import Link from "next/link";
import type { Route } from "next";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="font-display text-2xl text-black">Rivayat</p>
          <p className="text-sm text-neutral-500">Made for writers and storytellers</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm text-neutral-600">
          <Link href={"/about" as Route} className="transition-colors hover:text-black">
            About
          </Link>
          <Link href={"/contact" as Route} className="transition-colors hover:text-black">
            Contact
          </Link>
          <Link href={"/terms" as Route} className="transition-colors hover:text-black">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
