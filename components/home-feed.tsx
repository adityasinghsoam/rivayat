"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LikeButton } from "@/components/post-interactions";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type FeedPost = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  slug: string;
  tags: string[];
  views: number;
  readTime: number;
  likeCount: number;
  likedByMe: boolean;
  author: {
    name: string;
    username: string;
  };
};

export function HomeFeed() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyStateMessage, setEmptyStateMessage] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestInFlightRef = useRef(false);
  const queryKey = useMemo(() => searchParams.toString(), [searchParams]);

  async function loadPosts(reset = false) {
    if (requestInFlightRef.current) {
      return;
    }

    requestInFlightRef.current = true;
    setError(null);

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams(queryKey);
      params.set("limit", "10");

      if (!reset && nextCursor) {
        params.set("cursor", nextCursor);
      }

      const endpoint = params.toString() ? `/api/posts/explore?${params.toString()}` : "/api/posts/explore";
      console.log("[Explore] Fetching posts from:", endpoint);

      const data = await apiFetch<{
        posts: FeedPost[];
        emptyStateMessage?: string | null;
        nextCursor?: string | null;
      }>(endpoint);

      console.log("[Explore] Received posts:", data.posts.length, "nextCursor:", data.nextCursor ?? null);

      setEmptyStateMessage(data.emptyStateMessage ?? null);
      setNextCursor(data.nextCursor ?? null);
      setHasMore(Boolean(data.nextCursor));
      setPosts((current) => {
        const merged = reset ? data.posts : [...current, ...data.posts];
        const seen = new Set<string>();

        return merged.filter((post) => {
          if (seen.has(post.id)) {
            return false;
          }

          seen.add(post.id);
          return true;
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load posts.");
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    void loadPosts(true);
  }, [queryKey]);

  useEffect(() => {
    if (!sentinelRef.current || loading || loadingMore || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting && !requestInFlightRef.current) {
          void loadPosts(false);
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loading, loadingMore, hasMore, nextCursor, queryKey]);

  if (loading) {
    return <p className="text-sm text-neutral-400">Loading posts...</p>;
  }

  if (error) {
    return <p className="text-sm text-neutral-300">{error}</p>;
  }

  if (!posts.length) {
    return (
      <Card className="mx-auto flex max-w-3xl flex-col gap-3 p-8 text-center">
        <p className="font-display text-3xl text-white">Nothing here yet</p>
        <p className="text-sm text-neutral-400">{emptyStateMessage || "Start writing your first story"}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post, index) => (
        <Card
          key={post.slug}
          className="animate-stagger-in flex min-w-0 flex-col gap-4 border-white/10 bg-white/5 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:border-indigo-400/40 hover:shadow-lg sm:p-7"
          style={{ ["--stagger-delay" as "--stagger-delay"]: `${Math.min(index * 100, 600)}ms` } as React.CSSProperties}
        >
          <Link href={`/post/${post.slug}`} className="block min-w-0">
            <h2 className="mb-3 break-words font-display text-[1.8rem] font-semibold leading-tight tracking-tight text-white sm:text-[2.2rem]">
              {post.title}
            </h2>
            <p className="max-w-3xl break-words text-[15px] leading-7 text-neutral-300">{post.excerpt}</p>
          </Link>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}` as Route}>
                <Badge className="border-white/10 bg-white/6 text-neutral-300 transition hover:border-indigo-400/25 hover:bg-white/8 hover:text-white">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-400">
              <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-neutral-200 transition hover:text-indigo-300">
                {post.author.name}
              </Link>{" · "}
              {formatDate(post.createdAt)} · {post.readTime} min read · {post.views} views
            </p>
            <LikeButton postId={post.id} initialLiked={post.likedByMe} initialCount={post.likeCount} />
          </div>
        </Card>
      ))}

      {loadingMore ? <p className="py-2 text-center text-sm text-neutral-400">Loading more posts...</p> : null}
      {!hasMore ? <p className="py-2 text-center text-sm text-neutral-500">No more posts</p> : null}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
