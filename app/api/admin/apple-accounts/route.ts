import { NextResponse } from 'next/server';
import { getAllAppleAccounts, addAppleAccount, updateAppleAccount, deleteAppleAccount } from '@/lib/storage';

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const body = await request.json();
    console.log('POST request body:', body);
    
    const { appleEmail, remainingCredit } = body;
    console.log('Parsed values:', { appleEmail, remainingCredit });
    
    const account = await addAppleAccount(appleEmail, remainingCredit);
    console.log('Created account:', account);
    
    return NextResponse.json(account);
  } catch (error) {
    console.error('Add apple account error:', error);
    return NextResponse.json({ error: 'Failed to add apple account' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, appleEmail, remainingCredit } = await request.json();
    await updateAppleAccount(id, appleEmail, remainingCredit);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update apple account error:', error);
    return NextResponse.json({ error: 'Failed to update apple account' }, { status: 500 });
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
