'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [months, setMonths] = useState(1);
  const [email, setEmail] = useState('');
  const [depositorName, setDepositorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showAccountCopyToast, setShowAccountCopyToast] = useState(false);

  const MONTHLY_PRICE = 4000;
  
  // 할인 적용된 가격 계산
  const calculatePrice = (selectedMonths: number) => {
    if (selectedMonths === 6) {
      return 23000; // 24000 -> 23000 (1000원 할인)
    } else if (selectedMonths === 12) {
      return 45000; // 48000 -> 45000 (3000원 할인)
    } else {
      return selectedMonths * MONTHLY_PRICE;
    }
  };

  const totalPrice = calculatePrice(months);
  const originalPrice = months * MONTHLY_PRICE;
  const discount = originalPrice - totalPrice;
  const hasDiscount = discount > 0;

  useEffect(() => {
    setIsVisible(true);

    // URL에서 requestId 확인
    const requestId = searchParams.get('requestId');
    const userEmail = searchParams.get('email');

    if (!requestId || !userEmail) {
      // requestId나 email이 없으면 메인 페이지로 리다이렉트
      router.push('/');
      return;
    }

    setEmail(userEmail);
    setLoading(false);
  }, [searchParams, router]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('110574383789');
    setShowAccountCopyToast(true);
    setTimeout(() => {
      setShowAccountCopyToast(false);
    }, 2000);
  };

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(
      '최저가 유튜브 프리미엄 가입은 Linkuni에서 !\n'
      + '신청하기: https://youtube-premium-pv6f.vercel.app');
    setShowCopyToast(true);
    setTimeout(() => {
      setShowCopyToast(false);
    }, 2000);
  };

  const handleComplete = async () => {
    if (!depositorName.trim()) {
      alert('입금자명을 입력해주세요.');
      return;
    }

    try {
      // 입금자명과 개월수를 기존 신청에 업데이트
      const requestId = searchParams.get('requestId');
      
      if (!requestId) {
        alert('요청 ID가 없습니다.');
        return;
      }

      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          months,
          depositorName,
        }),
      });

      if (response.ok) {
        setIsCompleted(true);
      } else {
        alert('업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  // 신청 완료 화면
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            신청이 완료되었습니다!
          </h1>
          <p className="text-gray-600 mb-2">
            입금 확인 후 관리자가
          </p>
          <p className="text-gray-600 mb-6">
            입력하신 연락처로 안내드리겠습니다.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              입금 후 24시간 이내에 프리미엄 초대가 완료됩니다.
            </p>
          </div>

          {/* 추천인 혜택 안내 */}
          <div className="mb-6 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 rounded-xl p-5 relative overflow-visible">
            {/* 배경 장식 */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200 rounded-full blur-2xl opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-pink-200 rounded-full blur-2xl opacity-30"></div>

            <div className="relative z-10">
              <div className="space-y-4">
                {/* 상단 아이콘과 제목 */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-2xl">🎁</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 text-left">Linkuni를 널리 알려주세요 !</h3>
                  </div>
                </div>

                {/* 설명 텍스트 */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-sm">🎁</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-green-800 text-left">추천인 혜택 이벤트</p>
                        <p className="text-xs text-gray-700 leading-relaxed text-left">
                          새로운 회원이 <span className="font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded text-xs">{email}</span>을<br/>
                          추천인으로 입력하면 <span className="font-bold text-green-600">둘 다 +1개월 무료!</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 공유 링크 섹션 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <p className="text-xs font-semibold text-gray-900">링크를 복사해서 친구들에게 공유하세요</p>
                    </div>
                    
                    <div className="relative group">
                      <div className="flex items-center bg-white border-2 border-purple-300 rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200 group-hover:border-purple-400">
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="text-xs text-gray-500 mb-1 font-medium">공유할 링크</div>
                          <div className="text-sm text-gray-900 font-mono truncate">
                            https://youtube-premium-pv6f.vercel.app
                          </div>
                        </div>
                        <button
                          onClick={handleCopyDomain}
                          className="ml-3 flex-shrink-0 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-1.5 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>복사</span>
                        </button>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            메인으로 돌아가기
          </button>
        </div>

        {/* 복사 완료 토스트 메시지 - 화면 하단 고정 */}
        {showCopyToast && (
          <div className="fixed bottom-8 left-1/2 z-50 animate-slide-up">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2 border border-gray-700">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">링크가 복사되었습니다</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* 계좌번호 복사 토스트 메시지 */}
      {showAccountCopyToast && (
        <div className="fixed bottom-8 left-1/2 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2 border border-gray-700">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">계좌번호가 복사되었습니다</span>
          </div>
        </div>
      )}
    <div 
      className={`min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={`max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            마지막 단계입니다!
          </h1>
          <p className="text-gray-600">
            이용 기간을 선택하고 입금하시면 모든 준비가 끝납니다
          </p>
        </div>

        {/* 신청 정보 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">신청하신 이메일</p>
              <p className="text-sm text-blue-800 font-medium">{email}</p>
            </div>
          </div>
        </div>

        {/* 기간 선택 */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            이용 기간을 선택해주세요
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 3, 6, 12].map((m) => {
              const price = calculatePrice(m);
              const originalPrice = m * MONTHLY_PRICE;
              const hasDiscount = price < originalPrice;
              
              return (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`p-4 rounded-lg border-2 transition-all relative ${
                    months === m
                      ? 'border-green-600 bg-green-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-green-300'
                  }`}
                >
                  {hasDiscount && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {m === 6 ? '1천원↓' : '3천원↓'}
                    </div>
                  )}
                  <div className="text-2xl font-bold text-gray-800">{m}</div>
                  <div className="text-sm text-gray-600">개월</div>
                  {hasDiscount && (
                    <div className="text-xs text-red-600 font-semibold mt-1">
                      {price.toLocaleString()}원
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* 커스텀 개월 수 입력 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              또는 직접 입력
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={months}
              onChange={(e) => setMonths(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900"
              placeholder="개월 수 입력 (1-24)"
            />
          </div>
        </div>

        {/* 요금 계산 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-700">
              <span>월 이용료</span>
              <span className="font-semibold">{MONTHLY_PRICE.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>선택 기간</span>
              <span className="font-semibold">{months}개월</span>
            </div>
            {hasDiscount && (
              <>
                <div className="flex justify-between items-center text-gray-500">
                  <span className="line-through">정가</span>
                  <span className="line-through">{originalPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span className="font-bold">할인</span>
                  <span className="font-bold">-{discount.toLocaleString()}원</span>
                </div>
              </>
            )}
            <div className="border-t border-green-300 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">총 결제 금액</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-green-600">
                    {totalPrice.toLocaleString()}원
                  </span>
                  {hasDiscount && (
                    <div className="text-xs text-green-700 font-semibold mt-1">
                      🎉 {discount.toLocaleString()}원 절약!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 계좌 정보 */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            입금 계좌 정보
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <div>
                <div className="text-sm text-gray-600 mb-1">은행</div>
                <div className="text-xl font-bold text-gray-900">신한은행</div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">계좌번호</div>
                <div className="text-xl font-bold text-gray-900 font-mono">110574383789</div>
              </div>
              <button
                onClick={handleCopyAccount}
                className="ml-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                복사
              </button>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <div>
                <div className="text-sm text-gray-600 mb-1">입금 금액</div>
                <div className="text-2xl font-bold text-green-600">{totalPrice.toLocaleString()}원</div>
              </div>
            </div>
          </div>
        </div>

        {/* 입금자명 입력 */}
        <div className="bg-white border-2 border-blue-300 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            입금자명 입력 <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            value={depositorName}
            onChange={(e) => setDepositorName(e.target.value)}
            placeholder="입금하실 때 사용할 이름을 입력해주세요"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 입금 시 사용하실 이름과 동일하게 입력해주세요 (확인 시 사용됩니다)
          </p>
        </div>

        {/* 안내 사항 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-yellow-900 mb-2">입금 안내</p>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• 위에 입력하신 입금자명으로 입금해주세요</li>
                <li>• 입금 확인 후 관리자가 입력하신 연락처로 안내드립니다</li>
                <li>• 입금 후 24시간 이내에 프리미엄 초대가 완료됩니다</li>
                <li>• 문의사항이 있으시면 연락처로 문의해주세요</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            메인으로
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            신청 완료
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}

