'use client';

import { useState, useEffect } from 'react';
import { MemberRequest } from '@/types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [requests, setRequests] = useState<MemberRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // 월 갱신 관련 상태
  const [monthlyUpdateLoading, setMonthlyUpdateLoading] = useState(false);
  const [updateCandidates, setUpdateCandidates] = useState<any[]>([]);
  const [showUpdatePreview, setShowUpdatePreview] = useState(false);

  useEffect(() => {
    // 세션 스토리지에서 인증 상태 확인
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/list');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
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

  // 월 갱신 미리보기 함수
  const fetchUpdateCandidates = async () => {
    try {
      const response = await fetch('/api/admin/monthly-update');
      if (response.ok) {
        const data = await response.json();
        setUpdateCandidates(data.candidateMembers || []);
        setShowUpdatePreview(true);
      }
    } catch (error) {
      console.error('Failed to fetch update candidates:', error);
    }
  };

  // 월 갱신 실행 함수
  const executeMonthlyUpdate = async () => {
    if (!confirm('정말로 월 갱신을 실행하시겠습니까?\n결제일이 지난 회원들의 정보가 업데이트됩니다.')) {
      return;
    }

    try {
      setMonthlyUpdateLoading(true);
      const response = await fetch('/api/admin/monthly-update', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`월 갱신이 완료되었습니다.\n업데이트된 회원 수: ${result.updatedCount}명`);
        setShowUpdatePreview(false);
        setUpdateCandidates([]);
      } else {
        const error = await response.json();
        alert(`월 갱신 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('Monthly update error:', error);
      alert('월 갱신 중 오류가 발생했습니다.');
    } finally {
      setMonthlyUpdateLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
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

  const stats = {
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

  // 인증되지 않은 경우 로그인 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">관리자 인증</h1>
            <p className="text-gray-600">비밀번호를 입력해주세요</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>

            {authError && (
              <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              로그인
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-gray-700 hover:text-gray-900 transition flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              메인 페이지로 돌아가기
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-gray-600 mt-1">YouTube Premium 회원 신청 관리</p>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/members"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                회원 관리
              </a>
              <a
                href="/admin/all-members"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                전체 회원 목록
              </a>
              <button
                onClick={fetchUpdateCandidates}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                월 갱신
              </button>
              <a
                href="/api/admin/export"
                download
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel 다운로드
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                메인 페이지로
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">전체 신청</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-600">대기중</div>
              <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600">승인됨</div>
              <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600">거부됨</div>
              <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {status === 'all' ? '전체' : status === 'pending' ? '대기중' : status === 'approved' ? '승인됨' : '거부됨'}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">로딩 중...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">신청 내역이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      입금자명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      개월수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카카오톡 ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전화번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      신청일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      업데이트
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">{request.depositorName || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">{request.months ? `${request.months}개월` : '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.kakaoId || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.updatedAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(request.id, 'approved')}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(request.id, 'rejected')}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                              >
                                거부
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(request.id)}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
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
      </div>

      {/* 월 갱신 미리보기 모달 */}
      {showUpdatePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">월 갱신 대상 회원</h3>
              <button
                onClick={() => setShowUpdatePreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {updateCandidates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">월 갱신이 필요한 회원이 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    총 <span className="font-semibold text-orange-600">{updateCandidates.length}명</span>의 회원이 월 갱신 대상입니다.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    결제일이 지난 회원들의 결제일이 다음 달로 업데이트되고 입금 상태가 '대기'로 변경됩니다.
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">닉네임</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">현재 결제일</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">현재 상태</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {updateCandidates.map((member) => (
                        <tr key={member.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{member.nickname}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{member.email}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(member.payment_date).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              member.deposit_status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.deposit_status === 'pending' ? '대기' : '실패'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowUpdatePreview(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={executeMonthlyUpdate}
                    disabled={monthlyUpdateLoading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                  >
                    {monthlyUpdateLoading ? '처리 중...' : '월 갱신 실행'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
