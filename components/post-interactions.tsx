"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  async function toggleLike() {
    if (busy) {
      return;
    }

    if (!user) {
      setMessage("Login to like posts");
      return;
    }

    const nextLiked = !liked;
    const nextCount = Math.max(0, count + (nextLiked ? 1 : -1));

    setLiked(nextLiked);
    setCount(nextCount);
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
      setLiked(liked);
      setCount(count);
      setMessage(error instanceof Error ? error.message : "Unable to update like");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={liked ? "gap-2 rounded-full text-neutral-900" : "gap-2 rounded-full"}
        onClick={toggleLike}
        disabled={busy}
      >
        <Heart className={liked ? "fill-neutral-900 text-neutral-900" : "text-neutral-500"} size={18} />
        {count}
      </Button>
      {message ? <p className="text-xs text-neutral-500">{message}</p> : null}
    </div>
  );
}
