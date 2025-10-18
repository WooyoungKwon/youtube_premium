import { NextResponse } from 'next/server';
import { addMovieBookingRequest, getAllMovieBookingRequests } from '@/lib/movie-storage';
import { sendMovieBookingNotification } from '@/lib/email';
import { Pool } from 'pg';

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

// 판매자 이메일 가져오기
async function getVendorEmails(referralCode?: string, referralType?: string): Promise<string[]> {
  try {
    let query = '';
    let params: any[] = [];

    if (referralType === 'vendor' && referralCode) {
      // 판매자 링크: 해당 판매자의 이메일만
      const vendorId = referralCode;
      query = 'SELECT email FROM vendors WHERE id = $1 AND is_active = true';
      params = [vendorId];
    } else {
      // 관리자 링크 또는 링크 없음: 모든 활성 판매자 이메일
      query = 'SELECT email FROM vendors WHERE is_active = true';
    }

    const result = await pool.query(query, params);
    return result.rows.map(row => row.email);
  } catch (error) {
    console.error('Error getting vendor emails:', error);
    return [];
  }
}

// POST: 영화 예매 요청 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      phone,
      theater,
      movieTitle,
      showDate,
      showTime,
      seats,
      additionalInfo,
      referralCode,
    } = body;

    // 필수 필드 검증
    if (!email || !phone || !theater || !movieTitle || !showDate || !showTime || !seats) {
      return NextResponse.json(
        { error: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    const bookingRequest = await addMovieBookingRequest(
      email,
      phone,
      theater,
      movieTitle,
      showDate,
      showTime,
      parseInt(seats),
      additionalInfo,
      referralCode
    );

    // 이메일 알림 발송 (비동기 - 결과를 기다리지 않음)
    const vendorEmails = await getVendorEmails(bookingRequest.referralCode, bookingRequest.referralType);
    if (vendorEmails.length > 0) {
      sendMovieBookingNotification(bookingRequest, vendorEmails).catch(error => {
        console.error('Failed to send movie booking notification:', error);
      });
      console.log(`Sending notification to ${vendorEmails.length} vendor(s)`);
    } else {
      console.log('No vendor emails found for notification');
    }

    return NextResponse.json(bookingRequest, { status: 201 });
  } catch (error) {
    console.error('Movie booking request error:', error);
    const message = error instanceof Error ? error.message : '예매 요청에 실패했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: 모든 영화 예매 요청 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'all' | 'pending' | 'claimed' | 'confirmed' | 'completed' | 'cancelled' || 'all';

    const bookings = await getAllMovieBookingRequests({ status });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get movie bookings error:', error);
    return NextResponse.json(
      { error: '예매 요청 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
