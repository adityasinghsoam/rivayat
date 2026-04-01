"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function BookmarkButton({
  postId,
  initialBookmarked,
}: {
  postId: string;
  initialBookmarked: boolean;
}) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggleBookmark() {
    if (!user) {
      setMessage("Please log in.");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const data = await apiFetch<{ bookmarked: boolean }>(`/api/posts/${postId}/bookmark`, {
        method: "POST",
      });
      setBookmarked(data.bookmarked);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update bookmark.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button variant="ghost" className={bookmarked ? "gap-2 text-ember" : "gap-2"} onClick={toggleBookmark} disabled={busy}>
        <Bookmark className={bookmarked ? "fill-ember text-ember" : "text-ink/70"} size={18} />
        {bookmarked ? "Saved" : "Save"}
      </Button>
      {message ? <p className="text-xs text-ink/60">{message}</p> : null}
    </div>
  );
}
