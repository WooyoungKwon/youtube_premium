'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralEmail, setReferralEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [accountType, setAccountType] = useState('user');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAdminInfo, setShowAdminInfo] = useState(false);
  const [referralValidation, setReferralValidation] = useState<{ status: 'idle' | 'checking' | 'valid' | 'invalid'; message: string }>({ status: 'idle', message: '' });

  useEffect(() => {
    // 페이지 로딩 완료 표시
    setIsPageReady(true);

    // 페이지 로딩 후 약간의 지연을 두고 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // ESC 키로 이미지 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  // 추천인 이메일 실시간 검증
  useEffect(() => {
    if (!referralEmail) {
      setReferralValidation({ status: 'idle', message: '' });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setReferralValidation({ status: 'checking', message: '확인 중...' });

      try {
        const response = await fetch('/api/verify-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: referralEmail })
        });

        const data = await response.json();

        if (data.valid) {
          setReferralValidation({ status: 'valid', message: '✓ 확인 되었습니다. 혜택이 제공됩니다.' });
        } else {
          setReferralValidation({ status: 'invalid', message: '✗ 존재하지 않는 이메일입니다' });
        }
      } catch (error) {
        setReferralValidation({ status: 'invalid', message: '✗ 확인할 수 없습니다' });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [referralEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 추천인 이메일이 있는 경우 검증 확인
    if (referralEmail && referralValidation.status !== 'valid') {
      setMessage({
        type: 'error',
        text: '추천인 이메일을 확인해주세요. 등록된 회원의 이메일만 입력 가능합니다.'
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: accountType === 'user' ? email : null,
          phone,
          referralEmail: referralEmail || undefined,
          planType: 'family',
          accountType: accountType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const emailParam = accountType === 'admin' ? '관리자 제공 계정' : email;
        router.push(`/payment?requestId=${data.id}&email=${encodeURIComponent(emailParam)}&accountType=${accountType}`);
      } else {
        setMessage({
          type: 'error',
          text: data.error || '신청에 실패했습니다.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '네트워크 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 페이지가 준비되지 않았을 때 로딩 화면 표시
  if (!isPageReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-300 border-t-red-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4 transition-opacity duration-500 relative ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
    >
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
            <div className="inline-block w-12 h-12 border-4 border-red-300 border-t-red-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">신청 처리 중...</h3>
            <p className="text-sm text-gray-600">잠시만 기다려주세요</p>
          </div>
        </div>
      )}
      <div className={`max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            YouTube Premium
          </h1>
        </div>

        {/* Admin Account Promotion Section */}
        <div className="mb-6 space-y-4">
          <>
            {accountType === 'user' ? (
              <div className={`relative p-4 pt-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-md ${isVisible ? 'animate-slide-in-right' : ''}`}>
                {/* 심플한 이벤트 배지 */}
                <div className="absolute -top-3 -right-3 z-50">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 relative z-50">
                      <span className="animate-pulse">✨</span>
                      <span>깜짝 할인</span>
                    </div>
                    {/* 펄스 효과 */}
                    <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-40 -z-10"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                      <span className="text-lg">🎁</span>
                      관리자 제공 계정 사용하면 최대 9,000원 할인 !
                    </h3>
                    <p className="text-xs text-blue-700 mt-1">지금 바로 혜택을 받아보세요</p>
                  </div>

                  {/* 설명 펼치기 영역 */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${showAdminInfo ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3 mb-3">
                      <h4 className="text-sm font-bold text-blue-900 mb-2">💡 관리자 제공 계정이란?</h4>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        관리자가 생성한 가족장 유튜브 프리미엄 계정입니다. 이미 계정에 프리미엄이 활성화 되어 있어, 바로 사용하실 수 있습니다.
                      </p>

                      <div className="p-2 bg-blue-100 border-l-4 border-blue-400 rounded">
                        <h4 className="font-semibold text-blue-800 text-xs mb-1">🤔 누가 사용하면 좋나요?</h4>
                        <ul className="space-y-0.5 text-xs text-blue-700 list-disc list-inside">
                          <li>12개월 이내 가족 계정 가입 이력이 있으신 분</li>
                          <li>유튜브 정책으로 본 계정 정지가 걱정되시는 분</li>
                          <li>빠르게 프리미엄을 이용하고 싶으신 분</li>
                        </ul>
                      </div>

                      <div className="p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="text-xs text-yellow-800">
                          <strong>⚠️ 중요:</strong> 새 계정이므로 기존 구독 목록, 시청 기록은 이전되지 않습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!showAdminInfo) {
                        setShowAdminInfo(true);
                      } else {
                        setIsAnimating(true);
                      }
                    }}
                    disabled={isAnimating}
                    className="w-full px-4 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {showAdminInfo ? '혜택 적용하기' : '자세히 보고 적용하기'}
                  </button>
                </div>
                {isAnimating && (
                  <div
                    className="absolute inset-0 bg-green-300 rounded-xl animate-fill"
                    onAnimationEnd={() => {
                      setAccountType('admin');
                      setIsAnimating(false);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="p-4 bg-green-300 border-2 border-green-400 rounded-xl shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-green-800">✓</span>
                    <h3 className="font-bold text-sm text-green-900">혜택 적용됨</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAccountType('user')}
                    className="w-full px-4 py-2.5 text-sm bg-white border-2 border-green-600 text-green-700 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    내 계정 직접 입력
                  </button>
                </div>
              </div>
            )}
          </>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className={`transition-opacity duration-300 ${accountType === 'admin' ? 'opacity-40' : 'opacity-100'}`}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              유튜브 이메일 주소 {accountType === 'user' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              id="email"
              value={accountType === 'admin' ? '' : email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={accountType === 'admin' ? '관리자 제공 계정 선택됨' : 'your.email@example.com'}
              required={accountType === 'user'}
              disabled={accountType === 'admin'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-gray-600">
              {accountType === 'user' ? '12개월 내에 가족 계정에 가입한 적이 없던 이메일이어야 합니다.' : '새로운 계정이 제공되므로 이메일을 입력할 필요가 없습니다.'}
            </p>
          </div>

          <div>
            <label htmlFor="referralEmail" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              추천인 이메일 주소 <span className="text-gray-400 text-xs">(선택)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                id="referralEmail"
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                placeholder="추천인의 유튜브 이메일 (1개월 추가 혜택 🎁)"
                className={`w-full px-4 py-3 pr-24 border-2 rounded-lg focus:ring-2 outline-none transition text-gray-900 ${referralValidation.status === 'valid'
                    ? 'border-green-300 bg-green-50/30 focus:ring-green-500 focus:border-transparent'
                    : referralValidation.status === 'invalid'
                      ? 'border-red-300 bg-red-50/30 focus:ring-red-500 focus:border-transparent'
                      : 'border-purple-300 bg-purple-50/30 focus:ring-purple-500 focus:border-transparent'
                  }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {referralValidation.status === 'checking' && (
                  <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                )}
                {referralValidation.status === 'valid' && (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {referralValidation.status === 'invalid' && (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {referralEmail && referralValidation.status === 'valid' && (
                  <span className="text-purple-600 text-xs font-semibold whitespace-nowrap">+1개월 🎁</span>
                )}
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {referralValidation.status === 'valid' && (
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {referralValidation.message}
                </p>
              )}
              {referralValidation.status === 'invalid' && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {referralValidation.message}
                </p>
              )}
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <strong>기존 회원의 이메일만</strong> 입력 가능합니다. (실시간 검증)
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-gray-900"
            />

            {/* 전화번호로 친구추가 허용 안내 */}
            <details className="mt-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <summary className="px-4 py-3.5 cursor-pointer hover:bg-yellow-100/50 transition-all flex items-center justify-between text-sm font-semibold text-yellow-900 list-none select-none">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-800">전화번호 입력 전 필독! 📱</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-yellow-600 font-medium hidden sm:inline">자세히 보기</span>
                  <svg className="w-5 h-5 text-yellow-700 transition-transform duration-300 ease-in-out group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>

              <div className="px-4 pb-4 pt-2 space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  카카오톡 <strong className="text-yellow-800">전화번호로 친구추가</strong>가 차단되어 있으면 연락을 드릴 수가 없어요😢<br />
                  아래 방법으로 설정을 변경해주세요!
                </p>

                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">📱 설정 방법:</p>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                      <li>카카오톡 앱 실행</li>
                      <li>오른쪽 위 톱니바퀴 → <strong>친구 관리 클릭 🖱️</strong></li>
                      <li><strong>전화번호로 친구추가 허용</strong> 켜기 ✅</li>
                    </ol>
                  </div>

                  {/* 이미지 안내 섹션 */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">🖼️ 설정 화면 예시 (클릭하면 크게 보기):</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                        onClick={() => setSelectedImage('/kakao-phone-setting-1.png')}
                      >
                        <img
                          src="/kakao-phone-setting-1.png"
                          alt="카카오톡 설정 메뉴"
                          className="w-full h-auto object-cover"
                        />
                        <div className="bg-gray-100 px-2 py-1.5 text-center">
                          <p className="text-xs text-gray-700 font-medium">① 설정 메뉴</p>
                        </div>
                      </div>
                      <div
                        className="rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                        onClick={() => setSelectedImage('/kakao-phone-setting-2.png')}
                      >
                        <img
                          src="/kakao-phone-setting-2.png"
                          alt="전화번호로 친구추가 허용"
                          className="w-full h-auto object-cover"
                        />
                        <div className="bg-gray-100 px-2 py-1.5 text-center">
                          <p className="text-xs text-gray-700 font-medium">② 전화번호 허용</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
                }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? '처리 중...' : '신청하기'}
          </button>
        </form>

        <div className="mt-6 text-center px-4">
          <p className="text-sm text-gray-500 break-keep">
            관리자가 신청을 확인한 후 카카오톡으로 안내를 보내드립니다.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <a
            href="/#youtube"
            className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            YouTube 섹션으로 돌아가기
          </a>
        </div>
      </div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-lg w-full animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:bg-gray-100 active:scale-95 transition-all sm:-top-2 sm:-right-8"
              aria-label="닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <img
              src={selectedImage}
              alt="설정 화면 크게 보기"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              onClick={() => setSelectedImage(null)}
            />

            <p className="text-white text-center mt-4 text-sm opacity-80">
              화면을 터치하면 닫힙니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
