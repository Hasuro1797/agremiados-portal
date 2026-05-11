/* eslint-disable @next/next/no-img-element */
"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/lib/routes";
import { cn, formatDateRange, formatTimeRange } from "@/lib/utils";
import { Discount, IActivity } from "@/types/activities";
import { ActivityType } from "@/utils/enum";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import Link from "next/link";

interface Props {
  activity: IActivity;
  index: number;
}

const typeLabels: Record<ActivityType, string> = {
  [ActivityType.ACADEMIC]: "Académico",
  [ActivityType.SOCIAL]: "Social",
};

const typeBadgeColors: Record<ActivityType, string> = {
  [ActivityType.ACADEMIC]: "bg-indigo-900/85 backdrop-blur-sm",
  [ActivityType.SOCIAL]: "bg-green-600/85 backdrop-blur-sm",
};

export function getActiveDiscount(discounts: Discount[]) {
  const now = new Date();
  return discounts.find(
    (d) =>
      new Date(d.startDate) <= now &&
      new Date(d.endDate) >= now &&
      d.status === "ACTIVE",
  );
}

export default function ActivityCard({ activity, index }: Props) {
  const imageUrl = activity.images?.length
    ? activity.images[0].media?.url
    : null;

  const activeDiscount = getActiveDiscount(activity.discounts);

  const discountedPrice =
    activeDiscount && activity.price != null
      ? activity.price * (1 - activeDiscount.percentage / 100)
      : activity.price;

  console.log("ActivityCard render", {
    activity,
    activeDiscount,
    discountedPrice,
  });
  return (
    <Card
      className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 h-full overflow-hidden group transition-all"
      style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}
    >
      <div className="relative overflow-hidden h-48 shrink-0 bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={activity.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
            <CalendarDays className="size-16 text-primary/20" />
          </div>
        )}

        {/* Type badge */}
        <span
          className={cn(
            "absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-semibold text-white uppercase tracking-widest",
            typeBadgeColors[activity.type],
          )}
        >
          {typeLabels[activity.type]}
        </span>

        {/* Discount badge */}
        {activeDiscount && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-semibold text-white bg-emerald-500 uppercase tracking-widest">
            {activeDiscount.percentage}% DE DESCUENTO
          </span>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-5 flex flex-col flex-1 h-[calc(100%-12rem)]">
        {/* Title + description */}
        <Link
          href={routes.activities.detail(activity.id)}
          className="font-bold mb-2 text-lg leading-tight line-clamp-2 text-gray-900 group-hover:text-primary transition-colors duration-200"
        >
          {activity.title}
        </Link>

        {/* Date + time */}
        <div className="my-auto flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CalendarDays className="size-4 shrink-0 text-gray-400" />
            <span>
              {formatDateRange(
                activity.date,
                activity.finishDate ?? activity.date,
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="size-4 shrink-0 text-gray-400" />
            <span>
              {formatTimeRange(
                activity.date,
                activity.finishDate ?? activity.date,
              )}
            </span>
          </div>
          {activity.venue && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin className="size-4 shrink-0 text-gray-400" />
              <div>
                <span className="truncate">{activity.venue}</span>
                {activity.address && (
                  <p className=" text-gray-500 truncate">{activity.address}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <Separator className="my-4" />
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            {activeDiscount && activity.price != null && (
              <p className="text-xs text-gray-400 line-through leading-none mb-1">
                S/ {activity.price.toFixed(2)}
              </p>
            )}
            <p
              className={cn(
                "text-xl font-extrabold leading-none tracking-tight",
                activity.hasPrice ? "text-gray-900" : "text-emerald-500",
              )}
            >
              {activity.hasPrice && discountedPrice != null
                ? `S/ ${discountedPrice.toFixed(2)}`
                : "Gratis"}
            </p>
          </div>
          {activity.href && (
            <Link
              href={activity.href}
              className="text-xs text-gray-500 hover:text-primary font-medium flex items-center transition-colors"
              target="_blank"
            >
              Ver más información
              <ArrowRight className="size-3 ml-1" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
