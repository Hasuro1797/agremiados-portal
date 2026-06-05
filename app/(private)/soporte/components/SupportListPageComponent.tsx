"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MY_SUPPORTS } from "@/graphql/query/support.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { SupportListItem, SupportStatus } from "@/types/support.type";
import { useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PRIORITY_CLASSES,
  PRIORITY_LABELS,
  STATUS_CLASSES,
  STATUS_LABELS,
} from "./support-utils";

const PAGE_SIZE = 10;

type StatusFilter = SupportStatus | "ALL";

const FILTER_ORDER: StatusFilter[] = [
  "ALL",
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
  "REOPENED",
  "REJECTED",
  "CLOSED",
];

const FILTER_LABEL = (f: StatusFilter) =>
  f === "ALL" ? "Todos" : STATUS_LABELS[f];

const formatDate = (iso: string) => {
  try {
    return format(parseISO(iso), "dd MMM yyyy", { locale: es });
  } catch {
    return iso;
  }
};

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function SupportListPageComponent() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);

  const variables = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(status !== "ALL" ? { status } : {}),
    }),
    [page, status],
  );

  const { data, loading, error } = useQuery(MY_SUPPORTS, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const items = (get(data, "mySupports.items", []) ?? []) as SupportListItem[];
  const total = get(data, "mySupports.total", 0) as number;
  const pageSize = get(data, "mySupports.pageSize", PAGE_SIZE) as number;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-primary">
                Soporte y reclamos
              </h1>
              <p className="text-sm text-gray-500">
                Revisa el estado de tus reclamos y abre uno nuevo cuando lo
                necesites.
              </p>
            </div>
            <Button
              asChild
              className="bg-accent hover:bg-accent-hover text-white"
            >
              <Link href={routes.support.new}>
                <Plus className="mr-1.5 size-4" />
                Nuevo reclamo
              </Link>
            </Button>
          </header>

          {/* Status tabs */}
          <Tabs
            value={status}
            onValueChange={(v) => {
              setStatus(v as StatusFilter);
              setPage(1);
            }}
          >
            <TabsList className="bg-white border border-gray-100 shadow-sm overflow-x-auto max-w-full justify-start">
              {FILTER_ORDER.map((f) => (
                <TabsTrigger
                  key={f}
                  value={f}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  {FILTER_LABEL(f)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading && items.length === 0 ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="p-10 text-center text-sm text-red-600">
                Ocurrió un error al cargar los reclamos.
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <MessageSquare className="size-10 text-primary/30 mx-auto" />
                <p className="text-sm font-semibold text-primary">
                  No tienes reclamos
                </p>
                <p className="text-xs text-gray-500">
                  Cuando abras un reclamo, lo verás listado aquí.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="px-4 sm:px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <Link
                      href={routes.support.detail(item.id)}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-primary line-clamp-1">
                          {item.topic}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="size-3.5 text-primary" />
                            {formatDate(item.createdAt)}
                          </span>
                          {item.category?.name && (
                            <span>· {item.category.name}</span>
                          )}
                          {item.place && <span>· {item.place}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                            STATUS_CLASSES[item.status],
                          )}
                        >
                          {STATUS_LABELS[item.status]}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            PRIORITY_CLASSES[item.priority],
                          )}
                        >
                          {PRIORITY_LABELS[item.priority]}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {items.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500">
                  {total} {total === 1 ? "reclamo" : "reclamos"}
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
