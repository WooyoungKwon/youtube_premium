import { NextResponse } from 'next/server';
import { getAllAppleAccounts, addAppleAccount, deleteAppleAccount } from '@/lib/storage';

export async function GET() {
  try {
    const accounts = await getAllAppleAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Get apple accounts error:', error);
    return NextResponse.json({ error: 'Failed to get apple accounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { appleEmail, password } = await request.json();
    const account = await addAppleAccount(appleEmail, password);
    return NextResponse.json(account);
  } catch (error) {
    console.error('Add apple account error:', error);
    return NextResponse.json({ error: 'Failed to add apple account' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await deleteAppleAccount(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete apple account error:', error);
    return NextResponse.json({ error: 'Failed to delete apple account' }, { status: 500 });
  }
}
