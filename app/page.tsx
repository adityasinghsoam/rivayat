import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { HomeFeed } from "@/components/home-feed";

export default function HomePage() {
  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-[2.75rem] border border-black/5 bg-white/65 px-8 py-12 text-center shadow-card backdrop-blur sm:px-12">
        <div className="mx-auto max-w-3xl space-y-5">
          <Badge className="bg-ink text-parchment">Premium space for thoughtful writing</Badge>
          <h1 className="font-display text-6xl leading-none tracking-tight text-ink sm:text-7xl">Rivayat</h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-ink/72 sm:text-xl">A home for poetry and stories</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5">
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
