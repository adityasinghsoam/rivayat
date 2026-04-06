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
      <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p>
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold text-black sm:text-3xl">{title}</h2>
        <p className="max-w-2xl text-base leading-7 text-neutral-700">{description}</p>
      </div>
    </div>
  );
}

function FeaturedCard({ post, priority = false }: { post: HomePost; priority?: boolean }) {
  return (
    <Card className={priority ? "flex h-full flex-col gap-5 p-8" : "flex h-full flex-col gap-4 p-6"}>
      <div className="flex flex-wrap items-center gap-2">
        {post.tags.slice(0, 2).map((tag) => (
          <Badge key={tag}>#{tag}</Badge>
        ))}
      </div>
      <div className="space-y-3">
        <Link href={`/post/${post.slug}` as Route} className="block font-display text-2xl font-semibold leading-tight tracking-tight text-black sm:text-3xl">
          {post.title}
        </Link>
        <p className="text-sm leading-7 text-neutral-700">{post.excerpt}</p>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
        <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-neutral-900 transition-colors hover:text-neutral-700">
          {post.author.name}
        </Link>
        <span>·</span>
        <span>{formatDate(post.createdAt)}</span>
        <span>·</span>
        <span>{post.readTime} min read</span>
      </div>
    </Card>
  );
}

function TrendingCard({ post, index }: { post: HomePost; index: number }) {
  return (
    <Card className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-neutral-500">0{index + 1}</p>
        <Badge>Trending today</Badge>
      </div>
      <div className="space-y-2">
        <Link href={`/post/${post.slug}` as Route} className="block font-display text-xl font-semibold leading-tight text-black">
          {post.title}
        </Link>
        <p className="text-sm leading-7 text-neutral-700">{post.excerpt}</p>
      </div>
      <div className="mt-auto text-sm text-neutral-500">
        <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-neutral-900 transition-colors hover:text-neutral-700">
          {post.author.name}
        </Link>{" "}
        · {post._count.likes} likes · {post.views} views
      </div>
    </Card>
  );
}

export default async function HomePage() {
  const { storyCount, featuredPosts, trendingPosts } = await getHomeSections();

  return (
    <div className="pb-16">
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="max-w-3xl space-y-6">
            <Badge>Trusted space for thoughtful writing</Badge>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl">
              A home for poetry and stories
            </h1>
            <p className="max-w-2xl text-base leading-8 text-neutral-700 sm:text-lg">
              Rivayat brings poems, essays, and stories into one calm reading experience built for writers who care
              about craft and readers who make time for it.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/write">
                <Button>Start Writing</Button>
              </Link>
              <p className="text-sm text-neutral-500">{storyCount}+ stories shared</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeading
          eyebrow="Featured"
          title="Selected pieces worth settling into"
          description="A short shelf of recent writing that sets the tone for Rivayat."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid">
            {featuredPosts[0] ? <FeaturedCard post={featuredPosts[0]} priority /> : null}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {featuredPosts.slice(1).map((post) => (
              <FeaturedCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section id="trending" className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <SectionHeading
            eyebrow="Popular posts"
            title="Trending today"
            description="Stories readers are opening, liking, and passing around right now."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trendingPosts.slice(0, 3).map((post, index) => (
              <TrendingCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section id="latest" className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeading
          eyebrow="Latest posts"
          title="Fresh writing from across Rivayat"
          description="A steady feed of newly published work from poets and storytellers."
        />
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-neutral-500">Loading posts...</p>}>
            <HomeFeed />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
