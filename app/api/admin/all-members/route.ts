import { NextRequest, NextResponse } from 'next/server';
import { getAllMembersWithDetails } from '@/lib/storage';

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