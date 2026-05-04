import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService, type Notification } from "../../services/notificationService";
import { toast } from "sonner";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: Record<string, unknown>) => ["notifications", "list", params] as const,
  unreadCount: () => ["notifications", "unread-count"] as const,
};

export function useNotifications(params?: { limit?: number; unread_only?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.getNotifications(params),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    // Poll every 60 seconds in the background
    refetchInterval: 60_000,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      notificationService.updateNotification(id, isRead),
    onSuccess: (updated) => {
      // Patch all cached notification lists
      qc.setQueriesData<Notification[]>({ queryKey: notificationKeys.all }, (old) =>
        old?.map((n) => (n.id === (updated as Notification).id ? (updated as Notification) : n))
      );
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      toast.success("All notifications marked as read");
      qc.setQueriesData<Notification[]>({ queryKey: notificationKeys.all }, (old) =>
        old?.map((n) => ({ ...n, is_read: true }))
      );
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to mark all as read"),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: (_data, id) => {
      toast.success("Notification deleted");
      qc.setQueriesData<Notification[]>({ queryKey: notificationKeys.all }, (old) =>
        old?.filter((n) => n.id !== id)
      );
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete notification"),
  });
}
