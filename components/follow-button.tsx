"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggleFollow() {
    if (!user) {
      setMessage("Please log in.");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const data = await apiFetch<{ isFollowing: boolean }>(`/api/users/${username}/follow`, {
        method: "POST",
      });
      setFollowing(data.isFollowing);
      trackEvent("follow_action", { following: data.isFollowing });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update follow status.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button variant={following ? "ghost" : "primary"} onClick={toggleFollow} disabled={busy}>
        {busy ? "Updating..." : following ? "Unfollow" : "Follow"}
      </Button>
      {message ? <p className="text-xs text-neutral-400">{message}</p> : null}
    </div>
  );
}
