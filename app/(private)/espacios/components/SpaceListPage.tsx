/* eslint-disable @next/next/no-img-element */
"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { GET_RESERVATIONS_FROM_WEBSITE } from "@/graphql/query/reservation-space.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { ISpaceReservation } from "@/types/activities";
import { useQuery } from "@apollo/client";
import { get } from "lodash";
import {
  Building2,
  CalendarDays,
  CircleAlert,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";

const spaceTypeLabels: Record<string, string> = {
  HALL: "Salón de Eventos",
  AUDITORIUM: "Auditorio",
  MEETING_ROOM: "Sala de Reuniones",
  OFFICE: "Oficina",
  OTHER: "Otro",
};

const spaceTypeColors: Record<string, string> = {
  HALL: "bg-violet-100 text-violet-700",
  AUDITORIUM: "bg-blue-100 text-blue-700",
  MEETING_ROOM: "bg-emerald-100 text-emerald-700",
  OFFICE: "bg-amber-100 text-amber-700",
  OTHER: "bg-gray-100 text-gray-700",
};

function SpaceCard({ space }: { space: ISpaceReservation }) {
  const sorted = [...(space.images ?? [])].sort((a, b) => a.order - b.order);
  const cover = sorted[0]?.media.url;
  const typeLabel = spaceTypeLabels[space.spaceType] ?? space.spaceType;
  const typeColor =
    spaceTypeColors[space.spaceType] ?? "bg-gray-100 text-gray-700";

  const priceLabel =
    space.pricePerHour != null
      ? `S/. ${space.pricePerHour.toFixed(2)} / hora`
      : space.price != null
        ? `S/. ${space.price.toFixed(2)}`
        : null;

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={space.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Building2 className="size-12 text-primary/30" />
          </div>
        )}
        {/* Type badge */}
        <span
          className={cn(
            "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide",
            typeColor,
          )}
        >
          {typeLabel}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {space.title}
          </h3>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Users className="size-4 shrink-0" />
            {space.capacity} personas
          </span>
          {space.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" />
              {space.location}
            </span>
          )}
        </div>

        {/* Amenities preview */}
        {space.amenities && space.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {space.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-600"
              >
                {amenity}
              </span>
            ))}
            {space.amenities.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-500">
                +{space.amenities.length - 3} más
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {priceLabel ? (
            <span className="text-primary font-bold text-base">
              {priceLabel}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">Consultar precio</span>
          )}
          <Link
            href={routes.spaces.detail(space.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <CalendarDays className="size-4" />
            Ver espacio
          </Link>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="aspect-video w-full bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 bg-gray-100 rounded w-16" />
          <div className="h-5 bg-gray-100 rounded w-16" />
        </div>
        <div className="flex justify-between pt-2">
          <div className="h-5 bg-gray-100 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

export default function SpaceListPage() {
  const { data, loading, error } = useQuery(GET_RESERVATIONS_FROM_WEBSITE, {
    fetchPolicy: "cache-and-network",
  });

  const spaces: ISpaceReservation[] = get(
    data,
    "getReservationsFromWebsite",
    [],
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link
              href={routes.home}
              className="hover:text-gray-600 transition-colors"
            >
              Inicio
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">
              Espacios para reservar
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Espacios para reservar
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Reserva salones, auditorios y oficinas disponibles para tu
                evento
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CircleAlert className="size-12 text-red-300 mb-3" />
            <p className="text-gray-500 text-sm">
              No se pudo cargar los espacios.
            </p>
          </div>
        )}

        {!loading && !error && spaces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="size-12 text-gray-200 mb-3" />
            <p className="text-gray-500 text-sm">
              No hay espacios disponibles por el momento.
            </p>
          </div>
        )}

        {!loading && !error && spaces.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
