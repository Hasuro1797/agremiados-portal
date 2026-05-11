import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatTime,
  getDayNameFormat,
  getEventsForDate,
  HOURS,
  organizeOverlappingEvents,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { IEventSchedule } from "@/types/activities";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import CurrentTimeLine from "../CurrentTimeLine";
import TimeGridEvent from "../TimeGridEvent";

interface TimeGridViewProps {
  currentDate: Date;
  events: IEventSchedule[];
  viewType: "week" | "day";
  onSelectedDate: (date: Date) => void;
}

export default function TimeGridView({
  currentDate,
  events,
  viewType,
  onSelectedDate,
}: TimeGridViewProps) {
  const days =
    viewType === "week"
      ? Array.from({ length: 7 }, (_, i) =>
          addDays(startOfWeek(currentDate, { locale: es }), i)
        )
      : [currentDate];
  // ("los days", days);
  const today = new Date();
  return (
    <div className="">
      {/* <span className="text-xs">GMT-05</span> */}
      <div className="flex">
        <div className="w-16 md:w-20 flex-shrink-0 flex items-end justify-end h-16 border-b text-xs border-r text-right p-1">
          <span>GTM-5</span>
        </div>
        {days.map((date) => (
          <div
            key={date.toISOString()}
            className="flex-1 border-b border-r text-center p-1"
          >
            <div className="text-xs flex flex-col items-center justify-center uppercase md:text-xs font-medium">
              {/* Nombres responsivos de los días */}
              <span className="sm:hidden">
                {getDayNameFormat(date, "mobile")}
              </span>
              <span className="hidden md:block lg:hidden">
                {getDayNameFormat(date, "tablet")}
              </span>
              <span className="hidden lg:block">
                {getDayNameFormat(date, "desktop")}
              </span>
              <button
                onAbort={() => onSelectedDate(date)}
                className={cn(
                  "sm:text-xl sm:size-9 size-7 rounded-full flex justify-center text-foreground items-center",
                  isSameDay(date, today) && "bg-primary text-white"
                )}
              >
                {format(date, "d")}
              </button>
            </div>
          </div>
        ))}
      </div>
      {/*Grid de días y eventos */}
      <ScrollArea className="h-[calc(100vh_-_219px)] sm:h-[calc(100vh_-_179px)]">
        <div className="flex">
          <div className="w-16 md:w-20 flex-shrink-0 border-r bg-secondary/5">
            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex justify-end h-[calc((100vh_-_179px)/12)] px-2 py-1"
                >
                  <span className="text-[11px] leading-[120%] text-right text-muted-foreground">
                    {formatTime(hour, "00", "day")}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Grid de eventos */}
          <div className="flex flex-1 relative">
            {days.map((date) => {
              const dayEvents = getEventsForDate(events, date);
              const organizedEvents = organizeOverlappingEvents(dayEvents);
              const isToday = isSameDay(date, new Date());

              return (
                <div
                  key={date.toISOString()}
                  className="flex-1 border-r relative"
                  style={{ height: `calc(((100vh - 179px) / 12) * 24)` }}
                >
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className={cn(
                        "border-b h-[calc((100vh_-_179px)/12)]",
                        (hour < 8 || hour >= 18) && "bg-secundary/5"
                      )}
                    />
                  ))}
                  {isToday && <CurrentTimeLine />}
                  {organizedEvents.map(({ event, position, total }) => (
                    <TimeGridEvent
                      key={event.id}
                      event={event}
                      date={date}
                      position={position}
                      total={total}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
