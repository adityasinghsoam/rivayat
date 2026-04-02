import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_10px_32px_rgba(2,6,23,0.28)] backdrop-blur-md transition-all duration-300 hover:border-indigo-400/40 hover:shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
