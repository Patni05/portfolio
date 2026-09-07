"use client";

import { useInView } from "@/hooks/useInView";

/**
 * Stand-in for the Zeplymart operations dashboard: a schematic of the real
 * layout (role switcher, KPI row, chart, order rows) drawn in CSS. It is
 * explicitly labelled as a schematic — it is replaced the moment a real
 * screenshot lands in /public.
 */
const BARS = [42, 68, 55, 84, 61, 92, 74, 58, 80, 66, 88, 71];

const ROWS = [
  { id: "#4821", status: "delivered", tone: "ok" },
  { id: "#4822", status: "en route", tone: "live" },
  { id: "#4823", status: "packing", tone: "warn" },
];

export function DashboardVisual() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);

  return (
    <div ref={ref} className="dashviz" data-visible={inView ? "true" : "false"}>
      <div className="dashviz__roles mono">
        {["customer", "admin", "manager", "rider"].map((role, i) => (
          <span key={role} data-active={i === 1 ? "true" : "false"}>
            {role}
          </span>
        ))}
      </div>

      <div className="dashviz__kpis">
        {[
          { label: "orders", value: "1,284" },
          { label: "on time", value: "96%" },
          { label: "avg eta", value: "18m" },
        ].map((kpi) => (
          <div key={kpi.label} className="dashviz__kpi">
            <span className="dashviz__kpi-value mono">{kpi.value}</span>
            <span className="dashviz__kpi-label mono">{kpi.label}</span>
          </div>
        ))}
      </div>

      <div className="dashviz__chart" aria-hidden="true">
        {BARS.map((height, i) => (
          <span
            key={i}
            style={{
              ["--h" as string]: `${height}%`,
              ["--d" as string]: `${i * 45}ms`,
            }}
          />
        ))}
      </div>

      <ul className="dashviz__rows mono">
        {ROWS.map((row) => (
          <li key={row.id}>
            <span>{row.id}</span>
            <span className="dashviz__status" data-tone={row.tone}>
              {row.status}
            </span>
          </li>
        ))}
      </ul>

      <p className="dashviz__note mono">schematic · not a screenshot</p>
    </div>
  );
}
