/* eslint-disable @next/next/no-img-element */
"use client";
import { GENERATE_ATTENDACE_MUTATION } from "@/graphql/mutation/social.mutation";
import { GET_SOCIAL_ACTIVITIES } from "@/graphql/query/social.query";
import { routes } from "@/lib/routes";
import { cn, formatDateRange, formatTimeRange } from "@/lib/utils";
import { useMutation, useQuery } from "@apollo/client";
import { get } from "lodash";
import { ArrowRight, Calendar, CircleX, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { PeopleAvailable } from "@/utils/enum";
import { useUserStore } from "@/providers/user-provider";

interface EventDiscount {
  id: number;
  name: string;
  percentage: number;
}

interface ImageActivity {
  alt?: string;
  url: string;
  id: number;
}

interface Event {
  date: string;
  finishDate: string;
  id: number;
  title: string;
  peopleAvailable: string;
  price: number;
  images: ImageActivity[];
  description?: string;
  href?: string;
  stock: number;
  hasPrice: boolean;
  status_stock: number;
  discounts?: EventDiscount[];
}

export default function CheckAttendece() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { hasAvailable, hasPaymentPerDay } = useUserStore((state) => state);
  const router = useRouter();

  const {
    data: socialAtivities,
    loading: socialActivitiesLoading,
    error: socialActivitiesError,
    refetch: refetchSocialActivities,
  } = useQuery(GET_SOCIAL_ACTIVITIES, { fetchPolicy: "no-cache" });

  const [generateAttendace, { loading: attendaceLoading }] = useMutation(
    GENERATE_ATTENDACE_MUTATION,
    {
      onError: (error) => {
        toast.error(error?.message || "Error en generar la asistencia", {
          description: error?.message ? "" : "Por favor intenta de nuevo",
          classNames: {
            icon: "text-red-500",
            title: "text-primary",
            description: "text-primary",
            toast: "bg-secondary",
          },
        });
      },
      onCompleted: (data) => {
        toast.success(
          get(
            data,
            "generateAttendace.message",
            "Se registro a la actividad con éxito",
          ),
          {
            description: "Gracias por registrarte",
            classNames: {
              icon: "text-green-500",
              toast: "bg-secondary",
              title: "text-primary",
              description: "text-primary",
            },
          },
        );
        refetchSocialActivities();
      },
    },
  );

  const handlePay = (idEvent: number, peopleAvailable: string) => {
    if (
      peopleAvailable === PeopleAvailable.HABILES_AL_DIA &&
      !hasPaymentPerDay
    ) {
      toast.warning(
        "Para inscribirte en este evento debes tener tus pagos al día",
        {
          description: "Por favor realiza tu pago para poder inscribirte",
          classNames: {
            icon: "text-yellow-500",
            title: "text-primary",
            description: "text-primary",
            toast: "bg-secondary",
          },
          duration: 8000,
        },
      );
      return;
    } else if (peopleAvailable === PeopleAvailable.HABILES && !hasAvailable) {
      toast.warning("Para inscribirte en este evento debes estar habilitado", {
        description:
          "Por favor realiza tu pago para cambiar tu estado a habilitado",
        classNames: {
          icon: "text-yellow-500",
          title: "text-primary",
          description: "text-primary",
          toast: "bg-secondary",
        },
        duration: 8000,
      });
      return;
    } else {
      window.localStorage.setItem("productId", idEvent.toString());
      router.push(`${routes.checkout}/socialEvents`);
    }
  };

  const handleGenerateAttendace = async (id: number) => {
    try {
      await generateAttendace({ variables: { activityId: id } });
    } catch (error) {
      console.error("Error al generar la asistencia", error);
    }
  };

  const events: Event[] = get(
    socialAtivities,
    "getSocialActivitiesFromWebsite",
    [],
  );

  return (
    <div className="max-w-48 h-16 size-full">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="hover:bg-[#006FFD] text-primary hover:text-blue-100 ease-out duration-300 border-[3px] border-[#006FFD] shadow-xl rounded-lg size-full flex items-center gap-2 px-4 py-2"
          >
            <p className="text-center font-medium text-wrap text-lg">
              Eventos S.
            </p>
          </Button>
        </DialogTrigger>
        <DialogContent
          aria-describedby={undefined}
          className="flex flex-col gap-0 max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl h-[90vh] p-0 border-primary"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-2xl font-bold text-primary">
              Próximos Eventos
            </DialogTitle>
            <p className="text-sm text-slate-500 mt-0.5">
              Descubre las mejores experiencias para ti.
            </p>
          </DialogHeader>

          {socialActivitiesLoading ? (
            <div className="flex justify-center items-center flex-1">
              <Loader strokeWidth={2} className="size-10 animate-spin" />
            </div>
          ) : (
            <Fragment>
              {socialActivitiesError ? (
                <div className="flex justify-center flex-col items-center flex-1 px-4">
                  <CircleX className="h-10 w-10 text-red-500" />
                  <p className="text-primary text-sm mt-2">
                    Ocurrió un error al cargar las actividades
                  </p>
                </div>
              ) : events.length === 0 ? (
                <div className="flex justify-center items-center flex-1 px-4">
                  <p className="text-slate-500 text-sm">
                    No hay eventos disponibles actualmente.
                  </p>
                </div>
              ) : (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event) => {
                      const discount = event.discounts?.[0];
                      const discountedPrice = discount
                        ? event.price * (1 - discount.percentage / 100)
                        : event.price;
                      const isOutOfStock = event.status_stock === event.stock;
                      const imageUrl = get(event, "images.[0].url", "");
                      const imageAlt = get(
                        event,
                        "images.[0].alt",
                        event.title,
                      );
                      const availableText =
                        event.peopleAvailable === PeopleAvailable.HABILES
                          ? "Habilitados"
                          : event.peopleAvailable ===
                              PeopleAvailable.HABILES_AL_DIA
                            ? "Pago al día"
                            : "Todos";

                      return (
                        <Card
                          key={event.id}
                          className="overflow-hidden group transition-all duration-300 flex flex-col h-full"
                        >
                          <div className="relative h-48 overflow-hidden">
                            <div className="size-full bg-gray-100">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={imageAlt}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">
                                    Sin imagen
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="absolute bottom-4 left-4 bg-[#1a1a3e] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                              Evento Social
                            </span>
                            <span
                              className={cn(
                                "absolute bottom-4 right-4 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                                availableText === "Habilitados"
                                  ? "border border-slate-200 text-slate-700 bg-slate-100"
                                  : availableText === "Pago al día"
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : "border border-blue-100 text-blue-700 bg-blue-50",
                              )}
                            >
                              {availableText}
                            </span>
                            {discount && (
                              <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                {discount.percentage}% DE DESCUENTO
                              </span>
                            )}
                          </div>

                          <CardContent className="flex flex-col flex-1 p-5 h-[calc(100%-12rem)]">
                            <h3
                              className="font-bold text-lg line-clamp-2 text-primary mb-2 leading-tight"
                              title={event.title}
                            >
                              {event.title}
                            </h3>
                            {event.description && (
                              <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                {event.description}
                              </p>
                            )}

                            <div className="mt-auto space-y-3">
                              {event.date && (
                                <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="size-3 shrink-0" />
                                    <span>
                                      {formatDateRange(
                                        event.date,
                                        event.finishDate,
                                      )}
                                    </span>
                                  </div>
                                  <span className="block ml-[18px] text-slate-400">
                                    {formatTimeRange(
                                      event.date,
                                      event.finishDate,
                                    )}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-3 w-full">
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                      {event.hasPrice ? (
                                        <>
                                          {discount && (
                                            <p className="text-xs text-slate-500 line-through">
                                              S/. {event.price.toFixed(2)}
                                            </p>
                                          )}
                                          <p
                                            className={cn(
                                              "font-bold text-xl",
                                              discount
                                                ? "text-emerald-600"
                                                : "text-primary",
                                            )}
                                          >
                                            S/. {discountedPrice.toFixed(2)}
                                          </p>
                                        </>
                                      ) : (
                                        <p className="font-bold text-xl text-emerald-600">
                                          Gratis
                                        </p>
                                      )}
                                    </div>
                                    {event.href && (
                                      <Link
                                        href={event.href}
                                        className="text-xs text-slate-500 hover:text-primary font-medium flex items-center transition-colors"
                                        target="_blank"
                                      >
                                        Ver más información
                                        <ArrowRight className="size-3 ml-1" />
                                      </Link>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    disabled={isOutOfStock || attendaceLoading}
                                    onClick={() =>
                                      event.hasPrice
                                        ? handlePay(
                                            event.id,
                                            event.peopleAvailable,
                                          )
                                        : handleGenerateAttendace(event.id)
                                    }
                                    className={cn(
                                      "text-xs text-white transition-all active:scale-[0.98]",
                                      isOutOfStock &&
                                        "opacity-70 cursor-not-allowed",
                                    )}
                                  >
                                    {attendaceLoading ? (
                                      <Loader
                                        strokeWidth={2}
                                        className="size-3 animate-spin"
                                      />
                                    ) : isOutOfStock ? (
                                      "Sin Stock"
                                    ) : event.hasPrice ? (
                                      "Inscribirse"
                                    ) : (
                                      "Asistir"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </Fragment>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
