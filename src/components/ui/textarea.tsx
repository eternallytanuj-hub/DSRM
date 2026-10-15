import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[#1F2433] bg-[#0c0e17] px-3 py-2 text-xs text-[#F0F3F8] shadow-sm placeholder:text-[#5A6275] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-[#384259] disabled:cursor-not-allowed disabled:opacity-50 font-mono",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
