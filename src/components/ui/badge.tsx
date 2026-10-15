import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500",
  {
    variants: {
      variant: {
        default:
          "border border-blue-500/30 bg-blue-500/10 text-blue-400",
        secondary:
          "border border-[#1F2433] bg-[#191b25] text-[#9BA3B8]",
        destructive:
          "border border-red-500/20 bg-red-500/10 text-red-400",
        outline: "border border-[#1F2433] text-[#F0F3F8]",
        success:
          "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        warning:
          "border border-amber-500/30 bg-amber-500/10 text-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
