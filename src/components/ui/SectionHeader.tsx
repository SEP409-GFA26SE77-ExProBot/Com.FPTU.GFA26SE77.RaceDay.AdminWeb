import React from "react";

interface SectionHeaderProps {
  /** Optional — không hiện mã FR-* trên UI user-facing */
  id?: string;
  title: string;
  desc: string;
  color?: string;
}

export function SectionHeader({ id, title, desc, color }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: "24px" }}>
      {id ? (
        <div
          style={{
            fontSize: "10px",
            color: color || "var(--accent-color, #10B981)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          {id}
        </div>
      ) : null}
      <h2
        style={{
          fontSize: "22px",
          fontWeight: 800,
          color: "var(--text-primary, #0f172a)",
          margin: "0 0 6px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text-secondary, #64748B)", margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

export default SectionHeader;
