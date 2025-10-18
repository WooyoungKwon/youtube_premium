'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalMembers: number;
  octoberMembers: number;
  totalYoutubeAccounts: number;
  monthlyRevenue: number;
  monthlyCost: number;
  monthlyProfit: number;
  cumulativeRevenue: number;
  pricePerMember: number;
  costPerYoutubeAccount: number;
  rupeeToKrw: number;
}

export default function YoutubeHome({ initialStats }: { initialStats: Stats }) {
  const router = useRouter();
  const [stats] = useState<Stats>(initialStats);
  const [showMemberEmailModal, setShowMemberEmailModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberEmailLoading, setMemberEmailLoading] = useState(false);
  const [memberEmailError, setMemberEmailError] = useState<string | null>(null);


  const handleMemberEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberEmailLoading(true);
    setMemberEmailError(null);
    try {
      const response = await fetch(`/api/members/check-expiry?email=${encodeURIComponent(memberEmail)}`);
      const data = await response.json();
      if (response.ok) {
        router.push(`/member?email=${encodeURIComponent(memberEmail)}`);
      } else {
        setMemberEmailError(data.error || '회원 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      setMemberEmailError('네트워크 오류가 발생했습니다.');
    } finally {
      setMemberEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Linkuni" className="h-16 w-auto object-contain" />
          </div>
          <a href="/admin" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">관리자</a>
        </div>
      </nav>

      <div className="py-4 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl md:rounded-full border-2 border-red-200 shadow-xl py-4 px-4 md:px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-6 relative z-10 text-sm">
              <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                <span className="text-sm md:text-base font-bold text-red-600 uppercase tracking-wide whitespace-nowrap">실시간 가입 현황</span>
              </div>
              <div className="flex items-center justify-center gap-[clamp(0.5rem,2vw,1rem)]">
                <div className="flex animate-bounce-slow items-center whitespace-nowrap rounded-full border border-blue-300 bg-blue-500/10 p-[clamp(0.25rem,1vh,0.375rem)_clamp(0.5rem,2vw,0.75rem)] shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <svg className="h-[clamp(0.75rem,3vw,1rem)] w-[clamp(0.75rem,3vw,1rem)] flex-shrink-0 animate-pulse text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                  <span className="text-[clamp(0.65rem,2vw,0.75rem)] font-bold text-blue-700 mr-1">총 가입자</span>
                  <span className="tabular-nums text-[clamp(0.75rem,2.5vw,1rem)] font-black text-blue-900">{(stats.octoberMembers + 231).toLocaleString() }</span>
                  <span className="text-[clamp(0.65rem,2vw,0.75rem)] font-bold text-blue-700 ml-1">명</span>
                </div>
                <div className="flex animate-bounce-slow items-center whitespace-nowrap rounded-full border border-green-300 bg-green-500/10 p-[clamp(0.25rem,1vh,0.375rem)_clamp(0.5rem,2vw,0.75rem)] shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md" style={{ animationDelay: '0.2s' }}>
                  <svg className="h-[clamp(0.75rem,3vw,1rem)] w-[clamp(0.75rem,3vw,1rem)] flex-shrink-0 animate-pulse text-green-600" fill="currentColor" viewBox="0 0 20 20" style={{ animationDelay: '0.2s' }}><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" /></svg>
                  <span className="text-[clamp(0.65rem,2vw,0.75rem)] font-bold text-green-700 mr-1">10월 가입자</span>
                  <span className="tabular-nums text-[clamp(0.75rem,2.5vw,1rem)] font-black text-green-900">{stats.octoberMembers.toLocaleString()}</span>
                  <span className="text-[clamp(0.65rem,2vw,0.75rem)] font-bold text-green-700 ml-1">명</span>
                </div>
                <div className="flex animate-bounce-slow items-center whitespace-nowrap rounded-full border border-orange-300 bg-orange-500/10 p-[clamp(0.25rem,1vh,0.375rem)_clamp(0.5rem,2vw,0.75rem)] shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md" style={{ animationDelay: '0.4s' }}>
                  <svg className="h-[clamp(0.75rem,3vw,1rem)] w-[clamp(0.75rem,3vw,1rem)] flex-shrink-0 animate-pulse text-orange-600" fill="currentColor" viewBox="0 0 20 20" style={{ animationDelay: '0.4s' }}><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                  <span className="text-[clamp(0.65rem,2vw,0.75rem)] font-bold text-orange-700 mr-1">누적</span>
                  <span className="tabular-nums text-[clamp(0.75rem,2.5vw,1rem)] font-black text-orange-900">{Math.floor(stats.totalMembers * 3.5).toLocaleString()}</span>
                  <span className="text-[clamp(0.65rem,2vw,0.75rem)] font-bold text-orange-700 ml-1">개월</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-12">
        <div className="text-center mb-16">
          <div className="inline-block mb-6"><span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">✨ 최저가 프리미엄 멤버십</span></div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">YouTube Premium을<br /><span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">더 저렴하게</span><p className="text-lg text-gray-600">모든 기능을 최저가로 즐기세요</p></h1>
          {/* 프리미엄 혜택 카드 */}
          <div className="flex flex-wrap justify-center gap-4 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl hover:border-red-300 transition-all hover:shadow-md"><div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><span className="text-xl">🚫</span></div><span className="text-sm font-semibold text-gray-800">광고 없는 시청</span></div>
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl hover:border-blue-300 transition-all hover:shadow-md"><div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden"><img src="/youtube-music-icon.png" alt="Music" className="w-5 h-5 object-contain" /></div><span className="text-sm font-semibold text-gray-800">유튜브 뮤직 무료</span></div>
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:border-green-300 transition-all hover:shadow-md"><div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><img src="/globe.svg" alt="No VPN" className="w-5 h-5 object-contain" /></div><span className="text-sm font-semibold text-gray-800">VPN 없이 가입</span></div>
          </div>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-10"><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-sm font-semibold text-green-700">문제 발생 시 차액 100% 환불 보장</span></div>
          <div className="flex flex-col gap-6 justify-center items-center">
            <div className="flex gap-3 justify-center items-center mx-4">
              <div className="relative"><div className="absolute -top-3 -left-3 bg-yellow-400 text-gray-900 text-xs px-2.5 py-1 rounded-full font-bold shadow-lg z-20 animate-bounce">💸 최저가 보장</div><Link href="/apply/youtube" className="group relative px-6 py-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-pulse-slow overflow-hidden block"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div><div className="absolute inset-0 rounded-xl border-2 border-white/50 animate-ping opacity-75"></div><div className="relative flex items-center gap-3"><div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg></div><div className="flex flex-col items-start"><span className="text-xs text-white/80 font-medium">NEW</span><span className="text-lg font-bold text-white whitespace-nowrap">신규 가입</span></div></div></Link></div>
              <button onClick={() => setShowMemberEmailModal(true)} className="group relative px-6 py-4 bg-white border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl hover:border-blue-400 transition-all duration-200 hover:-translate-y-0.5"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div><div className="flex flex-col items-start"><span className="text-xs text-gray-500 font-medium">MEMBER</span><span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">기존 회원</span></div></div></button>
            </div>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button onClick={() => { const element = document.getElementById('pricing-section'); element?.scrollIntoView({ behavior: 'smooth' }); }} className="px-6 py-3 text-gray-700 hover:text-red-600 font-semibold transition-all duration-300 flex items-center gap-2 group"><svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="border-b-2 border-transparent group-hover:border-red-600 transition-all">요금제 보기</span></button>
            </div>
          </div>
        </div>

        <div id="pricing-section" className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 shadow-2xl border border-gray-200 max-w-4xl mx-auto scroll-mt-20">
          <div className="text-center mb-8"><h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">요금제 종류</h2><p className="text-gray-600">비쌀 이유가 없습니다. 장기 구독 시 더욱 저렴하게!</p></div>
          <div className="mb-10">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition cursor-pointer"><div className="text-sm font-semibold text-gray-600 mb-2">1개월</div><div className="text-3xl font-bold text-gray-900 mb-1">4,000원</div><div className="text-xs text-gray-500">월 4,000원</div></div>
              <div className="bg-white border-2 border-green-500 rounded-2xl p-6 hover:border-green-600 transition cursor-pointer relative shadow-lg"><div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-md">💰 1천원 할인</div><div className="text-sm font-semibold text-green-600 mb-2">6개월</div><div className="text-3xl font-bold text-green-600 mb-1">23,000원</div><div className="flex items-center gap-2"><div className="text-xs text-gray-400 line-through">24,000원</div><div className="text-xs text-green-600 font-semibold">월 3,833원</div></div></div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-500 rounded-2xl p-6 hover:border-red-600 transition cursor-pointer relative shadow-lg"><div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-md">🔥 3천원 할인</div><div className="text-sm font-semibold text-red-600 mb-2">12개월</div><div className="text-3xl font-bold text-red-600 mb-1">45,000원</div><div className="flex items-center gap-2"><div className="text-xs text-gray-400 line-through">48,000원</div><div className="text-xs text-red-600 font-semibold">월 3,750원</div></div></div>
            </div>
          </div>
          <button onClick={() => router.push('/apply/youtube')} className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-5 rounded-2xl text-xl font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 cursor-pointer relative overflow-hidden group animate-pulse-slow"><span className="relative z-10 flex items-center justify-center gap-2">프리미엄 시작하기<svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></span><div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div><div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div></button>
          <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-600"><div className="flex items-center gap-2"><span className="text-green-500">✓</span><span>24시간 이내 초대</span></div><div className="flex items-center gap-2"><span className="text-green-500">✓</span><span>간편한 계좌이체</span></div><div className="flex items-center gap-2"><span className="text-green-500">✓</span><span>안전한 거래</span></div></div>
        </div>

      </div>

      <footer className="bg-white border-t border-gray-200 py-8 mt-20"><div className="max-w-7xl mx-auto px-4 text-center"><p className="text-xs text-gray-400">© 2025 YouTube Premium 공유 서비스. All rights reserved.</p></div></footer>

      {showMemberEmailModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => { if (!memberEmailLoading) { setShowMemberEmailModal(false); setMemberEmail(''); setMemberEmailError(null); } }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl"><h2 className="text-2xl font-bold text-gray-900">기존 회원 확인</h2><button onClick={() => { if (!memberEmailLoading) { setShowMemberEmailModal(false); setMemberEmail(''); setMemberEmailError(null); } }} disabled={memberEmailLoading} className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"><svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <div className="p-6">
              <form onSubmit={handleMemberEmailCheck} className="space-y-6">
                <div><label htmlFor="member-email" className="block text-sm font-medium text-gray-700 mb-2">가입 시 사용한 이메일 주소 또는 아이디</label><input type="text" id="member-email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="user1234 또는 user1234@gmail.com" required disabled={memberEmailLoading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 disabled:bg-gray-100" /><p className="mt-2 text-xs text-gray-500">이메일 전체 또는 @ 앞의 아이디만 입력하셔도 됩니다.</p></div>
                {memberEmailError && <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg"><div className="flex items-center gap-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg><span>{memberEmailError}</span></div></div>}
                <button type="submit" disabled={memberEmailLoading || !memberEmail} className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">{memberEmailLoading ? '확인 중...' : '회원 페이지로 이동'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}