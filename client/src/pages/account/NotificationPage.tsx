import { useState } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { format, isToday, isYesterday } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { NotificationDetails } from "@/components/notifications/NotificationDetails";
import { notificationPath } from "@/components/notifications/notificationPath";
import {
  changeNotifications,
  loadNotifications,
  selectNotificationInbox,
  type Notification,
} from "@/store/notificationSlice";
import type { AppDispatch } from "@/store/store";

function groupByDate(notifications: Notification[]) {
  const groups = new Map<string, Notification[]>();
  for (const notification of notifications) {
    const date = new Date(notification.createdAt ?? "");
    let day = "Undated";
    if (Number.isFinite(date.getTime())) {
      day = isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy");
    }
    const group = groups.get(day) ?? [];
    group.push(notification);
    groups.set(day, group);
  }
  return Array.from(groups);
}

export default function NotificationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { owner, notifications, status, actionError, live } = useSelector(selectNotificationInbox);
  const [filter, setFilter] = useState("all");
  const [pending, setPending] = useState(false);
  const unread = notifications.filter((notification) => !notification.isRead);
  const groups = groupByDate(filter === "unread" ? unread : notifications);
  const loading = status === "idle" || status === "loading";

  async function runAction(change: Parameters<typeof changeNotifications>[0]) {
    setPending(true);
    try {
      await dispatch(changeNotifications(change));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[704px] px-4 py-6 sm:px-6 md:p-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium leading-tight tracking-tight md:text-[28px]">
            Notifications
          </h1>
          <div className="mt-1 text-sm text-muted-foreground" role="status">
            <p className="tabular-nums">{unread.length} unread</p>
            {!live && status !== "idle" && <p>Live updates unavailable</p>}
          </div>
        </div>
        {(notifications.length > 0 || (!live && status === "ready")) && (
          <div className="flex flex-wrap gap-2">
            {!live && status === "ready" && (
              <Button
                variant="ghost"
                size="sm"
                className="min-h-11"
                onClick={() => {
                  if (owner) void dispatch(loadNotifications(owner));
                }}
              >
                Refresh
              </Button>
            )}
            {unread.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="min-h-11"
                disabled={pending}
                onClick={() => void runAction({ kind: "readAll" })}
              >
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="min-h-11" disabled={pending}>
                    Clear all
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes your notification history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void runAction({ kind: "deleteAll" })}>
                      Clear all
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </header>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList aria-label="Filter notifications" className="h-auto">
          <TabsTrigger value="all" className="min-h-11">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="min-h-11">
            Unread
          </TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-6 flex flex-col gap-6" aria-busy={loading}>
          {status === "error" && (
            <Alert variant="destructive">
              <AlertDescription>Could not load notifications.</AlertDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 min-h-11"
                onClick={() => {
                  if (owner) void dispatch(loadNotifications(owner));
                }}
              >
                Try again
              </Button>
            </Alert>
          )}
          {actionError && (
            <Alert variant="destructive">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}
          {loading && notifications.length === 0 && (
            <div className="flex flex-col gap-2" aria-label="Loading notifications">
              {[1, 2, 3].map((key) => (
                <Skeleton key={key} className="h-16 w-full animate-none" />
              ))}
            </div>
          )}
          {status === "ready" && groups.length === 0 && (
            <Empty className="items-start rounded-none border-t border-border px-2 py-6 text-left">
              <EmptyHeader>
                <EmptyTitle>
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </EmptyTitle>
              </EmptyHeader>
            </Empty>
          )}
          {groups.map(([day, items]) => (
            <section key={day}>
              <h2 className="border-b border-border px-2 pb-2 text-xs font-medium text-muted-foreground">
                {day}
              </h2>
              <ul className="divide-y divide-border">
                {items.map((notification) => (
                  <li key={notification._id} className="flex min-w-0 items-center gap-1">
                    <Link
                      className="flex min-h-11 min-w-0 flex-1 items-start gap-3 rounded-md px-2 py-3 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                      to={notificationPath(notification.redirectUrl)}
                      onClick={() => {
                        if (!notification.isRead) {
                          void dispatch(
                            changeNotifications({ kind: "read", id: notification._id }),
                          );
                        }
                      }}
                    >
                      <NotificationDetails notification={notification} />
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-11 text-muted-foreground"
                      disabled={pending}
                      aria-label={`Delete notification: ${notification.message}`}
                      onClick={() => void runAction({ kind: "delete", id: notification._id })}
                    >
                      <Trash2 strokeWidth={1.5} aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
