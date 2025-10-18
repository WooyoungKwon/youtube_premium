'use client';

import { useState, useEffect } from 'react';
import { BookingRequest } from '@/types';

export default function MovieBookingsAdmin() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/movie/bookings?status=${filter}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralBadge = (booking: BookingRequest) => {
    if (!booking.referralType) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">기본 (관리자 10%)</span>;
    }
    if (booking.referralType === 'admin') {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">관리자 링크 (10%)</span>;
    }
    if (booking.referralType === 'vendor') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">판매자 링크 (100%)</span>;
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: '대기중', className: 'bg-yellow-100 text-yellow-700' },
      claimed: { label: '수락됨', className: 'bg-blue-100 text-blue-700' },
      confirmed: { label: '확정', className: 'bg-purple-100 text-purple-700' },
      completed: { label: '완료', className: 'bg-green-100 text-green-700' },
      cancelled: { label: '취소', className: 'bg-red-100 text-red-700' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">영화 예매 요청 관리</h1>
          <p className="text-gray-600">수수료 시스템이 적용된 영화 예매 요청을 관리합니다</p>
        </div>

        {/* 필터 버튼 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            대기중
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'completed'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            완료
          </button>
        </div>

        {/* 테스트 링크 안내 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📋 테스트용 링크</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div>
              <strong>관리자 링크 (10% 수수료):</strong>
              <code className="ml-2 px-2 py-1 bg-white rounded">
                /apply/movie?ref=admin
              </code>
            </div>
            <div>
              <strong>판매자 링크 (100% 수익):</strong>
              <code className="ml-2 px-2 py-1 bg-white rounded">
                /apply/movie?ref=vendor_123
              </code>
            </div>
            <div>
              <strong>기본 링크 (관리자 10%):</strong>
              <code className="ml-2 px-2 py-1 bg-white rounded">
                /apply/movie
              </code>
            </div>
          </div>
        </div>

        {/* 예매 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">예매 요청이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{booking.movieTitle}</h3>
                      {getStatusBadge(booking.status)}
                      {getReferralBadge(booking)}
                    </div>
                    <p className="text-gray-600">{booking.theater}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">고객 정보</p>
                    <p className="text-gray-900">{booking.customerEmail}</p>
                    <p className="text-gray-900">{booking.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">예매 정보</p>
                    <p className="text-gray-900">
                      {booking.showDate} {booking.showTime}
                    </p>
                    <p className="text-gray-900">{booking.seats}명</p>
                  </div>
                </div>

                {booking.additionalInfo && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500 mb-1">추가 요청사항</p>
                    <p className="text-gray-900">{booking.additionalInfo}</p>
                  </div>
                )}

                {booking.referralCode && (
                  <div className="text-sm text-gray-600">
                    <strong>추천 코드:</strong> {booking.referralCode}
                  </div>
                )}

                {booking.commission > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-purple-700">
                      수수료: ₩{booking.commission.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
