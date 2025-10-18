'use client';

export default function MovieApply() {
  // 영화 예매 서비스 비활성화
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">서비스 준비 중</h1>
          <p className="text-xl text-white/80 mb-8">영화 티켓 예매 서비스는 현재 준비 중입니다.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
