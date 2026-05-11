"use client";
import { GET_ALL_ACTIVITIES } from "@/graphql/query/activity.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { IActivity } from "@/types/activities";
import { ActivityType } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

const WEEK_DAYS = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];

export default function MiniCalendar() {
  const today = new Date();
  // const [currentMonth, setCurrentMonth] = useState(today);

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const todayFormatted = format(new Date(), "yyyy-MM-dd", { locale: es });
  const { data: activitiesData, loading } = useQuery(GET_ALL_ACTIVITIES, {
    variables: {
      page: 1,
      pageSize: 100,
      filters: {
        startDate: todayFormatted + "T00:00:00Z",
        endDate: todayFormatted + "T23:59:59Z",
      },
    },
    fetchPolicy: "cache-and-network",
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        {/* <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button> */}
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
          {format(today, "MMMM yyyy", { locale: es })}
        </span>
        {/* <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
        >
          <ChevronRight className="size-4" />
        </button> */}
        {/* <Link
          href={routes.schedule}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Ver todo
          </span>
          <ChevronRight className="size-3" />
        </Link> */}
        <Link
          href={routes.schedule}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors font-semibold"
        >
          Ver todo
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, idx) => {
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, today);
          return (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-center h-7 w-7 mx-auto rounded-full text-xs font-medium transition-colors",
                isToday && "bg-primary text-white font-bold",
                !isToday && isCurrentMonth && "text-gray-700 hover:bg-gray-100",
                !isCurrentMonth && "text-gray-300",
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <span className="text-xs font-semibold text-primary">
          Actividades del día
        </span>
        {loading ? (
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : get(
            activitiesData,
            "getActivitiesFromWebsite.activities.length",
          ) ? (
          get(activitiesData, "getActivitiesFromWebsite.activities").map(
            (act: IActivity) => (
              <div
                key={act.id}
                className="px-2 py-2 bg-gray-50 rounded-md text-gray-700 flex items-center gap-1"
                title={act.title}
              >
                <span
                  className={cn(
                    "size-2 rounded-full block shrink-0",
                    act.type === ActivityType.ACADEMIC
                      ? "bg-primary"
                      : "bg-accent",
                  )}
                />
                <span className="block text-xs line-clamp-1 truncate">
                  {act.title}
                </span>
              </div>
            ),
          )
        ) : (
          <p className="text-xs text-gray-500">No hay actividades hoy</p>
        )}
      </div>
    </div>
  );
}
