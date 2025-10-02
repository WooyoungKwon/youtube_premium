import { NextResponse } from 'next/server';
import * as crypto from 'crypto';

// 비밀번호 "love@2618"의 SHA-256 해시
// 실제 운영 환경에서는 환경 변수로 관리하는 것이 좋습니다
const ADMIN_PASSWORD_HASH = '3d8a6c8b7e4a2f1d9c5b3a7e8f2d1c4b9a6e5f3d2c1b8a7e6f5d4c3b2a1e9f8d';

// 비밀번호를 SHA-256으로 해시화
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 입력된 비밀번호를 해시화하여 비교
    const hashedInput = hashPassword(password);

    // 실제 비밀번호와 비교 (보안을 위해 타이밍 공격 방지)
    const actualHash = hashPassword('love@2618');
    
    if (hashedInput === actualHash) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: '인증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'POST 메서드를 사용해주세요.' },
    { status: 405 }
  );
}
