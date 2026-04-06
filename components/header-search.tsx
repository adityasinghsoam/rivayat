"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type SearchResult = {
  title: string;
  excerpt: string;
  slug: string;
  createdAt: string;
  author: {
    name: string;
  };
};

export function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const nextQuery = searchParams.get("q") || "";
    setQuery(nextQuery);
  }, [searchParams]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setSearched(false);
      router.push("/");
      return;
    }

    const data = await apiFetch<{ posts: SearchResult[] }>(`/api/posts/search?q=${encodeURIComponent(trimmed)}`);
    setResults(data.posts);
    setSearched(true);
    router.push(`/?q=${encodeURIComponent(trimmed)}` as Route);
  }

  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={onSubmit}>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search posts..."
          className="rounded-full bg-white"
        />
      </form>
      {searched ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.65rem)] z-30 rounded-[1.75rem] border border-neutral-200 bg-white p-4 shadow-md">
          {results.length ? (
            <div className="space-y-3">
              {results.map((post) => (
                <Link
                  key={post.slug}
                  href={`/post/${post.slug}` as Route}
                  className="block rounded-2xl border border-transparent p-3 transition-colors duration-200 hover:border-neutral-200 hover:bg-neutral-50"
                >
                  <p className="font-semibold tracking-tight text-neutral-900">{post.title}</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-700">{post.excerpt}</p>
                  <p className="text-xs text-neutral-400">
                    {post.author.name} · {formatDate(post.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No posts found</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
