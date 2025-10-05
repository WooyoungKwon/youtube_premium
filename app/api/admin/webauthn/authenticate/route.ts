import { NextResponse } from 'next/server';
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import { Pool } from 'pg';
import { createToken, setAuthCookie } from '@/lib/auth';

const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '')
  .replace('sslmode=require', '')
  .replace('&&', '&');

const pool = new Pool({
  connectionString,
  ssl: false,
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

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

// POST: Face ID/Touch ID 인증
export async function POST(request: Request) {
  try {
    const { action, ...body } = await request.json();

    // 1단계: 인증 시작 - Challenge 생성
    if (action === 'generate-options') {
      // 등록된 credential이 있는지만 확인
      const { rows: credentials } = await client.sql`
        SELECT credential_id 
        FROM admin_credentials
        LIMIT 1
      `;

      if (credentials.length === 0) {
        return NextResponse.json(
          { error: '등록된 기기가 없습니다. 먼저 기기를 등록해주세요.' },
          { status: 404 }
        );
      }

      // allowCredentials를 빈 배열로 설정하여 현재 디바이스의 Passkey 자동 검색
      const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: [], // 빈 배열 = 현재 디바이스에 저장된 Passkey 사용
        userVerification: 'required',
      });

      return NextResponse.json({
        options,
        challenge: options.challenge,
      });
    }

    // 2단계: 인증 검증
    if (action === 'verify-authentication') {
      const { credential, challenge } = body;

      // 모든 등록된 credential 조회하여 매칭 시도
      const { rows: allCredentials } = await client.sql`
        SELECT * FROM admin_credentials
      `;

      if (allCredentials.length === 0) {
        return NextResponse.json(
          { error: '등록된 기기가 없습니다.' },
          { status: 404 }
        );
      }

      // 각 credential에 대해 검증 시도
      let verified = false;
      let matchedCredential = null;
      let authenticationInfo = null;

      for (const dbCred of allCredentials) {
        try {
          const publicKey = Buffer.from(dbCred.public_key, 'base64');

          const verification = await verifyAuthenticationResponse({
            response: credential,
            expectedChallenge: challenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            credential: {
              id: dbCred.credential_id,
              publicKey: publicKey,
              counter: parseInt(dbCred.counter),
            },
          });

          if (verification.verified) {
            verified = true;
            matchedCredential = dbCred;
            authenticationInfo = verification.authenticationInfo;
            break;
          }
        } catch (error) {
          // 이 credential이 맞지 않음, 다음 시도
          continue;
        }
      }

      if (!verified || !matchedCredential || !authenticationInfo) {
        return NextResponse.json(
          { error: '인증 실패: 등록된 기기를 찾을 수 없습니다.' },
          { status: 401 }
        );
      }

      // Counter 업데이트 및 마지막 사용 시간 갱신
      const newCounter = authenticationInfo.newCounter;
      await client.sql`
        UPDATE admin_credentials
        SET counter = ${newCounter},
            last_used_at = CURRENT_TIMESTAMP
        WHERE id = ${matchedCredential.id}
      `;

      // JWT 토큰 생성 및 쿠키 설정
      const token = createToken({ deviceId: matchedCredential.id });
      await setAuthCookie(token);

      return NextResponse.json({
        success: true,
        verified: true,
        message: '인증 성공',
        deviceName: matchedCredential.device_name,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('WebAuthn authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET: 로그아웃
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: '로그아웃 되었습니다.' });
  response.cookies.delete('admin-token');
  return response;
}
