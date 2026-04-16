"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FollowToggleButton({ authorUsername }: { authorUsername: string }) {
  const [following, setFollowing] = useState(false);

  return (
    <Button
      variant={following ? "secondary" : "ghost"}
      type="button"
      className="px-3 py-1.5 text-sm"
      data-follow-author={authorUsername}
      onClick={() => setFollowing((current) => !current)}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
