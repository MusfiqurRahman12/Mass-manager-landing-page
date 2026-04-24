import {
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Button,
  Card,
  LoadingSpinner,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "../components/common";
import { MainLayout } from "../components/layout";
import { useRequireAuth } from "../hooks";
import {
  notificationService,
  type Notification,
  type NotificationType,
} from "../services/notificationService";

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
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

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
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

const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  expense_added: "Expense",
  expense_updated: "Expense",
  expense_deleted: "Expense",
  meal_added: "Meal",
  meal_updated: "Meal",
  meal_deleted: "Meal",
  deposit_added: "Deposit",
  deposit_updated: "Deposit",
  deposit_deleted: "Deposit",
  member_joined: "Member",
  member_removed: "Member",
  manager_transfer_request: "Transfer",
  manager_transfer_approved: "Transfer",
  manager_transfer_rejected: "Transfer",
  market_day_reminder: "Reminder",
  month_started: "System",
  month_closed: "System",
};

const ITEMS_PER_PAGE = 10;

export function NotificationsPage() {
  const { isReady } = useRequireAuth();
  const navigate = useNavigate();

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [filterUnread, setFilterUnread] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications({
        limit: 100,
        unread_only: filterUnread,
      });
      setNotifications(data);
    } catch (error) {
      toast.error("Failed to load notifications");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      fetchNotifications();
    }
  }, [isReady, filterUnread]);

  // Pagination
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = useMemo(() => {
    return notifications.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [notifications, currentPage]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  // Handlers
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return;

    try {
      await notificationService.updateNotification(notification.id, true);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setIsSubmitting(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!notificationToDelete) return;

    setIsSubmitting(true);
    try {
      await notificationService.deleteNotification(notificationToDelete.id);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationToDelete.id)
      );
      toast.success("Notification deleted");
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    } catch (error) {
      toast.error("Failed to delete notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification);
    }

    // Navigate based on type
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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  if (!isReady || isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen message="Loading notifications..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "You're all caught up!"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                isLoading={isSubmitting}
                className="flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Filter:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterUnread(false)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !filterUnread
                  ? "bg-primary text-white"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterUnread(true)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterUnread
                  ? "bg-primary text-white"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-error/20 text-error text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <Card>
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                {filterUnread
                  ? "You have no unread notifications"
                  : "You don't have any notifications yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors group ${
                    !notification.is_read
                      ? "bg-primary/5 dark:bg-primary/10"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                        NOTIFICATION_COLORS[notification.type]
                      }`}
                    >
                      {NOTIFICATION_ICONS[notification.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                            {notification.body}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-neutral-400">
                              {formatTime(notification.created_at)}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded-full text-neutral-500">
                              {NOTIFICATION_LABELS[notification.type]}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification);
                              }}
                              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-400"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotificationToDelete(notification);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 hover:bg-error/10 rounded-lg text-error"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, notifications.length)} of{" "}
              {notifications.length} notifications
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && notificationToDelete && (
        <Modal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)}
        >
          <ModalHeader>Delete Notification</ModalHeader>
          <ModalBody>
            <p className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setNotificationToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isSubmitting}
            >
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </MainLayout>
  );
}
