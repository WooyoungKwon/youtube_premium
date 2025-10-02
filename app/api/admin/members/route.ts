import { NextResponse } from 'next/server';
import { getMembersByYoutube, addMember, updateMemberStatus, deleteMember } from '@/lib/storage';

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
    const { youtubeAccountId, userEmail, startDate, endDate, requestId, kakaoId, phone } = await request.json();
    const member = await addMember(
      youtubeAccountId,
      userEmail,
      startDate,
      endDate,
      requestId,
      kakaoId,
      phone
    );
    return NextResponse.json(member);
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    await updateMemberStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update member status error:', error);
    return NextResponse.json({ error: 'Failed to update member status' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await deleteMember(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
