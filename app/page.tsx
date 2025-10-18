'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { captureReferralFromURL } from '@/lib/referral';

function HomeContent() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Linkuni" className="h-16 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <a href="/vendor" className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium">
              판매자
            </a>
            <a href="/admin" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">
              관리자
            </a>
          </div>
        </div>
      </nav>

      <div className={`max-w-6xl mx-auto px-4 py-20 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            원하시는 서비스를 <br className="md:hidden" />
            <span className="bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">선택해주세요</span>
          </h1>
          <p className="text-xl text-gray-600 mt-6">편리하고 저렴한 구독 서비스</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* YouTube Premium 카드 */}
          <Link
            href="/youtube"
            className={`group relative bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-10 border-2 border-red-200 hover:border-red-400 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="absolute top-6 right-6">
              <span className="bg-red-500 text-white text-sm px-4 py-1.5 rounded-full font-bold shadow-lg">인기</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-14 h-14 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-3">YouTube Premium</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">광고 없이 무제한 음악 & 동영상을<br />최저가로 즐기세요</p>

              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">🚫 광고 차단</span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">🎵 유튜브 뮤직</span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">💰 월 3,750원~</span>
              </div>

              <div className="flex items-center gap-3 text-red-600 font-bold text-lg group-hover:gap-4 transition-all">
                <span>자세히 보기</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 영화 티켓 대리 예매 카드 - 비활성화 */}
          <div
            className={`group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-10 border-2 border-gray-300 shadow-2xl transition-all duration-500 opacity-60 cursor-not-allowed ${
              isVisible ? 'translate-y-0 opacity-60' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="absolute top-6 right-6">
              <span className="bg-gray-500 text-white text-sm px-4 py-1.5 rounded-full font-bold shadow-lg">준비중</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-500 mb-3">영화 티켓 대리 예매</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">정가에 비해 30% 할인된 가격으로<br />편리하게 영화 티켓을 예매해드립니다</p>

              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-sm font-semibold">🎬 CGV/메가박스/롯데</span>
                <span className="px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-sm font-semibold">⚡ 빠른 예매</span>
              </div>

              <div className="flex items-center gap-3 text-gray-400 font-bold text-lg">
                <span>서비스 준비 중</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>}>
      <HomeContent />
    </Suspense>
  );
}
