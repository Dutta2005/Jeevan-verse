import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Bell } from "lucide-react";
import { Link } from "react-router";
import {
  changeNotifications,
  loadNotifications,
  selectNotificationInbox,
} from "@/store/notificationSlice";
import type { AppDispatch } from "@/store/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationDetails } from "../notifications/NotificationDetails";
import { notificationPath } from "../notifications/notificationPath";

export default function Notifications() {
  const dispatch = useDispatch<AppDispatch>();
  const { owner, notifications, status, live } = useSelector(selectNotificationInbox);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && owner && !live && status === "ready") void dispatch(loadNotifications(owner));
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unreadCount ? `Notifications (${unreadCount} unread)` : "Notifications"}
        >
          <Bell strokeWidth={1.5} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-1 top-0 grid h-4 min-w-4 place-items-center rounded-sm border border-border bg-background px-1 text-[11px] leading-none tabular-nums"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="flex max-h-[var(--radix-dropdown-menu-content-available-height)] w-88 max-w-[calc(100vw-1.5rem)] flex-col rounded-xl p-0 motion-reduce:animate-none"
      >
        <div className="px-4 py-3">
          <div className="flex items-baseline justify-between gap-4">
            <DropdownMenuLabel className="p-0 text-base font-medium">
              Notifications
            </DropdownMenuLabel>
            <span className="text-xs text-muted-foreground tabular-nums">{unreadCount} unread</span>
          </div>
          {!live && status !== "idle" && (
            <p className="mt-1 text-xs text-muted-foreground">Live updates unavailable</p>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuGroup className="min-h-0 divide-y divide-border overflow-y-auto px-2">
          {status === "error" && (
            <div>
              <p role="alert" className="px-2 pt-3 text-sm text-muted-foreground">
                Could not load notifications.
              </p>
              <DropdownMenuItem
                className="min-h-11 cursor-pointer"
                onSelect={(event) => {
                  event.preventDefault();
                  if (owner) void dispatch(loadNotifications(owner));
                }}
              >
                Try again
              </DropdownMenuItem>
            </div>
          )}
          {notifications.length > 0
            ? notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  asChild
                  className="min-h-11 cursor-pointer items-start gap-3 rounded-none px-2 py-3"
                >
                  <Link
                    to={notificationPath(notification.redirectUrl)}
                    onClick={() => {
                      if (!notification.isRead) {
                        void dispatch(changeNotifications({ kind: "read", id: notification._id }));
                      }
                    }}
                  >
                    <NotificationDetails notification={notification} />
                  </Link>
                </DropdownMenuItem>
              ))
            : status === "ready" && (
                <p className="px-2 py-5 text-sm text-muted-foreground">No notifications yet</p>
              )}
          {notifications.length === 0 && (status === "loading" || status === "idle") && (
            <div role="status" className="p-2">
              <span className="sr-only">Loading notifications</span>
              <Skeleton className="h-12 w-full animate-none" />
            </div>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuGroup className="px-2">
          <DropdownMenuItem
            asChild
            className="min-h-11 cursor-pointer justify-between rounded-none px-2 font-medium"
          >
            <Link to="/notifications">
              View all notifications
              <ArrowRight strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
