import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium font-mono tracking-wider ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600/90 text-white hover:bg-blue-600 border border-blue-500/30",
        destructive:
          "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
        outline:
          "border border-[#1F2433] bg-[#11131c] text-[#F0F3F8] hover:bg-white/[0.04] hover:border-[#384259]",
        secondary:
          "bg-white/[0.04] text-[#F0F3F8] hover:bg-white/[0.08] border border-white/[0.08]",
        ghost: "hover:bg-white/[0.04] text-[#9BA3B8] hover:text-[#F0F3F8]",
        link: "text-blue-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded px-3 text-[11px]",
        lg: "h-10 rounded-md px-6 text-sm",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
