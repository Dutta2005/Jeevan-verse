import { useSelector, useDispatch } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { addNotifications } from "../../store/notificationSlice";
import { RootState } from "../../store/store";
import { Bell, Droplet } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Link } from "react-router";
import { api } from "../../api/api";
import { useCallback, useEffect } from "react";
import { Button } from "../ui/button";

function Notifications() {
  const dispatch = useDispatch();
  const { notifications, lastCheckedAt } = useSelector((state: RootState) => state.notification);

  // Fetch notifications when the app opens
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get("/notifications/after", {
        params: { time: lastCheckedAt },
      });
      if (response.data.data) {
        dispatch(addNotifications(response.data.data));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [dispatch, lastCheckedAt]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]); // Refresh when the notification cutoff changes

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${notifications.length ? ` (${notifications.length})` : ""}`}
        >
          <Bell aria-hidden="true" />
          {notifications.length > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
            >
              {notifications.length > 9 ? "9+" : notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <div className="flex flex-col h-[480px]">
          <ScrollArea className="flex-1">
            <div className="p-4">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground">No new notifications</p>
              ) : (
                notifications.map((notification) => (
                  <Link
                    to={notification.redirectUrl}
                    key={notification._id || `${notification.type}-${notification.createdAt}`}
                    className="flex items-start gap-4 mb-4 last:mb-0"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      {notification.type === "blood_request" ? (
                        <Droplet className="text-primary" size={16} />
                      ) : (
                        <Bell className="text-primary" size={16} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm leading-none">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification?.createdAt &&
                          formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>
          <Separator />
          <Link
            to="/notifications"
            className="block p-4 text-center text-sm text-primary hover:bg-primary/10 transition-colors"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Notifications;
