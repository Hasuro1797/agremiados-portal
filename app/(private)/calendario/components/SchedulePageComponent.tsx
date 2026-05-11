"use client";
import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_CALENDAR_ACTIVITIES } from "@/graphql/query/calendarActivity.query";
import { routes } from "@/lib/routes";
import { useOrganization } from "@/providers/organization-provider";
import { IActivity } from "@/types/activities";
import { useQuery } from "@apollo/client";
import {
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { get } from "lodash";
import Link from "next/link";
import { useState } from "react";
import CalendarGrid from "./CalendarGrid";
import FeaturedActivities from "./FeaturedActivities";

export default function SchedulePageComponent() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const { organization } = useOrganization();

  const rangeStart = startOfWeek(startOfMonth(currentMonth), {
    weekStartsOn: 0,
  });
  const rangeEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

  const { data, loading } = useQuery(GET_CALENDAR_ACTIVITIES, {
    variables: {
      startDate: format(rangeStart, "yyyy-MM-dd"),
      endDate: format(rangeEnd, "yyyy-MM-dd"),
    },
    fetchPolicy: "cache-and-network",
    skip: !organization?.moduleEvents,
  });

  const activities: IActivity[] = get(
    data,
    "getCalendarActivities",
    [],
  ) as IActivity[];

  const dayActivities = activities.filter((a) =>
    isSameDay(new Date(a.date), selectedDate),
  );

  function handleMonthChange(newMonth: Date) {
    setCurrentMonth(newMonth);
    if (isSameMonth(today, newMonth)) {
      setSelectedDate(today);
    } else {
      setSelectedDate(startOfMonth(newMonth));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <div className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
          aria-label="Breadcrumb"
        >
          <Link
            href={routes.home}
            className="hover:text-primary transition-colors"
          >
            Inicio
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Calendario</span>
        </nav>

        {/* Header */}
        <div className="mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl leading-relaxed">
            Consulta los eventos y actividades programadas para el mes.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <Skeleton className="h-[600px] rounded-2xl" />
            <Skeleton className="h-[460px] rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            <CalendarGrid
              activities={activities}
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
              selectedDate={selectedDate}
              onDaySelect={setSelectedDate}
            />
            <div className="sticky top-24">
              <FeaturedActivities
                activities={dayActivities}
                selectedDate={selectedDate}
                moduleEvents={!!organization?.moduleEvents}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
