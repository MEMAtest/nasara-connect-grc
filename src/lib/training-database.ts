/**
 * Training Module Database Operations
 * Database layer for learning progress tracking and competency management
 */

import { Pool } from 'pg';
import { logger, logError, logDbOperation } from '@/lib/logger';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// =====================================================
// Training Database Schema Initialization
// =====================================================

export async function initTrainingDatabase() {
  const client = await pool.connect();
  try {
    // User Learning Progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_progress (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        completed_pathways INTEGER DEFAULT 0,
        total_pathways INTEGER DEFAULT 6,
        completed_lessons INTEGER DEFAULT 0,
        total_lessons INTEGER DEFAULT 45,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        weekly_goal INTEGER DEFAULT 80,
        weekly_progress INTEGER DEFAULT 0,
        last_activity_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_email)
      )
    `);

    // Module Progress table (tracks individual module completion)
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_module_progress (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        module_id VARCHAR(255) NOT NULL,
        pathway_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
        progress_percentage INTEGER DEFAULT 0,
        score INTEGER,
        max_score INTEGER,
        time_spent INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, module_id)
      )
    `);

    // Pathway Progress table (tracks learning pathway completion)
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_pathway_progress (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        pathway_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
        progress_percentage INTEGER DEFAULT 0,
        modules_completed INTEGER DEFAULT 0,
        total_modules INTEGER DEFAULT 0,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, pathway_id)
      )
    `);

    // Badges/Achievements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_badges (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        badge_id VARCHAR(255) NOT NULL,
        badge_name VARCHAR(255) NOT NULL,
        badge_description TEXT,
        badge_icon VARCHAR(100),
        badge_rarity VARCHAR(50),
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_id)
      )
    `);

    // Assessment Results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_assessment_results (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        module_id VARCHAR(255) NOT NULL,
        assessment_id VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        max_score INTEGER NOT NULL,
        passed BOOLEAN DEFAULT false,
        attempt_number INTEGER DEFAULT 1,
        time_spent INTEGER,
        responses JSONB DEFAULT '[]',
        breakdown JSONB DEFAULT '{}',
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Certificate download tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_certificate_events (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        module_id VARCHAR(255) NOT NULL,
        score INTEGER,
        download_count INTEGER DEFAULT 1,
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, module_id)
      )
    `);

    // Daily Activity Log (for streak tracking)
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_activity_log (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        activity_date DATE NOT NULL,
        points_earned INTEGER DEFAULT 0,
        lessons_completed INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, activity_date)
      )
    `);

    // Training assignments table (admin assignments to learners)
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_assignments (
        id VARCHAR(255) PRIMARY KEY,
        assigned_by VARCHAR(255) NOT NULL,
        assigned_to VARCHAR(255) NOT NULL,
        module_id VARCHAR(255) NOT NULL,
        due_date DATE,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'revoked')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_progress_user ON training_progress(user_email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_module_progress_user ON training_module_progress(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_pathway_progress_user ON training_pathway_progress(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_badges_user ON training_badges(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_certificates_user ON training_certificate_events(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_activity_log_user ON training_activity_log(user_id, activity_date)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_assignments_assigned_by ON training_assignments(assigned_by)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_assignments_module ON training_assignments(module_id)`);

    logger.info('Training database tables initialized successfully');
  } catch (error) {
    logError(error, 'Failed to initialize training database');
    throw error;
  } finally {
    client.release();
  }
}

// =====================================================
// User Progress Operations
// =====================================================

export interface UserTrainingProgress {
  id: string;
  user_id: string;
  user_email: string;
  completed_pathways: number;
  total_pathways: number;
  completed_lessons: number;
  total_lessons: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  weekly_goal: number;
  weekly_progress: number;
  last_activity_date: Date | null;
  badges_count?: number;
}

export async function getUserProgress(userEmail: string): Promise<UserTrainingProgress | null> {
  const startTime = Date.now();

  // Get or create user progress
  let result = await pool.query<UserTrainingProgress>(
    'SELECT * FROM training_progress WHERE user_email = $1',
    [userEmail]
  );

  if (result.rows.length === 0) {
    // Create default progress for new user
    const id = `progress-${crypto.randomUUID()}`;
    await pool.query(
      `INSERT INTO training_progress (id, user_id, user_email) VALUES ($1, $2, $3)`,
      [id, userEmail, userEmail]
    );
    result = await pool.query<UserTrainingProgress>(
      'SELECT * FROM training_progress WHERE user_email = $1',
      [userEmail]
    );
  }

  // Get badge count
  const badgeResult = await pool.query(
    'SELECT COUNT(*) as count FROM training_badges WHERE user_id = $1',
    [userEmail]
  );

  logDbOperation('query', 'training_progress', Date.now() - startTime);

  if (result.rows[0]) {
    return {
      ...result.rows[0],
      badges_count: parseInt(badgeResult.rows[0]?.count || '0', 10),
    };
  }

  return null;
}

export async function updateUserProgress(
  userEmail: string,
  updates: Partial<UserTrainingProgress>
): Promise<UserTrainingProgress | null> {
  const startTime = Date.now();

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'completed_pathways', 'total_pathways', 'completed_lessons', 'total_lessons',
    'current_streak', 'longest_streak', 'total_points', 'weekly_goal',
    'weekly_progress', 'last_activity_date'
  ];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(updates[field as keyof typeof updates]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return getUserProgress(userEmail);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userEmail);

  const result = await pool.query<UserTrainingProgress>(
    `UPDATE training_progress SET ${fields.join(', ')} WHERE user_email = $${paramIndex} RETURNING *`,
    values
  );

  logDbOperation('update', 'training_progress', Date.now() - startTime);
  return result.rows[0] || null;
}

// =====================================================
// Module Progress Operations
// =====================================================

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  pathway_id: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  score: number | null;
  max_score: number | null;
  time_spent: number;
  attempts: number;
  started_at: Date | null;
  completed_at: Date | null;
}

export async function getModuleProgress(userId: string, moduleId: string): Promise<ModuleProgress | null> {
  const startTime = Date.now();
  const result = await pool.query<ModuleProgress>(
    'SELECT * FROM training_module_progress WHERE user_id = $1 AND module_id = $2',
    [userId, moduleId]
  );
  logDbOperation('query', 'training_module_progress', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function getAllModuleProgress(userId: string): Promise<ModuleProgress[]> {
  const startTime = Date.now();
  const result = await pool.query<ModuleProgress>(
    'SELECT * FROM training_module_progress WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );
  logDbOperation('query', 'training_module_progress', Date.now() - startTime);
  return result.rows;
}

export async function updateModuleProgress(
  userId: string,
  moduleId: string,
  updates: Partial<ModuleProgress>
): Promise<ModuleProgress> {
  const startTime = Date.now();

  // Check if record exists
  const existing = await getModuleProgress(userId, moduleId);

  if (!existing) {
    // Insert new record
    const id = `mod-progress-${crypto.randomUUID()}`;
    const result = await pool.query<ModuleProgress>(
      `INSERT INTO training_module_progress (
        id, user_id, module_id, pathway_id, status, progress_percentage,
        score, max_score, time_spent, attempts, started_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        id,
        userId,
        moduleId,
        updates.pathway_id || null,
        updates.status || 'not_started',
        updates.progress_percentage || 0,
        updates.score || null,
        updates.max_score || null,
        updates.time_spent || 0,
        updates.attempts || 0,
        updates.started_at || (updates.status === 'in_progress' ? new Date() : null),
        updates.completed_at || null,
      ]
    );
    logDbOperation('insert', 'training_module_progress', Date.now() - startTime);
    return result.rows[0];
  }

  // Update existing record
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'pathway_id', 'status', 'progress_percentage', 'score', 'max_score',
    'time_spent', 'attempts', 'started_at', 'completed_at'
  ];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(updates[field as keyof typeof updates]);
      paramIndex++;
    }
  }

  // Auto-set started_at if transitioning to in_progress
  if (updates.status === 'in_progress' && !existing.started_at) {
    fields.push(`started_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;
  }

  // Auto-set completed_at if transitioning to completed
  if (updates.status === 'completed' && !existing.completed_at) {
    fields.push(`completed_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);
  values.push(moduleId);

  const result = await pool.query<ModuleProgress>(
    `UPDATE training_module_progress SET ${fields.join(', ')} WHERE user_id = $${paramIndex} AND module_id = $${paramIndex + 1} RETURNING *`,
    values
  );

  logDbOperation('update', 'training_module_progress', Date.now() - startTime);
  return result.rows[0];
}

