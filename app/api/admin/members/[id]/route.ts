import { NextRequest, NextResponse } from 'next/server';
import { updateMember, deleteMember } from '@/lib/storage';

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { nickname, email, name, joinDate, paymentDate, depositStatus } = await request.json();
    const { id } = await params;
    
    await updateMember(id, nickname, email, name, joinDate, paymentDate, depositStatus);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteMember(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}