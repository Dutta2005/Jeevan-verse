import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { addNotifications } from '../../store/notificationSlice';
import { RootState } from '../../store/store';
import { Bell, Droplet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Link } from 'react-router';
import { api } from '../../api/api';
import { useEffect } from 'react';

function Notifications() {
    const dispatch = useDispatch();
    const { notifications, lastCheckedAt } = useSelector((state: RootState) => state.notification);
    
    // Fetch notifications when the app opens
    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications/after', {
                params: { time: lastCheckedAt }
            });
            if (response.data.data) {                
                dispatch(addNotifications(response.data.data));
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []); // Runs once when the component mounts
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative dark:text-dark-text">
                    <Bell size={20} />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-sm text-white rounded-full flex items-center justify-center">
                            {notifications.length}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0">
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
                                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                                            {notification.type === "blood_request" ? (
                                                <Droplet className="text-primary" size={16} />
                                            ) : (
                                                <Bell className="text-primary" size={16} />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm leading-none">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground">{notification?.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                    <Separator />
                    <Link to="/notifications" className="block p-4 text-center text-sm text-primary hover:bg-accent/10 transition-colors">
                        View all notifications
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default Notifications;