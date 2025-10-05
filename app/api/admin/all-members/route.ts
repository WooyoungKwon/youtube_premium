import { NextRequest, NextResponse } from 'next/server';
import { getAllMembersWithDetails } from '@/lib/storage';

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const allMembers = await getAllMembersWithDetails();
    return NextResponse.json(allMembers);
  } catch (error) {
    console.error('Failed to fetch all members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch all members' },
      { status: 500 }
    );
  }
}