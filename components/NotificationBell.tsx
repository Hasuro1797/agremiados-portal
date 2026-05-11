"use client";
import apolloClient from "@/graphql/apollo.client";

import { cn, formatDate } from "@/lib/utils";
import { useMutation } from "@apollo/client";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MY_NOTIFICATIONS } from "@/graphql/query/notification.query";
import {
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
} from "@/graphql/mutation/notification.mutation";

interface NotificationItem {
  id: number;
  userId: string;
  subject: string;
  body: string;
  channel: string;
  status: string; // "PENDING" | "SENT" | "FAILED" | "READ"
  readAt?: string;
  createdAt: string;
}

interface NotificationsData {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
}

const POLL_INTERVAL_MS = 60_000;

const isRead = (n: NotificationItem) => n.status === "READ";

export default function NotificationBell() {
  const [data, setData] = useState<NotificationsData | null>(null);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const result = await apolloClient.query({
        query: MY_NOTIFICATIONS,
        variables: { page: 1, pageSize: 10, unreadOnly: false },
        fetchPolicy: "network-only",
      });
      setData(result.data?.myNotifications ?? null);
    } catch {
      // silently fail — bell is non-critical
    }
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const handleMarkRead = async (id: number) => {
    await markRead({ variables: { id } });
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, status: "READ" } : n,
        ),
      };
    });
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        unreadCount: 0,
        notifications: prev.notifications.map((n) => ({
          ...n,
          status: "READ",
        })),
      };
    });
  };

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
              onClick={handleMarkAllRead}
            >
              Marcar todas leídas
            </Button>
          )}
        </div>

        {/* Notification list */}
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                    !isRead(notif) && "bg-blue-50/50 dark:bg-blue-950/10",
                  )}
                  onClick={() => {
                    if (!isRead(notif)) handleMarkRead(notif.id);
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!isRead(notif) && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <div
                      className={cn("flex-1 min-w-0", isRead(notif) && "ml-4")}
                    >
                      <p className="text-sm font-medium truncate">
                        {notif.subject}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notif.body}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />

        {/* Footer */}
        <div className="px-4 py-2">
          <Link
            href="/admin/notificaciones"
            className="text-xs text-center block text-muted-foreground hover:text-foreground transition-colors py-1"
            onClick={() => setOpen(false)}
          >
            Ver todas las notificaciones
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
