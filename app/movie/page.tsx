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

    // Kakao SDK 초기화
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => {
      if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init('fd0f2e6e7067b6c9c5705962e6ca7e40');
      }
    };
    document.head.appendChild(script);
    return () => {
      clearTimeout(timer);
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, [searchParams]);

  const openKakaoChat = () => {
    if (typeof window !== 'undefined' && window.Kakao && window.Kakao.Channel) {
      window.Kakao.Channel.chat({ channelPublicId: '_BxlKLn' });
    } else {
      window.open('https://pf.kakao.com/_BxlKLn', '_blank');
    }
  };

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
              Coming Soon
            </span>
          </h1>

          {/* 설명 */}
          <p className="text-xl md:text-2xl text-white/90 mb-4 leading-relaxed font-semibold">
            서비스 준비 중입니다
          </p>
          <p className="text-lg text-white/70 mb-12">
            더 나은 서비스로 곧 찾아뵙겠습니다
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
              href="/"
              className="group px-10 py-5 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl font-bold text-xl shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>홈으로 돌아가기</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-md border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-white/50">© 2025 영화 티켓 대리 예매 서비스. All rights reserved.</p>
        </div>
      </footer>

      {/* 플로팅 카톡 버튼 */}
      <button
        onClick={openKakaoChat}
        className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 rounded-full shadow-2xl hover:shadow-3xl px-5 py-4 flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 z-50 group"
        aria-label="카카오톡 문의하기"
      >
        <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.442 1.492 4.623 3.768 6.033L5 21l5.246-2.763C10.826 18.41 11.405 18.5 12 18.5c5.523 0 10-3.477 10-8S17.523 3 12 3z" />
        </svg>
        <span className="text-gray-900 font-bold text-sm whitespace-nowrap">문의하기</span>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
      </button>

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
