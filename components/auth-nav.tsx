"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";

export function AuthNav() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  if (loading) {
    return <div className="h-10 w-28" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/login">
          <Button variant="ghost">Log in</Button>
        </Link>
        <Link href="/signup">
          <Button variant="secondary">Join</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link href="/" className="px-3 py-2 text-sm text-ink/75 transition hover:text-ink">
        Explore
      </Link>
      <Link href={"/saved" as Route} className="px-3 py-2 text-sm text-ink/80 transition hover:text-ink">
        Saved
      </Link>
      <Link href="/write" className="px-3 py-2 text-sm text-ink/80 transition hover:text-ink">
        Write
      </Link>
      <NotificationBell />
      <Link href={`/profile/${user.username}` as Route} className="px-3 py-2 text-sm text-ink/80 transition hover:text-ink">
        Profile
      </Link>
      <Button variant="ghost" onClick={onLogout}>
        Log out
      </Button>
    </div>
  );
}
