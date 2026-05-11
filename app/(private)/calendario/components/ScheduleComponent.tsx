"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewType } from "@/lib/calendar";
import { IEventSchedule } from "@/types/activities";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  format,
  startOfDay,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Menu,
  Table2,
} from "lucide-react";
import React, { useState } from "react";
import MonthView from "./Views/MonthView";
import TimeGridView from "./Views/TimeGridView";
import AgendaView from "./Views/AgendaView";
import DropdownAvatar from "@/components/DropdownAvatar";

export interface IScheduleComponentProps {
  events: IEventSchedule[];
}
export default function ScheduleComponent({ events }: IScheduleComponentProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setView("day");
  };

  const navigateToday = () => setCurrentDate(new Date());

  const navigatePrevious = () => {
    switch (view) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "agenda":
        setCurrentDate(subDays(currentDate, 14)); // Mover 2 semanas atrás
        break;
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "agenda":
        setCurrentDate(addDays(currentDate, 14));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const getAgendaDateRange = (date: Date) => {
    const startDate = startOfDay(date);
    const endDate = endOfDay(addDays(startDate, 13)); // 2 semanas
    return `${format(startDate, "d 'de' MMM", { locale: es })} - ${format(
      endDate,
      "d 'de' MMM, yyyy",
      { locale: es }
    )}`;
  };
  return (
    <Card className="flex flex-col h-[calc(100vh_-_40px)] w-full my-5 overflow-hidden">
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 p-4 border-b">
        <div className="flex items-center gap-4 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="">
                <Menu className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setView("month")}>
                <CalendarIcon className="mr-2 size-4" />
                Mes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("week")}>
                <LayoutGrid className="mr-2 size-4" />
                Semana
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("day")}>
                <Table2 className="mr-2 size-4" />
                Día
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("agenda")}>
                <List className="mr-2 size-4" />
                Agenda
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

          {/* <div className="hidden md:flex gap-1">
            <Button
              variant={view === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("month")}
            >
              Mes
            </Button>
            <Button
              variant={view === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("week")}
            >
              Semana
            </Button>
            <Button
              variant={view === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("day")}
            >
              Día
            </Button>
            <Button
              variant={view === "agenda" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("agenda")}
            >
              Agenda
            </Button>
          </div> */}
          <h2 className="text-lg font-semibold block text-balance sm:hidden capitalize">
            {view === "agenda"
              ? getAgendaDateRange(currentDate)
              : format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={navigateToday}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="size-4" />
            </Button>
            <h2 className="text-lg font-semibold hidden sm:block capitalize">
              {view === "agenda"
                ? getAgendaDateRange(currentDate)
                : format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="">
                <Menu className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setView("month")}>
                <CalendarIcon className="mr-2 size-4" />
                Mes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("week")}>
                <LayoutGrid className="mr-2 size-4" />
                Semana
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("day")}>
                <Table2 className="mr-2 size-4" />
                Día
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("agenda")}>
                <List className="mr-2 size-4" />
                Agenda
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownAvatar isEditable />
          {/* <h2 className="text-lg font-semibold capitalize">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2> */}
          {/* <Button variant="outline" size="sm" onClick={navigateToday}>
            Hoy
          </Button> */}
        </div>
      </div>
      {view === "month" && (
        <MonthView
          currentDate={currentDate}
          events={events}
          onDateSelect={handleDateSelect}
        />
      )}
      {view === "week" && (
        <TimeGridView
          currentDate={currentDate}
          events={events}
          viewType="week"
          onSelectedDate={handleDateSelect}
        />
      )}
      {view === "day" && (
        <TimeGridView
          currentDate={currentDate}
          events={events}
          viewType="day"
          onSelectedDate={handleDateSelect}
        />
      )}
      {view === "agenda" && (
        <AgendaView events={events} currentDate={currentDate} />
      )}
    </Card>
  );
}
