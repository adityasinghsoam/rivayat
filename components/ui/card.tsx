import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-neutral-200 bg-white/88 p-6 shadow-sm backdrop-blur transition-shadow duration-300 hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
