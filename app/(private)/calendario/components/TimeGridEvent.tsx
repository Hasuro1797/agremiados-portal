import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatTime } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { IEventSchedule } from "@/types/activities";
import PopOverContentComponent from "./PopOverContent";

export interface ITimeGridEventProps {
  event: IEventSchedule;
  date: Date;
  position: number;
  total: number;
}

export default function TimeGridEvent({
  event,
  position,
  date,
}: ITimeGridEventProps) {
  const [startHour, startMinute] = event.startTime.split(":").map(Number);
  const [endHour, endMinute] = event.endTime.split(":").map(Number);
  const top = startHour + startMinute / 60;
  const height = endHour - startHour + (endMinute - startMinute) / 60;
  // Nuevo cálculo para el diseño escalonado
  const baseWidth = 85; // Ancho base del evento en porcentaje
  const stepOffset = 5; // Desplazamiento horizontal por cada posición
  const width = `${baseWidth}%`;
  const left = `${stepOffset * position}%`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "absolute rounded-md px-2 py-1 text-xs text-white overflow-hidden hover:ring-2 hover:ring-slate-100 transition-all"
          )}
          style={{
            top: `calc(((100vh - 179px) / 12) * ${top})`,
            height: `calc(((100vh - 179px) / 12) * ${height})`,
            width: width,
            left: left,
            zIndex: position + 1,
            backgroundColor: event.color,
          }}
        >
          <div className="font-medium truncate">{event.title}</div>
          <div className="text-xs opacity-90 truncate">
            {formatTime(startHour, startMinute.toString())} -{" "}
            {formatTime(endHour, endMinute.toString())}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopOverContentComponent event={event} date={date} />
      </PopoverContent>
    </Popover>
  );
}
