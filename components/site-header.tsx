"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { HeaderSearch } from "@/components/header-search";
import { AuthNav } from "@/components/auth-nav";
import { ScrollProgress } from "@/components/scroll-progress";

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
      data-site-header
      className={`sticky top-0 z-30 border-b border-neutral-200 transition-all duration-300 ${
        scrolled ? "bg-white/95 shadow-sm" : "bg-white/90"
      }`}
    >
      <ScrollProgress />
      <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 py-4 sm:grid-cols-[auto_minmax(320px,1fr)_auto] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="justify-self-start font-display text-3xl italic tracking-tight text-black transition-colors duration-200 hover:text-neutral-700"
        >
          Rivayat
        </Link>
        <div className="order-3 sm:order-none sm:justify-self-center sm:w-full sm:max-w-xl">
          <Suspense fallback={<div className="h-11 w-full rounded-full border border-neutral-200 bg-white" />}>
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
