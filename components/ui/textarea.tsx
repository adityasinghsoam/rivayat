import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-y rounded-3xl border border-neutral-200 bg-white/90 px-4 py-3 text-sm text-ink placeholder:text-ink/40 shadow-sm transition-all duration-200 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-300",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
