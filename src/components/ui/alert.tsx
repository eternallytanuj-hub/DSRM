import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-xs",
  {
    variants: {
      variant: {
        default: "bg-[#11131c] text-[#F0F3F8] border-[#1F2433]",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-300 [&>svg]:text-red-400",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-300 [&>svg]:text-amber-400",
        info:
          "border-blue-500/30 bg-blue-500/10 text-blue-300 [&>svg]:text-blue-400",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 [&>svg]:text-emerald-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-mono text-xs font-semibold leading-none tracking-wide", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs [&_p]:leading-relaxed text-[#9BA3B8] font-sans", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
