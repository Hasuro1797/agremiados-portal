"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import {
  ActivityAudience,
  ActivityForCheckout,
  BillingFormData,
  Guest,
} from "@/types/payment.type";
import {
  CalendarDays,
  CircleX,
  Loader2,
  Ticket,
  Users,
} from "lucide-react";
import BillingSection, { isBillingValid } from "./BillingSection";
import GuestsSection, { isGuestValid } from "./GuestsSection";

interface ActivityConfigStepProps {
  activity: ActivityForCheckout | null;
  loading: boolean;
  error: boolean;
  billing: BillingFormData;
  onBillingChange: (data: BillingFormData) => void;
  guests: Guest[];
  onGuestsChange: (guests: Guest[]) => void;
  onPay: () => void;
  onEnrollFree: () => void;
  paying: boolean;
  enrolling: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);

export default function ActivityConfigStep({
  activity,
  loading,
  error,
  billing,
  onBillingChange,
  guests,
  onGuestsChange,
  onPay,
  onEnrollFree,
  paying,
  enrolling,
}: ActivityConfigStepProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <CircleX className="size-10 text-red-500" />
        <p className="max-w-md text-sm text-primary">
          No pudimos cargar la información de la actividad. Inténtalo de nuevo más
          tarde.
        </p>
      </div>
    );
  }

  const available = activity.stock - activity.stockUsed;
  const soldOut = available <= 0;
  const isFree = !activity.hasPrice || activity.price <= 0;
  const priceInvitee = activity.priceInvitee ?? 0;
  const guestStock = activity.guestStock ?? 0;
  const admitsGuests =
    activity.audience !== ActivityAudience.MEMBERS_ONLY &&
    priceInvitee > 0 &&
    guestStock > 0;

  const guestsTotal = priceInvitee * guests.length;
  const subtotal = activity.price + guestsTotal;
  const guestsValid = guests.every(isGuestValid);

  const canPay =
    !soldOut && isBillingValid(billing) && guestsValid && !paying;
  const canEnroll = !soldOut && !enrolling;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-primary">
            Resumen de inscripción
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">{activity.title}</h3>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            {activity.date && (
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                {formatDate(activity.date)}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              {soldOut ? (
                <span className="text-red-600 font-medium">Sin cupos</span>
              ) : (
                <>
                  {available} {available === 1 ? "cupo" : "cupos"} disponibles
                </>
              )}
            </span>
          </div>

          {soldOut && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <CircleX className="mt-0.5 size-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">
                No hay cupos disponibles para esta actividad.
              </p>
            </div>
          )}

          <Separator />

          {isFree ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Ticket className="size-4 text-primary" />
                Inscripción
              </span>
              <span className="text-lg font-bold text-green-700">Gratis</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <Ticket className="size-4 text-primary" />
                  Inscripción (tú)
                </span>
                <span className="font-medium text-primary">
                  {formatCurrency(activity.price)}
                </span>
              </div>
              {guests.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Invitados ({guests.length} × {formatCurrency(priceInvitee)})
                  </span>
                  <span className="font-medium text-primary">
                    {formatCurrency(guestsTotal)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Incluye IGV. El monto final se confirma al generar el pago.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isFree && admitsGuests && (
        <GuestsSection
          guests={guests}
          onChange={onGuestsChange}
          maxGuests={guestStock}
          priceInvitee={priceInvitee}
        />
      )}

      {!isFree && <BillingSection value={billing} onChange={onBillingChange} />}

      <div className="flex justify-end">
        {isFree ? (
          <Button
            size="lg"
            disabled={!canEnroll}
            onClick={onEnrollFree}
            className="font-semibold bg-accent hover:bg-accent-hover"
          >
            {enrolling && <Loader2 className="mr-2 size-4 animate-spin" />}
            Inscribirse gratis
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={!canPay}
            onClick={onPay}
            className="font-semibold bg-accent hover:bg-accent-hover"
          >
            {paying && <Loader2 className="mr-2 size-4 animate-spin" />}
            Pagar
          </Button>
        )}
      </div>
    </div>
  );
}
