"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";

const navLinkClass =
  "relative px-3 py-2 text-sm text-neutral-300 transition-colors duration-200 hover:text-white after:absolute after:bottom-1 after:left-3 after:h-px after:w-0 after:bg-indigo-400 after:transition-all after:duration-200 hover:after:w-[calc(100%-1.5rem)]";

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
          <Button variant="primary">Join</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link href="/" className={navLinkClass}>
        Explore
      </Link>
      <Link href={"/saved" as Route} className={navLinkClass}>
        Saved
      </Link>
      <Link href="/write" className={navLinkClass}>
        Write
      </Link>
      <NotificationBell />
      <Link href={`/profile/${user.username}` as Route} className={navLinkClass}>
        Profile
      </Link>
      <Button variant="ghost" onClick={onLogout}>
        Log out
      </Button>
    </div>
  );
}
