import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-[2rem] border border-black/5 bg-white/75 p-6 shadow-card backdrop-blur", className)}>
      {children}
    </div>
  );
}
