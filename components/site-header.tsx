"use client";

import Link from "next/link";
import { HeaderSearch } from "@/components/header-search";
import { AuthNav } from "@/components/auth-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[rgba(252,248,241,0.86)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 py-4 sm:grid-cols-[auto_minmax(320px,1fr)_auto] sm:px-6 lg:px-8">
        <Link href="/" className="justify-self-start font-display text-3xl italic tracking-tight text-ink">
          Rivayat
        </Link>
        <div className="order-3 sm:order-none sm:justify-self-center sm:w-full sm:max-w-xl">
          <HeaderSearch />
        </div>
        <div className="justify-self-end">
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
