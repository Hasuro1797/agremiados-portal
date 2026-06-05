"use client";
import apolloClient from "@/graphql/apollo.client";

import { useMutation } from "@apollo/client";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationRow from "@/components/notifications/NotificationRow";
import {
  type NotificationsData,
} from "@/components/notifications/notification-utils";
import { MY_NOTIFICATIONS } from "@/graphql/query/notification.query";
import {
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
} from "@/graphql/mutation/notification.mutation";
import { routes } from "@/lib/routes";

const POLL_INTERVAL_MS = 60_000;

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
    // optimistic update
    setData((prev) =>
      prev
        ? {
            ...prev,
            unreadCount: Math.max(0, prev.unreadCount - 1),
            notifications: prev.notifications.map((n) =>
              n.id === id ? { ...n, status: "READ" } : n,
            ),
          }
        : prev,
    );
    try {
      await markRead({ variables: { id } });
    } catch {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            unreadCount: 0,
            notifications: prev.notifications.map((n) => ({
              ...n,
              status: "READ",
            })),
          }
        : prev,
    );
    try {
      await markAllRead();
    } catch {
      fetchNotifications();
    }
  };

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-1rem))] p-0 overflow-hidden rounded-2xl shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-primary hover:bg-primary/5"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-3.5" />
              Marcar todas leídas
            </Button>
          )}
        </div>

        {/* Notification list */}
        <ScrollArea className="h-[min(26rem,60vh)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-gray-50">
                <Bell className="size-5 text-gray-300" />
              </span>
              <p className="text-sm text-gray-500">No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <NotificationRow
                  key={notif.id}
                  notification={notif}
                  compact
                  onRead={handleMarkRead}
                  onBeforeNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-white p-2">
          <Link
            href={routes.myNotifications}
            className="block w-full rounded-lg py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            onClick={() => setOpen(false)}
          >
            Ver todas las notificaciones
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
