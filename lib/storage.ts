import { MemberRequest } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'requests.json');

// 데이터 디렉토리 생성
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// 모든 신청 조회
export async function getAllRequests(): Promise<MemberRequest[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 신청 추가
export async function addRequest(email: string, kakaoId?: string, phone?: string): Promise<MemberRequest> {
  await ensureDataDir();
  
  const requests = await getAllRequests();
  
  // 이미 신청한 이메일인지 확인
  const existingRequest = requests.find(req => req.email === email);
  if (existingRequest) {
    throw new Error('이미 신청한 이메일입니다.');
  }
  
  const newRequest: MemberRequest = {
    id: Date.now().toString(),
    email,
    kakaoId,
    phone,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  requests.push(newRequest);
  await fs.writeFile(DATA_FILE, JSON.stringify(requests, null, 2));
  
  return newRequest;
}

// 신청 상태 업데이트
export async function updateRequestStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<MemberRequest> {
  await ensureDataDir();
  
  const requests = await getAllRequests();
  const index = requests.findIndex(req => req.id === id);
  
  if (index === -1) {
    throw new Error('신청을 찾을 수 없습니다.');
  }
  
  requests[index].status = status;
  requests[index].updatedAt = new Date().toISOString();
  
  await fs.writeFile(DATA_FILE, JSON.stringify(requests, null, 2));
  
  return requests[index];
}

// 신청 삭제
export async function deleteRequest(id: string): Promise<void> {
  await ensureDataDir();
  
  const requests = await getAllRequests();
  const filteredRequests = requests.filter(req => req.id !== id);
  
  await fs.writeFile(DATA_FILE, JSON.stringify(filteredRequests, null, 2));
}
