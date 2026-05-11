import { formatTime } from "@/lib/calendar";
import { IEventSchedule } from "@/types/activities";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlignLeft, LinkIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface PopOverContentProps {
  event: IEventSchedule;
  date: Date;
}

export default function PopOverContentComponent({
  event,
  date,
}: PopOverContentProps) {
  const [startHour, startMinute] = event.startTime.split(":").map(Number);
  const [endHour, endMinute] = event.endTime.split(":").map(Number);
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div
          className={`size-4 min-w-4 rounded mt-[6px]`}
          style={{ backgroundColor: event.color }}
        />
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{event.title}</h3>
          <div className="space-y-2 text-xs text-foreground/70">
            <span>{format(date, "EEEE, dd MMMM", { locale: es })}</span>
            {" ⋅ "}
            <span>
              {formatTime(startHour, startMinute.toString())} -{" "}
              {formatTime(endHour, endMinute.toString())}
            </span>
          </div>
        </div>
      </div>
      {event.description && (
        <div className="flex gap-3">
          <div className="min-w-4">
            <AlignLeft className="size-4 mt-1.5" strokeWidth={2} />
          </div>
          <p className="text-foreground/70 text-sm">{event.description}</p>
        </div>
      )}
      {event.href && (
        <div className="flex gap-2">
          <LinkIcon className="size-4" strokeWidth={2} />
          <a
            href={event.href}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 text-xs"
          >
            Ver más información
          </a>
        </div>
      )}
      {event.isPaid && (
        <div className="flex justify-end">
          <Link
            href={"/"}
            className="px-4 bg-primary py-2 text-white hover:bg-blue-600 rounded-md text-xs"
          >
            Participar
          </Link>
        </div>
      )}
    </div>
  );
}
