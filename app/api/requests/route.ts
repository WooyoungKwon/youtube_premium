import { NextResponse } from 'next/server';
import { addRequest } from '@/lib/storage';
import { sendNewRequestNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, months, depositorName, referralEmail, planType } = body;

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

    // 전화번호는 필수
    if (!phone) {
      return NextResponse.json(
        { error: '전화번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const newRequest = await addRequest(email, undefined, phone, months, depositorName, referralEmail, planType);

    // 관리자에게 이메일 알림 전송
    try {
      await sendNewRequestNotification({
        email,
        phone,
        referralEmail,
        requestId: newRequest.id,
      });
    } catch (error) {
      console.error('Email notification failed:', error);
    }

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
