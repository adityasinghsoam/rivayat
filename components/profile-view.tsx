"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
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
    return <p className="text-sm text-neutral-500">Loading profile...</p>;
  }

  if (error) {
    return <p className="text-sm text-neutral-700">{error === "User not found." ? "User not found" : error}</p>;
  }

  if (!profile) {
    return <p className="text-sm text-neutral-700">User not found</p>;
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
      trackEvent("follow_action", { following: data.isFollowing });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update follow status.");
    } finally {
      setFollowBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Card className="animate-rise-in relative grid gap-8 overflow-hidden p-6 sm:grid-cols-[auto_1fr] sm:items-start sm:p-8">
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-3xl font-semibold text-neutral-700">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
          ) : (
            profile.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="relative space-y-4">
          <div className="space-y-1">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-black sm:text-5xl">{profile.name}</h1>
            <p className="text-sm text-neutral-500">@{profile.username}</p>
          </div>
          <div className="flex gap-6 text-sm text-neutral-700">
            <p>{profile.followersCount} followers</p>
            <p>{profile.followingCount} following</p>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-neutral-700">{profile.bio || "This user has not added a bio yet."}</p>
          <p className="text-sm text-neutral-500">Joined {formatDate(profile.createdAt)}</p>
          <div className="flex gap-3">
            {isOwner ? (
              <Link href="/profile/edit">
                <Button variant="secondary">Edit Profile</Button>
              </Link>
            ) : (
              <Button variant={profile.isFollowing ? "ghost" : "primary"} onClick={toggleFollow} disabled={followBusy}>
                {followBusy ? "Updating..." : profile.isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
          {error ? <p className="text-sm text-neutral-700">{error}</p> : null}
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="font-display text-3xl text-black">Posts</h2>
        {profile.posts.length ? (
          <div className="space-y-4">
            {profile.posts.map((post, index) => (
              <Card
                key={post.slug}
                className="animate-stagger-in space-y-3 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-7"
                style={{ ["--stagger-delay" as "--stagger-delay"]: `${Math.min(index * 100, 500)}ms` } as React.CSSProperties}
              >
                <Link href={`/post/${post.slug}` as Route} className="block font-display text-2xl font-semibold tracking-tight text-black">
                  {post.title}
                </Link>
                <p className="text-sm leading-7 text-neutral-700">{post.excerpt}</p>
                <p className="text-sm text-neutral-500">{formatDate(post.createdAt)}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-sm text-neutral-500">No posts available.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
