export interface MemberRequest {
  id: string;
  email: string;
  kakaoId?: string;
  phone?: string;
  referralEmail?: string;
  months?: number;
  depositorName?: string;
  planType?: 'family' | 'individual'; // 요금제 타입
  accountType?: 'user' | 'admin'; // 계정 타입
  platform?: 'youtube' | 'movie'; // 플랫폼 타입
  movieDetails?: {
    theater?: string;
    movieTitle?: string;
    showDate?: string;
    showTime?: string;
    seats?: number;
    additionalInfo?: string;
    referralCode?: string; // 추천인 코드 (admin 또는 vendor_xxx)
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  isRegistered?: boolean; // 회원으로 등록되었는지 여부
}

export interface CreateRequestDTO {
  email: string;
  kakaoId?: string;
  phone?: string;
  months?: number;
  depositorName?: string;
  planType?: 'family' | 'individual';
}

export interface UpdateRequestDTO {
  status: 'approved' | 'rejected';
}

export interface AppleAccount {
  id: string;
  appleEmail: string;
  remainingCredit: number;
  memo?: string;
  lastUpdated?: string;
  createdAt: string;
}

export interface YoutubeAccount {
  id: string;
  appleAccountId: string;
  youtubeEmail: string;
  nickname?: string;
  renewalDate: string; // Required field
  memo?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  youtubeAccountId: string;
  requestId?: string;
  nickname: string;
  email: string;
  name: string;
  lastPaymentDate: string; // 이전 결제일 (마지막으로 결제한 날짜)
  paymentDate: string; // 다음 결제 예정일 (월 구독 갱신일)
  depositStatus: 'completed' | 'pending';
  willRenew?: boolean; // 갱신 여부
  renewMonths?: number; // 갱신 기간 (개월 수)
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  rating: number;
  completedBookings: number;
  totalEarnings: number;
  responseTime: number; // 평균 응답 시간 (초)
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  id: string;
  customerEmail: string;
  customerPhone: string;
  theater: string;
  movieTitle: string;
  showDate: string;
  showTime: string;
  seats: number;
  additionalInfo?: string;
  status: 'pending' | 'claimed' | 'confirmed' | 'completed' | 'cancelled';
  claimedBy?: string; // 예매를 수락한 판매자 ID
  claimedAt?: string;
  commission: number;
  referralCode?: string; // 추천인 코드 (admin 또는 vendor_xxx)
  referralType?: 'admin' | 'vendor'; // 추천인 타입
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  requestId: string;
  vendorId: string;
  bookingNumber: string;
  totalPrice: number;
  vendorCommission: number;
  platformFee: number;
  completedAt: string;
}
