type Props = {
  index: string;
  label: string;
};

/** The monospace section kicker, e.g. "// 01 - about". */
export function SectionLabel({ index, label }: Props) {
  return (
    <p className="kicker mono" aria-hidden="true">
      <span style={{ color: "var(--accent)" }}>{"//"}</span>
      <span>
        {index} — {label}
      </span>
    </p>
  );
}
