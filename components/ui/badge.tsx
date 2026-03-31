import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-saffron/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-ink/80",
        className,
      )}
    >
      {children}
    </span>
  );
}
