import { Priority, SupportStatus } from "@/types/support.type";

export const STATUS_LABELS: Record<SupportStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En proceso",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
  REJECTED: "Rechazado",
  REOPENED: "Reabierto",
};

export const STATUS_CLASSES: Record<SupportStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600 border-gray-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  RESOLVED: "bg-green-50 text-green-700 border-green-200",
  REOPENED: "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const PRIORITY_CLASSES: Record<Priority, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-orange-50 text-orange-700",
  URGENT: "bg-red-50 text-red-700",
};
