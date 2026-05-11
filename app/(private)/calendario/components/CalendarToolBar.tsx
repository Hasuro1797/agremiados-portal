"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const VIEWS = {
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
};

interface CalendarToolBarProps {
  view: string;
  onViewChange: (view: string) => void;
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

export function CalendarToolBar({
  view,
  onViewChange,
  date,
  onNavigate,
}: CalendarToolBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => onNavigate("TODAY")} size="sm">
          Hoy
        </Button>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("PREV")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("NEXT")}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <h2 className="text-xl font-semibold">
          {format(date, "MMMM yyyy", { locale: es })}
        </h2>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Select value={view} onValueChange={onViewChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(VIEWS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
