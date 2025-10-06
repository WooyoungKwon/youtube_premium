'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [currentReview, setCurrentReview] = useState(0);

  // 이름 마스킹 함수 (성만 보이고 이름은 **로)
  const maskName = (name: string) => {
    if (name.length <= 1) return name;
    return name[0] + '**';
  };

  const reviews = [
    {
      id: 1,
      name: "김민수",
      rating: 5,
      comment: "신청 과정도 간단하고 초대도 빨리 해주셔서 좋네요.",
      date: "2025.09.28"
    },
    {
      id: 2,
      name: "박지영",
      rating: 5,
      comment: "광고 없이 영상 보니까 너무 좋아요. 가격 대비 최고의 효율이 아닌가...",
      date: "2025.09.25"
    },
    {
      id: 3,
      name: "이준호",
      rating: 5,
      comment: "월 4000원에 유튜브 뮤직까지 개꿀이네요",
      date: "2025.09.22"
    },
    {
      id: 4,
      name: "최수진",
      rating: 5,
      comment: "국적 변경 없이 바로 가입 가능하고, 관리자 응대도 친절하고 빠릅니다.",
      date: "2025.09.20"
    },
    {
      id: 5,
      name: "정태윤",
      rating: 5,
      comment: "다른 곳보다 훨씬 저렴하네요. 가성비가 너무 좋은 것 같습니다 !",
      date: "2025.09.18"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 4000); // 4초마다 자동 슬라이드

    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <span className="text-gray-900 font-bold text-xl">YouTube Premium</span>
          </div>
          <a href="/admin" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">
            관리자
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
              ✨ 최저가 프리미엄 멤버십
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            YouTube Premium을
            <br />
            <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              더 저렴하게
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
            광고 없는 동영상, 백그라운드 재생, 오프라인 저장
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
            3,000원 대의 가격으로 프리미엄 혜택을 누리세요
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/apply"
              className="group relative px-8 py-4 bg-gradient-to-r from-red-600 via-red-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              onClick={(e) => {
                e.preventDefault();
                // 흰색 오버레이 생성
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
                
                // 페이드 아웃 시작
                requestAnimationFrame(() => {
                  overlay.style.opacity = '1';
                });
                
                // 페이지 전환
                setTimeout(() => {
                  router.push('/apply');
                }, 300);
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>지금 신청하기</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <button
              onClick={() => {
                const element = document.getElementById('pricing-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-300 hover:border-red-500 hover:text-red-600 transition-all duration-300 hover:shadow-lg"
            >
              요금제 보기
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 text-6xl flex items-center justify-center leading-none">🚫</div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">광고 없는 시청</h3>
            <p className="text-gray-600">중단 없이 영상을 감상하세요</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100 text-center">
            <div className="mb-4 flex justify-center">
              <img 
                src="/youtube-music-icon.png" 
                alt="YouTube Music" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">YouTube Music 무료</h3>
            <p className="text-gray-600">음악 스트리밍 무제한 이용</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100 text-center">
            <div className="mb-4 flex justify-center">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">VPN 없이 가입</h3>
            <p className="text-gray-600">복잡한 절차 없이 간편하게</p>
          </div>
        </div>

        <div id="pricing-section" className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 shadow-2xl border border-gray-200 max-w-4xl mx-auto scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">요금제 종류</h2>
            <p className="text-gray-600">장기 구독 시 더욱 저렴하게!</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition cursor-pointer">
              <div className="text-sm font-semibold text-gray-600 mb-2">1개월</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">4,000원</div>
              <div className="text-xs text-gray-500">월 4,000원</div>
            </div>
            
            <div className="bg-white border-2 border-green-500 rounded-2xl p-6 hover:border-green-600 transition cursor-pointer relative shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-md">
                💰 1천원 할인
              </div>
              <div className="text-sm font-semibold text-green-600 mb-2">6개월</div>
              <div className="text-3xl font-bold text-green-600 mb-1">23,000원</div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400 line-through">24,000원</div>
                <div className="text-xs text-green-600 font-semibold">월 3,833원</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-500 rounded-2xl p-6 hover:border-red-600 transition cursor-pointer relative shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-md">
                🔥 3천원 할인
              </div>
              <div className="text-sm font-semibold text-red-600 mb-2">12개월</div>
              <div className="text-3xl font-bold text-red-600 mb-1">45,000원</div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400 line-through">48,000원</div>
                <div className="text-xs text-red-600 font-semibold">월 3,750원</div>
              </div>
            </div>
          </div>
          
          {/* 추천인 혜택 섹션 */}
          <div className="mb-6 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 rounded-2xl p-6 relative overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-200 rounded-full blur-3xl opacity-30"></div>

            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🎁</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900">추천인 혜택</h3>
                    <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">+1개월 무료</span>
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                      10월 한정 🔥
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    신청 시 추천인을 입력하면 <span className="font-bold text-purple-600">1개월 추가 혜택</span>을 드립니다!
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>신청 페이지에서 추천인의 유튜브 이메일 주소를 입력해주세요</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>이벤트 기간: 2025년 10월 1일 ~ 10월 31일</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/apply')}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-5 rounded-2xl text-xl font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 cursor-pointer relative overflow-hidden group animate-pulse-slow"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              프리미엄 시작하기
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* 반짝이는 효과 */}
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>24시간 이내 초대</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>간편한 계좌이체</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>안전한 거래</span>
            </div>
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div className="mt-20 overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">이용자 후기</h2>
            <p className="text-gray-600">*실제 서비스를 제공 받고 계신 사용자 분들의 후기입니다</p>
          </div>

          {/* 무한 스크롤 컨테이너 */}
          <div className="relative">
            <div className="flex gap-6 animate-scroll">
              {/* 리뷰 카드들을 2번 반복해서 무한 스크롤 효과 */}
              {[...reviews, ...reviews].map((review, index) => (
                <div
                  key={`${review.id}-${index}`}
                  className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  {/* 별점 */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  {/* 리뷰 내용 */}
                  <p className="text-gray-700 mb-6 leading-relaxed min-h-[120px]">
                    "{review.comment}"
                  </p>

                  {/* 작성자 정보 */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{maskName(review.name)}</p>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 그라디언트 오버레이 (양쪽 끝 흐림 효과) */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">YouTube Premium 가족 구독 공유 서비스</p>
          <p className="text-gray-400 text-xs mt-2">합법적인 멤버십을 공유합니다</p>
        </div>
      </footer>
    </div>
  );
}
