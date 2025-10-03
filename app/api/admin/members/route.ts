import { NextResponse } from 'next/server';
import { getMembersByYoutube, addMember, updateMemberDepositStatus } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const youtubeId = searchParams.get('youtubeId');
    if (!youtubeId) {
      return NextResponse.json({ error: 'YouTube ID is required' }, { status: 400 });
    }
    const members = await getMembersByYoutube(youtubeId);
    return NextResponse.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json({ error: 'Failed to get members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { youtubeAccountId, nickname, email, name, joinDate, paymentDate, depositStatus, requestId } = await request.json();
    const member = await addMember(
      youtubeAccountId,
      nickname,
      email,
      name,
      joinDate,
      paymentDate,
      depositStatus,
      requestId
    );
    return NextResponse.json(member);
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, depositStatus } = await request.json();
    await updateMemberDepositStatus(id, depositStatus);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update member deposit status error:', error);
    return NextResponse.json({ error: 'Failed to update member deposit status' }, { status: 500 });
  }
}


