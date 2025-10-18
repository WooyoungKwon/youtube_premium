import { Pool } from 'pg';
import { BookingRequest } from '@/types';

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

// 영화 예매 요청 테이블 초기화
export async function initMovieDatabase() {
  try {
    // 영화 예매 요청 테이블
    await client.sql`
      CREATE TABLE IF NOT EXISTS movie_booking_requests (
        id VARCHAR(255) PRIMARY KEY,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        theater VARCHAR(255) NOT NULL,
        movie_title VARCHAR(255) NOT NULL,
        show_date VARCHAR(50) NOT NULL,
        show_time VARCHAR(50) NOT NULL,
        seats INTEGER NOT NULL,
        additional_info TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        claimed_by VARCHAR(255),
        claimed_at TIMESTAMP,
        commission DECIMAL(10,2) DEFAULT 0,
        referral_code VARCHAR(255),
        referral_type VARCHAR(50),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 인덱스 생성
    await client.sql`CREATE INDEX IF NOT EXISTS idx_movie_booking_status ON movie_booking_requests(status)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_movie_booking_created_at ON movie_booking_requests(created_at DESC)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_movie_booking_claimed_by ON movie_booking_requests(claimed_by)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_movie_booking_referral ON movie_booking_requests(referral_code, referral_type)`;

    console.log('Movie booking database initialized successfully');
  } catch (error) {
    console.error('Movie database initialization error:', error);
    throw error;
  }
}

// 영화 예매 요청 추가
export async function addMovieBookingRequest(
  customerEmail: string,
  customerPhone: string,
  theater: string,
  movieTitle: string,
  showDate: string,
  showTime: string,
  seats: number,
  additionalInfo?: string,
  referralCode?: string
): Promise<BookingRequest> {
  try {
    await initMovieDatabase();

    const id = `movie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    // referralCode로 타입 결정
    let referralType: 'admin' | 'vendor' | undefined;
    if (referralCode) {
      referralType = referralCode === 'admin' ? 'admin' : 'vendor';
    }

    // 기본 수수료 계산 (나중에 실제 가격 기반으로 수정 가능)
    // admin: 티켓 가격의 10%, vendor: 티켓 가격의 100%
    const baseCommission = 0; // 초기값, 나중에 실제 예매 가격이 확정되면 업데이트

    await client.sql`
      INSERT INTO movie_booking_requests (
        id, customer_email, customer_phone, theater, movie_title,
        show_date, show_time, seats, additional_info, status,
        commission, referral_code, referral_type, created_at, updated_at
      )
      VALUES (
        ${id}, ${customerEmail}, ${customerPhone}, ${theater}, ${movieTitle},
        ${showDate}, ${showTime}, ${seats}, ${additionalInfo || null}, 'pending',
        ${baseCommission}, ${referralCode || null}, ${referralType || null},
        ${createdAt}, ${createdAt}
      )
    `;

    return {
      id,
      customerEmail,
      customerPhone,
      theater,
      movieTitle,
      showDate,
      showTime,
      seats,
      additionalInfo,
      status: 'pending',
      commission: baseCommission,
      referralCode,
      referralType,
      createdAt,
      updatedAt: createdAt,
    };
  } catch (error) {
    console.error('Add movie booking request error:', error);
    throw error;
  }
}

