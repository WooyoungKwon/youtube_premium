'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MemberRequest } from '@/types';
import RegisterMemberModal from './components/RegisterMemberModal';
import WebAuthnLogin from './components/WebAuthnLogin';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MemberRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string } | null>(null);

  useEffect(() => {
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // React Query로 요청 목록 조회 (서버 측 페이지네이션)
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['adminRequests', currentPage, filter],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/list?page=${currentPage}&limit=${itemsPerPage}&status=${filter}`,
        { cache: 'no-store' }
      );
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json() as Promise<{
        requests: MemberRequest[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>;
    },
    enabled: isAuthenticated,
  });

  const requests = requestsData?.requests || [];
  const totalItems = requestsData?.total || 0;
  const totalPages = requestsData?.totalPages || 1;

  // React Query로 통계 조회
  const { data: revenueStats = null, isLoading: statsLoading } = useQuery<AdminStats | null>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // React Query로 신청 통계 조회
  const { data: requestStats } = useQuery({
    queryKey: ['requestStats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/request-stats', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch request stats');
      return response.json() as Promise<{
        total: string;
        pending: string;
        approved: string;
        rejected: string;
      }>;
    },
    enabled: isAuthenticated,
  });

  const loading = requestsLoading || statsLoading;

  const fetchRequests = async () => {
    queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
  };

  const fetchStats = async () => {
    queryClient.invalidateQueries({ queryKey: ['adminStats'] });
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
    setConfirmAction({ type: 'delete', id });
  };

  const executeDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRequests();
        showToastMessage('삭제되었습니다.');
      } else {
        showToastMessage('삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to delete request:', error);
      showToastMessage('삭제에 실패했습니다.', 'error');
    }
  };

  const handleRegisterMember = (request: MemberRequest) => {
    setSelectedRequest(request);
    setIsRegisterModalOpen(true);
  };

  const handleRegisterSuccess = () => {
    showToastMessage('회원 등록이 완료되었습니다.');
    fetchRequests();
    fetchStats();
  };

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

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToastMessage(`${label}이(가) 복사되었습니다.`);
    } catch (err) {
      console.error('복사 실패:', err);
      showToastMessage('복사에 실패했습니다.', 'error');
    }
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
              <Link href="/admin/renewals" className="px-4 py-2 bg-blue-900 border border-blue-800 text-blue-100 rounded hover:bg-blue-800 transition text-sm font-medium">
                갱신 요청 관리
              </Link>
              <Link href="/admin/vendors" className="px-4 py-2 bg-purple-900 border border-purple-800 text-purple-100 rounded hover:bg-purple-800 transition text-sm font-medium">
                판매자 관리
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
          {requestStats && (
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
          )}

          {/* Revenue Stats */}
          {revenueStats && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">수익 현황</h2>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-800 border-b border-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">작업</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">이메일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">계정타입</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">입금자명</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">개월수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">전화번호</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">추천인</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">회원등록</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">신청일</th>
                  </tr>
                </thead>
                <tbody className="bg-neutral-900 divide-y divide-neutral-800">
                  {Array.from({ length: itemsPerPage }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-8 bg-neutral-800 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-neutral-800 rounded w-40"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-neutral-800 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-neutral-800 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-neutral-800 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-neutral-800 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-neutral-800 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-neutral-800 rounded-full w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-neutral-800 rounded-full w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-neutral-800 rounded w-32"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">신청 내역이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-800 border-b border-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      작업
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      계정타입
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
                  </tr>
                </thead>
                <tbody className="bg-neutral-900 divide-y divide-neutral-800">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-neutral-850">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.accountType === 'admin' ? (
                          <div className="text-sm font-medium text-white">관리자 제공 계정</div>
                        ) : (
                          <div
                            onClick={() => copyToClipboard(request.email, '이메일')}
                            className="text-sm font-medium text-white cursor-pointer hover:text-blue-400 transition"
                            title="클릭하여 복사"
                          >
                            {request.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.accountType === 'admin' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-900 text-blue-100 border border-blue-800">
                            관리자
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                            일반
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-400">{request.depositorName || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-400">{request.months ? `${request.months}개월` : '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.phone ? (
                          <div
                            onClick={() => copyToClipboard(request.phone!, '전화번호')}
                            className="text-sm text-neutral-300 cursor-pointer hover:text-blue-400 transition"
                            title="클릭하여 복사"
                          >
                            {request.phone}
                          </div>
                        ) : (
                          <div className="text-sm text-neutral-300">-</div>
                        )}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              전체 {totalItems}개 중 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}개 표시
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
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  // 최대 10개 페이지만 표시
                  const startPage = Math.max(1, currentPage - 5);
                  const page = startPage + i;
                  if (page > totalPages) return null;
                  return (
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
                  );
                })}
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

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-4">삭제 확인</h3>
            <p className="text-neutral-300 mb-6">정말 삭제하시겠습니까?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'delete') {
                    executeDelete(confirmAction.id);
                  }
                  setConfirmAction(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`${toastType === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
            {toastType === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
