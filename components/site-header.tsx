"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { HeaderSearch } from "@/components/header-search";
import { AuthNav } from "@/components/auth-nav";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 border-b border-black/5 bg-[rgba(248,245,240,0.88)] backdrop-blur-xl transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 py-4 sm:grid-cols-[auto_minmax(320px,1fr)_auto] sm:px-6 lg:px-8">
        <Link href="/" className="justify-self-start font-display text-3xl italic tracking-tight text-ink transition-colors hover:text-amber-700">
          Rivayat
        </Link>
        <div className="order-3 sm:order-none sm:justify-self-center sm:w-full sm:max-w-xl">
          <Suspense fallback={<div className="h-11 w-full rounded-full bg-white/70 shadow-sm" />}>
            <HeaderSearch />
          </Suspense>
        </div>
        <div className="justify-self-end">
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
