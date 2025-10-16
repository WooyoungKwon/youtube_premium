'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RenewalRequest {
  id: string;
  nickname: string;
  email: string;
  name: string;
  paymentDate: string;
  willRenew: boolean;
  renewMonths: number;
  isAutoPayment: boolean;
  renewalMessage?: string;
  depositStatus: string;
  youtubeEmail: string;
  youtubeNickname: string;
}

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<RenewalRequest[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // 검색어 디바운싱 (500ms 후 실행)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 디바운스된 검색어로 API 호출
  useEffect(() => {
    fetchRenewals();
  }, [debouncedSearchQuery]);

  const fetchRenewals = async () => {
    try {
      if (initialLoading) {
        setInitialLoading(true);
      } else {
        setSearching(true);
      }

      const url = debouncedSearchQuery.trim()
        ? `/api/admin/renewals?search=${encodeURIComponent(debouncedSearchQuery)}`
        : '/api/admin/renewals';

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setRenewals(data.renewals);
      } else {
        setError(data.error || '갱신 요청을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setInitialLoading(false);
      setSearching(false);
    }
  };

  const handleApprove = async (memberId: string) => {
    if (!confirm('이 갱신 요청을 승인하시겠습니까?')) {
      return;
    }

    try {
      setProcessingId(memberId);
      const response = await fetch('/api/admin/renewals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('갱신이 승인되었습니다.');
        setTimeout(() => setSuccessMessage(null), 3000);
        await fetchRenewals(); // 목록 새로고침
      } else {
        alert(data.error || '갱신 승인에 실패했습니다.');
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const calculatePrice = (months: number) => {
    const prices: { [key: number]: number } = {
      1: 4000,
      2: 8000,
      3: 12000,
      6: 23000,
      12: 45000
    };
    return prices[months] || months * 4000;
  };

  const calculateNewExpiryDate = (currentDate: string, months: number) => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">갱신 요청을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <img src="/logo.png" alt="Linkuni" className="h-16 w-auto object-contain cursor-pointer" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">갱신 요청 관리</h1>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            관리자 홈
          </Link>
        </div>
      </nav>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">총 갱신 요청</p>
                <p className="text-2xl font-bold text-gray-900">{renewals.length}건</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">일시불 예상 수익</p>
                <p className="text-2xl font-bold text-gray-900">
                  {renewals.filter(r => !r.isAutoPayment).reduce((sum, r) => sum + calculatePrice(r.renewMonths), 0).toLocaleString()}원
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  자동이체: {renewals.filter(r => r.isAutoPayment).length}건 (월 {renewals.filter(r => r.isAutoPayment).length * 4000}원)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">결제 방식 분포</p>
                <p className="text-2xl font-bold text-gray-900">
                  일시불 {renewals.filter(r => !r.isAutoPayment).length}건
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  자동이체: {renewals.filter(r => r.isAutoPayment).length}건
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Renewals List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">갱신 요청 목록</h2>
            </div>

            {/* 검색창 */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {searching ? (
                    <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="입금자명 검색..."
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64 placeholder:text-gray-400 text-gray-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {renewals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">현재 갱신 요청이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[180px]" />
                  <col className="w-[200px]" />
                  <col className="w-[110px]" />
                  <col className="w-[90px]" />
                  <col className="w-[140px]" />
                  <col className="w-[120px]" />
                  <col className="w-[110px]" />
                  <col className="w-[100px]" />
                  <col className="w-[200px]" />
                </colgroup>
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">회원 정보</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">YouTube 계정</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">현재 만료일</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">갱신 기간</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">결제 방식</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">결제 금액</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">새 만료일</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">작업</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">메시지</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {renewals.map((renewal) => (
                    <tr key={renewal.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <div className="overflow-hidden">
                          <p className="font-semibold text-gray-900 truncate">{renewal.nickname}</p>
                          <p className="text-sm text-gray-600 truncate">{renewal.name}</p>
                          <p className="text-xs text-gray-500 truncate">{renewal.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="overflow-hidden">
                          <p className="text-sm text-gray-900 truncate">{renewal.youtubeEmail}</p>
                          {renewal.youtubeNickname && (
                            <p className="text-xs text-blue-600 truncate">{renewal.youtubeNickname}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {new Date(renewal.paymentDate).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
                          {renewal.isAutoPayment ? 1 : renewal.renewMonths}개월
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {renewal.isAutoPayment ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                              🔄 자동이체
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              월 4천원
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
                              💰 일시불
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {renewal.renewMonths}개월
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {renewal.isAutoPayment ? (
                          <div>
                            <p className="text-base font-bold text-green-600 whitespace-nowrap">
                              4,000원
                            </p>
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              매월
                            </p>
                          </div>
                        ) : (
                          <p className="text-base font-bold text-green-600 whitespace-nowrap">
                            {calculatePrice(renewal.renewMonths).toLocaleString()}원
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-purple-600 whitespace-nowrap">
                          {new Date(new Date(renewal.paymentDate).setMonth(new Date(renewal.paymentDate).getMonth() + (renewal.isAutoPayment ? 1 : renewal.renewMonths))).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleApprove(renewal.id)}
                          disabled={processingId === renewal.id}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                        >
                          {processingId === renewal.id ? (
                            <span className="flex items-center gap-1">
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              처리중
                            </span>
                          ) : (
                            '승인'
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        {renewal.renewalMessage ? (
                          <div className="group relative">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 cursor-pointer hover:bg-amber-100 transition">
                              <p className="text-xs text-gray-700 line-clamp-2">{renewal.renewalMessage}</p>
                            </div>
                            <div className="hidden group-hover:block absolute z-10 right-0 top-full mt-1 w-64 bg-white border-2 border-amber-300 rounded-lg p-3 shadow-xl">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{renewal.renewalMessage}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
