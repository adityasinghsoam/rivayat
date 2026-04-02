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
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-indigo-500 text-white hover:scale-[1.02] hover:bg-indigo-400",
        variant === "secondary" &&
          "border border-white/10 bg-white/10 text-white backdrop-blur-md hover:scale-[1.02] hover:bg-white/20",
        variant === "ghost" &&
          "bg-transparent text-neutral-200 hover:scale-[1.02] hover:bg-white/8 hover:text-white",
        variant === "danger" &&
          "bg-neutral-700 text-white hover:scale-[1.02] hover:bg-neutral-600",
        className,
      )}
      {...props}
    />
  );
}
