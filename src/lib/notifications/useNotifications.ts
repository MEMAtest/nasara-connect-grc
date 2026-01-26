"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Notification, NotificationListResult } from "@/lib/notifications/types";

interface UseNotificationsOptions {
  limit?: number;
}

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string, read?: boolean) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = options.limit ?? 8;
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    return params.toString();
  }, [limit]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/notifications?${queryString}`);
      if (!response.ok) {
        throw new Error("Unable to load notifications");
      }
      const data = (await response.json()) as NotificationListResult;
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markAsRead = useCallback(async (notificationId: string, read: boolean = true) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      if (!response.ok) {
        throw new Error("Unable to update notification");
      }
      const data = (await response.json()) as { readAt: string | null };
      setNotifications((prev) => {
        const next = prev.map((notification) =>
          notification.id === notificationId ? { ...notification, readAt: data.readAt } : notification
        );
        setUnreadCount(next.reduce((count, notification) => count + (notification.readAt ? 0 : 1), 0));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Unable to mark all as read");
      }
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, readAt: notification.readAt ?? now })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    markAsRead,
    markAllRead,
  };
}
