import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/database';

export async function POST() {
  try {
    await initDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('database-initialization-api-failed', error);
    } else {
      console.error('Database initialization error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}