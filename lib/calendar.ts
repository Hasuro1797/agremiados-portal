import { IEvent, IEventSchedule } from "@/types/activities";
import { ActivityType } from "@/utils/enum";
import {
  addDays,
  format,
  getDay,
  isSameDay,
  parseISO
} from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";


export type ViewType = "month" | "week" | "day" | "agenda";
export const CELL_HEIGHT = 60;
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Consistent colors per activity type (used by CalendarGrid legend)
export const ACTIVITY_COLORS: Record<string, string> = {
  [ActivityType.ACADEMIC]: "#3b82f6", // blue-500
  [ActivityType.SOCIAL]: "#22c55e",   // green-500
};
const DEFAULT_ACTIVITY_COLOR = "#f97316"; // orange-500 for sport/other

export const getDayNames = (daysOfWeek: number[]) => {
  return daysOfWeek
    .map((day) => format(addDays(new Date(0), day), "EEEE", { locale: es }))
    .join(", ");
};


export const getTypeOfActivityData = (initialData: IEvent): IEventSchedule=> {
  if (initialData.type === ActivityType.ACADEMIC) {
    return {
      color: ACTIVITY_COLORS[ActivityType.ACADEMIC],
      title: get(initialData, "academicActivity.title", ""),
      description: get(initialData, "academicActivity.description"),
      id: initialData.id,
      isPaid: initialData.isPaid,
      href: get(initialData, "academicActivity.href"),
      date: get(initialData, "academicActivity.date", ""),
      startTime: format(
        get(initialData, "academicActivity.date", ""),
        "HH:mm"
      ),
      endTime: format(
        get(initialData, "academicActivity.finishDate", ""),
        "HH:mm"
      ),
      recurrence: {
        type: initialData.concurrence,
        days: initialData.days,
        endsType: initialData.finishConcurrence ? "on" : "never",
        ...(initialData.finishConcurrence && {
          endsOn: new Date(initialData.finishConcurrence),
        }),
      },
    };
  } else if (initialData.type === ActivityType.SOCIAL) {
    return {
      color: ACTIVITY_COLORS[ActivityType.SOCIAL],
      title: get(initialData, "socialActivity.title", ""),
      description: get(initialData, "socialActivity.description"),
      id: initialData.id,
      isPaid: initialData.isPaid,
      href: get(initialData, "socialActivity.href"),
      date: get(initialData, "socialActivity.date", ""),
      startTime: format(get(initialData, "socialActivity.date", ""), "HH:mm"),
      endTime: format(
        get(initialData, "socialActivity.finishDate", ""),
        "HH:mm"
      ),
      recurrence: {
        type: initialData.concurrence,
        days: initialData.days,
        endsType: initialData.finishConcurrence ? "on" : "never",
        ...(initialData.finishConcurrence && {
          endsOn: new Date(initialData.finishConcurrence),
        }),
      },
    };
  } else {
    return {
      color: DEFAULT_ACTIVITY_COLOR,
      title: get(initialData, "sportActivity.title", ""),
      description: get(initialData, "sportActivity.description"),
      id: initialData.id,
      isPaid: initialData.isPaid,
      href: get(initialData, "sportActivity.href"),
      date: get(initialData, "sportActivity.date", ""),
      startTime: format(get(initialData, "sportActivity.date", ""), "HH:mm"),
      endTime: format(
        get(initialData, "sportActivity.finishDate", ""),
        "HH:mm"
      ),
      recurrence: {
        type: initialData.concurrence,
        days: initialData.days,
        endsType: initialData.finishConcurrence ? "on" : "never",
        ...(initialData.finishConcurrence && {
          endsOn: new Date(initialData.finishConcurrence),
        }),
      },
    };
  }
};

export const eventOccursOnDate = (event: IEventSchedule, date: Date): boolean => {
  if(event.recurrence.type === "none"){
    return isSameDay(event.date, date);
  }
  const eventStartDate = parseISO(event.date);
  const dayOfWeek = getDay(date);

  if(!event.recurrence.days.includes(dayOfWeek)) return false;
  if(date < new Date(eventStartDate.setHours(0, 0, 0, 0))) return false;

  // Verificar si hay fecha de finalización y si la fecha está antes de ella
  if(event.recurrence.endsType === "on"){
    const endDate = parseISO(event.recurrence.endsOn ? event.recurrence.endsOn.toString() : "")
    if(date > endDate) return false;
  }
  return true;
}

// Función para obtener todos los eventos para una fecha específica
export const getEventsForDate = (events: IEventSchedule[], date: Date): IEventSchedule[] => {
  const filterList = events.filter((event) =>{
    if (event.recurrence.type === "custom"){
      return eventOccursOnDate(event, date);
    }
    return isSameDay(parseISO(event.date), date);
  });
  return filterList;
}

// Mejorar la organización de eventos superpuestos
export const organizeOverlappingEvents = (events: IEventSchedule[]): {event: IEventSchedule; position: number; total:number}[] => {
  // Ordenar eventos por hora de inicio
  const sortedEvents = [...events].sort((a, b) => {
    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime)
    }
    // Si tienen la misma hora de inicio, el más largo va primero
    return b.endTime.localeCompare(a.endTime)
  })

  // Crear grupos de eventos superpuestos
  const groups: IEventSchedule[][] = []
  let currentGroup: IEventSchedule[] = []

  sortedEvents.forEach((event: IEventSchedule) => {
    if (currentGroup.length === 0) {
      currentGroup.push(event)
    } else {
      const lastEvent = currentGroup[currentGroup.length - 1]
      if (event.startTime < lastEvent.endTime) {
        // El evento se superpone con el grupo actual
        currentGroup.push(event)
      } else {
        // Comenzar un nuevo grupo
        groups.push([...currentGroup])
        currentGroup = [event]
      }
    }
  })

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  // Asignar posiciones dentro de cada grupo
  const result: { event: IEventSchedule; position: number; total: number }[] = []
  groups.forEach((group) => {
    group.forEach((event, index) => {
      result.push({
        event,
        position: index,
        total: group.length,
      })
    })
  })
  return result
}

// Función auxiliar para formatear la hora en 12 horas
export const formatTime = (hour: number, minute = "00", view="month") => {
  const period = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  if(view === "day" || view === "agenda" || view === "week"){
    return `${displayHour} ${period}`
  }
  return `${displayHour}:${minute.padStart(2, "0")} ${period}`
}

// Función auxiliar para obtener el nombre abreviado del día
export const getDayNameFormat = (date: Date, viewportSize: "mobile" | "tablet" | "desktop") => {
  switch (viewportSize) {
    case "mobile":
      return format(date, "EEEEE", { locale: es })
    case "tablet":
      return format(date, "E", { locale: es })
    case "desktop":
      return format(date, "EEE", { locale: es })
    default:
      return format(date, "EEEE", { locale: es })
  }
}
