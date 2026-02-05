import { pool } from "@/lib/database";
import { logError } from "@/lib/logger";

export interface NotificationPreferences {
  email_notifications: boolean;
  in_app_notifications: boolean;
  weekly_reports: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email_notifications: true,
  in_app_notifications: true,
  weekly_reports: true,
};

let settingsReady = false;

async function ensureSettingsTable() {
  if (settingsReady) return;
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(255),
        phone VARCHAR(100),
        organization VARCHAR(255),
        email_notifications BOOLEAN DEFAULT true,
        push_notifications BOOLEAN DEFAULT true,
        weekly_reports BOOLEAN DEFAULT true,
        in_app_notifications BOOLEAN DEFAULT true,
        two_factor_enabled BOOLEAN DEFAULT false,
        session_timeout BOOLEAN DEFAULT true,
        dark_mode BOOLEAN DEFAULT false,
        compact_view BOOLEAN DEFAULT false,
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      ALTER TABLE user_settings
      ADD COLUMN IF NOT EXISTS in_app_notifications BOOLEAN DEFAULT true
    `);
    settingsReady = true;
  } catch (error) {
    settingsReady = false;
    logError(error as Error, "Failed to initialize user settings table for notifications");
    throw error;
  } finally {
    client.release();
  }
}

export async function getNotificationPreferences(userEmail: string): Promise<NotificationPreferences> {
  try {
    await ensureSettingsTable();
    const result = await pool.query<NotificationPreferences>(
      `SELECT email_notifications, in_app_notifications, weekly_reports
       FROM user_settings
       WHERE user_email = $1
       LIMIT 1`,
      [userEmail]
    );
    if (!result.rows.length) {
      return defaultPreferences;
    }
    return {
      email_notifications: result.rows[0].email_notifications ?? defaultPreferences.email_notifications,
      in_app_notifications: result.rows[0].in_app_notifications ?? defaultPreferences.in_app_notifications,
      weekly_reports: result.rows[0].weekly_reports ?? defaultPreferences.weekly_reports,
    };
  } catch (error) {
    logError(error as Error, "Failed to load notification preferences");
    return defaultPreferences;
  }
}
