"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type ProfileData = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  posts: Array<{
    title: string;
    excerpt: string;
    createdAt: string;
    slug: string;
  }>;
};

export function ProfileView({ username }: { username: string }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    apiFetch<{ user: ProfileData }>(`/api/users/${username}`)
      .then((data) => {
        setProfile(data.user);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return <p className="text-sm text-ink/60">Loading profile...</p>;
  }

  if (error) {
    return <p className="text-sm text-ink/60">{error === "User not found." ? "User not found" : error}</p>;
  }

  if (!profile) {
    return <p className="text-sm text-ink/60">User not found</p>;
  }

  const isOwner = user?.username === profile.username;

  async function toggleFollow() {
    if (!user) {
      setError("Please log in.");
      return;
    }

    setFollowBusy(true);
    setError(null);

    try {
      const data = await apiFetch<{
        isFollowing: boolean;
        followersCount: number;
        followingCount: number;
      }>(`/api/users/${username}/follow`, {
        method: "POST",
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              isFollowing: data.isFollowing,
              followersCount: data.followersCount,
              followingCount: data.followingCount,
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update follow status.");
    } finally {
      setFollowBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Card className="grid gap-8 p-8 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-ink/6 text-3xl font-semibold text-ink/55">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
          ) : (
            profile.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="font-display text-5xl text-ink">{profile.name}</h1>
            <p className="text-sm text-ink/58">@{profile.username}</p>
          </div>
          <div className="flex gap-6 text-sm text-ink/62">
            <p>{profile.followersCount} followers</p>
            <p>{profile.followingCount} following</p>
          </div>
          <p className="max-w-2xl text-sm leading-8 text-ink/78">{profile.bio || "This user has not added a bio yet."}</p>
          <p className="text-sm text-ink/58">Joined {formatDate(profile.createdAt)}</p>
          <div className="flex gap-3">
            {isOwner ? (
              <Link href="/profile/edit">
                <Button variant="secondary">Edit Profile</Button>
              </Link>
            ) : (
              <Button variant={profile.isFollowing ? "ghost" : "secondary"} onClick={toggleFollow} disabled={followBusy}>
                {followBusy ? "Updating..." : profile.isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="font-display text-3xl text-ink">Posts</h2>
        {profile.posts.length ? (
          <div className="space-y-4">
            {profile.posts.map((post) => (
              <Card key={post.slug} className="space-y-2 p-7 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(28,23,21,0.1)]">
                <Link href={`/post/${post.slug}` as Route} className="block font-display text-2xl text-ink">
                  {post.title}
                </Link>
                <p className="text-sm leading-8 text-ink/75">{post.excerpt}</p>
                <p className="text-sm text-ink/58">{formatDate(post.createdAt)}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-sm text-ink/60">No posts available.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
