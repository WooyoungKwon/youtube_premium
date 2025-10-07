'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MemberRequest } from '@/types';
import RegisterMemberModal from './components/RegisterMemberModal';
import WebAuthnLogin from './components/WebAuthnLogin';

interface AdminStats {
  totalMembers: number;
  totalYoutubeAccounts: number;
  monthlyRevenue: number;
  monthlyCost: number;
  monthlyProfit: number;
  cumulativeRevenue: number;
  pricePerMember: number;
  costPerYoutubeAccount: number;
  rupeeToKrw: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [requests, setRequests] = useState<MemberRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MemberRequest | null>(null);
  const [revenueStats, setRevenueStats] = useState<AdminStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    try {
      const [requestsRes, statsRes] = await Promise.all([
        fetch('/api/admin/list', { cache: 'no-store' }),
        fetch('/api/admin/stats', { cache: 'no-store' })
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data);
      } else {
        console.error('Failed to fetch requests:', requestsRes.status, requestsRes.statusText);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setRevenueStats(data);
      } else {
        console.error('Failed to fetch stats:', statsRes.status, statsRes.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error instanceof TypeError) {
        console.error('Network error - check if server is running on http://localhost:3000');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/list', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setRevenueStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchRequests();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRequests();
      }
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  };

  const handleRegisterMember = (request: MemberRequest) => {
    setSelectedRequest(request);
    setIsRegisterModalOpen(true);
  };

  const handleRegisterSuccess = () => {
    alert('회원 등록이 완료되었습니다.');
    fetchRequests();
    fetchStats();
  };

  const handleMigrateRevenue = async () => {
    if (!confirm('기존 회원들의 수익을 마이그레이션하시겠습니까?\n이미 기록된 회원은 건너뛰고, 새로운 회원만 추가됩니다.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/migrate-revenue', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        alert(`마이그레이션 완료!\n\n총 회원: ${data.stats.totalMembers}명\n새로 기록: ${data.stats.migratedMembers}명\n건너뛴 회원: ${data.stats.skippedMembers}명\n추가된 수익: ${data.stats.totalAmount.toLocaleString()}원`);
        fetchStats();
      } else {
        const error = await response.json();
        alert(`마이그레이션 실패: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('마이그레이션 중 오류가 발생했습니다.');
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-900 text-yellow-100 border-yellow-800',
      approved: 'bg-green-900 text-green-100 border-green-800',
      rejected: 'bg-red-900 text-red-100 border-red-800',
    };
    const labels = {
      pending: '대기중',
      approved: '승인됨',
      rejected: '거부됨',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const requestStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setAuthError(data.error || '비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      setAuthError('인증에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-800 rounded-lg mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">관리자 로그인</h1>
              <p className="text-sm text-neutral-400">Face ID 또는 Touch ID로 로그인하세요</p>
            </div>

            <WebAuthnLogin onSuccess={() => setIsAuthenticated(true)} />

            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-neutral-400 hover:text-white transition">
                ← 메인 페이지로 돌아가기
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">관리자 대시보드</h1>
              <p className="text-sm text-neutral-400 mt-1">YouTube Premium 회원 신청 관리</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/members" className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded hover:bg-neutral-700 transition text-sm font-medium">
                회원 관리
              </Link>
              <Link href="/admin/all-members" className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded hover:bg-neutral-700 transition text-sm font-medium">
                전체 회원 목록
              </Link>
              <a href="/api/admin/export" download className="px-4 py-2 bg-green-900 border border-green-800 text-green-100 rounded hover:bg-green-800 transition text-sm font-medium">
                Excel 다운로드
              </a>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-900 border border-red-800 text-red-100 rounded hover:bg-red-800 transition text-sm font-medium">
                로그아웃
              </button>
              <a href="/" className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded hover:bg-neutral-700 transition text-sm font-medium">
                메인 페이지로
              </a>
            </div>
          </div>

          {/* Request Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
              <div className="text-sm text-neutral-400">전체 신청</div>
              <div className="text-2xl font-bold text-white">{requestStats.total}</div>
            </div>
            <div className="bg-neutral-900 border border-yellow-800 p-4 rounded-lg">
              <div className="text-sm text-yellow-400">대기중</div>
              <div className="text-2xl font-bold text-yellow-300">{requestStats.pending}</div>
            </div>
            <div className="bg-neutral-900 border border-green-800 p-4 rounded-lg">
              <div className="text-sm text-green-400">승인됨</div>
              <div className="text-2xl font-bold text-green-300">{requestStats.approved}</div>
            </div>
            <div className="bg-neutral-900 border border-red-800 p-4 rounded-lg">
              <div className="text-sm text-red-400">거부됨</div>
              <div className="text-2xl font-bold text-red-300">{requestStats.rejected}</div>
            </div>
          </div>

          {/* Revenue Stats */}
          {revenueStats && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">수익 현황</h2>
                <button
                  onClick={handleMigrateRevenue}
                  className="px-3 py-1.5 bg-orange-900 border border-orange-800 text-orange-100 text-sm rounded hover:bg-orange-800 transition"
                >
                  기존 회원 수익 마이그레이션
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                  <div className="text-sm font-medium text-neutral-400 mb-1">총 회원 수</div>
                  <div className="text-3xl font-bold text-white">{revenueStats.totalMembers}명</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                  <div className="text-sm font-medium text-neutral-400 mb-1">YouTube 계정 수</div>
                  <div className="text-3xl font-bold text-white">{revenueStats.totalYoutubeAccounts}개</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-neutral-900 border border-green-900/30 p-5 rounded-lg">
                  <div className="text-sm font-medium text-green-400 mb-1">월 매출</div>
                  <div className="text-3xl font-bold text-green-300">
                    {revenueStats.monthlyRevenue.toLocaleString()}원
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {revenueStats.pricePerMember.toLocaleString()}원 × {revenueStats.totalMembers}명
                  </div>
                </div>

                <div className="bg-neutral-900 border border-red-900/30 p-5 rounded-lg">
                  <div className="text-sm font-medium text-red-400 mb-1">월 지출</div>
                  <div className="text-3xl font-bold text-red-300">
                    {revenueStats.monthlyCost.toLocaleString()}원
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {revenueStats.costPerYoutubeAccount}₹ × {revenueStats.totalYoutubeAccounts}개 × {revenueStats.rupeeToKrw}원
                  </div>
                </div>

                <div className="bg-neutral-900 border border-blue-900/30 p-5 rounded-lg">
                  <div className="text-sm font-medium text-blue-400 mb-1">월 순수익</div>
                  <div className="text-3xl font-bold text-blue-300">
                    {revenueStats.monthlyProfit.toLocaleString()}원
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    매출 - 지출
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                  <div className="text-sm font-medium text-neutral-400 mb-1">누적 수익 (10월~)</div>
                  <div className="text-3xl font-bold text-white">
                    {revenueStats.cumulativeRevenue.toLocaleString()}원
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    2025년 10월부터 누적
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded font-medium transition text-sm ${
                filter === status
                  ? 'bg-white text-neutral-900'
                  : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {status === 'all' ? '전체' : status === 'pending' ? '대기중' : status === 'approved' ? '승인됨' : '거부됨'}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-neutral-500">로딩 중...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">신청 내역이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-800 border-b border-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      입금자명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      개월수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      전화번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      추천인
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      회원등록
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      신청일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-neutral-900 divide-y divide-neutral-800">
                  {paginatedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-neutral-850">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{request.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-400">{request.depositorName || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-400">{request.months ? `${request.months}개월` : '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-300">{request.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-purple-400">{request.referralEmail || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.isRegistered ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900 text-indigo-100 border border-indigo-800">
                            등록완료
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                            미등록
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                        {new Date(request.createdAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(request.id, 'approved')}
                                className="px-3 py-1 bg-green-900 border border-green-800 text-green-100 rounded hover:bg-green-800 transition"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(request.id, 'rejected')}
                                className="px-3 py-1 bg-red-900 border border-red-800 text-red-100 rounded hover:bg-red-800 transition"
                              >
                                거부
                              </button>
                            </>
                          )}
                          {request.status === 'approved' && !request.isRegistered && (
                            <button
                              onClick={() => handleRegisterMember(request)}
                              className="px-3 py-1 bg-blue-900 border border-blue-800 text-blue-100 rounded hover:bg-blue-800 transition"
                            >
                              회원 등록
                            </button>
                          )}
                          {request.status === 'approved' && request.isRegistered && (
                            <span className="px-3 py-1 bg-neutral-800 text-neutral-500 rounded cursor-not-allowed border border-neutral-700">
                              등록완료
                            </span>
                          )}
                          <button
                            onClick={() => handleDelete(request.id)}
                            className="px-3 py-1 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredRequests.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              전체 {filteredRequests.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)}개 표시
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded text-sm font-medium transition ${
                      currentPage === page
                        ? 'bg-white text-neutral-900'
                        : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Register Member Modal */}
      {selectedRequest && (
        <RegisterMemberModal
          isOpen={isRegisterModalOpen}
          onClose={() => {
            setIsRegisterModalOpen(false);
            setSelectedRequest(null);
          }}
          requestId={selectedRequest.id}
          requestEmail={selectedRequest.email}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}
