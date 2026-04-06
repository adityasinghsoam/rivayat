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
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-black text-white hover:-translate-y-0.5 hover:bg-neutral-800",
        variant === "secondary" &&
          "bg-neutral-100 text-black hover:-translate-y-0.5 hover:bg-neutral-200",
        variant === "ghost" &&
          "bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-black",
        variant === "danger" &&
          "bg-neutral-800 text-white hover:bg-black",
        className,
      )}
      {...props}
    />
  );
}
