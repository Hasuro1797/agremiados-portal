import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getEventsForDate } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { IEventSchedule } from "@/types/activities";
import {
  addDays,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import EventPopover from "../EventPopover";
import PopOverContentComponent from "../PopOverContent";

interface MonthViewProps {
  currentDate: Date;
  events: IEventSchedule[];
  onDateSelect: (date: Date) => void;
}

export default function MonthView({
  currentDate,
  events,
  onDateSelect,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const weekStart = startOfWeek(monthStart);
  const daysInView = Array.from({ length: 42 }, (_, i) =>
    addDays(weekStart, i)
  );
  const today = new Date();

  // const calculateMaxEvents = (cellHeight: number) => {
  //   const eventHeight = 20; // Altura aproximada de cada evento en píxeles
  //   const maxEvents = Math.floor((cellHeight - 40) / eventHeight); // 30 píxeles para el día y el botón "más"
  //   return Math.max(0, maxEvents);
  // };
  const MAX_VISIBLE_EVENTS = 2;

  return (
    <div className="h-[calc(100vh_-_113px)] grid grid-rows-[32px_repeat(6,minmax(0,1fr))] grid-cols-7 gap-px bg-slate-200">
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className="p-2 text-center font-semibold uppercase bg-white text-xs"
        >
          {format(addDays(weekStart, i), "EEE", { locale: es })}
        </div>
      ))}

      {daysInView.map((date) => {
        const daysEvents = getEventsForDate(events, date);
        const hasMoreEvents = daysEvents.length > MAX_VISIBLE_EVENTS;
        const visibleEvents = daysEvents.slice(0, MAX_VISIBLE_EVENTS);
        const remainingEvents = daysEvents.slice(MAX_VISIBLE_EVENTS);
        const isToday = isSameDay(date, today);
        return (
          <div
            key={date.toISOString()}
            className={cn(
              "h-full p-1 bg-white",
              !isSameMonth(date, currentDate) && "text-foreground/60"
            )}
          >
            <div className="w-full flex justify-center">
              <button
                onClick={() => onDateSelect(date)}
                className={cn(
                  "size-7 text-xs sm:text-sm flex justify-center items-center hover:bg-blue-600 p-1 rounded-full ease-in-out transition-all",
                  isToday &&
                    "bg-primary hover:bg-blue-600 text-white font-semibold"
                )}
              >
                {format(date, "d")}
              </button>
            </div>
            <div className="space-y-1">
              {visibleEvents.map((event) => (
                <EventPopover key={event.id} event={event} date={date} />
              ))}
              {hasMoreEvents && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full text-left px-2 rounded text-xs text-muted-foreground hover:bg-slate-300 transition-all">
                      +{remainingEvents.length} más
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-xl font-semibold">
                          {format(date, "d")}
                        </span>
                        <div className="text-sm uppercase text-foreground/70">
                          {format(date, "EEEEEE", { locale: es })}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {daysEvents.map((event) => (
                          <Popover key={event.id}>
                            <PopoverTrigger asChild>
                              <button className="w-full text-left px-2 hover:bg-slate-300 overflow-hidden rounded-full">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "size-2 rounded-full",
                                      event.color
                                    )}
                                  />
                                  <div className="truncate">
                                    <div className="text-sx">
                                      {event.startTime} {event.title}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <PopOverContentComponent
                                event={event}
                                date={date}
                              />
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
