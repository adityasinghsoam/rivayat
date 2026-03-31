import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
