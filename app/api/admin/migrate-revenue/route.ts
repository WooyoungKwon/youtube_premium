import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import { addRevenueRecord } from '@/lib/storage';

const client = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// POST: 기존 회원들의 수익을 revenue_records 테이블로 마이그레이션
export async function POST() {
  try {
    console.log('Starting revenue migration...');

    // 이미 수익이 기록된 회원 ID 조회
    const { rows: existingRecords } = await client.sql`
      SELECT DISTINCT member_id FROM revenue_records
    `;
    const existingMemberIds = new Set(existingRecords.map(r => r.member_id));
    console.log('Already recorded member IDs:', existingMemberIds.size);

    // 입금 완료된 모든 회원 조회 (수익이 아직 기록되지 않은 회원만)
    const { rows: members } = await client.sql`
      SELECT 
        m.id,
        m.name,
        m.deposit_status,
        r.months
      FROM members m
      LEFT JOIN member_requests r ON m.request_id = r.id
      WHERE m.deposit_status = 'completed'
    `;

    console.log(`Found ${members.length} completed members in total`);

    const PRICE_PER_MEMBER = 4000;
    let migratedCount = 0;
    let skippedCount = 0;
    let totalAmount = 0;

    for (const member of members) {
      // 이미 기록된 회원은 건너뛰기
      if (existingMemberIds.has(member.id)) {
        skippedCount++;
        console.log(`Skipping member ${member.id} (${member.name}) - already recorded`);
        continue;
      }

      const months = parseInt(member.months || '1');
      const amount = months * PRICE_PER_MEMBER;

      try {
        await addRevenueRecord(
          member.id,
          amount,
          months,
          `마이그레이션 - 기존 회원 (${member.name}) ${months}개월`
        );
        
        migratedCount++;
        totalAmount += amount;
        console.log(`Migrated: ${member.name} - ${amount}원 (${months}개월)`);
      } catch (error) {
        console.error(`Failed to migrate member ${member.id}:`, error);
      }
    }

    console.log('Migration completed:', {
      total: members.length,
      migrated: migratedCount,
      skipped: skippedCount,
      totalAmount
    });

    return NextResponse.json({
      success: true,
      message: '수익 마이그레이션이 완료되었습니다.',
      stats: {
        totalMembers: members.length,
        migratedMembers: migratedCount,
        skippedMembers: skippedCount,
        totalAmount: totalAmount,
      }
    });
  } catch (error) {
    console.error('Revenue migration error:', error);
    return NextResponse.json(
      {
        error: 'Failed to migrate revenue',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
