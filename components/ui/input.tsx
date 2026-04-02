import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-400 shadow-[0_8px_24px_rgba(2,6,23,0.22)] backdrop-blur-md transition-all duration-200 focus:border-violet-400/70 focus:outline-none focus:ring-2 focus:ring-violet-400/45",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
