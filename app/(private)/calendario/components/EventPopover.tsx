"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { IEventSchedule } from "@/types/activities";
import { Fragment } from "react";
import PopOverContentComponent from "./PopOverContent";

interface EventPopoverProps {
  event: IEventSchedule;
  date: Date;
}

export default function EventPopover({ event, date }: EventPopoverProps) {
  return (
    <Fragment>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-2 text-left px-2  rounded-full text-xs text-foreground overflow-hidden hover:ring-2 hover:ring-slate-200 transition-all"
            )}
          >
            <div
              className={cn("size-2 min-w-2 rounded-full")}
              style={{ backgroundColor: event.color }}
            />
            <div className="truncate text-xs">
              {event.startTime} {event.title}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <PopOverContentComponent event={event} date={date} />
        </PopoverContent>
      </Popover>
    </Fragment>
  );
}
