// 추천인 코드를 쿠키에 저장/조회하는 유틸리티

const REFERRAL_COOKIE_NAME = 'referral_code';
const COOKIE_EXPIRES_DAYS = 30; // 30일간 유지

// 쿠키 설정
export function setReferralCode(code: string) {
  if (typeof window === 'undefined') return;

  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_EXPIRES_DAYS);

  document.cookie = `${REFERRAL_COOKIE_NAME}=${code}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

// 쿠키에서 읽기
export function getReferralCode(): string | null {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === REFERRAL_COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

// 쿠키 삭제
export function clearReferralCode() {
  if (typeof window === 'undefined') return;

  document.cookie = `${REFERRAL_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// URL에서 ref 파라미터를 확인하고 쿠키에 저장
export function captureReferralFromURL(searchParams: URLSearchParams) {
  const ref = searchParams.get('ref');
  if (ref) {
    setReferralCode(ref);
    return ref;
  }
  return null;
}
