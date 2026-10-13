import React from "react";

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Card({ children, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface, #ffffff)",
        border: "1px solid var(--border, rgba(15,23,42,0.08))",
        borderRadius: "14px",
        padding: "20px",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        color: "var(--text-primary, #0f172a)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;
