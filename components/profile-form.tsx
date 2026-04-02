"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForm({
  initialValue,
}: {
  initialValue: {
    username: string;
    name: string;
    bio: string | null;
    avatarUrl: string | null;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initialValue.name);
  const [bio, setBio] = useState(initialValue.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialValue.avatarUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);

    try {
      const data = await apiFetch<{ user: { username: string } }>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({ name, bio, avatarUrl }),
      });
      router.push(`/profile/${data.user.username}` as Route);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Name</label>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Avatar URL</label>
        <Input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Bio</label>
        <Textarea value={bio} onChange={(event) => setBio(event.target.value)} />
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <Button onClick={submit} disabled={busy}>
        {busy ? "Saving..." : "Save profile"}
      </Button>
    </div>
  );
}
