'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    email: '',
    name: '',
    rating: 5,
    comment: ''
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 카카오톡 채널 SDK 초기화
  useEffect(() => {
    // Kakao SDK 로드
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init('fd0f2e6e7067b6c9c5705962e6ca7e40');
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 카카오톡 채널 채팅 열기
  const openKakaoChat = () => {
    if (window.Kakao && window.Kakao.Channel) {
      window.Kakao.Channel.chat({
        channelPublicId: '_BxlKLn' // 카카오톡 채널 ID
      });
    } else {
      // SDK 로드 실패 시 대체 URL로 이동
      window.open('https://pf.kakao.com/_BxlKLn', '_blank');
    }
  };

  // 이름 마스킹 함수 (성만 보이고 이름은 **로)
  const maskName = (name: string) => {
    if (name.length <= 1) return name;
    return name[0] + '**';
  };

  // 날짜 포맷팅 (YYYY.MM.DD)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 후기 불러오기
  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 후기 작성 제출
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewMessage(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewFormData),
      });

      const data = await response.json();

      if (response.ok) {
        // 폼 초기화
        setReviewFormData({
          email: '',
          name: '',
          rating: 5,
          comment: ''
        });

        // 후기 목록 새로고침
        await fetchReviews();

        // 모달 닫기
        setShowReviewModal(false);
        setReviewMessage(null);

        // 성공 메시지는 닫힌 후에 표시 (선택사항)
        // alert('후기가 성공적으로 작성되었습니다! 감사합니다.');
      } else {
        setReviewMessage({
          type: 'error',
          text: data.error || '후기 작성에 실패했습니다.'
        });
      }
    } catch (error) {
      setReviewMessage({
        type: 'error',
        text: '네트워크 오류가 발생했습니다.'
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

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
          
          <div className="flex flex-col gap-6 justify-center items-center">
            {/* Primary CTA - 신청하기 */}
            <Link
              href="/apply"
              className="group relative px-10 py-5 bg-gradient-to-r from-red-600 via-red-500 to-pink-500 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              onClick={(e) => {
                e.preventDefault();
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
                  router.push('/apply');
                }, 300);
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>지금 신청하기</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            {/* Secondary CTAs - 요금제/후기 */}
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                onClick={() => {
                  const element = document.getElementById('pricing-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 text-gray-700 hover:text-red-600 font-semibold transition-all duration-300 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="border-b-2 border-transparent group-hover:border-red-600 transition-all">요금제 보기</span>
              </button>

              <span className="text-gray-300">|</span>

              <button
                onClick={() => {
                  const element = document.getElementById('reviews-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="border-b-2 border-transparent group-hover:border-blue-600 transition-all">후기 보러 가기</span>
              </button>
            </div>
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
                  </div>
                  <p className="text-gray-700 mb-3">
                    신청 시 추천인을 입력하면 <span className="font-bold text-purple-600">1개월 추가 혜택</span>을 드립니다!
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>기존 회원의 추천을 받아 신규 가입하는 경우에만 참여가 가능합니다</span>
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
        <div id="reviews-section" className="mt-20 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">이용자 후기</h2>
            <p className="text-gray-600 mb-6">*실제 서비스를 제공 받고 계신 사용자 분들의 후기입니다</p>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              후기 작성하기 ✍️
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">후기를 불러오는 중...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600 mb-4">아직 작성된 후기가 없습니다</p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                첫 후기 작성하기
              </button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
                  >
                    {/* 상단: 별점과 날짜 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>

                    {/* 리뷰 내용 */}
                    <p className="text-gray-700 leading-relaxed mb-4 line-clamp-4">
                      "{review.comment}"
                    </p>

                    {/* 작성자 정보 */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {review.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{maskName(review.name)}</p>
                        <p className="text-xs text-gray-500">이용자</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">
            © 2025 YouTube Premium 공유 서비스. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 플로팅 카카오톡 문의 버튼 */}
      <button
        onClick={openKakaoChat}
        className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 rounded-full shadow-2xl hover:shadow-3xl px-5 py-4 flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 z-40"
        aria-label="카카오톡 문의하기"
      >
        <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.442 1.492 4.623 3.768 6.033L5 21l5.246-2.763C10.826 18.41 11.405 18.5 12 18.5c5.523 0 10-3.477 10-8S17.523 3 12 3z"/>
        </svg>
        <span className="text-gray-900 font-bold text-sm whitespace-nowrap">문의하기</span>
      </button>

      {/* 후기 작성 모달 */}
      {showReviewModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            if (!reviewSubmitting) {
              setShowReviewModal(false);
              setReviewMessage(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">서비스 후기 작성</h2>
              <button
                onClick={() => {
                  if (!reviewSubmitting) {
                    setShowReviewModal(false);
                    setReviewMessage(null);
                  }
                }}
                disabled={reviewSubmitting}
                className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-6">
              {/* 이메일 */}
              <div>
                <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="modal-email"
                  value={reviewFormData.email}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                  disabled={reviewSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 disabled:bg-gray-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  이메일은 공개되지 않으며, 중복 후기 방지 용도로만 사용됩니다.
                </p>
              </div>

              {/* 이름 */}
              <div>
                <label htmlFor="modal-name" className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="modal-name"
                  value={reviewFormData.name}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, name: e.target.value })}
                  placeholder="홍길동"
                  required
                  disabled={reviewSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 disabled:bg-gray-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  이름은 첫 글자만 공개됩니다. (예: 홍**)
                </p>
              </div>

              {/* 별점 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  별점 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                      disabled={reviewSubmitting}
                      className="transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                    >
                      <svg
                        className={`w-10 h-10 ${
                          star <= reviewFormData.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        } transition-colors`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-3 text-xl font-bold text-gray-700">
                    {reviewFormData.rating}점
                  </span>
                </div>
              </div>

              {/* 후기 내용 */}
              <div>
                <label htmlFor="modal-comment" className="block text-sm font-medium text-gray-700 mb-2">
                  후기 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="modal-comment"
                  value={reviewFormData.comment}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                  placeholder="서비스 이용 후기를 작성해주세요. 좋았던 점, 개선되었으면 하는 점 등을 자유롭게 작성하실 수 있습니다."
                  required
                  disabled={reviewSubmitting}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none text-gray-900 disabled:bg-gray-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  최소 10자 이상 작성해주세요.
                </p>
              </div>

              {/* 메시지 */}
              {reviewMessage && (
                <div
                  className={`p-4 rounded-lg ${
                    reviewMessage.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {reviewMessage.type === 'success' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{reviewMessage.text}</span>
                  </div>
                </div>
              )}

              {/* 안내 사항 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">후기 작성 안내</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• 한 이메일당 하나의 후기만 작성할 수 있습니다.</li>
                      <li>• 작성된 후기는 즉시 공개됩니다.</li>
                      <li>• 이름은 개인정보 보호를 위해 첫 글자만 표시됩니다.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!reviewSubmitting) {
                      setShowReviewModal(false);
                      setReviewMessage(null);
                    }
                  }}
                  disabled={reviewSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting || reviewFormData.comment.length < 10}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {reviewSubmitting ? '작성 중...' : '후기 작성하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
