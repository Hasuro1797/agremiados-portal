import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import {
  Bell,
  CalendarCheck,
  CreditCard,
  type LucideIcon,
  Megaphone,
  MessageSquareText,
  ReceiptText,
} from "lucide-react";

export interface NotificationItem {
  id: number;
  userId: string;
  triggerKey?: string | null;
  subject: string;
  body: string;
  link?: string | null;
  channel: string;
  status: string; // "PENDING" | "SENT" | "FAILED" | "READ"
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationsData {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
}

export const isRead = (n: NotificationItem) => n.status === "READ";

export const isAnnouncement = (n: NotificationItem) =>
  n.triggerKey === "ANNOUNCEMENT";

/** Per-trigger visual config: icon + accent color used for the icon chip. */
const TRIGGER_VISUALS: Record<
  string,
  { icon: LucideIcon; className: string }
> = {
  ANNOUNCEMENT: { icon: Megaphone, className: "bg-accent/10 text-accent" },
  QUOTA_AVAILABLE: { icon: ReceiptText, className: "bg-amber-100 text-amber-600" },
  PAYMENT: { icon: CreditCard, className: "bg-emerald-100 text-emerald-600" },
  RESERVATION: { icon: CalendarCheck, className: "bg-sky-100 text-sky-600" },
  SUPPORT: { icon: MessageSquareText, className: "bg-violet-100 text-violet-600" },
};

export function notificationVisual(n: NotificationItem) {
  return (
    TRIGGER_VISUALS[n.triggerKey ?? ""] ?? {
      icon: Bell,
      className: "bg-primary/10 text-primary",
    }
  );
}

/** Shared prose styling so sanitized HTML bodies render consistently. */
export const NOTIFICATION_PROSE =
  "prose prose-sm max-w-none text-gray-600 " +
  "prose-headings:font-bold prose-headings:text-gray-900 prose-headings:my-1 " +
  "prose-p:my-1 prose-p:text-gray-600 prose-a:text-primary prose-a:font-medium " +
  "prose-strong:text-gray-800 prose-li:my-0.5 prose-li:text-gray-600 " +
  "prose-ul:my-1 prose-ol:my-1 prose-blockquote:my-1 prose-blockquote:border-primary";

/**
 * Renders an admin-authored HTML body, sanitized, with prose styling.
 * `clamp` truncates the rendered output (used in the compact bell list).
 */
export function SafeHtml({
  html,
  className,
  clamp,
}: {
  html: string;
  className?: string;
  clamp?: boolean;
}) {
  return (
    <div
      className={cn(
        NOTIFICATION_PROSE,
        clamp && "line-clamp-2 [&_*]:inline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
