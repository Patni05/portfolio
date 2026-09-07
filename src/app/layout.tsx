import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { profile } from "@/data/profile";
import { personSchema, siteDescription, siteName, siteUrl } from "@/lib/site";
import { bootScript } from "@/lib/boot";
import { getResumeHref } from "@/lib/resume";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { EffectsProvider } from "@/components/providers/EffectsProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { BackgroundLayer } from "@/three/BackgroundLayer";
import { Grain } from "@/components/ui/Grain";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { Nav } from "@/components/layout/Nav";
import { IntroScreen } from "@/components/layout/IntroScreen";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  // No explicit weight: all three of these are variable fonts, so omitting
  // it yields ONE woff2 per family covering every weight. Listing weights
  // makes next/font emit a separate static file per weight instead.
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Display face for headings only — tighter and more characterful than Inter at
// large sizes, while Inter stays the body face for readability.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s — ${profile.name}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  keywords: [
    "Bhupesh Patni",
    "full-stack developer",
    "Next.js developer",
    "React developer",
    "Dehradun developer",
    "F5-TTS",
    "Cloudflare Workers",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: siteUrl,
    siteName: profile.name,
    title: siteName,
    description: siteDescription,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Server-side: the resume button only exists if the PDF does.
  const resumeHref = getResumeHref();

  return (
    <html
      lang="en"
      // Font variables must live on the SAME element as --font-display etc.
      // A custom property that references another is substituted where it is
      // DECLARED (:root), so variables defined further down the tree resolve
      // to nothing and the whole font stack silently falls back.
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Settles theme + intro state before first paint. See lib/boot.ts. */}
        <script
          dangerouslySetInnerHTML={{ __html: bootScript }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {/* Without JS the reveal observers never fire, so unhide everything.
            This must live inside <head> — <noscript> is not a valid child of
            <html>, and React refuses to render it there. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <ThemeProvider>
          <EffectsProvider>
            <SmoothScroll>
            <a href="#main" className="skip-link">
              Skip to content
            </a>

            <IntroScreen />
            <ScrollProgressBar />
            <BackgroundLayer />
            <Nav resumeHref={resumeHref} />

            <main id="main">{children}</main>

            <Footer />
            <Grain />
            </SmoothScroll>
          </EffectsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
