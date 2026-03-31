"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CommentsSection } from "@/components/comments-section";
import { LikeButton } from "@/components/post-interactions";
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
  likedByMe: boolean;
  author: {
    name: string;
    username: string;
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
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge>{post.language}</Badge>
          {post.tags.map((tag) => (
            <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}` as Route}>
              <Badge className="bg-ink/5">#{tag}</Badge>
            </Link>
          ))}
        </div>
        <h1 className="font-display text-5xl leading-tight text-ink">{post.title}</h1>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink/60">
            <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-ink">
              {post.author.name}
            </Link>{" "}
            · {formatDate(post.createdAt)}
          </p>
          <LikeButton postId={post.id} initialLiked={post.likedByMe} initialCount={post.likeCount} />
        </div>
      </header>
      <Card className="p-8">
        <div
          className="prose prose-stone prose-lg mx-auto max-w-none text-[1.1rem] leading-9 text-ink/90 [&_blockquote]:border-l-2 [&_blockquote]:border-ember [&_blockquote]:pl-4 [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:font-display [&_h1]:text-4xl [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:font-display [&_h2]:text-3xl [&_p]:my-4 [&_p]:whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
        />
      </Card>
      <CommentsSection postId={post.id} />
    </article>
  );
}
