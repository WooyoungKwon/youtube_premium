import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export interface AdminSession {
  authenticated: boolean;
  deviceId?: string;
  lastUsed?: number;
}

/**
 * JWT 토큰 생성
 */
export function createToken(payload: { deviceId: string }): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // 7일 유효
  });
}

/**
 * JWT 토큰 검증
 */
export function verifyToken(token: string): { deviceId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { deviceId: string };
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * 쿠키에 JWT 토큰 설정 (httpOnly, secure)
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * 쿠키에서 JWT 토큰 가져오기 및 검증
 */
export async function verifyAuthCookie(): Promise<AdminSession> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return { authenticated: false };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      deviceId: decoded.deviceId,
      lastUsed: Date.now(),
    };
  } catch (error) {
    console.error('Auth cookie verification failed:', error);
    return { authenticated: false };
  }
}

/**
 * 로그아웃 (쿠키 삭제)
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}
