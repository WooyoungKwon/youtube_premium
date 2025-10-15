'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookingRequest } from '@/types';

interface VendorData {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  completedBookings: number;
  totalEarnings: number;
}

export default function VendorDashboard() {
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [myBookings, setMyBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'my'>('pending');

  useEffect(() => {
    // 로그인 확인
    const vendorDataStr = sessionStorage.getItem('vendorData');
    if (!vendorDataStr) {
      router.push('/vendor');
      return;
    }

    const vendorData = JSON.parse(vendorDataStr);
    setVendor(vendorData);
  }, [router]);

  const fetchBookingRequests = async (vendorData: VendorData) => {
    try {
      setLoading(true);

      // 모든 예매 요청 가져오기
      const response = await fetch('/api/movie/bookings?status=all');
      if (response.ok) {
        const allBookings: BookingRequest[] = await response.json();

        console.log('All bookings:', allBookings);
        console.log('Vendor ID:', vendorData.id);

        // 대기 중인 예매 요청 (내 전용 링크 + 공개 요청)
        const pendingRequests = allBookings.filter(booking => {
          if (booking.status !== 'pending') return false;

          // 내 전용 링크로 들어온 요청
          if (booking.referralCode === vendorData.id && booking.referralType === 'vendor') {
            console.log('Found my exclusive booking:', booking.id);
            return true;
          }

          // 공개 요청 (admin 링크 또는 링크 없음)
          if (booking.referralType === 'admin' || !booking.referralType) {
            console.log('Found public booking:', booking.id);
            return true;
          }

          return false;
        });

        // 내가 수락한 예매
        const myAcceptedBookings = allBookings.filter(
          booking => booking.claimedBy === vendorData.id
        );

        console.log('Pending requests:', pendingRequests.length);
        console.log('My accepted bookings:', myAcceptedBookings.length);

        setRequests(pendingRequests);
        setMyBookings(myAcceptedBookings);
      }
    } catch (error) {
      console.error('Failed to fetch booking requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // vendor가 설정되면 데이터 불러오기
  useEffect(() => {
    if (vendor) {
      fetchBookingRequests(vendor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?.id]); // vendor.id가 변경될 때만 다시 불러오기

  const handleLogout = () => {
    sessionStorage.removeItem('vendorData');
    router.push('/vendor');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">판매자 대시보드</h1>
              <p className="text-sm text-gray-600 mt-1">{vendor.name}님, 환영합니다!</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fetchBookingRequests()}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium"
              >
                🔄 새로고침
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">완료 예매</p>
                <p className="text-2xl font-bold text-gray-900">{vendor.completedBookings}건</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">총 수익</p>
                <p className="text-2xl font-bold text-gray-900">{vendor.totalEarnings.toLocaleString()}원</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">평점</p>
                <p className="text-2xl font-bold text-gray-900">{vendor.rating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">새 요청</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}건</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === 'pending'
                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                대기 중인 예매 요청 ({requests.length})
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === 'my'
                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                내가 수락한 예매 ({myBookings.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">로딩 중...</p>
              </div>
            ) : activeTab === 'pending' ? (
              requests.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">새로운 예매 요청이 없습니다</h3>
                  <p className="text-gray-600 text-sm">새로운 예매 요청이 들어오면 여기에 표시됩니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{request.movieTitle}</h3>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{request.theater}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{request.showDate} {request.showTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>{request.seats}명</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{formatDate(request.createdAt)}</span>
                            </div>
                          </div>
                          {request.additionalInfo && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700"><strong>추가 요청:</strong> {request.additionalInfo}</p>
                            </div>
                          )}
                        </div>
                        <div className="ml-6">
                          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg">
                            예매 수락
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              myBookings.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">수락한 예매가 없습니다</h3>
                  <p className="text-gray-600 text-sm">예매 요청을 수락하면 여기에 표시됩니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
                    <div key={booking.id} className="border border-green-200 bg-green-50 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">진행 중</span>
                            <h3 className="text-lg font-bold text-gray-900">{booking.movieTitle}</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
                            <div>🎬 {booking.theater}</div>
                            <div>📅 {booking.showDate} {booking.showTime}</div>
                            <div>👥 {booking.seats}명</div>
                            <div>💰 수수료: {booking.commission.toLocaleString()}원</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
