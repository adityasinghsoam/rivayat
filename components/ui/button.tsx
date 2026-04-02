"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] hover:bg-violet-400 hover:shadow-[0_0_30px_rgba(139,92,246,0.38)]",
        variant === "secondary" &&
          "border border-white/10 bg-white/8 text-white shadow-[0_0_20px_rgba(139,92,246,0.16)] backdrop-blur-md hover:scale-[1.02] hover:border-violet-400/60 hover:bg-white/12 hover:shadow-[0_0_24px_rgba(139,92,246,0.28)]",
        variant === "ghost" &&
          "bg-transparent text-neutral-200 hover:scale-[1.02] hover:bg-white/8 hover:text-white",
        variant === "danger" &&
          "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.28)] hover:scale-[1.02] hover:bg-rose-400",
        className,
      )}
      {...props}
    />
  );
}