// =====================================================
// Training Assignment Operations
// =====================================================

export interface TrainingAssignment {
  id: string;
  assigned_by: string;
  assigned_to: string;
  module_id: string;
  due_date: Date | null;
  notes: string | null;
  status: 'assigned' | 'in_progress' | 'completed' | 'revoked';
  created_at: Date;
  updated_at: Date;
}

export type TrainingAssignmentScope = "assigned_by" | "assigned_to" | "all";

export async function listTrainingAssignments(
  userEmail: string,
  scope: TrainingAssignmentScope = "assigned_by"
): Promise<TrainingAssignment[]> {
  const startTime = Date.now();
  const whereClause =
    scope === "assigned_to"
      ? "assigned_to = $1"
      : scope === "all"
      ? "(assigned_by = $1 OR assigned_to = $1)"
      : "assigned_by = $1";
  const result = await pool.query<TrainingAssignment>(
    `SELECT * FROM training_assignments WHERE ${whereClause} ORDER BY created_at DESC`,
    [userEmail]
  );
  logDbOperation('query', 'training_assignments', Date.now() - startTime);
  return result.rows;
}

export async function createTrainingAssignment(
  assignedBy: string,
  payload: {
    moduleId: string;
    assignedTo: string;
    dueDate?: string | null;
    notes?: string | null;
    status?: TrainingAssignment['status'];
  }
): Promise<TrainingAssignment> {
  const startTime = Date.now();
  const id = `assignment-${crypto.randomUUID()}`;
  const status = payload.status ?? 'assigned';
  const result = await pool.query<TrainingAssignment>(
    `INSERT INTO training_assignments (
      id, assigned_by, assigned_to, module_id, due_date, notes, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      id,
      assignedBy,
      payload.assignedTo,
      payload.moduleId,
      payload.dueDate || null,
      payload.notes || null,
      status,
    ]
  );
  logDbOperation('insert', 'training_assignments', Date.now() - startTime);
  return result.rows[0];
}

// =====================================================
// Certificate Tracking
// =====================================================

export async function logCertificateDownload(
  userId: string,
  moduleId: string,
  score?: number
): Promise<void> {
  const startTime = Date.now();
  await pool.query(
    `INSERT INTO training_certificate_events (id, user_id, module_id, score)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, module_id)
     DO UPDATE SET
       downloaded_at = CURRENT_TIMESTAMP,
       download_count = training_certificate_events.download_count + 1,
       score = EXCLUDED.score`,
    [`cert-${crypto.randomUUID()}`, userId, moduleId, typeof score === "number" ? score : null]
  );
  logDbOperation('insert', 'training_certificate_events', Date.now() - startTime);
}

export interface CertificateDownload {
  id: string;
  user_id: string;
  module_id: string;
  score: number | null;
  download_count: number;
  downloaded_at: Date;
}

export async function getCertificateDownloads(userId: string): Promise<CertificateDownload[]> {
  const startTime = Date.now();
  const result = await pool.query<CertificateDownload>(
    'SELECT * FROM training_certificate_events WHERE user_id = $1 ORDER BY downloaded_at DESC',
    [userId]
  );
  logDbOperation('query', 'training_certificate_events', Date.now() - startTime);
  return result.rows;
}

// =====================================================
// Badge Operations
// =====================================================

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_description: string | null;
  badge_icon: string | null;
  badge_rarity: string | null;
  earned_at: Date;
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const startTime = Date.now();
  const result = await pool.query<UserBadge>(
    'SELECT * FROM training_badges WHERE user_id = $1 ORDER BY earned_at DESC',
    [userId]
  );
  logDbOperation('query', 'training_badges', Date.now() - startTime);
  return result.rows;
}

export async function awardBadge(
  userId: string,
  badgeId: string,
  badgeName: string,
  description?: string,
  icon?: string,
  rarity?: string
): Promise<UserBadge | null> {
  const startTime = Date.now();

  // Check if already earned
  const existing = await pool.query(
    'SELECT id FROM training_badges WHERE user_id = $1 AND badge_id = $2',
    [userId, badgeId]
  );

  if (existing.rows.length > 0) {
    return null; // Already has badge
  }

  const id = `badge-${crypto.randomUUID()}`;
  const result = await pool.query<UserBadge>(
    `INSERT INTO training_badges (id, user_id, badge_id, badge_name, badge_description, badge_icon, badge_rarity)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [id, userId, badgeId, badgeName, description, icon, rarity]
  );

  logDbOperation('insert', 'training_badges', Date.now() - startTime);
  return result.rows[0];
}

