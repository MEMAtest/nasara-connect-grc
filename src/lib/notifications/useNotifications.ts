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
  isEnabled: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string, read?: boolean) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  const limit = options.limit ?? 8;
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    return params.toString();
  }, [limit]);

  useEffect(() => {
    let isActive = true;
    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) return;
        const data = (await response.json()) as { in_app_notifications?: boolean };
        if (!isActive) return;
        setIsEnabled(data.in_app_notifications ?? true);
      } catch {
        // Ignore settings failures; keep notifications enabled.
      }
    };
    void loadPreferences();
    return () => {
      isActive = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!isEnabled) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
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
  }, [queryString, isEnabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markAsRead = useCallback(async (notificationId: string, read: boolean = true) => {
    try {
      if (!isEnabled) return;
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
  }, [isEnabled]);

  const markAllRead = useCallback(async () => {
    try {
      if (!isEnabled) return;
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Unable to mark all as read");
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  }, [isEnabled, refresh]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isEnabled,
    refresh,
    markAsRead,
    markAllRead,
  };
}
