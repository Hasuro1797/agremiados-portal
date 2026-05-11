/* eslint-disable @next/next/no-img-element */
"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GET_ACTIVITY_BY_ID } from "@/graphql/query/activity.query";
import { routes } from "@/lib/routes";
import { cn, formatDateRange, formatTimeRange } from "@/lib/utils";
import { IActivity } from "@/types/activities";
import { ActivityType } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getActiveDiscount } from "../../components/ActivityCard";

const typeLabels: Record<ActivityType, string> = {
  [ActivityType.ACADEMIC]: "Académico",
  [ActivityType.SOCIAL]: "Social",
};

const typeBadgeClasses: Record<ActivityType, string> = {
  [ActivityType.ACADEMIC]: "bg-indigo-900/85 text-white",
  [ActivityType.SOCIAL]: "bg-green-600/85 text-white",
};

const checkoutRoutes: Record<ActivityType, string> = {
  [ActivityType.ACADEMIC]: `${routes.checkout}/academicEvents`,
  [ActivityType.SOCIAL]: `${routes.checkout}/socialEvents`,
};

function statusLabel(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Activo", cls: "bg-emerald-500/85 text-white" },
    INACTIVE: { label: "Inactivo", cls: "bg-gray-400/85 text-white" },
    FINISHED: { label: "Finalizado", cls: "bg-gray-500/85 text-white" },
    CANCELLED: { label: "Cancelado", cls: "bg-red-500/85 text-white" },
    UPCOMING: { label: "Próximo", cls: "bg-blue-500/85 text-white" },
  };
  return (
    map[status?.toUpperCase()] ?? {
      label: status,
      cls: "bg-gray-400/85 text-white",
    }
  );
}

function audienceLabel(audience?: string) {
  if (!audience) return null;
  const map: Record<string, string> = {
    OPEN: "Abierto al público",
    MEMBERS_AND_GUESTS: "Colegiados y invitados",
    MEMBERS_ONLY: "Exclusivo para miembros",
  };
  return map[audience] ?? audience;
}

