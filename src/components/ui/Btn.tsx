import React from "react";

interface BtnProps {
  label: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
  small?: boolean;
  color?: string;
  colorRgb?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Btn({
  label,
  primary,
  danger,
  small,
  color = "#10B981",
  colorRgb = "16,185,129",
  onClick,
  style,
  disabled,
  type = "button",
}: BtnProps) {
  const borderStyle = danger
    ? "1px solid rgba(239,68,68,0.35)"
    : primary
    ? "none"
    : `1px solid rgba(${colorRgb},0.3)`;

  const bgStyle = danger
    ? "rgba(239,68,68,0.12)"
    : primary
    ? `rgba(${colorRgb},0.18)`
    : "transparent";

  const textColor = danger ? "#EF4444" : primary ? color : "#64748B";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: small ? "5px 10px" : "7px 14px",
        borderRadius: "8px",
        fontSize: small ? "11px" : "12px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        border: borderStyle,
        background: bgStyle,
        color: textColor,
        transition: "all 0.15s",
        ...style,
      }}
    >
      {label}
    </button>
  );
}

export default Btn;
