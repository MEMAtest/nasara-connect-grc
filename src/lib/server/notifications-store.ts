import { randomUUID } from "crypto";
import { pool } from "@/lib/database";
import type { Notification, NotificationCreateInput, NotificationListResult } from "@/lib/notifications/types";
import { logError } from "@/lib/logger";

interface NotificationRow {
  id: string;
  organization_id: string;
  user_id: string | null;
  source: string | null;
  title: string;
  message: string | null;
  link: string | null;
  severity: string;
  metadata: Record<string, unknown> | null;
  created_at: Date | string;
  read_at?: Date | string | null;
}

let notificationsReady = false;

async function ensureNotificationsTables() {
  if (notificationsReady) return;
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        user_id TEXT,
        source TEXT,
        title TEXT NOT NULL,
        message TEXT,
        link TEXT,
        severity TEXT DEFAULT 'info',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_reads (
        id TEXT PRIMARY KEY,
        notification_id TEXT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        read_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(notification_id, user_id)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_org_created ON notifications (organization_id, created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads (user_id, read_at DESC)`);
    notificationsReady = true;
  } catch (error) {
    notificationsReady = false;
    logError(error as Error, "Failed to initialize notifications tables");
    throw error;
  } finally {
    client.release();
  }
}

function toNotification(row: NotificationRow): Notification {
  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString();
  const readAt = row.read_at
    ? row.read_at instanceof Date
      ? row.read_at.toISOString()
      : new Date(row.read_at).toISOString()
    : null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id ?? null,
    source: row.source ?? null,
    title: row.title,
    message: row.message ?? null,
    link: row.link ?? null,
    severity: (row.severity || "info") as Notification["severity"],
    metadata: row.metadata ?? null,
    createdAt,
    readAt,
  };
}

export async function createNotification(input: NotificationCreateInput): Promise<Notification> {
  await ensureNotificationsTables();
  const id = `note-${randomUUID()}`;
  const result = await pool.query<NotificationRow>(
    `INSERT INTO notifications (id, organization_id, user_id, source, title, message, link, severity, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, organization_id, user_id, source, title, message, link, severity, metadata, created_at`,
    [
      id,
      input.organizationId,
      input.userId ?? null,
      input.source ?? null,
      input.title,
      input.message ?? null,
      input.link ?? null,
      input.severity ?? "info",
      input.metadata ?? null,
    ],
  );
  return toNotification(result.rows[0]);
}

export async function listNotifications(options: {
  organizationIds: string[];
  userId: string;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<NotificationListResult> {
  await ensureNotificationsTables();
  const limit = Math.max(1, Math.min(options.limit ?? 10, 50));
  const offset = Math.max(0, options.offset ?? 0);

  const filters = [
    "n.organization_id = ANY($1)",
    "(n.user_id IS NULL OR n.user_id = $2)",
  ];
  if (options.unreadOnly) {
    filters.push("r.read_at IS NULL");
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const listQuery = `
    SELECT n.id, n.organization_id, n.user_id, n.source, n.title, n.message, n.link, n.severity, n.metadata, n.created_at, r.read_at
    FROM notifications n
    LEFT JOIN notification_reads r ON r.notification_id = n.id AND r.user_id = $2
    ${whereClause}
    ORDER BY n.created_at DESC
    LIMIT $3 OFFSET $4
  `;
  const listResult = await pool.query<NotificationRow>(listQuery, [options.organizationIds, options.userId, limit, offset]);

  const countQuery = `
    SELECT COUNT(*)::int AS count
    FROM notifications n
    LEFT JOIN notification_reads r ON r.notification_id = n.id AND r.user_id = $2
    WHERE n.organization_id = ANY($1)
      AND (n.user_id IS NULL OR n.user_id = $2)
      AND r.read_at IS NULL
  `;
  const countResult = await pool.query<{ count: number }>(countQuery, [options.organizationIds, options.userId]);

  return {
    notifications: listResult.rows.map(toNotification),
    unreadCount: countResult.rows[0]?.count ?? 0,
  };
}

export async function setNotificationRead(options: {
  notificationId: string;
  userId: string;
  read: boolean;
}): Promise<{ readAt: string | null }> {
  await ensureNotificationsTables();
  if (!options.read) {
    await pool.query(
      `DELETE FROM notification_reads WHERE notification_id = $1 AND user_id = $2`,
      [options.notificationId, options.userId],
    );
    return { readAt: null };
  }

  const readResult = await pool.query<{ read_at: Date | string }>(
    `INSERT INTO notification_reads (id, notification_id, user_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (notification_id, user_id)
     DO UPDATE SET read_at = NOW()
     RETURNING read_at`,
    [`read-${randomUUID()}`, options.notificationId, options.userId],
  );
  const readAt = readResult.rows[0]?.read_at;
  return { readAt: readAt instanceof Date ? readAt.toISOString() : new Date(readAt).toISOString() };
}

export async function markAllNotificationsRead(options: {
  organizationIds: string[];
  userId: string;
}): Promise<{ count: number }> {
  await ensureNotificationsTables();
  const result = await pool.query<{ count: number }>(
    `
      INSERT INTO notification_reads (id, notification_id, user_id, read_at)
      SELECT $3 || '-' || n.id, n.id, $2, NOW()
      FROM notifications n
      LEFT JOIN notification_reads r ON r.notification_id = n.id AND r.user_id = $2
      WHERE n.organization_id = ANY($1)
        AND (n.user_id IS NULL OR n.user_id = $2)
        AND r.read_at IS NULL
      ON CONFLICT (notification_id, user_id)
      DO UPDATE SET read_at = NOW()
      RETURNING 1 as count
    `,
    [options.organizationIds, options.userId, `read-${randomUUID()}`],
  );
  return { count: result.rowCount ?? 0 };
}
