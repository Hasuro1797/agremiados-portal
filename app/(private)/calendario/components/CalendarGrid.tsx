"use client";
import { ACTIVITY_COLORS } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { IActivity } from "@/types/activities";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ActivityType } from "@/utils/enum";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEK_DAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

const LEGEND = [
  { label: "ACADÉMICO", color: ACTIVITY_COLORS[ActivityType.ACADEMIC] },
  { label: "SOCIAL", color: ACTIVITY_COLORS[ActivityType.SOCIAL] },
];

interface CalendarGridProps {
  activities: IActivity[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
}

export default function CalendarGrid({
  activities,
  currentMonth,
  onMonthChange,
  selectedDate,
  onDaySelect,
}: CalendarGridProps) {
  const today = new Date();

  const canGoBack = isAfter(startOfMonth(currentMonth), startOfMonth(today));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getActivitiesForDay = (day: Date) =>
    activities.filter((a) => isSameDay(new Date(a.date), day));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-primary capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h2>
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={() =>
                canGoBack && onMonthChange(subMonths(currentMonth, 1))
              }
              disabled={!canGoBack}
              aria-label="Mes anterior"
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                canGoBack
                  ? "text-gray-400 hover:bg-gray-100 hover:text-primary cursor-pointer"
                  : "text-gray-200 cursor-not-allowed",
              )}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => onMonthChange(addMonths(currentMonth, 1))}
              aria-label="Mes siguiente"
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            {LEGEND.map((l) => (
              <span
                key={l.label}
                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wide"
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: l.color }}
                />
                {l.label}
              </span>
            ))}
          </div>
          {!isSameMonth(currentMonth, today) && (
            <button
              onClick={() => onMonthChange(today)}
              className="text-[11px] font-bold text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors uppercase tracking-wide"
            >
              HOY
            </button>
          )}
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-100">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const isInCurrentMonth = isSameMonth(day, currentMonth);
          const dayActivities = getActivitiesForDay(day);
          const isLastCol = idx % 7 === 6;
          const isLastRow = idx >= days.length - 7;

          return (
            <div
              key={idx}
              onClick={() => isInCurrentMonth && onDaySelect(day)}
              className={cn(
                "min-h-[72px] p-1.5 transition-colors",
                isInCurrentMonth ? "cursor-pointer" : "cursor-default",
                !isLastCol && "border-r border-gray-50",
                !isLastRow && "border-b border-gray-50",
                isSelected && isInCurrentMonth
                  ? "bg-accent/[0.05] hover:bg-accent-hover/[0.08]"
                  : isToday
                    ? "bg-blue-50/40 hover:bg-blue-50/70"
                    : isInCurrentMonth
                      ? "bg-white hover:bg-gray-50/60"
                      : "bg-gray-50/30",
              )}
            >
              {/* Date number */}
              <div
                className={cn(
                  "size-7 flex items-center justify-center rounded-full text-xs font-semibold mb-1 mx-auto",
                  isToday
                    ? "bg-accent text-white font-bold"
                    : isSelected && isInCurrentMonth
                      ? "bg-accent/15 text-accent font-bold ring-1 ring-accent/30"
                      : isInCurrentMonth
                        ? "text-gray-700"
                        : "text-gray-300",
                )}
              >
                {format(day, "d")}
              </div>

              {/* Events — desktop: colored dot + truncated title */}
              <div className="hidden sm:flex flex-col gap-0.5">
                {dayActivities.slice(0, 2).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-1 overflow-hidden"
                  >
                    <span
                      className="size-[6px] rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          ACTIVITY_COLORS[activity.type] ??
                          ACTIVITY_COLORS[ActivityType.ACADEMIC],
                      }}
                    />
                    <span className="text-[10px] text-gray-500 truncate leading-tight">
                      {activity.title}
                    </span>
                  </div>
                ))}
                {dayActivities.length > 2 && (
                  <span className="text-[9px] text-gray-400 font-semibold pl-2.5">
                    +{dayActivities.length - 2} más
                  </span>
                )}
              </div>

              {/* Events — mobile: dots only */}
              {dayActivities.length > 0 && (
                <div className="flex gap-0.5 justify-center sm:hidden mt-0.5">
                  {dayActivities.slice(0, 3).map((activity, i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          ACTIVITY_COLORS[activity.type] ??
                          ACTIVITY_COLORS[ActivityType.ACADEMIC],
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
