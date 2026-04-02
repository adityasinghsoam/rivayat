"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type DraftItem = {
  id: string;
  title: string;
  excerpt: string;
  updatedAt: string;
  tags: string[];
  language: "ENGLISH" | "HINDI";
  views: number;
  readTime: number;
};

export function DraftsList() {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ drafts: DraftItem[] }>("/api/drafts")
      .then((data) => {
        setDrafts(data.drafts);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load drafts.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-sm text-neutral-400">Loading drafts...</p>;
  }

  if (error) {
    return <p className="text-sm text-neutral-300">{error}</p>;
  }

  if (!drafts.length) {
    return (
      <Card className="p-8 text-center">
        <p className="font-display text-3xl text-white">No drafts yet</p>
        <p className="mt-2 text-sm text-neutral-400">Start a new draft and come back to refine it later.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <Card key={draft.id} className="space-y-3 p-6">
          <Link href={`/posts/${draft.id}/edit` as Route} className="block font-display text-2xl text-white">
            {draft.title || "Untitled draft"}
          </Link>
          <p className="text-sm leading-7 text-neutral-300">{draft.excerpt || "No excerpt yet."}</p>
          <p className="text-sm text-neutral-400">
            Updated {formatDate(draft.updatedAt)} · {draft.readTime} min read · {draft.views} views
          </p>
        </Card>
      ))}
    </div>
  );
}
