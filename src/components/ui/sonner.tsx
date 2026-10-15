"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0d0f18] group-[.toaster]:text-[#F0F3F8] group-[.toaster]:border-[#1F2433] group-[.toaster]:shadow-2xl group-[.toaster]:font-mono group-[.toaster]:text-xs",
          description: "group-[.toast]:text-[#9BA3B8] font-sans text-xs",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white font-mono text-xs",
          cancelButton:
            "group-[.toast]:bg-[#1d1f29] group-[.toast]:text-[#9BA3B8] font-mono text-xs",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
