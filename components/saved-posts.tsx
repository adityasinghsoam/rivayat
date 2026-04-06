"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type SavedPost = {
  id: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    createdAt: string;
    author: {
      name: string;
      username: string;
    };
  };
};

export function SavedPosts() {
  const [bookmarks, setBookmarks] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ bookmarks: SavedPost[] }>("/api/bookmarks")
      .then((data) => {
        setBookmarks(data.bookmarks);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load saved posts.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading saved posts...</p>;
  }

  if (error) {
    return <p className="text-sm text-neutral-700">{error}</p>;
  }

  if (!bookmarks.length) {
    return (
      <Card className="p-8 text-center">
        <p className="font-display text-3xl text-black">No saved posts yet</p>
        <p className="mt-2 text-sm text-neutral-500">Save posts to read them later</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id} className="flex flex-col gap-3 p-6">
          <Link href={`/post/${bookmark.post.slug}` as Route} className="block">
            <h2 className="font-display text-2xl leading-tight text-black">{bookmark.post.title}</h2>
          </Link>
          <p className="text-sm leading-8 text-neutral-700">{bookmark.post.excerpt}</p>
          <p className="text-sm text-neutral-500">
            <Link href={`/profile/${bookmark.post.author.username}` as Route} className="font-medium text-neutral-900">
              {bookmark.post.author.name}
            </Link>{" "}
            · {formatDate(bookmark.post.createdAt)}
          </p>
        </Card>
      ))}
    </div>
  );
}
