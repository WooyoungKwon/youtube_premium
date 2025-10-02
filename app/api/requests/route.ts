import { NextResponse } from 'next/server';
import { addRequest } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, kakaoId, phone, months, depositorName } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 간단한 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }
    
    // 카카오톡 아이디나 전화번호 중 하나는 필수
    if (!kakaoId && !phone) {
      return NextResponse.json(
        { error: '카카오톡 아이디 또는 전화번호 중 하나는 필수입니다.' },
        { status: 400 }
      );
    }
    
    const newRequest = await addRequest(email, kakaoId, phone, months, depositorName);
    
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'POST 메서드를 사용해주세요.' },
    { status: 405 }
  );
}
