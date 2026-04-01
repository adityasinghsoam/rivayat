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
    return <p className="text-sm text-ink/60">Loading post...</p>;
  }

  if (error) {
    return <p className="text-sm text-ink/60">{error === "Post not found." ? "Post not found" : error}</p>;
  }

  if (!post) {
    return <p className="text-sm text-ink/60">Post not found</p>;
  }

  return (
    <article className="mx-auto mt-2 flex max-w-4xl flex-col gap-8 px-0 sm:mt-4">
      <header className="mx-auto flex w-full max-w-4xl flex-col gap-5 rounded-[2rem] border border-neutral-200 bg-white/80 p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-amber-100 text-amber-700">{post.language}</Badge>
          {post.tags.map((tag) => (
            <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}` as Route}>
              <Badge className="bg-neutral-100 text-neutral-700">#{tag}</Badge>
            </Link>
          ))}
        </div>
        <div className="space-y-4">
          <h1 className="break-words font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <div className="border-b border-black/5 pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-ink/6 text-lg font-semibold text-ink/60">
                  {post.author.avatarUrl ? (
                    <img src={post.author.avatarUrl} alt={post.author.name} className="h-full w-full object-cover" />
                  ) : (
                    post.author.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-ink transition hover:text-amber-700">
                    {post.author.name}
                  </Link>
                  <p className="text-sm text-ink/55">
                    @{post.author.username} · {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
              <FollowButton username={post.author.username} initialFollowing={post.author.isFollowing} />
            </div>
            {post.author.bio ? <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-700">{post.author.bio}</p> : null}
          </div>
        </div>
      </header>

      <Card className="overflow-hidden p-0">
        <div
          className="prose prose-stone prose-lg mx-auto max-w-3xl break-words px-5 py-10 text-[1.02rem] leading-relaxed text-neutral-700 sm:px-10 sm:py-12 sm:text-[1.08rem] [&_blockquote]:my-8 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-amber-700 [&_blockquote]:bg-amber-50 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_h1]:mb-6 [&_h1]:mt-10 [&_h1]:break-words [&_h1]:font-display [&_h1]:text-4xl [&_h2]:mb-5 [&_h2]:mt-9 [&_h2]:break-words [&_h2]:font-display [&_h2]:text-3xl [&_p]:my-6 [&_p]:break-words [&_p]:whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
        />
      </Card>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <LikeButton postId={post.id} initialLiked={post.likedByMe} initialCount={post.likeCount} />
          <p className="text-sm text-neutral-600">{post.commentCount} comments</p>
        </div>
        <BookmarkButton postId={post.id} initialBookmarked={post.bookmarkedByMe} />
      </Card>

      <CommentsSection postId={post.id} />
    </article>
  );
}
