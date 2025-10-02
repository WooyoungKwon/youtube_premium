export interface MemberRequest {
  id: string;
  email: string;
  kakaoId?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestDTO {
  email: string;
  kakaoId?: string;
  phone?: string;
}

export interface UpdateRequestDTO {
  status: 'approved' | 'rejected';
}
