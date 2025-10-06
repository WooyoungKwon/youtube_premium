import { NextResponse } from 'next/server';
import { addReview, getAllReviews, initDatabase } from '@/lib/storage';
import { Pool } from 'pg';

// 최초 1회 DB 초기화 (reviews 테이블 생성)
let dbInitialized = false;

// DB 연결
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

const client = {
  sql: async (strings: TemplateStringsArray, ...values: any[]) => {
    const text = strings.reduce((acc, str, i) =>
      acc + str + (i < values.length ? `$${i + 1}` : ''), ''
    );
    return pool.query(text, values);
  }
};

// 후기 작성
export async function POST(request: Request) {
  try {
    const { email, name, rating, comment } = await request.json();

    // 입력 검증
    if (!email || !name || !rating || !comment) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '별점은 1~5 사이여야 합니다.' },
        { status: 400 }
      );
    }

    // 회원 DB에서 이메일 존재 여부 확인
    const { rows: memberRows } = await client.sql`
      SELECT id FROM members WHERE email = ${email}
    `;

    if (memberRows.length === 0) {
      return NextResponse.json(
        { error: '등록된 회원이 아닙니다. 서비스를 이용 중인 회원만 후기를 작성할 수 있습니다.' },
        { status: 403 }
      );
    }

    const review = await addReview(email, name, rating, comment);

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: error.message || '후기 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 모든 후기 조회
export async function GET() {
  try {
    // DB 초기화 (최초 1회)
    if (!dbInitialized) {
      await initDatabase();
      dbInitialized = true;
    }

    const reviews = await getAllReviews();

    return NextResponse.json(reviews, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: '후기를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;
