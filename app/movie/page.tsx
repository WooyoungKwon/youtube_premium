'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { captureReferralFromURL } from '@/lib/referral';

function MovieServiceContent() {
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL에서 ref 파라미터 캡처 및 쿠키에 저장
    captureReferralFromURL(searchParams);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 relative overflow-hidden">
      {/* 배경 애니메이션 요소들 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 영화 필름 스트립 애니메이션 */}
        <div className="absolute top-20 left-0 w-full opacity-10">
          <div className="animate-scroll-horizontal flex gap-8">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-16 h-24 border-4 border-white/50 rounded-lg bg-white/10" />
            ))}
          </div>
        </div>

        {/* 팝콘 애니메이션 */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-float-popcorn opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            >
              🍿
            </div>
          ))}
        </div>

        {/* 별 반짝임 효과 */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Linkuni" className="h-16 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-white/80 hover:text-white transition text-sm font-medium">홈</a>
            <a href="/admin" className="text-white/80 hover:text-white transition text-sm font-medium">관리자</a>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className={`relative z-10 max-w-5xl mx-auto px-4 py-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center">
          {/* 영화 필름 아이콘 */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce-slow">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              {/* 원형 펄스 효과 */}
              <div className="absolute inset-0 rounded-3xl bg-purple-400 animate-ping opacity-20" />
            </div>
          </div>

          {/* 제목 */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            영화 티켓 대리 예매
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              지금 바로 신청하세요
            </span>
          </h1>

          {/* 설명 */}
          <p className="text-xl md:text-2xl text-white/90 mb-4 leading-relaxed font-semibold">
            정가 15,000원 → <span className="text-yellow-300">10,000원</span>
          </p>
          <p className="text-lg text-white/70 mb-12">
            간편한 신청으로 영화관에서 바로 사용 가능한 티켓을 받아보세요
          </p>

          {/* 특징 카드 */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-xl font-bold text-white mb-2">모든 극장 지원</h3>
              <p className="text-white/70 text-sm">CGV, 메가박스, 롯데시네마<br />주요 극장 예매 가능</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">빠른 처리</h3>
              <p className="text-white/70 text-sm">신청 후 빠르게<br />카카오톡으로 안내</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">저렴한 가격</h3>
              <p className="text-white/70 text-sm">정가보다 5,000원 저렴한<br />10,000원에 예매</p>
            </div>
          </div>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/apply/movie"
              className="group px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 rounded-xl font-bold text-xl shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 flex items-center gap-3"
            >
              <span>지금 예매 신청하기</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* 이용 방법 섹션 */}
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-3xl mx-auto mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">이용 방법</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-gray-900">
                  1
                </div>
                <h4 className="text-lg font-bold text-white mb-2">정보 입력</h4>
                <p className="text-white/70 text-sm">
                  원하시는 영화관, 영화, 날짜/시간을 입력해주세요
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-gray-900">
                  2
                </div>
                <h4 className="text-lg font-bold text-white mb-2">예매 진행</h4>
                <p className="text-white/70 text-sm">
                  관리자가 예매를 진행하고 카카오톡으로 안내드립니다
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-400 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-gray-900">
                  3
                </div>
                <h4 className="text-lg font-bold text-white mb-2">영화 관람</h4>
                <p className="text-white/70 text-sm">
                  티켓을 받으시고 영화관에서 편하게 관람하세요
                </p>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-3">안내사항</h3>
                <ul className="text-white/80 text-sm leading-relaxed space-y-2">
                  <li>• 예매 수수료는 별도로 안내드립니다</li>
                  <li>• 주말 및 공휴일에는 예매가 지연될 수 있습니다</li>
                  <li>• 특정 상영관(IMAX, 4DX 등)은 별도 문의 필요</li>
                  <li>• 문의사항은 카카오톡으로 편하게 문의해주세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-md border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-white/50">© 2025 영화 티켓 대리 예매 서비스. All rights reserved.</p>
        </div>
      </footer>

      {/* 커스텀 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes scroll-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes float-popcorn {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-scroll-horizontal {
          animation: scroll-horizontal 30s linear infinite;
        }

        .animate-float-popcorn {
          animation: float-popcorn 4s ease-in-out infinite;
        }

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function MoviePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-purple-300 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white">로딩 중...</p>
        </div>
      </div>
    }>
      <MovieServiceContent />
    </Suspense>
  );
}
