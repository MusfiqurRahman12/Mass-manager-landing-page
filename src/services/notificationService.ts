import apiClient from "./apiClient";

export type NotificationType =
  | "expense_added"
  | "meal_added"
  | "deposit_added"
  | "member_joined"
  | "member_removed"
  | "manager_transfer_request"
  | "market_day_reminder";

export interface Notification {
  id: string;
  user_id: string;
  mess_id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  related_entity_id?: string;
  created_at: string;
}

export interface UnreadCount {
  unread_count: number;
}

export const notificationService = {
  // Get user notifications
  getNotifications: async (params?: {
    limit?: number;
    offset?: number;
    unread_only?: boolean;
  }): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>("/notifications", {
      params,
    });
    return data;
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<UnreadCount> => {
    const { data } = await apiClient.get<UnreadCount>(
      "/notifications/unread-count",
    );
    return data;
  },

  // Mark notification as read/unread
  updateNotification: async (
    notificationId: string,
    isRead: boolean,
  ): Promise<Notification> => {
    const { data } = await apiClient.patch<Notification>(
      `/notifications/${notificationId}`,
      { is_read: isRead },
    );
    return data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>("/notifications/mark-all-read");
    return data;
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },
};
