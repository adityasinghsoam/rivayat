import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HomeFeed } from "@/components/home-feed";
import { formatDate, getReadTimeMinutes } from "@/lib/utils";

type HomePost = {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  createdAt: Date;
  views: number;
  tags: string[];
  author: {
    name: string;
    username: string;
  };
  _count: {
    likes: number;
  };
  readTime: number;
};

async function getHomeSections() {
  const [storyCount, featuredRaw, trendingRaw] = await Promise.all([
    prisma.post.count({
      where: {
        isPublished: true,
      },
    }),
    prisma.post.findMany({
      where: {
        isPublished: true,
      },
      take: 4,
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        createdAt: true,
        views: true,
        tags: true,
        content: true,
        _count: {
          select: {
            likes: true,
          },
        },
        author: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    }),
    prisma.post.findMany({
      where: {
        isPublished: true,
      },
      take: 5,
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        createdAt: true,
        views: true,
        tags: true,
        content: true,
        _count: {
          select: {
            likes: true,
          },
        },
        author: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    }),
  ]);

  const mapPosts = (posts: typeof featuredRaw): HomePost[] =>
    posts.map((post) => ({
      ...post,
      readTime: getReadTimeMinutes(post.content),
    }));

  return {
    storyCount,
    featuredPosts: mapPosts(featuredRaw),
    trendingPosts: mapPosts(trendingRaw).sort((a, b) => b._count.likes + b.views - (a._count.likes + a.views)),
  };
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">{eyebrow}</p>
      <div className="max-w-3xl space-y-2">
        <h2 className="font-display text-2xl font-semibold text-black sm:text-[2rem]">{title}</h2>
        <p className="max-w-2xl text-base leading-8 text-neutral-700">{description}</p>
      </div>
    </div>
  );
}

function EmptyPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="flex min-h-[220px] flex-col justify-between p-6">
      <div className="space-y-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500">
          /
        </div>
        <p className="font-display text-2xl text-black">{title}</p>
        <p className="max-w-sm text-sm leading-7 text-neutral-600">{description}</p>
      </div>
    </Card>
  );
}

function FeaturedCard({ post, priority = false }: { post: HomePost; priority?: boolean }) {
  return (
    <Card className={priority ? "relative flex h-full flex-col gap-5 overflow-hidden p-7" : "relative flex h-full flex-col gap-4 overflow-hidden p-6"}>
      <div className="absolute inset-y-6 left-0 w-px bg-neutral-300" />
      <div className="pl-4">
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.slice(0, 2).map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          <Link
            href={`/post/${post.slug}` as Route}
            className="block max-w-2xl font-display text-2xl font-semibold leading-[1.15] tracking-tight text-black sm:text-[2rem]"
          >
            {post.title}
          </Link>
          <p className="max-w-2xl text-sm italic leading-8 text-neutral-700">{post.excerpt}</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.08em] text-neutral-500">
          <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-neutral-800 transition-colors hover:text-black">
            {post.author.name}
          </Link>
          <span>·</span>
          <span>{formatDate(post.createdAt)}</span>
          <span>·</span>
          <span>{post.readTime} min read</span>
        </div>
      </div>
    </Card>
  );
}

function TrendingCard({ post, index }: { post: HomePost; index: number }) {
  return (
    <Card className="relative flex h-full flex-col gap-4 overflow-hidden p-6">
      <div className="absolute inset-y-6 left-0 w-px bg-neutral-300" />
      <div className="pl-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-neutral-500">0{index + 1}</p>
          <Badge>Trending today</Badge>
        </div>
        <div className="mt-4 space-y-2">
          <Link href={`/post/${post.slug}` as Route} className="block max-w-sm font-display text-xl font-semibold leading-[1.2] text-black">
            {post.title}
          </Link>
          <p className="max-w-sm text-sm italic leading-8 text-neutral-700">{post.excerpt}</p>
        </div>
        <div className="mt-5 text-xs tracking-[0.08em] text-neutral-500">
          <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-neutral-800 transition-colors hover:text-black">
            {post.author.name}
          </Link>{" "}
          · {post._count.likes} likes · {post.views} views
        </div>
      </div>
    </Card>
  );
}

export default async function HomePage() {
  const { storyCount, featuredPosts, trendingPosts } = await getHomeSections();

  return (
    <div>
      <section className="border-b border-neutral-200 bg-[linear-gradient(180deg,#fbf8f2_0%,#ffffff_92%)]">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">A quiet home for words that stay with you</p>
            <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-black sm:text-6xl">
              A home for poetry and <span className="italic text-neutral-800">stories</span>
            </h1>
            <p className="max-w-2xl text-base leading-8 text-neutral-700 sm:text-lg">
              Riwayat brings poems, essays, and stories into one calm reading experience built for writers who care
              about craft and readers who make time for it.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/write">
                <Button className="px-6 py-3 text-base hover:bg-neutral-900">Start Writing</Button>
              </Link>
              <p className="text-sm text-neutral-500">{storyCount}+ stories shared</p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4">
          <div className="h-px bg-neutral-200" />
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <SectionHeading
            eyebrow="Featured"
            title="Selected pieces worth settling into"
            description="A short shelf of recent writing that sets the tone for Riwayat."
          />
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <div className="grid">
              {featuredPosts[0] ? (
                <FeaturedCard post={featuredPosts[0]} priority />
              ) : (
                <EmptyPanel title="Nothing here yet" description="A few published stories will give this shelf its shape and character." />
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {featuredPosts.slice(1).length ? (
                featuredPosts.slice(1).map((post) => <FeaturedCard key={post.id} post={post} />)
              ) : (
                <>
                  <EmptyPanel title="Room for more writing" description="Featured shelves fill out as new stories are published." />
                  <EmptyPanel title="Curated selections" description="This space highlights strong recent work for returning readers." />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="trending" className="border-t border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <SectionHeading
            eyebrow="Popular posts"
            title="Trending today"
            description="Stories readers are opening, liking, and passing around right now."
          />
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {trendingPosts.slice(0, 3).length ? (
              trendingPosts.slice(0, 3).map((post, index) => <TrendingCard key={post.id} post={post} index={index} />)
            ) : (
              <>
                <EmptyPanel title="Nothing here yet" description="Reader momentum will surface here as the library of posts grows." />
                <EmptyPanel title="Popular posts" description="Views and likes help surface the writing readers are spending time with." />
                <EmptyPanel title="Momentum builds here" description="Return after a few publications to see what is resonating across Riwayat." />
              </>
            )}
          </div>
        </div>
      </section>

      <section id="latest" className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <SectionHeading
            eyebrow="Latest posts"
            title="Fresh writing from across Riwayat"
            description="A steady feed of newly published work from poets and storytellers."
          />
          <div className="mt-6">
            <Suspense fallback={<p className="text-sm text-neutral-500">Loading posts...</p>}>
              <HomeFeed />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
