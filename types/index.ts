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
  lastUpdated?: string;
  createdAt: string;
}

export interface YoutubeAccount {
  id: string;
  appleAccountId: string;
  youtubeEmail: string;
  nickname?: string;
  renewalDate: string; // Required field
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
  claimedBy?: string; // 예매를 수락한 업자 ID
  claimedAt?: string;
  commission: number;
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
