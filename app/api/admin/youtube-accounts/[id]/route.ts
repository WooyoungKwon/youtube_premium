import { NextResponse } from 'next/server';
import { updateYoutubeAccount, deleteYoutubeAccount } from '@/lib/storage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { youtubeEmail, nickname, renewalDate, memo } = await request.json();
    await updateYoutubeAccount(id, youtubeEmail, nickname, renewalDate, memo);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update youtube account error:', error);
    return NextResponse.json({ error: 'Failed to update youtube account' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteYoutubeAccount(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete youtube account error:', error);
    return NextResponse.json({ error: 'Failed to delete youtube account' }, { status: 500 });
  }
}