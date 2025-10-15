import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { Vendor } from '@/types';

const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '')
  .replace('&&', '&')
  .replace('sslmode=require', '');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 테이블 초기화
async function ensureVendorsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        rating DECIMAL(3,2) DEFAULT 5.0,
        completed_bookings INTEGER DEFAULT 0,
        total_earnings DECIMAL(10,2) DEFAULT 0,
        response_time INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Failed to create vendors table:', error);
  }
}

// GET: 판매자 목록 조회
export async function GET() {
  try {
    await ensureVendorsTable();

    const result = await pool.query(`
      SELECT * FROM vendors
      ORDER BY created_at DESC
    `);

    const vendors: Vendor[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      isActive: row.is_active,
      rating: parseFloat(row.rating) || 5.0,
      completedBookings: row.completed_bookings || 0,
      totalEarnings: parseFloat(row.total_earnings) || 0,
      responseTime: row.response_time || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return NextResponse.json(
      { error: '판매자 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 판매자 등록
export async function POST(request: Request) {
  try {
    await ensureVendorsTable();

    const body = await request.json();
    const { name, email, phone } = body;

    // 유효성 검사
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: '이름, 이메일, 전화번호는 필수입니다.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingVendor = await pool.query(
      'SELECT id FROM vendors WHERE email = $1',
      [email]
    );

    if (existingVendor.rows.length > 0) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      );
    }

    // 판매자 등록
    const id = `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await pool.query(
      `INSERT INTO vendors
       (id, name, email, phone, is_active, rating, completed_bookings, total_earnings, response_time, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, name, email, phone, true, 5.0, 0, 0, 0, now, now]
    );

    const vendor: Vendor = {
      id,
      name,
      email,
      phone,
      isActive: true,
      rating: 5.0,
      completedBookings: 0,
      totalEarnings: 0,
      responseTime: 0,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error('Failed to create vendor:', error);
    return NextResponse.json(
      { error: '판매자 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 판매자 정보 수정 (활성화/비활성화 등)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive, name, phone } = body;

    if (!id) {
      return NextResponse.json(
        { error: '판매자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (typeof isActive === 'boolean') {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    }

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (phone) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: '수정할 내용이 없습니다.' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(new Date().toISOString());
    values.push(id);

    await pool.query(
      `UPDATE vendors SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update vendor:', error);
    return NextResponse.json(
      { error: '판매자 정보 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 판매자 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '판매자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM vendors WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete vendor:', error);
    return NextResponse.json(
      { error: '판매자 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
