"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const { user } = useAuth();
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingMode, setReadingMode] = useState(false);

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

  useEffect(() => {
    document.body.classList.toggle("reading-mode", readingMode);

    return () => {
      document.body.classList.remove("reading-mode");
    };
  }, [readingMode]);

  const sanitizedContent = useMemo(() => sanitizeRichText(post?.content ?? ""), [post?.content]);
  const isAuthor = user?.id === post?.author.id;

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading post...</p>;
  }

  if (error) {
    return <p className="text-sm text-neutral-700">{error === "Post not found." ? "Post not found" : error}</p>;
  }

  if (!post) {
    return <p className="text-sm text-neutral-700">Post not found</p>;
  }

  return (
    <article
      className={[
        "mx-auto flex flex-col gap-8 px-0 transition-all duration-300 ease-out",
        readingMode ? "max-w-5xl pt-2 sm:pt-4" : "mt-2 max-w-4xl sm:mt-4",
      ].join(" ")}
    >
      <header
        className={[
          "animate-rise-in relative mx-auto flex w-full flex-col gap-5 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out sm:p-8",
          readingMode ? "max-w-5xl shadow-none" : "max-w-4xl",
        ].join(" ")}
      >
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge>{post.language}</Badge>
            {post.tags.map((tag) => (
              <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}` as Route}>
                <Badge>#{tag}</Badge>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAuthor ? (
              <Link href={`/posts/${post.id}/edit` as Route}>
                <Button variant="secondary" className="px-4 py-2">
                  Edit
                </Button>
              </Link>
            ) : null}
            <Button variant={readingMode ? "primary" : "secondary"} className="px-4 py-2" onClick={() => setReadingMode((current) => !current)}>
              {readingMode ? "Exit Reading Mode" : "Reading Mode"}
            </Button>
          </div>
        </div>

        <div className="relative space-y-4">
          <h1 className="animate-rise-in break-words font-display text-4xl font-semibold leading-tight tracking-tight text-black [animation-delay:120ms] sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <div className="animate-rise-in border-b border-neutral-200 pb-5 [animation-delay:200ms]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-lg font-semibold text-neutral-700">
                  {post.author.avatarUrl ? (
                    <img src={post.author.avatarUrl} alt={post.author.name} className="h-full w-full object-cover" />
                  ) : (
                    post.author.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="space-y-1">
                  <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-black transition hover:text-neutral-700">
                    {post.author.name}
                  </Link>
                  <p className="text-sm text-neutral-500">
                    @{post.author.username} · {formatDate(post.createdAt)} · {post.readTime} min read · {post.views} views
                  </p>
                </div>
              </div>
              {!isAuthor && !readingMode ? <FollowButton username={post.author.username} initialFollowing={post.author.isFollowing} /> : null}
            </div>
            {post.author.bio && !readingMode ? <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-700">{post.author.bio}</p> : null}
            {!post.isPublished ? <p className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Draft preview</p> : null}
          </div>
        </div>
      </header>

      <Card className={["animate-rise-in relative overflow-hidden p-0 transition-all duration-300 ease-out [animation-delay:280ms]", readingMode ? "shadow-none" : ""].join(" ")}>
        <div className="absolute inset-y-10 left-6 w-px bg-neutral-300 sm:left-8" />
        <div
          className={[
            "reading-reveal prose mx-auto break-words px-5 py-10 pl-9 text-neutral-700 transition-all duration-300 ease-out sm:px-10 sm:py-12 sm:pl-12",
            readingMode ? "max-w-4xl text-[1.12rem] leading-8 sm:text-[1.2rem] [&_p]:my-7" : "max-w-3xl text-[1.02rem] leading-relaxed sm:text-[1.08rem]",
            "[&_blockquote]:my-8 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_h1]:mb-6 [&_h1]:mt-10 [&_h1]:break-words [&_h1]:font-display [&_h1]:text-4xl [&_h2]:mb-5 [&_h2]:mt-9 [&_h2]:break-words [&_h2]:font-display [&_h2]:text-3xl [&_p]:break-words [&_p]:whitespace-pre-wrap",
          ].join(" ")}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </Card>

      {!readingMode ? (
        <>
          <Card className="animate-rise-in flex flex-col gap-4 p-5 [animation-delay:360ms] sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex flex-wrap items-center gap-4">
              <LikeButton postId={post.id} initialLiked={post.likedByMe} initialCount={post.likeCount} />
              <p className="text-sm text-neutral-500">{post.commentCount} comments</p>
            </div>
            <BookmarkButton postId={post.id} initialBookmarked={post.bookmarkedByMe} />
          </Card>

          <CommentsSection postId={post.id} />
        </>
      ) : null}
    </article>
  );
}
