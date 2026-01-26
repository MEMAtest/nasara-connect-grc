export type NotificationSeverity = "info" | "warning" | "critical" | "success";

export interface Notification {
  id: string;
  organizationId: string;
  userId: string | null;
  source: string | null;
  title: string;
  message: string | null;
  link: string | null;
  severity: NotificationSeverity;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  readAt?: string | null;
}

export interface NotificationCreateInput {
  organizationId: string;
  userId?: string | null;
  source?: string | null;
  title: string;
  message?: string | null;
  link?: string | null;
  severity?: NotificationSeverity;
  metadata?: Record<string, unknown> | null;
}

export interface NotificationListResult {
  notifications: Notification[];
  unreadCount: number;
}
