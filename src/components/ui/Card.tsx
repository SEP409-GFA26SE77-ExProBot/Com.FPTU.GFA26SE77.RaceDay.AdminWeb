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
        background: "var(--surface, rgba(255,255,255,0.03))",
        border: "1px solid var(--border, rgba(255,255,255,0.07))",
        borderRadius: "14px",
        padding: "20px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "var(--text-primary, #ffffff)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;
