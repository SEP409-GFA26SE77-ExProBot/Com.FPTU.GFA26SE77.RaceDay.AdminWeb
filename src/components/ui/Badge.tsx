import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        pending: "border-amber-500/30 bg-amber-500/15 text-amber-500",
        success: "border-emerald-500/30 bg-emerald-500/15 text-emerald-500",
        live: "border-rose-500/30 bg-rose-500/15 text-rose-500",
        cyan: "border-cyan-500/30 bg-cyan-500/15 text-cyan-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  label?: string;
  type?: string;
}

function ShadcnBadge({ className, variant, label, type, children, ...props }: BadgeProps) {
  // Support legacy type="green" | "amber" etc if passed
  const derivedVariant =
    type === "amber" || type === "pending"
      ? "pending"
      : type === "green"
      ? "success"
      : type === "rose" || type === "live"
      ? "live"
      : type === "cyan"
      ? "cyan"
      : variant;

  return (
    <div className={cn(badgeVariants({ variant: derivedVariant }), className)} {...props}>
      {children || label}
    </div>
  );
}

export { ShadcnBadge as Badge, badgeVariants };
export default ShadcnBadge;
