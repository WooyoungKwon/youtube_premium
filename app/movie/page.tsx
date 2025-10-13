'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function MovieComingSoon() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);

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
  }, []);

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
            영화 티켓 예매 서비스
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-gradient-x">
              Coming Soon
            </span>
          </h1>

          {/* 설명 */}
          <p className="text-xl md:text-2xl text-white/80 mb-4 leading-relaxed">
            더 나은 서비스로 찾아뵙겠습니다
          </p>
          <p className="text-lg text-white/60 mb-12">
            현재 서비스 준비 중이며, 곧 만나보실 수 있습니다
          </p>

          {/* 특징 카드 */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-xl font-bold text-white mb-2">모든 극장</h3>
              <p className="text-white/70 text-sm">CGV, 메가박스, 롯데시네마 등<br />주요 극장 예매 지원 예정</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">빠른 예매</h3>
              <p className="text-white/70 text-sm">간편한 신청으로<br />빠르게 예매를 진행</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">저렴한 가격</h3>
              <p className="text-white/70 text-sm">정가 15,000원보다 저렴한<br />10,000원에 예매 가능</p>
            </div>
          </div>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={openKakaoChat}
              className="group px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl font-bold text-lg shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 flex items-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.442 1.492 4.623 3.768 6.033L5 21l5.246-2.763C10.826 18.41 11.405 18.5 12 18.5c5.523 0 10-3.477 10-8S17.523 3 12 3z" />
              </svg>
              <span>서비스 출시 알림 받기</span>
            </button>

            <Link
              href="/"
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 text-white rounded-xl font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105"
            >
              홈으로 돌아가기
            </Link>
          </div>

          {/* 추가 정보 */}
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-3">서비스 준비 중</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-2">
                  현재 영화 티켓 대리 예매 서비스를 준비하고 있습니다.
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  카카오톡으로 문의 주시면 서비스 출시 시 가장 먼저 알려드리겠습니다!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-md border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-white/50">© 2025 영화 티켓 예매 서비스. 곧 만나요!</p>
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

        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
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

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
