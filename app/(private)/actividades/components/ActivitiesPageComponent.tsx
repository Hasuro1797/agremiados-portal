/* eslint-disable @next/next/no-img-element */
"use client";
import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GET_ALL_ACTIVITIES } from "@/graphql/query/activity.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/organization-provider";
import { IActivity } from "@/types/activities";
import { ActivityType } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { addMonths, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import { CalendarDays, CircleAlert, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ActivityCard from "./ActivityCard";

const PAGE_SIZE = 9;

function generateMonthOptions() {
  const opts: { label: string; value: string }[] = [
    { label: "Cualquier fecha", value: "" },
  ];
  for (let i = 0; i < 12; i++) {
    const d = addMonths(startOfMonth(new Date()), i);
    opts.push({
      label: format(d, "MMMM yyyy", { locale: es }),
      value: format(d, "yyyy-MM"),
    });
  }
  return opts;
}

const monthOptions = generateMonthOptions();

const typeOptions = [
  { label: "Todos los tipos", value: "" },
  { label: "Academico", value: ActivityType.ACADEMIC },
  { label: "Social", value: ActivityType.SOCIAL },
];

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-50 rounded-lg w-full" />
        <div className="h-3 bg-gray-50 rounded-lg w-2/3" />
        <div className="h-3 bg-gray-50 rounded-lg w-1/2" />
        <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-1">
          <div className="h-5 bg-gray-100 rounded-lg w-16" />
          <div className="h-4 bg-gray-50 rounded-lg w-32" />
        </div>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  )
    pages.push(p);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function ActivitiesPageComponent() {
  const { organization } = useOrganization();

  const [page, setPage] = useState(1);
  const [inputSearch, setInputSearch] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("");

  const gridRef = useRef<HTMLDivElement>(null);

  const filters = {
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(monthFilter ? { month: monthFilter } : {}),
  };

  const { data, loading, error } = useQuery(GET_ALL_ACTIVITIES, {
    variables: {
      page,
      pageSize: PAGE_SIZE,
      orderBy: "date-asc",
      search: search || undefined,
      filters: Object.keys(filters).length ? filters : undefined,
    },
    skip: !organization?.moduleEvents,
    fetchPolicy: "cache-and-network",
  });

  const activities: IActivity[] = get(
    data,
    "getActivitiesFromWebsite.activities",
    [],
  );
  const meta = get(data, "getActivitiesFromWebsite.meta", {
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const hasActiveFilters = !!search || !!typeFilter || !!monthFilter;

  function applySearch() {
    setSearch(inputSearch.trim());
    setPage(1);
  }

  function clearFilters() {
    setInputSearch("");
    setSearch("");
    setTypeFilter("");
    setMonthFilter("");
    setPage(1);
  }

  useEffect(() => {
    if (page > 1 && gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  const moduleDisabled = organization && !organization.moduleEvents;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <div className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav
          className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
          aria-label="Breadcrumb"
        >
          <Link
            href={routes.home}
            className="hover:text-primary transition-colors"
          >
            Inicio
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Actividades</span>
        </nav>

        <div className="mb-7 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <h1 className="text-3xl font-bold text-gray-900">
            Actividades y Eventos
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl leading-relaxed">
            Descubra seminarios, encuentros sociales y oportunidades de
            desarrollo continuo organizadas para los miembros del Colegio.
          </p>
        </div>

        {moduleDisabled && (
          <div className="flex flex-col items-center justify-center gap-4 py-32 text-center animate-in fade-in-0 duration-500">
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
              <CalendarDays className="size-12 text-gray-200 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-600">
                Modulo no disponible
              </h3>
              <p className="text-gray-400 text-sm mt-1 max-w-xs">
                El modulo de actividades no esta habilitado para tu
                organizacion.
              </p>
            </div>
          </div>
        )}

        {!moduleDisabled && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both">
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Buscar Actividad
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="Ej. Seminario de Derecho Penal..."
                      value={inputSearch}
                      onChange={(e) => setInputSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applySearch()}
                      className="pl-9 h-10 border-gray-200 rounded-xl text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-44 shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Tipo
                  </p>
                  <Select
                    value={typeFilter || "__all__"}
                    onValueChange={(v) => {
                      setTypeFilter(v === "__all__" ? "" : v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 border-gray-200 rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((o) => (
                        <SelectItem
                          key={o.value || "__all__"}
                          value={o.value || "__all__"}
                        >
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-48 shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Mes
                  </p>
                  <Select
                    value={monthFilter || "__all__"}
                    onValueChange={(v) => {
                      setMonthFilter(v === "__all__" ? "" : v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 border-gray-200 rounded-xl text-sm capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((o) => (
                        <SelectItem
                          key={o.value || "__all__"}
                          value={o.value || "__all__"}
                          className="capitalize"
                        >
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={applySearch}
                  className="h-10 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 shrink-0 w-full sm:w-auto"
                >
                  Filtrar
                </Button>
              </div>

              {(hasActiveFilters || (!loading && meta.total > 0)) && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  {hasActiveFilters ? (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors animate-in fade-in-0 duration-200"
                    >
                      <X className="size-3" />
                      Limpiar filtros
                    </button>
                  ) : (
                    <span />
                  )}
                  {!loading && meta.total > 0 && (
                    <span className="text-xs text-gray-400">
                      {meta.total} actividad{meta.total !== 1 ? "es" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 items-center justify-center py-20 animate-in fade-in-0 duration-300">
                <CircleAlert className="text-primary/60 size-10" />
                <p className="text-gray-500 text-sm">
                  No se pudieron cargar las actividades
                </p>
              </div>
            )}

            {!loading && !error && activities.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 py-20 animate-in fade-in-0 duration-300">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <CalendarDays className="size-9 text-gray-300" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-gray-600">
                    {hasActiveFilters ? "Sin resultados" : "No hay actividades"}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1 max-w-[260px]">
                    {hasActiveFilters
                      ? "Intenta con otros filtros o borra la busqueda."
                      : "No hay actividades disponibles por el momento."}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-3 text-primary text-sm font-medium hover:underline"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            )}

            {!loading && !error && activities.length > 0 && (
              <div
                ref={gridRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
              >
                {activities.map((activity, index) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    index={index}
                  />
                ))}
              </div>
            )}

            {!loading && !error && activities.length > 0 && (
              <div className="mt-10 animate-in fade-in-0 duration-300 space-y-3">
                <p className="text-center text-sm text-gray-400">
                  Mostrando{" "}
                  <span className="font-semibold text-gray-600">
                    {(page - 1) * PAGE_SIZE + 1}
                    {"--"}
                    {Math.min(page * PAGE_SIZE, meta.total)}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold text-gray-600">
                    {meta.total}
                  </span>{" "}
                  actividad{meta.total !== 1 ? "es" : ""}
                </p>

                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-xl h-9 px-4 text-sm"
                    >
                      Anterior
                    </Button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers(page, meta.totalPages).map((p, idx) =>
                        p === "..." ? (
                          <span
                            key={`e-${idx}`}
                            className="w-8 text-center text-gray-400 text-sm select-none"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p as number)}
                            className={cn(
                              "w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150",
                              page === p
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-100",
                            )}
                          >
                            {p}
                          </button>
                        ),
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-xl h-9 px-4 text-sm"
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
