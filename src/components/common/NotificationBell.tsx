import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  type Notification,
  notificationService,
} from "../../services/notificationService";

const NOTIFICATION_ICONS: Record<string, string> = {
  expense_added: "💰",
  expense_updated: "💰",
  expense_deleted: "🗑️",
  meal_added: "🍽️",
  meal_updated: "🍽️",
  meal_deleted: "🗑️",
  deposit_added: "💵",
  deposit_updated: "💵",
  deposit_deleted: "🗑️",
  member_joined: "👋",
  member_removed: "👋",
  manager_transfer_request: "👑",
  manager_transfer_approved: "✅",
  manager_transfer_rejected: "❌",
  market_day_reminder: "🛒",
  month_started: "📅",
  month_closed: "🔒",
};

const NOTIFICATION_COLORS: Record<string, string> = {
  expense_added: "bg-error/10 text-error",
  expense_updated: "bg-warning/10 text-warning",
  expense_deleted: "bg-neutral-500/10 text-neutral-500",
  meal_added: "bg-success/10 text-success",
  meal_updated: "bg-info/10 text-info",
  meal_deleted: "bg-neutral-500/10 text-neutral-500",
  deposit_added: "bg-success/10 text-success",
  deposit_updated: "bg-info/10 text-info",
  deposit_deleted: "bg-neutral-500/10 text-neutral-500",
  member_joined: "bg-primary/10 text-primary",
  member_removed: "bg-warning/10 text-warning",
  manager_transfer_request: "bg-warning/10 text-warning",
  manager_transfer_approved: "bg-success/10 text-success",
  manager_transfer_rejected: "bg-error/10 text-error",
  market_day_reminder: "bg-info/10 text-info",
  month_started: "bg-primary/10 text-primary",
  month_closed: "bg-neutral-500/10 text-neutral-500",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const [notifs, countData] = await Promise.all([
        notificationService.getNotifications({ limit: 50 }), // Get more to account for filtering
        notificationService.getUnreadCount(),
      ]);

      // Load preferences
      const savedNotifications = localStorage.getItem("notifications");
      const prefs = savedNotifications ? JSON.parse(savedNotifications) : null;

      if (!prefs) {
        setNotifications(notifs.slice(0, 5));
        setUnreadCount(countData.unread_count);
        return;
      }

      // Filter logic
      const filteredNotifs = notifs.filter((n) => {
        if (n.type.startsWith("meal_") && !prefs.meal_updates) return false;
        if (n.type.startsWith("expense_") && !prefs.expense_updates) return false;
        if (n.type.startsWith("deposit_") && !prefs.deposit_updates) return false;
        if (n.type.startsWith("manager_transfer") && !prefs.manager_transfer) return false;
        if (n.type === "market_day_reminder" && !prefs.market_day_reminder) return false;
        return true;
      });

      // Update state
      setNotifications(filteredNotifs.slice(0, 5));
      
      // Note: In a real app, unreadCount should be filtered by the backend
      // For now, we estimate it or just use the backend count
      setUnreadCount(filteredNotifs.filter(n => !n.is_read).length);
      
    } catch (error) {
      console.error("Failed to load notifications");
    }
  };


  const handleMarkAsRead = async (
    notificationId: string,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
    try {
      await notificationService.updateNotification(notificationId, true);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark all as read");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      const deletedNotif = notifications.find((n) => n.id === notificationId);
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete notification");
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    setIsOpen(false);

    // Navigate based on notification type
    switch (notification.type) {
      case "expense_added":
      case "expense_updated":
      case "expense_deleted":
        navigate("/expense-summary");
        break;
      case "meal_added":
      case "meal_updated":
      case "meal_deleted":
        navigate("/meals");
        break;
      case "deposit_added":
      case "deposit_updated":
      case "deposit_deleted":
        navigate("/deposits");
        break;
      case "member_joined":
      case "member_removed":
        navigate("/members");
        break;
      case "manager_transfer_request":
      case "manager_transfer_approved":
      case "manager_transfer_rejected":
        navigate("/settings");
        break;
      case "market_day_reminder":
        navigate("/meal-expenses");
        break;
      case "month_started":
      case "month_closed":
        navigate("/");
        break;
      default:
        break;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors group ${
                      !notification.is_read
                        ? "bg-primary/5 dark:bg-primary/10"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                          NOTIFICATION_COLORS[notification.type] ||
                          "bg-neutral-100 dark:bg-neutral-700"
                        }`}
                      >
                        {NOTIFICATION_ICONS[notification.type] || "🔔"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-0.5">
                          {notification.body}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-neutral-400">
                            {formatTime(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={(e) =>
                              handleMarkAsRead(notification.id, e)
                            }
                            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded"
                            title="Mark as read"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded text-error"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
              className="text-sm text-primary hover:underline font-medium"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
