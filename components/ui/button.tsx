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
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-black text-white shadow-sm hover:scale-[1.02] hover:bg-neutral-800",
        variant === "secondary" && "bg-neutral-100 text-neutral-900 shadow-sm hover:scale-[1.02] hover:bg-neutral-200",
        variant === "ghost" && "bg-transparent text-ink hover:scale-[1.02] hover:bg-neutral-100",
        variant === "danger" && "bg-red-600 text-white shadow-sm hover:scale-[1.02] hover:bg-red-500",
        className,
      )}
      {...props}
    />
  );
}
