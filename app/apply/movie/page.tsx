'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MovieApply() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [theater, setTheater] = useState('');
  const [movieTitle, setMovieTitle] = useState('');
  const [showDate, setShowDate] = useState('');
  const [showTime, setShowTime] = useState('');
  const [seats, setSeats] = useState('2');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    setIsPageReady(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
          platform: 'movie',
          movieDetails: {
            theater,
            movieTitle,
            showDate,
            showTime,
            seats: parseInt(seats),
            additionalInfo
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/payment?requestId=${data.id}&email=${encodeURIComponent(email)}&platform=movie`);
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

  if (!isPageReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4 transition-opacity duration-500 relative ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
            <div className="inline-block w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">신청 처리 중...</h3>
            <p className="text-sm text-gray-600">잠시만 기다려주세요</p>
          </div>
        </div>
      )}

      <div className={`max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            영화 티켓 대리 예매
          </h1>
          <p className="text-gray-600 text-sm">편하게 영화 티켓을 예매해드립니다</p>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl">
          <h3 className="font-bold text-purple-900 mb-2">💡 서비스 안내</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• 원하시는 영화관, 영화, 날짜/시간을 입력해주세요</li>
            <li>• 관리자가 확인 후 예매 진행 및 카톡으로 안내드립니다</li>
            <li>• 예매 수수료는 별도 안내드립니다</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
              />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="theater" className="block text-sm font-medium text-gray-700 mb-2">
                영화관 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="theater"
                value={theater}
                onChange={(e) => setTheater(e.target.value)}
                placeholder="예: CGV 강남, 메가박스 코엑스"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="movieTitle" className="block text-sm font-medium text-gray-700 mb-2">
                영화 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="movieTitle"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                placeholder="예: 범죄도시4"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="showDate" className="block text-sm font-medium text-gray-700 mb-2">
                관람 날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="showDate"
                value={showDate}
                onChange={(e) => setShowDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="showTime" className="block text-sm font-medium text-gray-700 mb-2">
                관람 시간 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="showTime"
                value={showTime}
                onChange={(e) => setShowTime(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-2">
                인원 <span className="text-red-500">*</span>
              </label>
              <select
                id="seats"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}명</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
              추가 요청사항 <span className="text-gray-400 text-xs">(선택)</span>
            </label>
            <textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="좌석 위치 선호도, 특별관(4DX, IMAX 등) 요청 등을 입력해주세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
            />
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
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? '처리 중...' : '예매 신청하기'}
          </button>
        </form>

        <div className="mt-6 text-center px-4">
          <p className="text-sm text-gray-500 break-keep">
            관리자가 신청을 확인한 후 카카오톡으로 예매 내역과 결제 안내를 보내드립니다.
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
    </div>
  );
}
