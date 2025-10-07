import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/storage';

export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
