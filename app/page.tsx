import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { HomeFeed } from "@/components/home-feed";

export default function HomePage() {
  return (
    <div className="pb-12">
      <section className="animate-rise-in relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-white/5 px-4 py-14 text-center shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-md sm:px-8 sm:pb-20 sm:pt-20 md:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.28),transparent_34%),radial-gradient(circle_at_70%_30%,rgba(244,63,94,0.18),transparent_26%)]" />
        <div className="relative mx-auto max-w-4xl space-y-6">
          <Badge className="animate-rise-in border-violet-400/30 bg-violet-500/10 text-violet-300 [animation-delay:100ms]">
            Premium space for thoughtful writing
          </Badge>
          <h1 className="animate-rise-in bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text font-display text-5xl font-bold leading-none tracking-tight text-transparent [animation-delay:180ms] sm:text-6xl md:text-7xl">
            Rivayat
          </h1>
          <p className="animate-rise-in mx-auto max-w-2xl text-base leading-8 text-neutral-300 [animation-delay:280ms] sm:text-lg md:text-xl">
            A home for poetry and stories
          </p>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-4xl space-y-5 sm:mt-16">
        <div className="space-y-2">
          <p className="animate-rise-in text-sm uppercase tracking-[0.22em] text-neutral-400 [animation-delay:320ms]">Latest writing</p>
          <h2 className="animate-rise-in bg-gradient-to-r from-white to-neutral-300 bg-clip-text font-display text-3xl text-transparent [animation-delay:380ms]">
            Read what deserves time
          </h2>
        </div>
        <Suspense fallback={<p className="text-sm text-neutral-400">Loading posts...</p>}>
          <HomeFeed />
        </Suspense>
      </section>
    </div>
  );
}
