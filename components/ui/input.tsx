import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 text-sm text-ink placeholder:text-ink/40 shadow-sm transition-all duration-200 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-300",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
