/**
 * 한국 시간대(KST, UTC+9) 유틸리티 함수들
 */

/**
 * 현재 KST 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getKSTDate(): string {
  const now = new Date();
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return kstTime.toISOString().split('T')[0];
}

/**
 * 현재 KST 날짜와 시간을 ISO 형식으로 반환
 */
export function getKSTDateTime(): string {
  const now = new Date();
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return kstTime.toISOString();
}

/**
 * Date 객체를 KST 기준 YYYY-MM-DD 형식으로 변환
 */
export function formatDateToKST(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const kstTime = new Date(d.getTime() + (9 * 60 * 60 * 1000));
  return kstTime.toISOString().split('T')[0];
}

/**
 * KST 기준으로 날짜에 개월 수 더하기
 */
export function addMonthsKST(date: Date | string, months: number): string {
  // YYYY-MM-DD 형식의 문자열이면 직접 파싱 (시간대 문제 방지)
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setMonth(d.getMonth() + months);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const kstTime = new Date(d.getTime() + (9 * 60 * 60 * 1000));
  kstTime.setUTCMonth(kstTime.getUTCMonth() + months);
  return kstTime.toISOString().split('T')[0];
}

/**
 * Date 객체나 ISO 문자열을 YYYY-MM-DD 형식으로 변환 (시간대 고려)
 */
export function toDateString(date: Date | string | null | undefined): string {
  if (!date) {
    // null이나 undefined면 오늘 날짜 반환
    return getKSTDate();
  }

  // 이미 YYYY-MM-DD 형식이면 그대로 반환
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // ISO 형식이면 날짜 부분만 추출
  if (typeof date === 'string' && date.includes('T')) {
    return date.split('T')[0];
  }
  
  // Date 객체인 경우
  if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      // Invalid Date면 오늘 날짜 반환
      return getKSTDate();
    }
    return formatDateToKST(date);
  }
  
  // 문자열이면 Date로 변환 시도
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return getKSTDate();
    }
    return formatDateToKST(d);
  } catch (error) {
    console.error('toDateString error:', error, 'date:', date);
    return getKSTDate();
  }
}

/**
 * KST 기준으로 날짜 포맷팅 (한국어)
 */
export function formatKSTToKorean(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const kstTime = new Date(d.getTime() + (9 * 60 * 60 * 1000));
  
  const year = kstTime.getUTCFullYear();
  const month = kstTime.getUTCMonth() + 1;
  const day = kstTime.getUTCDate();
  
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 두 날짜의 차이(일수) 계산 (KST 기준)
 */
export function getDaysDifferenceKST(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const kst1 = new Date(d1.getTime() + (9 * 60 * 60 * 1000));
  const kst2 = new Date(d2.getTime() + (9 * 60 * 60 * 1000));
  
  const diffTime = kst2.getTime() - kst1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
