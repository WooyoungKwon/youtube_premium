import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

const client = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// 신청 정보 업데이트 (입금자명과 개월수 추가)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { months, depositorName } = body;
    
    await client.sql`
      UPDATE member_requests
      SET months = ${months}, depositor_name = ${depositorName}
      WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json(
      { error: '업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}
