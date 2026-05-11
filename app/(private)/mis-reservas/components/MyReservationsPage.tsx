/* eslint-disable @next/next/no-img-element */
"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CANCEL_RESERVATION_REQUEST } from "@/graphql/mutation/reservation-space.mutation";
import { FIND_MY_RESERVATION_REQUESTS } from "@/graphql/query/reservation-space.query";
import { routes } from "@/lib/routes";
import { cn, formatDateRange, formatTimeRange } from "@/lib/utils";
import {
  IReservationRequest,
  IReservationRequestsResponse,
} from "@/types/activities";
import { useMutation, useQuery } from "@apollo/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import {
  Banknote,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  LoaderCircle,
  MessageSquare,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const spaceTypeLabels: Record<string, string> = {
  HALL: "Salón de Eventos",
  AUDITORIUM: "Auditorio",
  MEETING_ROOM: "Sala de Reuniones",
  OFFICE: "Oficina",
  OTHER: "Otro",
};

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  APROBADO: {
    label: "Aprobado",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  RECHAZADO: {
    label: "Rechazado",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  CANCELADO: {
    label: "Cancelado",
    bg: "bg-gray-50 border-gray-200",
    text: "text-gray-500",
    dot: "bg-gray-400",
  },
};

const PAGE_SIZE = 10;

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? {
    label: status,
    bg: "bg-gray-50 border-gray-200",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        cfg.bg,
        cfg.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function CancelButton({
  request,
  onCancelled,
}: {
  request: IReservationRequest;
  onCancelled: () => void;
}) {
  const [cancel, { loading }] = useMutation(CANCEL_RESERVATION_REQUEST);
  const cancellable =
    request.status === "PENDIENTE" || request.status === "RECHAZADO";

  if (!cancellable) return null;

  const handleCancel = async () => {
    try {
      await cancel({ variables: { id: request.id } });
      toast.success("Solicitud cancelada");
      onCancelled();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al cancelar la solicitud";
      toast.error(message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          disabled={loading}
        >
          <X className="size-3.5" />
          Cancelar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar solicitud?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas cancelar la solicitud para{" "}
            <strong>{request.eventName}</strong>? Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700"
          >
            Sí, cancelar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RequestCard({
  request,
  onRefetch,
}: {
  request: IReservationRequest;
  onRefetch: () => void;
}) {
  const sorted = [...(request.reservation?.images ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  const cover = sorted[0]?.media.url;

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image thumbnail */}
        {cover && (
          <div className="shrink-0 w-full sm:w-40 md:w-48 aspect-video sm:aspect-[4/3] bg-gray-100 overflow-hidden">
            <img
              src={cover}
              alt={request.reservation?.title ?? "Espacio"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">
                {request.eventName}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {request.reservation?.title && (
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3 shrink-0" />
                    {request.reservation.title}
                    {request.reservation.spaceType && (
                      <span className="text-gray-300">·</span>
                    )}
                    {spaceTypeLabels[request.reservation.spaceType] ??
                      request.reservation.spaceType}
                  </span>
                )}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0 text-primary/60" />
              {formatDateRange(request.startDate, request.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 shrink-0 text-primary/60" />
              {formatTimeRange(request.startDate, request.endDate)}
            </span>
            {request.estimatedPrice != null && (
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <Banknote className="size-4 shrink-0" />
                S/. {request.estimatedPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Purpose */}
          {request.purpose && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {request.purpose}
            </p>
          )}

          {/* Admin comment */}
          {request.adminComment && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <MessageSquare className="size-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">{request.adminComment}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <p className="text-xs text-gray-400">
              Enviada el{" "}
              {format(new Date(request.createdAt), "d MMM yyyy", {
                locale: es,
              })}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={routes.spaces.detail(request.reservationId)}
                className="text-xs text-primary hover:underline"
              >
                Ver espacio
              </Link>
              <CancelButton request={request} onCancelled={onRefetch} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MyReservationsPage() {
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = useQuery(
    FIND_MY_RESERVATION_REQUESTS,
    {
      variables: { page, pageSize: PAGE_SIZE },
      fetchPolicy: "cache-and-network",
    },
  );

  const response: IReservationRequestsResponse | null = get(
    data,
    "findMyReservationRequests",
    null,
  );

  const requests = response?.requests ?? [];
  const totalPages = response?.meta?.totalPages ?? 1;

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
              Mis solicitudes de reserva
            </span>
          </nav>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarDays className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Mis solicitudes
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  Seguimiento de tus reservas de espacios
                </p>
              </div>
            </div>
            <Link
              href={routes.spaces.home}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Building2 className="size-4" />
              Reservar espacio
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <LoaderCircle className="size-8 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CircleAlert className="size-12 text-red-300 mb-3" />
            <p className="text-gray-500 text-sm">
              No se pudo cargar tus solicitudes.
            </p>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CalendarDays className="size-12 text-gray-200 mb-3" />
            <p className="text-gray-700 font-semibold mb-1">
              Sin solicitudes aún
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Cuando solicites la reserva de un espacio, aparecerá aquí.
            </p>
            <Link
              href={routes.spaces.home}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Building2 className="size-4" />
              Ver espacios disponibles
            </Link>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              {response?.meta?.total} solicitud
              {response?.meta?.total !== 1 ? "es" : ""} en total
            </p>

            {requests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onRefetch={() => refetch()}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
