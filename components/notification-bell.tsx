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
      <Button variant="ghost" className="relative rounded-full px-3 hover:bg-ink/6" onClick={toggleOpen}>
        <Bell size={18} />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-80 rounded-3xl border border-black/5 bg-white/96 p-4 shadow-card backdrop-blur">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {notifications.length ? (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notificationHref(notification)}
                  className="block rounded-2xl p-3 transition hover:bg-ink/5"
                  onClick={() => setOpen(false)}
                >
                  <p className="text-sm text-ink">{notificationLabel(notification)}</p>
                  <p className="text-xs text-ink/55">
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.createdAt))}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-ink/60">You&apos;re all caught up</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
