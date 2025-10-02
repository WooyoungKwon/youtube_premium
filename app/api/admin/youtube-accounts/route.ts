import { NextResponse } from 'next/server';
import { getYoutubeAccountsByApple, addYoutubeAccount, deleteYoutubeAccount } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appleId = searchParams.get('appleId');
    if (!appleId) {
      return NextResponse.json({ error: 'Apple ID is required' }, { status: 400 });
    }
    const accounts = await getYoutubeAccountsByApple(appleId);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Get youtube accounts error:', error);
    return NextResponse.json({ error: 'Failed to get youtube accounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { appleAccountId, youtubeEmail, nickname, slotNumber } = await request.json();
    const account = await addYoutubeAccount(appleAccountId, youtubeEmail, slotNumber, nickname);
    return NextResponse.json(account);
  } catch (error) {
    console.error('Add youtube account error:', error);
    return NextResponse.json({ error: 'Failed to add youtube account' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await deleteYoutubeAccount(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete youtube account error:', error);
    return NextResponse.json({ error: 'Failed to delete youtube account' }, { status: 500 });
  }
}
