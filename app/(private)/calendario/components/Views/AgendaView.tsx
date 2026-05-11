"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { eventOccursOnDate } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { IEventSchedule } from "@/types/activities";
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  format,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import EventPopover from "../EventPopover";

interface AgendaViewProps {
  events: IEventSchedule[];
  currentDate: Date;
}

export default function AgendaView({ events, currentDate }: AgendaViewProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Definir el rango de fechas para la vista de agenda (por ejemplo, 2 semanas)
  const startDate = startOfDay(currentDate);
  const endDate = endOfDay(addDays(currentDate, 13)); // 2 semanas

  // Generar un array de todas las fechas en el rango
  const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });

  // Función para obtener eventos para una fecha específica, incluyendo eventos recurrentes
  const getEventsForDate = (date: Date): IEventSchedule[] => {
    return events.filter((event) => {
      if (event.recurrence.type === "custom") {
        return eventOccursOnDate(event, date);
      } else {
        const eventDate = parseISO(event.date);
        return isSameDay(eventDate, date);
      }
    });
  };

  // Función para verificar si un evento está ocurriendo ahora
  // const isEventNow = (event: IEventSchedule, date: Date) => {
  //   const [startHour, startMinute] = event.startTime.split(":").map(Number);
  //   const [endHour, endMinute] = event.endTime.split(":").map(Number);
  //   const eventStart = new Date(
  //     date.getFullYear(),
  //     date.getMonth(),
  //     date.getDate(),
  //     startHour,
  //     startMinute
  //   );
  //   const eventEnd = new Date(
  //     date.getFullYear(),
  //     date.getMonth(),
  //     date.getDate(),
  //     endHour,
  //     endMinute
  //   );
  //   return isWithinInterval(now, { start: eventStart, end: eventEnd });
  // };

  // Ordenar eventos por fecha y hora
  // const sortedEvents = [...events].sort((a, b) => {
  //   const dateA = parseISO(a.date);
  //   const dateB = parseISO(b.date);
  //   if (dateA.getTime() !== dateB.getTime()) {
  //     return dateA.getTime() - dateB.getTime();
  //   }
  //   return a.startTime.localeCompare(b.startTime);
  // });

  // // Agrupar eventos por fecha
  // const groupedEvents = sortedEvents.reduce((acc, event) => {
  //   const date = event.date;
  //   if (!acc[date]) {
  //     acc[date] = [];
  //   }
  //   acc[date].push(event);
  //   return acc;
  // }, {} as Record<string, IEventSchedule[]>);

  // Función para verificar si un evento está ocurriendo ahora
  // const isEventNow = (event: IEventSchedule) => {
  //   const [startHour, startMinute] = event.startTime.split(":").map(Number);
  //   const [endHour, endMinute] = event.endTime.split(":").map(Number);
  //   const eventStart = startHour * 60 + startMinute;
  //   const eventEnd = endHour * 60 + endMinute;
  //   const nowMinutes = now.getHours() * 60 + now.getMinutes();
  //   return nowMinutes >= eventStart && nowMinutes <= eventEnd;
  // };
  return (
    <ScrollArea className="h-[calc(100vh_-_114px)]">
      {datesInRange.map((date) => {
        const dayEvents = getEventsForDate(date);
        const isToday = isSameDay(date, now);

        if (dayEvents.length === 0) return null; // No mostrar días sin eventos

        return (
          <div
            key={date.toISOString()}
            className="flex border-b border-border last:border-b-0"
          >
            {/* Columna de fecha (ahora con posición sticky) */}
            <div className="w-20 flex-shrink-0 p-4 flex flex-col items-center justify-center border-r border-border sticky top-0 bg-background">
              <div
                className={cn(
                  "text-3xl font-bold",
                  isToday ? "text-primary" : "text-foreground"
                )}
              >
                {format(date, "d")}
              </div>
              <div className="text-xs text-muted-foreground uppercase">
                {format(date, "MMM", { locale: es })}
              </div>
              <div className="text-xs text-muted-foreground uppercase">
                {format(date, "EEE", { locale: es })}
              </div>
            </div>

            {/* Columna de eventos */}
            <div className="flex-1 relative p-2">
              {dayEvents.map((event) => {
                return (
                  <EventPopover
                    key={`${event.id}-${date.toISOString()}`}
                    date={date}
                    event={event}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </ScrollArea>
  );
}
