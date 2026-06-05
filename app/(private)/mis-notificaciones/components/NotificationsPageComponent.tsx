"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import NotificationRow from "@/components/notifications/NotificationRow";
import { type NotificationItem } from "@/components/notifications/notification-utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
} from "@/graphql/mutation/notification.mutation";
import { MY_NOTIFICATIONS } from "@/graphql/query/notification.query";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@apollo/client";
import { get } from "lodash";
import {
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";

const PAGE_SIZE = 15;

type Filter = "ALL" | "UNREAD";

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function NotificationsPageComponent() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);

  const variables = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      unreadOnly: filter === "UNREAD",
    }),
    [page, filter],
  );

  const { data, loading, error, refetch } = useQuery(MY_NOTIFICATIONS, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const items = (get(data, "myNotifications.notifications", []) ??
    []) as NotificationItem[];
  const total = get(data, "myNotifications.total", 0) as number;
  const unreadCount = get(data, "myNotifications.unreadCount", 0) as number;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleMarkRead = async (id: number) => {
    try {
      await markRead({ variables: { id } });
    } finally {
      refetch();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } finally {
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-primary">
                Mis notificaciones
              </h1>
              <p className="text-sm text-gray-500">
                Comunicados del colegio y avisos de tu cuenta.
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                className="gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="size-4" />
                Marcar todas leídas
              </Button>
            )}
          </header>

          {/* Filter tabs */}
          <Tabs
            value={filter}
            onValueChange={(v) => {
              setFilter(v as Filter);
              setPage(1);
            }}
          >
            <TabsList className="bg-white border border-gray-100 shadow-sm">
              <TabsTrigger
                value="ALL"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Todas
              </TabsTrigger>
              <TabsTrigger
                value="UNREAD"
                className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                No leídas
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading && items.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="p-10 text-center text-sm text-red-600">
                Ocurrió un error al cargar las notificaciones.
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Bell className="size-10 text-primary/30 mx-auto" />
                <p className="text-sm font-semibold text-primary">
                  {filter === "UNREAD"
                    ? "No tienes notificaciones sin leer"
                    : "No tienes notificaciones"}
                </p>
                <p className="text-xs text-gray-500">
                  Aquí verás los comunicados y avisos del colegio.
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    notification={item}
                    onRead={handleMarkRead}
                  />
                ))}
              </div>
            )}

            {items.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500">
                  {total} {total === 1 ? "notificación" : "notificaciones"}
                </p>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const numbers = getPageNumbers(page, totalPages);
  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      {numbers.map((n, i) =>
        n === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-xs text-gray-400">
            …
          </span>
        ) : (
          <Button
            key={n}
            size="sm"
            variant={n === page ? "default" : "ghost"}
            className={cn(
              "size-8 p-0 text-xs",
              n === page && "bg-primary text-white hover:bg-primary",
            )}
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ),
      )}
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
