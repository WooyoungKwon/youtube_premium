import { NextResponse } from 'next/server';
import { getYoutubeAccountsByApple, addYoutubeAccount } from '@/lib/storage';

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const { appleAccountId, youtubeEmail, nickname, renewalDate } = await request.json();
    const account = await addYoutubeAccount(appleAccountId, youtubeEmail, nickname, renewalDate);
    return NextResponse.json(account);
  } catch (error) {
    console.error('Add youtube account error:', error);
    return NextResponse.json({ error: 'Failed to add youtube account' }, { status: 500 });
  }
}
