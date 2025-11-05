import { NextResponse } from 'next/server';
import { updateAppleAccount, deleteAppleAccount, getAllAppleAccounts } from '@/lib/storage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { appleEmail, remainingCredit, memo } = await request.json();

    await updateAppleAccount(id, appleEmail, remainingCredit, memo);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update apple account error:', error);
    return NextResponse.json({ error: 'Failed to update apple account' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { remainingCredit } = await request.json();
    
    if (typeof remainingCredit !== 'number' || remainingCredit < 0) {
      return NextResponse.json({ error: 'Valid remaining credit is required' }, { status: 400 });
    }
    
    // 현재 애플 계정 정보를 가져와서 이메일 유지
    const accounts = await getAllAppleAccounts();
    const account = accounts.find((acc: any) => acc.id === id);
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    
    await updateAppleAccount(id, account.appleEmail, remainingCredit);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update apple account credit error:', error);
    return NextResponse.json({ error: 'Failed to update credit' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteAppleAccount(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete apple account error:', error);
    return NextResponse.json({ error: 'Failed to delete apple account' }, { status: 500 });
  }
}