// =====================================================
// Activity & Streak Operations
// =====================================================

export async function logActivity(
  userId: string,
  pointsEarned: number = 0,
  lessonsCompleted: number = 0,
  timeSpent: number = 0
): Promise<void> {
  const startTime = Date.now();
  const today = new Date().toISOString().split('T')[0];

  await pool.query(
    `INSERT INTO training_activity_log (id, user_id, activity_date, points_earned, lessons_completed, time_spent)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, activity_date)
     DO UPDATE SET
       points_earned = training_activity_log.points_earned + $4,
       lessons_completed = training_activity_log.lessons_completed + $5,
       time_spent = training_activity_log.time_spent + $6`,
    [`activity-${crypto.randomUUID()}`, userId, today, pointsEarned, lessonsCompleted, timeSpent]
  );

  // Update streak
  await updateStreak(userId);

  logDbOperation('insert', 'training_activity_log', Date.now() - startTime);
}

async function updateStreak(userId: string): Promise<void> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if there was activity yesterday
  const yesterdayResult = await pool.query(
    'SELECT id FROM training_activity_log WHERE user_id = $1 AND activity_date = $2',
    [userId, yesterday.toISOString().split('T')[0]]
  );

  // Get current progress
  const progressResult = await pool.query<UserTrainingProgress>(
    'SELECT current_streak, longest_streak FROM training_progress WHERE user_email = $1',
    [userId]
  );

  if (progressResult.rows.length === 0) return;

  const { current_streak, longest_streak } = progressResult.rows[0];

  let newStreak = 1;
  if (yesterdayResult.rows.length > 0) {
    // Continuing streak
    newStreak = current_streak + 1;
  }

  const newLongest = Math.max(newStreak, longest_streak);

  await pool.query(
    `UPDATE training_progress SET
       current_streak = $1,
       longest_streak = $2,
       last_activity_date = CURRENT_DATE,
       updated_at = CURRENT_TIMESTAMP
     WHERE user_email = $3`,
    [newStreak, newLongest, userId]
  );
}

