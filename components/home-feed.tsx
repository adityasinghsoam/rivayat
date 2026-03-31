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

      const endpoint = params.toString() ? `/api/posts?${params.toString()}` : "/api/posts";
      const data = await apiFetch<{
        posts: FeedPost[];
        emptyStateMessage?: string | null;
        nextCursor?: string | null;
      }>(endpoint);

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
      {
        rootMargin: "300px",
      },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loading, loadingMore, hasMore, nextCursor, queryKey]);

  if (loading) {
    return <p className="text-sm text-ink/60">Loading posts...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!posts.length) {
    return (
      <Card className="mx-auto max-w-3xl space-y-2 p-8 text-center">
        <p className="font-display text-3xl text-ink">Nothing here yet</p>
        <p className="text-sm text-ink/65">{emptyStateMessage || "Start writing your first story"}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <Card key={post.slug} className="space-y-4 p-7 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(28,23,21,0.1)]">
          <Link href={`/post/${post.slug}`} className="block space-y-3">
            <h2 className="font-display text-[2rem] leading-tight text-ink sm:text-[2.35rem]">{post.title}</h2>
            <p className="max-w-3xl text-[15px] leading-8 text-ink/74">{post.excerpt}</p>
          </Link>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}` as Route}>
                <Badge className="bg-ink/5 text-ink/70 transition hover:bg-ink/10">#{tag}</Badge>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-4">
            <p className="text-sm text-ink/58">
              <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-ink transition hover:text-ember">
                {post.author.name}
              </Link>{" "}
              · {formatDate(post.createdAt)}
            </p>
            <LikeButton postId={post.id} initialLiked={post.likedByMe} initialCount={post.likeCount} />
          </div>
        </Card>
      ))}
      {loadingMore ? <p className="py-2 text-center text-sm text-ink/60">Loading more posts...</p> : null}
      {!hasMore ? <p className="py-2 text-center text-sm text-ink/60">No more posts</p> : null}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
