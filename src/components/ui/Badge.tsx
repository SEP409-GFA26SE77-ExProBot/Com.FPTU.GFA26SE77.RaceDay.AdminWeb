import React from "react";

export type BadgeType = "green" | "amber" | "rose" | "cyan" | "gray" | "violet" | "blue";

interface BadgeProps {
  label: string;
  type: BadgeType;
  style?: React.CSSProperties;
}

export function Badge({ label, type, style }: BadgeProps) {
  const map: Record<BadgeType, string> = {
    green: "badge-green",
    amber: "badge-amber",
    rose: "badge-rose",
    cyan: "badge-cyan",
    gray: "badge-gray",
    violet: "badge-violet",
    blue: "badge-blue",
  };

  return (
    <span
      className={map[type] || "badge-gray"}
      style={{
        fontSize: "10px",
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: "100px",
        display: "inline-block",
        ...style,
      }}
    >
      {label}
    </span>
  );
}

export default Badge;