// =====================================================
// Dashboard Statistics
// =====================================================

export interface TrainingDashboardStats {
  totalLearners: number;
  averageCompletion: number;
  activeToday: number;
  totalBadgesAwarded: number;
  topPathways: { pathway_id: string; completion_count: number }[];
}

export async function getDashboardStats(): Promise<TrainingDashboardStats> {
  const startTime = Date.now();

  const today = new Date().toISOString().split('T')[0];

  const [totalLearners, avgCompletion, activeToday, totalBadges, topPathways] = await Promise.all([
    pool.query('SELECT COUNT(DISTINCT user_email) as count FROM training_progress'),
    pool.query('SELECT AVG(progress_percentage)::integer as avg FROM training_pathway_progress'),
    pool.query('SELECT COUNT(DISTINCT user_id) as count FROM training_activity_log WHERE activity_date = $1', [today]),
    pool.query('SELECT COUNT(*) as count FROM training_badges'),
    pool.query(`
      SELECT pathway_id, COUNT(*) as completion_count
      FROM training_pathway_progress
      WHERE status = 'completed'
      GROUP BY pathway_id
      ORDER BY completion_count DESC
      LIMIT 5
    `),
  ]);

  logDbOperation('query', 'training_dashboard_stats', Date.now() - startTime);

  return {
    totalLearners: parseInt(totalLearners.rows[0]?.count || '0', 10),
    averageCompletion: parseInt(avgCompletion.rows[0]?.avg || '0', 10),
    activeToday: parseInt(activeToday.rows[0]?.count || '0', 10),
    totalBadgesAwarded: parseInt(totalBadges.rows[0]?.count || '0', 10),
    topPathways: topPathways.rows,
  };
}
