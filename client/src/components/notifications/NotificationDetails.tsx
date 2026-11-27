import { formatDistanceToNow } from "date-fns";
import { Bell, Droplet, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/store/notificationSlice";

export function NotificationDetails({ notification }: { notification: Notification }) {
  const { Icon, source } =
    notification.type === "blood_request"
      ? { Icon: Droplet, source: "Blood Bridge" }
      : notification.type === "comment"
        ? { Icon: MessageCircle, source: "Comment" }
        : { Icon: Bell, source: null };
  const date = new Date(notification.createdAt ?? "");
  const hasDate = Number.isFinite(date.getTime());

  return (
    <>
      <span className="flex h-5 w-4 shrink-0 items-center justify-center text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={cn("wrap-anywhere text-sm leading-5", !notification.isRead && "font-medium")}
        >
          {notification.message}
        </span>
        {(source || hasDate) && (
          <span className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
            {source && <span>{source}</span>}
            {source && hasDate && <span aria-hidden="true">·</span>}
            {hasDate && (
              <time dateTime={date.toISOString()} className="tabular-nums">
                {formatDistanceToNow(date, { addSuffix: true })}
              </time>
            )}
          </span>
        )}
      </span>
      <span className="flex h-5 w-2 shrink-0 items-center justify-center">
        {!notification.isRead && (
          <>
            <span className="size-1.5 rounded-full bg-foreground" aria-hidden="true" />
            <span className="sr-only">Unread</span>
          </>
        )}
      </span>
    </>
  );
}
