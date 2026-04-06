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
      className={`sticky top-0 z-30 border-b border-white/10 backdrop-blur-lg transition-all duration-300 ${
        scrolled ? "bg-white/8 shadow-[0_10px_30px_rgba(2,6,23,0.24)]" : "bg-white/5"
      }`}
    >
      <ScrollProgress />
      <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 py-4 sm:grid-cols-[auto_minmax(320px,1fr)_auto] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="justify-self-start font-display text-3xl italic tracking-tight text-white transition-all duration-200 hover:scale-[1.02]"
        >
          Rivayat
        </Link>
        <div className="order-3 sm:order-none sm:justify-self-center sm:w-full sm:max-w-xl">
          <Suspense fallback={<div className="h-11 w-full rounded-full border border-white/10 bg-white/5 backdrop-blur-md" />}>
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
