import { NextResponse } from 'next/server';
import { updateYoutubeAccount, deleteYoutubeAccount } from '@/lib/storage';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { youtubeEmail, nickname, renewalDate, remainingCredit } = await request.json();
    await updateYoutubeAccount(params.id, youtubeEmail, nickname, renewalDate, remainingCredit);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update youtube account error:', error);
    return NextResponse.json({ error: 'Failed to update youtube account' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteYoutubeAccount(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete youtube account error:', error);
    return NextResponse.json({ error: 'Failed to delete youtube account' }, { status: 500 });
  }
}