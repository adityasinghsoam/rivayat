"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Bell } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: string;
  type: "like" | "comment" | "follow";
  createdAt: string;
  isRead: boolean;
  actor: {
    name: string;
    username: string;
  };
  post: {
    slug: string;
  } | null;
};

function notificationLabel(notification: NotificationItem) {
  if (notification.type === "like") {
    return `${notification.actor.name} liked your post`;
  }

  if (notification.type === "comment") {
    return `${notification.actor.name} commented on your post`;
  }

  return `${notification.actor.name} followed you`;
}

function notificationHref(notification: NotificationItem): Route {
  if ((notification.type === "like" || notification.type === "comment") && notification.post?.slug) {
    return `/post/${notification.post.slug}` as Route;
  }

  return `/profile/${notification.actor.username}` as Route;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    void loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const data = await apiFetch<{ notifications: NotificationItem[]; unreadCount: number }>("/api/notifications");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }

  async function toggleOpen() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications();

      if (unreadCount > 0) {
        await apiFetch("/api/notifications/read", {
          method: "POST",
        });
        setUnreadCount(0);
        setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      }
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" className="group relative rounded-full px-3" onClick={toggleOpen}>
        <Bell size={18} className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-rose-500 px-1 text-[10px] font-semibold text-white shadow-[0_0_18px_rgba(139,92,246,0.35)]">
            {unreadCount}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-80 rounded-3xl border border-white/10 bg-slate-950/78 p-4 shadow-[0_24px_60px_rgba(2,6,23,0.58)] backdrop-blur-lg">
          <div className="space-y-3">
            <p className="bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-sm font-semibold text-transparent">Notifications</p>
            {notifications.length ? (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notificationHref(notification)}
                  className="block rounded-2xl border border-transparent p-3 transition-all duration-200 hover:border-violet-400/40 hover:bg-white/6"
                  onClick={() => setOpen(false)}
                >
                  <p className="text-sm text-neutral-200">{notificationLabel(notification)}</p>
                  <p className="text-xs text-neutral-400">
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.createdAt))}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-neutral-400">You&apos;re all caught up</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
