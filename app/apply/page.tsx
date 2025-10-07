'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralEmail, setReferralEmail] = useState('');
  const [planType, setPlanType] = useState<'family' | 'individual'>('family');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    // 오버레이 제거 (페이드 아웃 효과와 함께)
    const overlay = document.getElementById('page-transition-overlay');
    if (overlay) {
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      }, 100);
    }
    
    // 페이지 로드 시 페이드인 효과
    document.body.style.opacity = '1';
    setIsVisible(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          referralEmail: referralEmail || undefined,
          planType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 신청 성공 시 부드럽게 페이지 전환
        const overlay = document.createElement('div');
        overlay.id = 'page-transition-overlay';
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: white;
          opacity: 0;
          transition: opacity 0.3s ease-out;
          z-index: 9999;
          pointer-events: none;
        `;
        document.body.appendChild(overlay);
        
        requestAnimationFrame(() => {
          overlay.style.opacity = '1';
        });
        
        setTimeout(() => {
          router.push(`/payment?requestId=${data.id}&email=${encodeURIComponent(email)}`);
        }, 300);
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

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={`max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            YouTube Premium
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              요금제 선택 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPlanType('family')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  planType === 'family'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
                <div className="font-bold text-gray-900">가족 요금제</div>
                <div className="text-xs text-gray-500 mt-1">최대 5명 공유</div>
              </button>
              <button
                type="button"
                onClick={() => setPlanType('individual')}
                className={`p-4 rounded-xl border-2 transition-all relative ${
                  planType === 'individual'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
                <div className="text-2xl mb-2">🧑</div>
                <div className="font-bold text-gray-900">개인 요금제</div>
                <div className="text-xs text-gray-500 mt-1">개인 전용 계정</div>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              유튜브 이메일 주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-gray-900"
            />
            {planType === 'family' && (
              <p className="mt-2 text-xs text-gray-600">
                12개월 내에 가족 계정에 가입한 적이 없던 이메일이어야 합니다
              </p>
            )}
            {planType === 'individual' && (
              <p className="mt-2 text-xs text-purple-600 font-medium">
                ✨ 개인 요금제는 가족 계정 가입 이력이 있어도 신청 가능합니다
              </p>
            )}
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
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 bg-purple-50/30"
              />
              {referralEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-purple-600 text-sm font-semibold">+1개월 🎁</span>
                </div>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                추천인 이메일 입력 시 1개월 추가 혜택이 제공됩니다
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
              className={`p-4 rounded-lg ${
                message.type === 'success'
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
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
            href="/"
            className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            홈으로 돌아가기
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
