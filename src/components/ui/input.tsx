import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-[#1F2433] bg-[#0c0e17] px-3 py-1 text-xs text-[#F0F3F8] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-[#5A6275] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-[#384259] disabled:cursor-not-allowed disabled:opacity-50 font-mono",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
