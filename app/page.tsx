import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FollowToggleButton } from "@/components/follow-toggle-button";
import { HomeFeed } from "@/components/home-feed";
import { formatDate } from "@/lib/utils";

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
};

type MoodCategory = (typeof MOOD_CATEGORIES)[number];

type HighlightAuthor = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  _count: {
    posts: number;
  };
};

const MOOD_CATEGORIES = ["Love", "Heartbreak", "Motivation", "Dark", "Short Reads"] as const;

function createExcerpt(excerpt: string, title: string, maxLength = 180) {
  const source = excerpt.trim() || title.trim();
  if (source.length <= maxLength) {
    return source;
  }

  return `${source.slice(0, maxLength).trimEnd()}...`;
}

async function getHomeSections() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const now = Date.now();

  const [storyCount, featuredRaw, trendingRaw, authors, categoryCountsRaw] = await Promise.all([
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
        createdAt: {
          gte: weekAgo,
        },
      },
      take: 20,
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        createdAt: true,
        views: true,
        tags: true,
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
    prisma.user.findMany({
      where: {
        posts: {
          some: {
            isPublished: true,
          },
        },
      },
      take: 3,
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
        _count: {
          select: {
            posts: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    }),
    prisma.post.findMany({
      where: {
        isPublished: true,
      },
      take: 100,
      select: {
        tags: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const mapPosts = (posts: typeof featuredRaw): HomePost[] =>
    posts.map((post) => ({
      ...post,
      excerpt: createExcerpt(post.excerpt, post.title),
    }));

  const featuredPosts = mapPosts(featuredRaw);
  const trendingPosts = mapPosts(trendingRaw)
    .sort((a, b) => {
      const hoursA = Math.max((now - a.createdAt.getTime()) / (1000 * 60 * 60), 1);
      const hoursB = Math.max((now - b.createdAt.getTime()) / (1000 * 60 * 60), 1);
      const scoreA = (a._count.likes + a.views) / hoursA;
      const scoreB = (b._count.likes + b.views) / hoursB;
      return scoreB - scoreA;
    })
    .slice(0, 5);

  const excludedIds = new Set([...featuredPosts, ...trendingPosts].map((post) => post.id));
  const preferredTags = Array.from(new Set([...featuredPosts, ...trendingPosts].flatMap((post) => post.tags))).slice(0, 5);

  const readNextCandidatePool = preferredTags.length
    ? await prisma.post.findMany({
        where: {
          isPublished: true,
          id: {
            notIn: Array.from(excludedIds),
          },
          tags: {
            hasSome: preferredTags,
          },
        },
        take: 20,
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          excerpt: true,
          slug: true,
          createdAt: true,
          views: true,
          tags: true,
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
      })
    : [];

  const readNextByTags = readNextCandidatePool
    .map((post) => ({
      post,
      overlap: post.tags.reduce((count, tag) => count + (preferredTags.includes(tag) ? 1 : 0), 0),
    }))
    .filter((item) => item.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) {
        return b.overlap - a.overlap;
      }
      return b.post.createdAt.getTime() - a.post.createdAt.getTime();
    })
    .slice(0, 3)
    .map((item) => item.post);

  const readNextFallback =
    readNextByTags.length === 0
      ? await prisma.post.findMany({
          where: {
            isPublished: true,
            id: {
              notIn: Array.from(excludedIds),
            },
          },
          take: 3,
          orderBy: [{ createdAt: "desc" }],
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            createdAt: true,
            views: true,
            tags: true,
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
        })
      : [];

  const readNextPosts = mapPosts(readNextByTags.length ? readNextByTags : readNextFallback).slice(0, 3);

  const featuredAuthorIds = Array.from(new Set(featuredPosts.map((post) => post.author.username)));
  const sameAuthorRaw =
    featuredAuthorIds.length > 0
      ? await prisma.post.findMany({
          where: {
            isPublished: true,
            author: {
              username: {
                in: featuredAuthorIds,
              },
            },
            id: {
              notIn: featuredPosts.map((post) => post.id),
            },
          },
          take: 24,
          orderBy: [{ createdAt: "desc" }],
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            createdAt: true,
            views: true,
            tags: true,
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
        })
      : [];

  const sameAuthorPostsByAuthor = new Map<string, HomePost[]>();
  for (const post of mapPosts(sameAuthorRaw)) {
    const key = post.author.username;
    const current = sameAuthorPostsByAuthor.get(key) ?? [];
    if (current.length < 2) {
      current.push(post);
      sameAuthorPostsByAuthor.set(key, current);
    }
  }

  const fromSameAuthor = featuredPosts.map((post) => ({
    featured: post,
    related: sameAuthorPostsByAuthor.get(post.author.username) ?? [],
  }));

  const categoryCounts = MOOD_CATEGORIES.reduce<Record<MoodCategory, number>>(
    (accumulator, category) => {
      accumulator[category] = 0;
      return accumulator;
    },
    {} as Record<MoodCategory, number>,
  );

  for (const post of categoryCountsRaw) {
    for (const tag of post.tags) {
      const matchingCategory = MOOD_CATEGORIES.find((category) => category.toLowerCase() === tag.toLowerCase());
      if (matchingCategory) {
        categoryCounts[matchingCategory] += 1;
      }
    }
  }

  return {
    storyCount,
    featuredPosts,
    trendingPosts,
    readNextPosts,
    fromSameAuthor,
    authors,
    categoryCounts,
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
  showCtas = false,
}: {
  title: string;
  description: string;
  showCtas?: boolean;
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
      {showCtas ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/write">
            <Button className="px-4 py-2 text-sm">Write a story</Button>
          </Link>
          <Link href="/#latest">
            <Button variant="ghost" className="px-4 py-2 text-sm">
              Explore stories
            </Button>
          </Link>
        </div>
      ) : null}
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

function AuthorHighlightCard({ author }: { author: HighlightAuthor }) {
  const bio = author.bio?.trim() || "Writer in progress. New stories and quiet reflections added every week.";

  return (
    <Card className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-start gap-4">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt={author.name} className="h-12 w-12 rounded-full border border-neutral-200 object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-neutral-700">
            {author.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="space-y-1">
          <Link href={`/profile/${author.username}` as Route} className="font-display text-2xl text-black transition-colors hover:text-neutral-700">
            {author.name}
          </Link>
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">@{author.username}</p>
        </div>
      </div>
      <p className="min-h-[72px] text-sm leading-7 text-neutral-700">{createExcerpt(bio, bio, 140)}</p>
      <div className="mt-auto flex items-center justify-between">
        <p className="text-xs tracking-[0.08em] text-neutral-500">{author._count.posts} published stories</p>
        <FollowToggleButton authorUsername={author.username} />
      </div>
    </Card>
  );
}

export default async function HomePage() {
  const { storyCount, featuredPosts, trendingPosts, readNextPosts, fromSameAuthor, authors, categoryCounts } = await getHomeSections();

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
                <Button className="px-6 py-3 text-base hover:bg-neutral-900">Write your first story in minutes</Button>
              </Link>
              <Link href="/#latest">
                <Button variant="ghost" className="px-6 py-3 text-base">
                  Explore stories
                </Button>
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
                <EmptyPanel title="Nothing here yet" description="A few published stories will give this shelf its shape and character." showCtas />
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {featuredPosts.slice(1).length ? (
                featuredPosts.slice(1).map((post) => <FeaturedCard key={post.id} post={post} />)
              ) : (
                <>
                  <EmptyPanel title="Room for more writing" description="Featured shelves fill out as new stories are published." showCtas />
                  <EmptyPanel title="Curated selections" description="This space highlights strong recent work for returning readers." />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <SectionHeading
            eyebrow="Find your mood"
            title="Browse by category"
            description="Jump into stories that match what you want to feel right now."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            {MOOD_CATEGORIES.map((category) => (
              <Link key={category} href={`/?tag=${encodeURIComponent(category)}` as Route}>
                <Badge className="cursor-pointer px-4 py-2 text-sm transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900">
                  {category} ({categoryCounts[category]} recent stories)
                </Badge>
              </Link>
            ))}
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
                <EmptyPanel title="Nothing trending this week" description="Trending uses a 7-day window. Publish fresh stories to start building momentum." showCtas />
                <EmptyPanel title="Popular posts" description="Views and likes help surface the writing readers are spending time with." />
                <EmptyPanel title="Momentum builds here" description="Return after a few publications to see what is resonating across Riwayat." />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <SectionHeading
            eyebrow="From same author"
            title="More from the writers you just discovered"
            description="Continue with two more recent pieces from each featured author."
          />
          <div className="mt-6 space-y-5">
            {fromSameAuthor.some((group) => group.related.length > 0) ? (
              fromSameAuthor.map((group) =>
                group.related.length > 0 ? (
                  <Card key={group.featured.id} className="p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm text-neutral-500">
                        More from{" "}
                        <Link href={`/profile/${group.featured.author.username}` as Route} className="font-medium text-neutral-900">
                          {group.featured.author.name}
                        </Link>
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {group.related.map((post) => (
                        <Card key={post.id} className="p-4">
                          <Link href={`/post/${post.slug}` as Route} className="block space-y-2">
                            <p className="font-display text-xl text-black">{post.title}</p>
                            <p className="text-sm leading-7 text-neutral-700">{createExcerpt(post.excerpt, post.title, 120)}</p>
                          </Link>
                          <p className="mt-3 text-xs tracking-[0.08em] text-neutral-500">{formatDate(post.createdAt)}</p>
                        </Card>
                      ))}
                    </div>
                  </Card>
                ) : null,
              )
            ) : (
              <EmptyPanel title="More from each author will appear here" description="As featured writers publish more, this section will connect related reads automatically." showCtas />
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <SectionHeading
            eyebrow="Read next"
            title="More stories picked for your next reading session"
            description="Recommendations based on tags from featured and trending posts, with fresh fallbacks."
          />
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {readNextPosts.length ? (
              readNextPosts.map((post) => <FeaturedCard key={post.id} post={post} />)
            ) : (
              <>
                <EmptyPanel title="No recommendations yet" description="Once a few posts are published, we can suggest what to read next." showCtas />
                <EmptyPanel title="Tag-based matching" description="Read Next prioritizes posts that share mood and theme with what readers already engage with." />
                <EmptyPanel title="Fresh fallback stories" description="When matching tags are limited, recent posts fill this section to keep discovery active." />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <SectionHeading
            eyebrow="Author highlights"
            title="Writers readers keep returning to"
            description="Three voices building depth and consistency across the Riwayat library."
          />
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {authors.length ? (
              authors.map((author) => <AuthorHighlightCard key={author.id} author={author} />)
            ) : (
              <>
                <EmptyPanel title="Writers will appear here" description="As soon as stories are published, standout authors will be highlighted in this section." showCtas />
                <EmptyPanel title="Discover new voices" description="Follow along with recurring authors and their evolving themes over time." />
                <EmptyPanel title="Reader favorites" description="This section surfaces creators with growing reader momentum and consistency." />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <SectionHeading
            eyebrow="Reading experience"
            title="A clean, immersive reading flow"
            description="Typography and spacing are tuned to keep long-form reading calm and focused."
          />
          <Card className="mt-6 p-7 sm:p-9">
            <article className="prose prose-neutral max-w-none">
              <h3>The city slept, but the page stayed awake</h3>
              <p>
                You open a story and the noise falls away. Short lines breathe, longer passages settle, and every paragraph
                moves at a pace that feels deliberate. This preview mirrors the same reading-first layout used across posts.
              </p>
              <p>
                <strong>Minimal distractions.</strong> Generous spacing. Familiar typography. Built so the writing stays in
                front and everything else steps back.
              </p>
            </article>
          </Card>
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
