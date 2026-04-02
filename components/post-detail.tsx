"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CommentsSection } from "@/components/comments-section";
import { LikeButton } from "@/components/post-interactions";
import { BookmarkButton } from "@/components/bookmark-button";
import { FollowButton } from "@/components/follow-button";
import { apiFetch } from "@/lib/api";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { formatDate } from "@/lib/utils";

type PostDetailData = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
  language: "ENGLISH" | "HINDI";
  views: number;
  readTime: number;
  isPublished: boolean;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    isFollowing: boolean;
  };
};

export function PostDetail({ slug }: { slug: string }) {
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ post: PostDetailData }>(`/api/posts/${slug}`)
      .then((data) => {
        setPost(data.post);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load post.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <p className="text-sm text-neutral-400">Loading post...</p>;
  }

  if (error) {
    return <p className="text-sm text-neutral-300">{error === "Post not found." ? "Post not found" : error}</p>;
  }

  if (!post) {
    return <p className="text-sm text-neutral-300">Post not found</p>;
  }

  return (
    <article className="mx-auto mt-2 flex max-w-4xl flex-col gap-8 px-0 sm:mt-4">
      <header className="animate-rise-in relative mx-auto flex w-full max-w-4xl flex-col gap-5 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.4)] backdrop-blur-md sm:p-8">
        <div className="relative flex flex-wrap gap-2">
          <Badge className="border-white/10 bg-white/6 text-neutral-300">{post.language}</Badge>
          {post.tags.map((tag) => (
            <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}` as Route}>
              <Badge className="border-white/10 bg-white/6 text-neutral-200">#{tag}</Badge>
            </Link>
          ))}
        </div>
        <div className="relative space-y-4">
          <h1 className="animate-rise-in break-words font-display text-4xl font-semibold leading-tight tracking-tight text-white [animation-delay:120ms] sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <div className="animate-rise-in border-b border-white/10 pb-5 [animation-delay:200ms]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/8 text-lg font-semibold text-neutral-300">
                  {post.author.avatarUrl ? (
                    <img src={post.author.avatarUrl} alt={post.author.name} className="h-full w-full object-cover" />
                  ) : (
                    post.author.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-white transition hover:text-indigo-300">
                    {post.author.name}
                  </Link>
                  <p className="text-sm text-neutral-400">
                    @{post.author.username} {" · "} {formatDate(post.createdAt)} {" · "} {post.readTime} min read {" · "} {post.views} views
                  </p>
                </div>
              </div>
              <FollowButton username={post.author.username} initialFollowing={post.author.isFollowing} />
            </div>
            {post.author.bio ? <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300">{post.author.bio}</p> : null}
            {!post.isPublished ? <p className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-400">Draft preview</p> : null}
          </div>
        </div>
      </header>

      <Card className="animate-rise-in overflow-hidden p-0 [animation-delay:280ms]">
        <div
          className="reading-reveal prose prose-invert prose-lg mx-auto max-w-3xl break-words px-5 py-10 text-[1.02rem] leading-relaxed text-neutral-300 sm:px-10 sm:py-12 sm:text-[1.08rem] [&_blockquote]:my-8 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-400 [&_blockquote]:bg-white/6 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_h1]:mb-6 [&_h1]:mt-10 [&_h1]:break-words [&_h1]:font-display [&_h1]:text-4xl [&_h2]:mb-5 [&_h2]:mt-9 [&_h2]:break-words [&_h2]:font-display [&_h2]:text-3xl [&_p]:my-6 [&_p]:break-words [&_p]:whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
        />
      </Card>

      <Card className="animate-rise-in flex flex-col gap-4 p-5 [animation-delay:360ms] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <LikeButton postId={post.id} initialLiked={post.likedByMe} initialCount={post.likeCount} />
          <p className="text-sm text-neutral-400">{post.commentCount} comments</p>
        </div>
        <BookmarkButton postId={post.id} initialBookmarked={post.bookmarkedByMe} />
      </Card>

      <CommentsSection postId={post.id} />
    </article>
  );
}
