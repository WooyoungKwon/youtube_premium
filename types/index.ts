export interface MemberRequest {
  id: string;
  email: string;
  kakaoId?: string;
  phone?: string;
  months?: number;
  depositorName?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
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
  renewalDate?: string;
  lastUpdated?: string;
  createdAt: string;
}

export interface YoutubeAccount {
  id: string;
  appleAccountId: string;
  youtubeEmail: string;
  nickname?: string;
  renewalDate?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  youtubeAccountId: string;
  requestId?: string;
  nickname: string;
  email: string;
  name: string;
  joinDate: string;
  paymentDate: string; // 다음 결제 예정일 (월 구독 갱신일)
  depositStatus: 'completed' | 'pending';
  createdAt: string;
}