function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="h-80 bg-gray-200 w-full" />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-5 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-100 rounded-2xl" />
            <div className="h-32 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageGallery({ images }: { images: IActivity["images"] }) {
  const [active, setActive] = useState(0);
  const sorted = [...images].sort((a, b) => a.order - b.order);
  if (!sorted.length) return null;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-video w-full">
        <img
          src={sorted[active].media.url}
          alt={sorted[active].media.alt ?? sorted[active].media.title}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.mediaId}
              onClick={() => setActive(i)}
              className={cn(
                "shrink-0 size-14 rounded-lg overflow-hidden border-2 transition-all duration-200",
                i === active
                  ? "border-primary opacity-100"
                  : "border-transparent opacity-60 hover:opacity-80",
              )}
            >
              <img
                src={img.media.url}
                alt={img.media.alt ?? img.media.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ActivityDetailComponent({ id }: { id: string }) {
  const { data, loading, error } = useQuery(GET_ACTIVITY_BY_ID, {
    variables: { id: parseInt(id) },
    fetchPolicy: "cache-and-network",
  });

  const activity: IActivity | null = get(data, "findOneActivity", null);
  const activeDiscount = activity
    ? getActiveDiscount(activity.discounts)
    : null;

  const discountedPrice =
    activeDiscount && activity?.price != null
      ? activity.price * (1 - activeDiscount.percentage / 100)
      : activity?.price;

  const heroImage = activity?.images?.length
    ? [...activity.images].sort((a, b) => a.order - b.order)[0].media.url
    : null;

  const status = activity ? statusLabel(activity.status) : null;
  const checkoutRoute = activity ? checkoutRoutes[activity.type] : "#";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      {loading && <SkeletonDetail />}

      {error && (
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="text-center">
            <CalendarDays className="size-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No se pudo cargar la actividad.
            </p>
            <Link
              href={routes.activities.home}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-4" />
              Volver a Actividades
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && !activity && (
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="text-center">
            <CalendarDays className="size-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Actividad no encontrada.</p>
            <Link
              href={routes.activities.home}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-4" />
              Volver a Actividades
            </Link>
          </div>
        </div>
      )}

      {!loading && activity && (
        <>
          {/* ── Hero Banner ── */}
          <div className="relative w-full min-h-64 sm:min-h-80 bg-gray-900 overflow-hidden">
            {heroImage ? (
              <img
                src={heroImage}
                alt={activity.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/50" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />

            <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-end h-full min-h-64 sm:min-h-80">
              {/* Breadcrumb */}
              <nav
                className="flex items-center gap-1.5 text-xs text-white/60 mb-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
                aria-label="Breadcrumb"
              >
                <Link
                  href={routes.home}
                  className="hover:text-white transition-colors"
                >
                  Inicio
                </Link>
                <span>/</span>
                <Link
                  href={routes.activities.home}
                  className="hover:text-white transition-colors"
                >
                  Actividades
                </Link>
                <span>/</span>
                <span className="text-white/90 font-medium line-clamp-1 max-w-[200px]">
                  {activity.title}
                </span>
              </nav>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm",
                    typeBadgeClasses[activity.type],
                  )}
                >
                  {typeLabels[activity.type]}
                </span>
                {status && (
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm",
                      status.cls,
                    )}
                  >
                    {status.label}
                  </span>
                )}
                {activeDiscount && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-emerald-500/90 text-white backdrop-blur-sm">
                    {activeDiscount.percentage}% de descuento
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4 max-w-3xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
                {activity.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4 shrink-0" />
                  {formatDateRange(
                    activity.date,
                    activity.finishDate ?? activity.date,
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 shrink-0" />
                  {formatTimeRange(
                    activity.date,
                    activity.finishDate ?? activity.date,
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* ── LEFT COLUMN ── */}
              <div className="lg:col-span-2 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                {/* Description */}
                {activity.description && (
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                      <span className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="size-4 text-primary" />
                      </span>
                      Descripción del Evento
                    </h2>
                    <div
                      className="prose prose-sm prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800 prose-li:text-gray-600"
                      dangerouslySetInnerHTML={{ __html: activity.description }}
                    />
                    {activity.href && (
                      <a
                        href={activity.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                      >
                        Ver más información
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </section>
                )}

                {/* Schedule / Days */}
                {activity.days && activity.days.length > 0 && (
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                      <span className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="size-4 text-primary" />
                      </span>
                      Programa
                    </h2>
                    <div className="space-y-3">
                      {activity.days.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50"
                        >
                          <div className="shrink-0 text-center min-w-[52px]">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                              Día {i + 1}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {d.day
                                ? (() => {
                                    try {
                                      return format(new Date(d.day), "dd MMM", {
                                        locale: es,
                                      });
                                    } catch {
                                      return d.day;
                                    }
                                  })()
                                : ""}
                            </p>
                          </div>
                          <Separator
                            orientation="vertical"
                            className="h-auto self-stretch"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">
                              {d.startTime} – {d.endTime}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Image gallery */}
                {activity.images && activity.images.length > 0 && (
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                      <span className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tag className="size-4 text-primary" />
                      </span>
                      Galería
                    </h2>
                    <ImageGallery images={activity.images} />
                  </section>
                )}
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                {/* Pricing card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
                  <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="size-4 text-primary" />
                    Inversión
                  </h2>

                  {!activity.hasPrice ? (
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-sm font-semibold text-emerald-700">
                        Entrada libre
                      </span>
                      <span className="text-xl font-extrabold text-emerald-600">
                        Gratis
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Member price */}
                      {activity.price != null && (
                        <div className="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              Colegiados Hábiles
                            </p>
                            <p className="text-[11px] text-gray-400">
                              Tarifa preferencial
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            {activeDiscount && (
                              <p className="text-xs text-gray-400 line-through leading-none mb-0.5">
                                S/ {activity.price.toFixed(2)}
                              </p>
                            )}
                            <p className="text-xl font-extrabold text-gray-900">
                              S/{" "}
                              {(discountedPrice ?? activity.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Invitee price */}
                      {activity.priceInvitee != null &&
                        activity.priceInvitee !== 0 && (
                          <div className="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                Invitados
                              </p>
                              <p className="text-[11px] text-gray-400">
                                Auspiciados por colegiado
                              </p>
                            </div>
                            <p className="text-xl font-extrabold text-gray-900 shrink-0">
                              S/ {activity.priceInvitee.toFixed(2)}
                            </p>
                          </div>
                        )}
                    </div>
                  )}

                  <Separator className="my-5" />

                  <Link href={checkoutRoute} className="block">
                    <Button
                      className="w-full font-semibold bg-accent hover:bg-accent-hover"
                      size="lg"
                    >
                      Inscribirse Ahora
                    </Button>
                  </Link>
                </div>

                {/* Logistics card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    Detalles Logísticos
                  </h2>

                  <div className="space-y-4">
                    {activity.venue && (
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 size-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                          <MapPin className="size-4 text-primary" />
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Sede
                          </p>
                          <p className="text-sm font-semibold text-gray-800 mt-0.5">
                            {activity.venue}
                          </p>
                          {activity.address && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {activity.address}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {activity.audience && (
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 size-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                          <Users className="size-4 text-primary" />
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Audiencia
                          </p>
                          <p className="text-sm font-semibold text-gray-800 mt-0.5">
                            {audienceLabel(activity.audience)}
                          </p>
                        </div>
                      </div>
                    )}

                    {activity.date && (
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 size-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                          <CalendarDays className="size-4 text-primary" />
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Fecha
                          </p>
                          <p className="text-sm font-semibold text-gray-800 mt-0.5">
                            {formatDateRange(
                              activity.date,
                              activity.finishDate ?? activity.date,
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatTimeRange(
                              activity.date,
                              activity.finishDate ?? activity.date,
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
