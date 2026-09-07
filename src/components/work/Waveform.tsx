"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTheme } from "@/components/providers/ThemeProvider";

const BARS = 48;
const FRAME_MS = 1000 / 30;

type Props = {
  /** When set, the bars are driven by a real Web Audio analyser. */
  src?: string | null;
};

/**
 * Audio waveform for the TTS project.
 *
 * With no sample clip supplied it renders a synthetic speech-like envelope, so
 * the visual is honest about being decorative. Set `src` and it upgrades to a
 * real AnalyserNode reading the actual model output — no other change needed.
 *
 * Performance notes: the gradient and the palette are built once (not 48 times
 * per frame), the loop is capped at ~30 fps, and it stops when the panel is
 * scrolled away or the tab is hidden.
 */
export function Waveform({ src }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const reducedMotion = useReducedMotion();
  const { theme } = useTheme();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const audioData = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const gradient = useRef<CanvasGradient | null>(null);
  const gradientKey = useRef("");
  const raf = useRef(0);
  const lastDraw = useRef(0);
  const [playing, setPlaying] = useState(false);

  // Invalidate the cached gradient when the theme changes.
  useEffect(() => {
    gradient.current = null;
    gradientKey.current = "";
  }, [theme]);

  const draw = useCallback((values: number[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gradient.current = null;
    }

    // Build the gradient once per size/theme, not once per bar per frame.
    const key = `${w}x${h}`;
    if (!gradient.current || gradientKey.current !== key) {
      const styles = getComputedStyle(document.documentElement);
      const accent = styles.getPropertyValue("--accent").trim() || "#4f8dff";
      const accent2 = styles.getPropertyValue("--accent-2").trim() || "#22d3a6";
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, accent);
      g.addColorStop(1, accent2);
      gradient.current = g;
      gradientKey.current = key;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = gradient.current;

    const gap = 2 * dpr;
    const barWidth = (w - gap * (BARS - 1)) / BARS;
    const mid = h / 2;
    const radius = Math.min(barWidth / 2, 2 * dpr);

    for (let i = 0; i < BARS; i += 1) {
      const amplitude = Math.max(0.02, Math.min(1, values[i] ?? 0));
      const barHeight = amplitude * h * 0.86;
      ctx.beginPath();
      ctx.roundRect(
        i * (barWidth + gap),
        mid - barHeight / 2,
        barWidth,
        barHeight,
        radius,
      );
      ctx.fill();
    }
  }, []);

  const staticFrame = useCallback(() => {
    draw(
      Array.from(
        { length: BARS },
        (_, i) => Math.abs(Math.sin(i * 0.42)) * 0.55 + 0.08,
      ),
    );
  }, [draw]);

  // Synthetic loop: a speech-like envelope, used when there is no clip.
  useEffect(() => {
    if (src && playing) return;

    if (reducedMotion || !inView) {
      // Draw one static frame so the panel is never blank.
      staticFrame();
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      raf.current = requestAnimationFrame(tick);
      if (document.visibilityState === "hidden") return;
      if (now - lastDraw.current < FRAME_MS) return;
      lastDraw.current = now;

      const t = (now - start) / 1000;
      const values = Array.from({ length: BARS }, (_, i) => {
        const x = i / BARS;
        // Layered sines plus a slow envelope, so it breathes like speech.
        const carrier =
          Math.sin(x * 22 + t * 5.2) * 0.5 + Math.sin(x * 9 - t * 2.6) * 0.3;
        const envelope =
          0.45 + 0.55 * Math.abs(Math.sin(t * 0.9 + x * Math.PI * 1.4));
        return Math.abs(carrier) * envelope * 0.9 + 0.04;
      });
      draw(values);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [draw, staticFrame, inView, reducedMotion, src, playing, theme]);

  // Real analyser path, only wired up once a clip actually plays.
  const startAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || analyser.current) return;

    type WindowWithAudio = Window & { webkitAudioContext?: typeof AudioContext };
    const win = window as WindowWithAudio;
    const AudioCtor = window.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtor) return;

    const context = new AudioCtor();
    const source = context.createMediaElementSource(audio);
    const node = context.createAnalyser();
    node.fftSize = 256;
    source.connect(node);
    node.connect(context.destination);

    analyser.current = node;
    audioData.current = new Uint8Array(new ArrayBuffer(node.frequencyBinCount));

    const tick = () => {
      const data = audioData.current;
      if (!analyser.current || !data) return;
      raf.current = requestAnimationFrame(tick);
      analyser.current.getByteFrequencyData(data);
      const values = Array.from({ length: BARS }, (_, i) => {
        const index = Math.floor((i / BARS) * data.length);
        return data[index] / 255;
      });
      draw(values);
    };
    raf.current = requestAnimationFrame(tick);
  }, [draw]);

  return (
    <div ref={ref} className="waveform">
      <canvas ref={canvasRef} className="waveform__canvas" aria-hidden="true" />

      {src ? (
        <>
          <audio
            ref={audioRef}
            src={src}
            preload="none"
            onPlay={() => {
              setPlaying(true);
              startAnalyser();
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
          <button
            type="button"
            className="waveform__play"
            aria-label={playing ? "Pause sample" : "Play speech sample"}
            onClick={() => {
              const audio = audioRef.current;
              if (!audio) return;
              if (audio.paused) void audio.play();
              else audio.pause();
            }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            <span>{playing ? "Pause" : "Play sample"}</span>
          </button>
        </>
      ) : (
        <p className="waveform__caption mono">
          synthesised waveform · sample clip coming soon
        </p>
      )}
    </div>
  );
}
