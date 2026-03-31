import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-y rounded-3xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
