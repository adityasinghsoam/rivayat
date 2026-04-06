"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";
import { ScrollProgress } from "@/components/scroll-progress";

const mainNavLinkClass =
  "text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-black";

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
        scrolled ? "bg-white shadow-sm" : "bg-white/95"
      }`}
    >
      <ScrollProgress />
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="font-display text-3xl italic tracking-tight text-black transition-colors duration-200 hover:text-neutral-700">
          Rivayat
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className={mainNavLinkClass}>
            Explore
          </Link>
          <Link href="/#trending" className={mainNavLinkClass}>
            Trending
          </Link>
          <Link href="/write" className={mainNavLinkClass}>
            Write
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
