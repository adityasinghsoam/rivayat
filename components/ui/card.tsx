import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(2,6,23,0.35)] backdrop-blur-md transition-all duration-300 hover:border-violet-400/40 hover:shadow-[0_18px_50px_rgba(139,92,246,0.18)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
