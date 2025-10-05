import { NextResponse } from 'next/server';
import { 
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import { createClient } from '@vercel/postgres';

const client = createClient({
  connectionString: process.env.POSTGRES_URL,
});

// Relying Party 설정
const rpName = 'YouTube Premium Admin';
const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const origin = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

// POST: 등록 옵션 생성 (Face ID, Touch ID 등록 시작)
export async function POST(request: Request) {
  try {
    const { action, ...body } = await request.json();

    // 1단계: 등록 시작 - Challenge 생성
    if (action === 'generate-options') {
      const { password } = body;
      
      // 기존 비밀번호로 일단 인증 (첫 등록 시에만)
      if (password !== 'love@2618') {
        return NextResponse.json(
          { error: '비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        );
      }

      // 기존 등록된 기기가 있는지 확인
      const { rows: existingCreds } = await client.sql`
        SELECT credential_id FROM admin_credentials
      `;

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userName: 'admin',
        attestationType: 'none',
        excludeCredentials: existingCreds.map(cred => ({
          id: cred.credential_id,
          transports: ['internal'] as const,
        })),
        authenticatorSelection: {
          residentKey: 'required', // 디바이스에 반드시 저장
          userVerification: 'required', // 생체 인증 필수
          authenticatorAttachment: 'platform', // 현재 기기의 Face ID, Touch ID만 사용
        },
      });

      // Challenge를 세션에 저장 (실제로는 Redis 등 사용 권장)
      // 여기서는 간단히 응답에 포함
      return NextResponse.json({
        options,
        challenge: options.challenge,
      });
    }

    // 2단계: 등록 검증 - Face ID/Touch ID로 생성된 credential 저장
    if (action === 'verify-registration') {
      const { credential, challenge, deviceName } = body;

      let verification: VerifiedRegistrationResponse;
      try {
        verification = await verifyRegistrationResponse({
          response: credential,
          expectedChallenge: challenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
        });
      } catch (error) {
        console.error('Registration verification failed:', error);
        return NextResponse.json(
          { error: '등록 검증 실패' },
          { status: 400 }
        );
      }

      const { verified, registrationInfo } = verification;

      if (!verified || !registrationInfo) {
        return NextResponse.json(
          { error: '등록 검증 실패' },
          { status: 400 }
        );
      }

      const credentialPublicKey = registrationInfo.credential.publicKey;
      const credentialID = registrationInfo.credential.id;
      const counter = registrationInfo.credential.counter;

      // DB에 저장
      const id = Date.now().toString();
      const credentialIdBase64 = Buffer.from(credentialID).toString('base64');
      const publicKeyBase64 = Buffer.from(credentialPublicKey).toString('base64');

      await client.sql`
        INSERT INTO admin_credentials (
          id,
          credential_id,
          public_key,
          counter,
          device_name,
          created_at
        )
        VALUES (
          ${id},
          ${credentialIdBase64},
          ${publicKeyBase64},
          ${counter},
          ${deviceName || 'Unknown Device'},
          CURRENT_TIMESTAMP
        )
      `;

      return NextResponse.json({
        success: true,
        verified: true,
        message: '기기가 성공적으로 등록되었습니다.',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('WebAuthn registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
