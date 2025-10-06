export interface MemberRequest {
  id: string;
  email: string;
  kakaoId?: string;
  phone?: string;
  referralEmail?: string;
  months?: number;
  depositorName?: string;
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
