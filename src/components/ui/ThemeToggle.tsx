"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function ThemeToggle({
  showLabel = false,
  size = "md",
  className = "",
  style,
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
        className={cn(
          "relative border-border bg-card/40 opacity-70",
          !showLabel && "px-0 w-9 h-9",
          className
        )}
        style={style}
        disabled
      >
        <span className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={cn(
        "relative transition-all duration-300 border-border bg-card/60 hover:bg-accent hover:border-primary/40 backdrop-blur-md cursor-pointer",
        !showLabel && "w-9 h-9 p-0",
        showLabel && "gap-2 px-3",
        className
      )}
      style={style}
    >
      <div className="relative flex items-center justify-center">
        <Sun
          className={cn(
            "h-4 w-4 transition-all duration-300 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]",
            isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          className={cn(
            "absolute h-4 w-4 transition-all duration-300 text-violet-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]",
            isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          )}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold select-none capitalize text-foreground">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </Button>
  );
}

export default ThemeToggle;
