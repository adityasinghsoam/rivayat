"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/rich-text-editor";
import { makeExcerpt } from "@/lib/utils";

type EditorPayload = {
  id?: string;
  title: string;
  content: string;
  tags: string[];
  language: "ENGLISH" | "HINDI";
};

export function PostEditorForm({ initialValue }: { initialValue?: EditorPayload }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [content, setContent] = useState(initialValue?.content ?? "");
  const [tags, setTags] = useState(initialValue?.tags.join(", ") ?? "");
  const [language, setLanguage] = useState<"ENGLISH" | "HINDI">(initialValue?.language ?? "ENGLISH");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const payload = {
        title,
        content,
        excerpt: makeExcerpt(content),
        tags: tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
        language,
      };

      if (initialValue?.id) {
        await apiFetch(`/api/posts/${initialValue.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        router.push(`/posts/${initialValue.id}`);
      } else {
        await apiFetch<{ post: { id: string } }>("/api/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        trackEvent("post_created", { language });
        router.push("/");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-5 p-8">
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Title</label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A title that carries weight" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Content</label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Tags</label>
          <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="poetry, monsoon, memory" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Language</label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as "ENGLISH" | "HINDI")}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white shadow-[0_8px_24px_rgba(2,6,23,0.22)] backdrop-blur-md transition-all duration-200 focus:border-violet-400/70 focus:outline-none focus:ring-2 focus:ring-violet-400/45"
          >
            <option value="ENGLISH">English</option>
            <option value="HINDI">Hindi</option>
          </select>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button variant="secondary" type="submit" disabled={busy}>
          {busy ? "Saving..." : initialValue?.id ? "Update post" : "Publish post"}
        </Button>
      </form>
    </Card>
  );
}
