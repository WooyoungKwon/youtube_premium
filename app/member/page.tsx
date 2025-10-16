'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MemberContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [memberData, setMemberData] = useState<{ id: string; email: string; expiryDate: string; willRenew: boolean; renewMonths: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [willRenew, setWillRenew] = useState(false);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewalMessage, setRenewalMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCompactView, setShowCompactView] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/');
      return;
    }

    const fetchMemberData = async () => {
      try {
        const response = await fetch(`/api/members/check-expiry?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          setMemberData(data);
          setWillRenew(data.willRenew || false);
          setRenewMonths(data.renewMonths || 1);
          // 이미 설정이 저장되어 있으면 컴팩트 뷰로 시작
          setShowCompactView(true);
        } else {
          setError(data.error || '회원 정보를 불러올 수 없습니다.');
        }
      } catch (error) {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [email, router]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('110574383789');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSaveRenewal = async () => {
    if (!memberData) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/members/update-renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: memberData.email,
          willRenew,
          renewMonths: willRenew ? renewMonths : null,
          renewalMessage: willRenew && renewalMessage.trim() ? renewalMessage.trim() : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveMessage({ type: 'success', text: '갱신 설정이 저장되었습니다.' });
        setShowCompactView(true);
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: data.error || '저장에 실패했습니다.' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">회원 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !memberData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error || '회원 정보를 찾을 수 없습니다.'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Toast Message */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">계좌번호가 복사되었습니다</span>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4">
            <img src="/logo.png" alt="Linkuni" className="h-16 w-auto object-contain" />
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">
            홈으로
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
            회원 전용 페이지
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            환영합니다! 👋
          </h1>
          <p className="text-lg text-gray-600">
            {memberData.email}
          </p>
        </div>

        {/* Expiry Date Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">멤버십 정보</h2>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-2">다음 결제 예정일</p>
            <p className="text-4xl font-bold text-blue-600 mb-4">
              {new Date(memberData.expiryDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>멤버십 활성 상태</span>
            </div>
          </div>
        </div>

        {/* Renewal Settings Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">갱신 설정</h2>
          </div>

          {showCompactView ? (
            /* 컴팩트 뷰 - 저장 후 */
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {willRenew ? (
                      <>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">갱신 예정</h3>
                          <p className="text-gray-700">
                            <span className="text-xl sm:text-2xl font-bold text-blue-600">{renewMonths}개월</span>
                            <span className="text-xs sm:text-sm ml-2">자동 갱신 설정됨</span>
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            만료일 이후 {renewMonths}개월 연장됩니다
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">갱신 안함</h3>
                          <p className="text-sm sm:text-base text-gray-700">만료일 이후 자동 갱신되지 않습니다</p>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCompactView(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-white border-2 border-blue-300 text-blue-600 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-50 transition flex-shrink-0"
                  >
                    변경하기
                  </button>
                </div>
              </div>

              {willRenew && (
                <>
                  <div className="bg-white rounded-xl p-3 sm:p-4 border-2 border-gray-200">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">결제 예정 금액</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 text-xs sm:text-sm">총 금액</span>
                          <span className="font-bold text-blue-600 text-base sm:text-xl">
                            {(() => {
                              const prices: { [key: number]: number } = { 1: 4000, 2: 8000, 3: 12000, 6: 23000, 12: 45000 };
                              return (prices[renewMonths] || renewMonths * 4000).toLocaleString();
                            })()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 계좌번호 안내 */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 border-2 border-amber-200">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">입금 계좌 안내</h4>
                        <div className="space-y-2">
                          <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-amber-200">
                            <div className="space-y-1.5 sm:space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">은행</span>
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm">신한은행</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">예금주</span>
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm">권우영</span>
                              </div>
                              <div className="flex flex-col gap-1.5 sm:gap-2 pt-1">
                                <span className="text-gray-600 text-xs sm:text-sm">계좌번호</span>
                                <div className="flex items-center justify-between gap-2 bg-amber-50 rounded px-2 sm:px-2.5 py-1.5">
                                  <span className="font-bold text-amber-600 text-xs sm:text-sm break-all">110574383789</span>
                                  <button
                                    onClick={handleCopyAccount}
                                    className="p-1.5 hover:bg-amber-100 rounded transition flex-shrink-0"
                                    title="계좌번호 복사"
                                  >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 px-1">
                            <p>💳 만료일에 계좌로 입금해주시면 자동으로 갱신됩니다</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* 기존 뷰 - 설정 변경 */
            <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
              <div className="flex items-start gap-2 sm:gap-3 mb-4">
                <input
                  type="checkbox"
                  id="willRenewCheck"
                  checked={willRenew}
                  onChange={(e) => setWillRenew(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="willRenewCheck" className="flex-1 cursor-pointer min-w-0">
                  <span className="text-base sm:text-lg font-semibold text-gray-900 block mb-1">멤버십 갱신하기</span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    만료일 이후에도 멤버십을 계속 사용하시려면 체크해주세요.
                  </span>
                </label>
              </div>

              {willRenew && (
                <div className="mt-4 sm:mt-6 pl-0 sm:pl-8 space-y-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">
                    갱신 기간 선택
                  </label>

                  {/* 카드 형식의 옵션들 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    {[
                      { months: 1, price: 4000, discount: null },
                      { months: 2, price: 8000, discount: null },
                      { months: 3, price: 12000, discount: null },
                      { months: 6, price: 23000, discount: '1,000원 할인' },
                      { months: 12, price: 45000, discount: '3,000원 할인' }
                    ].map((option) => (
                      <button
                        key={option.months}
                        onClick={() => setRenewMonths(option.months)}
                        className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          renewMonths === option.months
                            ? 'border-blue-500 bg-blue-50 shadow-lg sm:scale-105'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {/* 할인 뱃지 */}
                        {option.discount && (
                          <div className="absolute -top-1.5 sm:-top-2 -left-1.5 sm:-left-2 px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">
                            {option.discount}
                          </div>
                        )}

                        {/* 선택 체크 아이콘 */}
                        {renewMonths === option.months && (
                          <div className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="text-center">
                          <div className={`text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1 ${
                            renewMonths === option.months ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {option.months}
                          </div>
                          <div className={`text-[10px] sm:text-xs mb-1.5 sm:mb-2 ${
                            renewMonths === option.months ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            개월
                          </div>
                          <div className={`text-xs sm:text-sm font-semibold ${
                            renewMonths === option.months ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            {option.price.toLocaleString()}원
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                            월 {Math.round(option.price / option.months).toLocaleString()}원
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* 가격 안내 */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-200">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">선택하신 요금 안내</h4>
                        <div className="space-y-1 text-xs sm:text-sm text-gray-700">
                          <div className="flex justify-between items-center">
                            <span>갱신 기간</span>
                            <span className="font-semibold">{renewMonths}개월</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>총 결제 금액</span>
                            <span className="font-bold text-blue-600 text-base sm:text-lg">
                              {(() => {
                                const prices: { [key: number]: number } = { 1: 4000, 2: 8000, 3: 12000, 6: 23000, 12: 45000 };
                                return (prices[renewMonths] || renewMonths * 4000).toLocaleString();
                              })()}원
                            </span>
                          </div>
                          <div className="pt-1.5 sm:pt-2 border-t border-blue-200 text-[10px] sm:text-xs text-gray-600">
                            💡 만료일 이후 자동으로 {renewMonths}개월 연장됩니다
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 관리자에게 메시지 */}
              {willRenew && (
                <div className="mt-4">
                  <label htmlFor="renewal-message" className="block text-sm font-medium text-gray-700 mb-2">
                    관리자에게 메시지 (선택사항)
                  </label>
                  <textarea
                    id="renewal-message"
                    value={renewalMessage}
                    onChange={(e) => setRenewalMessage(e.target.value)}
                    placeholder="입금자명이 다르거나 특이사항이 있으면 여기에 남겨주세요."
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">{renewalMessage.length}/500자</p>
                </div>
              )}
            </div>

            {saveMessage && (
              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                saveMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {saveMessage.type === 'success' ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-medium text-sm sm:text-base">{saveMessage.text}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveRenewal}
              disabled={isSaving}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  저장 중...
                </span>
              ) : (
                '설정 저장하기'
              )}
            </button>
          </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">문의사항이 있으신가요?</p>
          <button
            onClick={() => {
              if (window.Kakao && window.Kakao.Channel) {
                window.Kakao.Channel.chat({
                  channelPublicId: '_BxlKLn'
                });
              } else {
                window.open('https://pf.kakao.com/_BxlKLn', '_blank');
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.442 1.492 4.623 3.768 6.033L5 21l5.246-2.763C10.826 18.41 11.405 18.5 12 18.5c5.523 0 10-3.477 10-8S17.523 3 12 3z"/>
            </svg>
            카카오톡 문의하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MemberPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <MemberContent />
    </Suspense>
  );
}
