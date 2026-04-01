import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { HomeFeed } from "@/components/home-feed";

export default function HomePage() {
  return (
    <div className="pb-10">
      <section className="rounded-[2.75rem] border border-neutral-200 bg-white/72 px-4 py-12 text-center shadow-sm sm:px-8 sm:pb-16 sm:pt-14 md:px-12">
        <div className="mx-auto max-w-3xl space-y-5">
          <Badge className="bg-amber-100 text-amber-700">Premium space for thoughtful writing</Badge>
          <h1 className="font-display text-5xl leading-none tracking-tight text-ink sm:text-6xl md:text-7xl">Rivayat</h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-neutral-700 sm:text-lg md:text-xl">
            A home for poetry and stories
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-4xl space-y-5 sm:mt-16">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.22em] text-ink/48">Latest writing</p>
          <h2 className="font-display text-3xl text-ink">Read what deserves time</h2>
        </div>
        <Suspense fallback={<p className="text-sm text-ink/60">Loading posts...</p>}>
          <HomeFeed />
        </Suspense>
      </section>
    </div>
  );
}
