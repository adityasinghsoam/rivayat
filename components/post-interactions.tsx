"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggleLike() {
    if (busy) {
      return;
    }

    if (!user) {
      setMessage("Login to like posts");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const data = await apiFetch<{ liked: boolean; likeCount: number }>(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      setLiked(data.liked);
      setCount(data.likeCount);
      trackEvent("post_liked", { liked: data.liked });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update like");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={liked ? "gap-2 rounded-full text-rose-300" : "gap-2 rounded-full"}
        onClick={toggleLike}
        disabled={busy}
      >
        <Heart className={liked ? "fill-rose-400 text-rose-400" : "text-neutral-400"} size={18} />
        {count}
      </Button>
      {message ? <p className="text-xs text-neutral-400">{message}</p> : null}
    </div>
  );
}
