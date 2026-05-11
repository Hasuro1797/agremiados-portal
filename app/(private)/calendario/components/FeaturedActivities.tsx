"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { IActivity } from "@/types/activities";
import { ActivityType } from "@/utils/enum";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeaturedActivitiesProps {
  activities: IActivity[];
  selectedDate: Date;
  moduleEvents: boolean;
  loading: boolean;
}

function ActivityCard({ activity }: { activity: IActivity }) {
  const router = useRouter();
  const isAcademic = activity.type === ActivityType.ACADEMIC;
  const checkoutType = isAcademic ? "academicEvents" : "socialEvents";

  const now = new Date();
  const activeDiscount = (activity.discounts ?? []).find(
    (d) => now >= new Date(d.startDate) && now <= new Date(d.endDate),
  );

  const basePrice = activity.price ?? 0;
  const displayPrice = activeDiscount
    ? basePrice * (1 - activeDiscount.percentage / 100)
    : basePrice;
  const priceLabel = activeDiscount ? "Pronto pago" : "Habilitados";

  const location = activity.venue || activity.address;

  const handleEnroll = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("productId", String(activity.id));
    }
    router.push(`${routes.checkout}/${checkoutType}`);
  };

  return (
    <div className="rounded-xl border border-gray-100 p-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200 group">
      {/* Badge + price */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            isAcademic
              ? "bg-blue-50 text-blue-700 border-blue-100"
              : "bg-green-50 text-green-700 border-green-100",
          )}
        >
          {isAcademic ? "Académico" : "Social"}
        </span>
        {activity.hasPrice && (
          <div className="text-right shrink-0">
            <p className="text-base font-bold text-primary leading-none">
              S/. {displayPrice.toFixed(0)}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{priceLabel}</p>
          </div>
        )}
        {!activity.hasPrice && (
          <span className="text-xs font-bold text-emerald-500">Gratis</span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-gray-800 leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors">
        {activity.title}
      </h4>

      {/* Meta */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CalendarDays className="size-3.5 shrink-0" />
          <span className="capitalize">
            {format(new Date(activity.date), "d 'de' MMMM, yyyy", {
              locale: es,
            })}
          </span>
        </div>
        {location && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      {activity.date && new Date(activity.date) > now && (
        <Button
          onClick={handleEnroll}
          className="w-full bg-accent hover:bg-accent-hover text-white h-9 text-sm font-semibold gap-2"
        >
          Inscribirme ahora
          <ArrowRight className="size-3.5" />
        </Button>
      )}

      {activity.href && (
        <div className="mt-2 text-center">
          <a
            href={activity.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-primary transition-colors"
          >
            Ver detalles del evento
          </a>
        </div>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3.5 w-28" />
      </div>
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
}

export default function FeaturedActivities({
  activities,
  selectedDate,
  moduleEvents,
  loading,
}: FeaturedActivitiesProps) {
  const dayLabel = format(selectedDate, "EEEE d 'de' MMMM", { locale: es });
  const capitalizedLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
            Actividades
          </p>
          <h3 className="text-sm font-bold text-gray-800 leading-snug">
            {capitalizedLabel}
          </h3>
        </div>
        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <CalendarDays className="size-4 text-primary" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {!moduleEvents ? (
          <p className="text-sm text-gray-400 text-center py-8">
            El módulo de eventos no está habilitado
          </p>
        ) : loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="size-10 rounded-2xl bg-gray-50 flex items-center justify-center">
              <CalendarDays className="size-5 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">
              No hay actividades para este día
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
}
