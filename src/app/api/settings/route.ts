/**
 * User Settings API Routes
 * GET /api/settings - Get current user settings
 * PUT /api/settings - Update user settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { auth } from '@/auth';
import { getSessionIdentity } from '@/lib/auth-utils';
import { logError, logApiRequest } from '@/lib/logger';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Vtu9NK8ThRbB@ep-royal-queen-abitcphb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

// Initialize settings table
async function initSettingsTable() {
  await pool.query(`
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
      two_factor_enabled BOOLEAN DEFAULT false,
      session_timeout BOOLEAN DEFAULT true,
      dark_mode BOOLEAN DEFAULT false,
      compact_view BOOLEAN DEFAULT false,
      language VARCHAR(10) DEFAULT 'en',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export interface UserSettings {
  id: string;
  user_id: string;
  user_email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  phone: string | null;
  organization: string | null;
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_reports: boolean;
  two_factor_enabled: boolean;
  session_timeout: boolean;
  dark_mode: boolean;
  compact_view: boolean;
  language: string;
  created_at: Date;
  updated_at: Date;
}

const defaultSettings = {
  first_name: '',
  last_name: '',
  role: '',
  phone: '',
  organization: '',
  email_notifications: true,
  push_notifications: true,
  weekly_reports: true,
  two_factor_enabled: false,
  session_timeout: true,
  dark_mode: false,
  compact_view: false,
  language: 'en',
};

export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/settings');

  try {
    const session = await auth();
    const identity = getSessionIdentity(session);

    if (!identity?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initSettingsTable();

    const result = await pool.query<UserSettings>(
      'SELECT * FROM user_settings WHERE user_email = $1',
      [identity.email]
    );

    if (result.rows.length === 0) {
      // Return default settings for new users
      return NextResponse.json({
        ...defaultSettings,
        user_email: identity.email,
        first_name: identity.name?.split(' ')[0] || '',
        last_name: identity.name?.split(' ').slice(1).join(' ') || '',
      });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    logError(error, 'Failed to fetch user settings');
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  logApiRequest('PUT', '/api/settings');

  try {
    const session = await auth();
    const identity = getSessionIdentity(session);

    if (!identity?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initSettingsTable();

    const body = await request.json();
    const {
      firstName,
      lastName,
      role,
      phone,
      organization,
      emailNotifications,
      pushNotifications,
      weeklyReports,
      twoFactorEnabled,
      sessionTimeout,
      darkMode,
      compactView,
      language,
    } = body;

    // Check if settings exist for this user
    const existing = await pool.query(
      'SELECT id FROM user_settings WHERE user_email = $1',
      [identity.email]
    );

    let result;
    if (existing.rows.length === 0) {
      // Insert new settings
      const id = `settings-${crypto.randomUUID()}`;
      result = await pool.query<UserSettings>(
        `INSERT INTO user_settings (
          id, user_id, user_email, first_name, last_name, role, phone, organization,
          email_notifications, push_notifications, weekly_reports, two_factor_enabled,
          session_timeout, dark_mode, compact_view, language
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          id,
          identity.email, // Use email as user_id for now
          identity.email,
          firstName ?? defaultSettings.first_name,
          lastName ?? defaultSettings.last_name,
          role ?? defaultSettings.role,
          phone ?? defaultSettings.phone,
          organization ?? defaultSettings.organization,
          emailNotifications ?? defaultSettings.email_notifications,
          pushNotifications ?? defaultSettings.push_notifications,
          weeklyReports ?? defaultSettings.weekly_reports,
          twoFactorEnabled ?? defaultSettings.two_factor_enabled,
          sessionTimeout ?? defaultSettings.session_timeout,
          darkMode ?? defaultSettings.dark_mode,
          compactView ?? defaultSettings.compact_view,
          language ?? defaultSettings.language,
        ]
      );
    } else {
      // Update existing settings
      result = await pool.query<UserSettings>(
        `UPDATE user_settings SET
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          role = COALESCE($3, role),
          phone = COALESCE($4, phone),
          organization = COALESCE($5, organization),
          email_notifications = COALESCE($6, email_notifications),
          push_notifications = COALESCE($7, push_notifications),
          weekly_reports = COALESCE($8, weekly_reports),
          two_factor_enabled = COALESCE($9, two_factor_enabled),
          session_timeout = COALESCE($10, session_timeout),
          dark_mode = COALESCE($11, dark_mode),
          compact_view = COALESCE($12, compact_view),
          language = COALESCE($13, language),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_email = $14
        RETURNING *`,
        [
          firstName,
          lastName,
          role,
          phone,
          organization,
          emailNotifications,
          pushNotifications,
          weeklyReports,
          twoFactorEnabled,
          sessionTimeout,
          darkMode,
          compactView,
          language,
          identity.email,
        ]
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    logError(error, 'Failed to update user settings');
    return NextResponse.json(
      { error: 'Failed to update settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
