/* eslint-disable @next/next/no-img-element */
"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CREATE_RESERVATION_REQUEST } from "@/graphql/mutation/reservation-space.mutation";
import { FIND_ONE_RESERVATION_SPACE } from "@/graphql/query/reservation-space.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { reservationRequestSchema, ReservationRequestValues } from "@/lib/zod";
import { ISpaceImage, ISpaceReservation } from "@/types/activities";
import { UserRoles } from "@/utils/enum";
import { useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { get } from "lodash";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CalendarIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUserStore } from "@/providers/user-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

const spaceTypeLabels: Record<string, string> = {
  HALL: "Salón de Eventos",
  AUDITORIUM: "Auditorio",
  MEETING_ROOM: "Sala de Reuniones",
  OFFICE: "Oficina",
  OTHER: "Otro",
};

function ImageGallery({ images }: { images: ISpaceImage[] }) {
  const [active, setActive] = useState(0);
  const sorted = [...images].sort((a, b) => a.order - b.order);
  if (!sorted.length) return null;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-video w-full">
        <img
          src={sorted[active].media.url}
          alt={sorted[active].media.title ?? "Imagen del espacio"}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.media.id}
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
                alt={img.media.title ?? ""}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="animate-pulse max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-5 bg-gray-100 rounded w-1/4" />
          <div className="aspect-video bg-gray-200 rounded-2xl w-full" />
          <div className="h-7 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

interface RequestFormProps {
  space: ISpaceReservation;
}