// 모든 영화 예매 요청 조회
export async function getAllMovieBookingRequests(options?: {
  status?: 'all' | 'pending' | 'claimed' | 'confirmed' | 'completed' | 'cancelled';
}): Promise<BookingRequest[]> {
  try {
    await initMovieDatabase();

    const status = options?.status || 'all';
    const whereClause = status !== 'all' ? `WHERE status = $1` : '';
    const params = status !== 'all' ? [status] : [];

    const query = `
      SELECT
        id,
        customer_email as "customerEmail",
        customer_phone as "customerPhone",
        theater,
        movie_title as "movieTitle",
        show_date as "showDate",
        show_time as "showTime",
        seats,
        additional_info as "additionalInfo",
        status,
        claimed_by as "claimedBy",
        claimed_at as "claimedAt",
        commission,
        referral_code as "referralCode",
        referral_type as "referralType",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM movie_booking_requests
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      theater: row.theater,
      movieTitle: row.movieTitle,
      showDate: row.showDate,
      showTime: row.showTime,
      seats: row.seats,
      additionalInfo: row.additionalInfo,
      status: row.status,
      claimedBy: row.claimedBy,
      claimedAt: row.claimedAt ? new Date(row.claimedAt).toISOString() : undefined,
      commission: parseFloat(row.commission) || 0,
      referralCode: row.referralCode,
      referralType: row.referralType,
      createdAt: new Date(row.createdAt).toISOString(),
      updatedAt: new Date(row.updatedAt).toISOString(),
    }));
  } catch (error) {
    console.error('Get all movie booking requests error:', error);
    return [];
  }
}

// 영화 예매 요청 상태 업데이트
export async function updateMovieBookingStatus(
  id: string,
  status: 'pending' | 'claimed' | 'confirmed' | 'completed' | 'cancelled',
  claimedBy?: string
): Promise<void> {
  try {
    const updatedAt = new Date().toISOString();

    if (claimedBy && status === 'claimed') {
      await client.sql`
        UPDATE movie_booking_requests
        SET status = ${status}, claimed_by = ${claimedBy}, claimed_at = ${updatedAt}, updated_at = ${updatedAt}
        WHERE id = ${id}
      `;
    } else {
      await client.sql`
        UPDATE movie_booking_requests
        SET status = ${status}, updated_at = ${updatedAt}
        WHERE id = ${id}
      `;
    }
  } catch (error) {
    console.error('Update movie booking status error:', error);
    throw error;
  }
}

// 수수료 업데이트 (예매 완료 후 실제 가격 기반으로)
export async function updateMovieBookingCommission(
  id: string,
  totalPrice: number
): Promise<void> {
  try {
    // 요청의 referralType에 따라 수수료 계산
    const { rows } = await client.sql`
      SELECT referral_type FROM movie_booking_requests WHERE id = ${id}
    `;

    if (rows.length === 0) {
      throw new Error('Booking request not found');
    }

    const referralType = rows[0].referral_type;
    let commission = 0;

    if (referralType === 'admin') {
      // 관리자 링크: 10% 수수료
      commission = totalPrice * 0.10;
    } else if (referralType === 'vendor') {
      // 판매자 링크: 100% (전액)
      commission = totalPrice;
    } else {
      // referral이 없는 경우: 기본적으로 관리자가 가져감 (10%)
      commission = totalPrice * 0.10;
    }

    const updatedAt = new Date().toISOString();

    await client.sql`
      UPDATE movie_booking_requests
      SET commission = ${commission}, updated_at = ${updatedAt}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Update movie booking commission error:', error);
    throw error;
  }
}

// 영화 예매 요청 삭제
export async function deleteMovieBookingRequest(id: string): Promise<void> {
  try {
    await client.sql`
      DELETE FROM movie_booking_requests WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Delete movie booking request error:', error);
    throw error;
  }
}

// 판매자별 통계
export async function getVendorStats(vendorId: string) {
  try {
    const { rows } = await client.sql`
      SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN commission ELSE 0 END), 0) as total_earnings
      FROM movie_booking_requests
      WHERE claimed_by = ${vendorId} AND referral_type = 'vendor'
    `;

    return {
      totalBookings: parseInt(rows[0].total_bookings),
      completedBookings: parseInt(rows[0].completed_bookings),
      totalEarnings: parseFloat(rows[0].total_earnings),
    };
  } catch (error) {
    console.error('Get vendor stats error:', error);
    return {
      totalBookings: 0,
      completedBookings: 0,
      totalEarnings: 0,
    };
  }
}

// 관리자 수수료 통계
export async function getAdminStats() {
  try {
    const { rows } = await client.sql`
      SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COALESCE(SUM(CASE WHEN status = 'completed' AND (referral_type = 'admin' OR referral_type IS NULL) THEN commission ELSE 0 END), 0) as total_commission
      FROM movie_booking_requests
    `;

    return {
      totalBookings: parseInt(rows[0].total_bookings),
      completedBookings: parseInt(rows[0].completed_bookings),
      totalCommission: parseFloat(rows[0].total_commission),
    };
  } catch (error) {
    console.error('Get admin stats error:', error);
    return {
      totalBookings: 0,
      completedBookings: 0,
      totalCommission: 0,
    };
  }
}
