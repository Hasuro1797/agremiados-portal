"use client";

import { cn, formatDate } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  isAnnouncement,
  isRead,
  type NotificationItem,
  notificationVisual,
  SafeHtml,
} from "./notification-utils";

interface NotificationRowProps {
  notification: NotificationItem;
  /** Compact layout for the bell dropdown (clamps the body). */
  compact?: boolean;
  /** Marks the notification read on the server + updates local state. */
  onRead: (id: number) => void;
  /** Called right before navigating (e.g. close the dropdown). */
  onBeforeNavigate?: () => void;
}

export default function NotificationRow({
  notification,
  compact = false,
  onRead,
  onBeforeNavigate,
}: NotificationRowProps) {
  const router = useRouter();
  const read = isRead(notification);
  const { icon: Icon, className: iconClass } = notificationVisual(notification);
  const hasLink = !!notification.link;

  const handleClick = () => {
    if (!read) onRead(notification.id);
    if (hasLink) {
      onBeforeNavigate?.();
      router.push(notification.link as string);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group w-full text-left flex gap-3 transition-colors",
        compact ? "px-4 py-3" : "px-4 sm:px-5 py-4 rounded-xl",
        "hover:bg-gray-50",
        !read && (compact ? "bg-accent/[0.04]" : "bg-accent/[0.05]"),
      )}
    >
      {/* Icon chip */}
      <span
        className={cn(
          "relative shrink-0 flex items-center justify-center rounded-xl",
          compact ? "size-9" : "size-10",
          iconClass,
        )}
      >
        <Icon className={compact ? "size-4" : "size-5"} />
        {!read && (
          <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              "flex-1 text-sm leading-snug",
              read ? "font-medium text-gray-700" : "font-semibold text-gray-900",
              compact && "line-clamp-1",
            )}
          >
            {isAnnouncement(notification) && (
              <span className="mr-1.5 inline-flex items-center rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent align-middle">
                Comunicado
              </span>
            )}
            {notification.subject}
          </p>
          {hasLink && (
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-gray-300 group-hover:text-primary transition-colors" />
          )}
        </div>

        <SafeHtml
          html={notification.body}
          clamp={compact}
          className={cn("mt-0.5", compact && "text-xs")}
        />

        <p className="mt-1.5 text-[11px] text-gray-400">
          {formatDate(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}