function ReservationRequestForm({ space }: RequestFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const [createRequest, { loading }] = useMutation(CREATE_RESERVATION_REQUEST);

  const form = useForm<ReservationRequestValues>({
    resolver: zodResolver(reservationRequestSchema),
    defaultValues: {
      eventName: "",
      purpose: "",
      guestCount: 1,
      startDate: "",
      endDate: "",
    },
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  // Estimate price client-side for preview
  const computeEstimate = () => {
    if (!startDate || !endDate) return null;
    const diff =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60);
    if (diff <= 0) return null;
    if (space.pricePerHour != null) return diff * space.pricePerHour;
    if (space.price != null) return space.price;
    return null;
  };

  const previewPrice = computeEstimate();

  const onSubmit = async (values: ReservationRequestValues) => {
    try {
      const result = await createRequest({
        variables: {
          input: {
            reservationId: space.id,
            eventName: values.eventName,
            purpose: values.purpose || undefined,
            guestCount: values.guestCount,
            startDate: new Date(values.startDate).toISOString(),
            endDate: new Date(values.endDate).toISOString(),
          },
        },
      });
      const price = get(result, "data.createReservationRequest.estimatedPrice");
      setEstimatedPrice(price ?? previewPrice);
      setSubmitted(true);
      toast.success("Solicitud enviada exitosamente");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al enviar la solicitud";
      toast.error(message);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-4">
        <CheckCircle2 className="size-14 text-emerald-500 mx-auto" />
        <h3 className="text-lg font-bold text-gray-900">¡Solicitud enviada!</h3>
        <p className="text-gray-500 text-sm">
          Tu solicitud está en revisión. Te notificaremos cuando sea aprobada.
        </p>
        {estimatedPrice != null && (
          <p className="text-primary font-semibold text-base">
            Precio estimado: S/. {estimatedPrice.toFixed(2)}
          </p>
        )}
        <Link
          href={routes.myReservations}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Ver mis solicitudes →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-5 text-primary" />
        <h3 className="text-base font-bold text-gray-900">Solicitar reserva</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="eventName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre del evento <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Conferencia Anual 2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Propósito del evento</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe brevemente el propósito del evento..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guestCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Número de asistentes <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={space.capacity}
                    placeholder={`Máx. ${space.capacity}`}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : parseInt(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <p className="text-xs text-gray-400 mt-1">
                  Capacidad máxima: {space.capacity} personas
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha y hora de inicio{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="text-gray-400 w-full"
                        >
                          <span className="min-w-0 truncate text-xs">
                            {field.value
                              ? format(
                                  field.value,
                                  //formato dd MAY 2024, 10:20 AM
                                  "dd MMM yyyy, hh:mm a",
                                  {
                                    locale: es,
                                  },
                                )
                              : "Seleccionar fecha y hora"}
                          </span>
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        defaultMonth={
                          field.value ? new Date(field.value) : undefined
                        }
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        locale={es}
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          className="max-w-max"
                          value={
                            field.value
                              ? format(new Date(field.value), "HH:mm")
                              : ""
                          }
                          onChange={(e) => {
                            const time = e.target.value;
                            if (field.value) {
                              const date = new Date(field.value);
                              const [hours, minutes] = time
                                .split(":")
                                .map(Number);
                              date.setHours(hours, minutes);
                              field.onChange(date.toISOString());
                            } else if (time) {
                              const today = new Date();
                              const [hours, minutes] = time
                                .split(":")
                                .map(Number);
                              today.setHours(hours, minutes, 0, 0);
                              field.onChange(today.toISOString());
                            }
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha y hora de fin <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="text-gray-400 w-full flex items-center"
                        >
                          <span className="min-w-0 truncate text-xs">
                            {field.value
                              ? format(field.value, "dd MMM yyyy, hh:mm a", {
                                  locale: es,
                                })
                              : "Seleccionar fecha y hora"}
                          </span>
                          <CalendarIcon className="ml-auto !size-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        defaultMonth={
                          field.value ? new Date(field.value) : undefined
                        }
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const start = new Date(startDate);
                          start.setHours(0, 0, 0, 0);
                          return date < start;
                        }}
                        locale={es}
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          className="max-w-max"
                          value={
                            field.value
                              ? format(new Date(field.value), "HH:mm")
                              : ""
                          }
                          onChange={(e) => {
                            const time = e.target.value;
                            if (field.value) {
                              const date = new Date(field.value);
                              const [hours, minutes] = time
                                .split(":")
                                .map(Number);
                              date.setHours(hours, minutes);
                              field.onChange(date.toISOString());
                            }
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Price preview */}
          {previewPrice != null && (
            <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Precio estimado</span>
              <span className="text-primary font-bold text-base">
                S/. {previewPrice.toFixed(2)}
              </span>
            </div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <>Enviando...</>
            ) : (
              <>
                <Send className="size-4" />
                Enviar solicitud
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function SpaceDetailPage({ id }: { id: number }) {
  const role = useUserStore((s) => s.role);
  const isMember = role === UserRoles.MEMBER;

  const { data, loading, error } = useQuery(FIND_ONE_RESERVATION_SPACE, {
    variables: { id },
    fetchPolicy: "cache-and-network",
  });

  const space: ISpaceReservation | null = get(data, "findOneReservation", null);

  const priceLabel =
    space?.pricePerHour != null
      ? `S/. ${space.pricePerHour.toFixed(2)} / hora`
      : space?.price != null
        ? `S/. ${space.price.toFixed(2)}`
        : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      {loading && (
        <div className="flex-1 pt-6">
          <SkeletonDetail />
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="text-center">
            <Building2 className="size-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No se pudo cargar el espacio.
            </p>
            <Link
              href={routes.spaces.home}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-4" />
              Volver a Espacios
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && !space && (
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="text-center">
            <Building2 className="size-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Espacio no encontrado.</p>
            <Link
              href={routes.spaces.home}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-4" />
              Volver a Espacios
            </Link>
          </div>
        </div>
      )}

      {!loading && space && (
        <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Link
              href={routes.home}
              className="hover:text-gray-600 transition-colors"
            >
              Inicio
            </Link>
            <span>/</span>
            <Link
              href={routes.spaces.home}
              className="hover:text-gray-600 transition-colors"
            >
              Espacios
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium line-clamp-1 max-w-[200px]">
              {space.title}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              {/* Gallery */}
              <ImageGallery images={space.images ?? []} />

              {/* Title & type */}
              <div>
                <span
                  className={cn(
                    "inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-2",
                    "bg-primary/10 text-primary",
                  )}
                >
                  {spaceTypeLabels[space.spaceType] ?? space.spaceType}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {space.title}
                </h1>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Users className="size-4 shrink-0 text-primary" />
                  Capacidad: {space.capacity} personas
                </span>
                {space.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4 shrink-0 text-primary" />
                    {space.location}
                  </span>
                )}
                {space.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4 shrink-0 text-primary/50" />
                    {space.address}
                  </span>
                )}
                {priceLabel && (
                  <span className="flex items-center gap-1.5 text-primary font-semibold">
                    <Clock className="size-4 shrink-0" />
                    {priceLabel}
                  </span>
                )}
              </div>

              {/* Description */}
              {space.description && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                    <span className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="size-4 text-primary" />
                    </span>
                    Descripción
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-600 prose-headings:text-gray-900 prose-a:text-primary prose-strong:text-gray-800"
                    dangerouslySetInnerHTML={{
                      __html:
                        typeof space.description === "string"
                          ? space.description
                          : JSON.stringify(space.description),
                    }}
                  />
                </section>
              )}

              {/* Amenities */}
              {space.amenities && space.amenities.length > 0 && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                    <span className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="size-4 text-primary" />
                    </span>
                    Amenidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {space.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Rules */}
              {space.rules && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                    <span className="size-7 rounded-lg bg-amber-100 flex items-center justify-center">
                      <ShieldCheck className="size-4 text-amber-600" />
                    </span>
                    Reglamento de uso
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-600 prose-headings:text-gray-900 prose-a:text-primary prose-strong:text-gray-800"
                    dangerouslySetInnerHTML={{
                      __html:
                        typeof space.rules === "string"
                          ? space.rules
                          : JSON.stringify(space.rules),
                    }}
                  />
                </section>
              )}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
              {/* Price card */}
              {priceLabel && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                    Tarifa
                  </p>
                  <p className="text-primary text-2xl font-bold">
                    {priceLabel}
                  </p>
                </div>
              )}

              {/* Request form — only for MEMBER role */}
              {isMember ? (
                <ReservationRequestForm space={space} />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-3">
                  <ShieldCheck className="size-10 text-gray-200 mx-auto" />
                  <p className="text-gray-500 text-sm">
                    Solo los colegiados habilitados pueden solicitar reservas.
                  </p>
                  <Link
                    href={routes.spaces.home}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ArrowLeft className="size-4" />
                    Volver a Espacios
                  </Link>
                </div>
              )}

              {/* My reservations link */}
              <Link
                href={routes.myReservations}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <CalendarDays className="size-4" />
                Ver mis solicitudes
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
