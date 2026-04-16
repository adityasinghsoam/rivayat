"use client";

import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/rich-text-editor";
import { normalizeExcerpt, stripHtml } from "@/lib/utils";

type EditorPayload = {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  language: "ENGLISH" | "HINDI";
  isPublished?: boolean;
  updatedAt?: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function PostEditorForm({ initialValue }: { initialValue?: EditorPayload }) {
  const router = useRouter();
  const [postId, setPostId] = useState(initialValue?.id ?? null);
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [content, setContent] = useState(initialValue?.content ?? "");
  const [excerpt, setExcerpt] = useState(initialValue?.excerpt ?? "");
  const [tags, setTags] = useState(initialValue?.tags.join(", ") ?? "");
  const [language, setLanguage] = useState<"ENGLISH" | "HINDI">(initialValue?.language ?? "ENGLISH");
  const [busyAction, setBusyAction] = useState<"draft" | "publish" | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialValue?.updatedAt ?? null);
  const [error, setError] = useState<string | null>(null);
  const lastSavedSnapshotRef = useRef("");

  const payload = useMemo(
    () => ({
      title,
      content,
      excerpt: normalizeExcerpt(excerpt, content),
      tags: tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
      language,
    }),
    [title, content, excerpt, tags, language],
  );

  const excerptLength = stripHtml(excerpt).trim().length;

  const currentSnapshot = JSON.stringify({
    ...payload,
    postId,
    isPublished: initialValue?.isPublished ?? false,
  });

  function buildSnapshot(nextPostId: string | null, publish: boolean) {
    return JSON.stringify({
      ...payload,
      postId: nextPostId,
      isPublished: publish,
    });
  }

  useEffect(() => {
    lastSavedSnapshotRef.current = currentSnapshot;
  }, []);

  async function persistPost(publish: boolean, autosave = false) {
    setError(null);

    if (autosave) {
      setSaveState("saving");
    } else {
      setBusyAction(publish ? "publish" : "draft");
    }

    try {
      const nextPayload = {
        ...payload,
        isPublished: publish,
      };

      let resolvedPostId = postId;

      if (postId) {
        const data = await apiFetch<{ post: { id: string; updatedAt: string; isPublished: boolean } }>(`/api/posts/${postId}`, {
          method: "PATCH",
          body: JSON.stringify(nextPayload),
        });

        resolvedPostId = data.post.id;
        setPostId(data.post.id);
        setLastSavedAt(data.post.updatedAt);
      } else {
        const data = await apiFetch<{ post: { id: string; updatedAt: string; isPublished: boolean } }>("/api/posts", {
          method: "POST",
          body: JSON.stringify(nextPayload),
        });

        resolvedPostId = data.post.id;
        setPostId(data.post.id);
        setLastSavedAt(data.post.updatedAt);
      }

      lastSavedSnapshotRef.current = buildSnapshot(resolvedPostId, publish);

      if (autosave) {
        setSaveState("saved");
        return;
      }

      if (publish) {
        trackEvent("post_created", { language });
        router.push(resolvedPostId ? (`/post/${resolvedPostId}` as Route) : ("/" as Route));
      } else {
        router.push("/drafts" as Route);
      }

      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save post";
      setError(message);
      setSaveState("error");
    } finally {
      setBusyAction(null);
    }
  }

  useEffect(() => {
    if (busyAction !== null) {
      return;
    }

    if (!title.trim() && !stripHtml(content)) {
      return;
    }

    if (currentSnapshot === lastSavedSnapshotRef.current) {
      return;
    }

    setSaveState("saving");
    const timer = window.setTimeout(() => {
      void persistPost(initialValue?.isPublished ?? false, true);
    }, 1500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentSnapshot, busyAction]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (currentSnapshot === lastSavedSnapshotRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [currentSnapshot]);

  return (
    <Card className="space-y-5 p-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Writing"}
            </p>
            {lastSavedAt ? <p className="text-xs text-neutral-400">Last saved {new Date(lastSavedAt).toLocaleString("en-IN")}</p> : null}
          </div>
          {!initialValue?.isPublished ? <p className="text-xs text-neutral-400">Drafts autosave while you type</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900">Title</label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A title that carries weight" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900">Content</label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-neutral-900">Excerpt</label>
            <p className="text-xs text-neutral-400">{Math.min(excerptLength, 180)}/180</p>
          </div>
          <Textarea
            value={excerpt}
            maxLength={180}
            onChange={(event) => setExcerpt(stripHtml(event.target.value))}
            placeholder="Leave blank to auto-generate from the first 150 characters of your content"
          />
          <p className="text-xs text-neutral-400">If empty, an excerpt is generated from the first 150 plain-text characters of the content.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900">Tags</label>
          <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="poetry, monsoon, memory" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900">Language</label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as "ENGLISH" | "HINDI")}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 transition-all duration-200 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          >
            <option value="ENGLISH">English</option>
            <option value="HINDI">Hindi</option>
          </select>
        </div>
        {error ? <p className="text-sm text-neutral-700">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" type="button" disabled={busyAction !== null} onClick={() => void persistPost(false)}>
            {busyAction === "draft" ? "Saving draft..." : "Save Draft"}
          </Button>
          <Button type="button" disabled={busyAction !== null} onClick={() => void persistPost(true)}>
            {busyAction === "publish" ? "Publishing..." : initialValue?.id ? "Save Changes" : "Publish"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
