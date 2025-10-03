'use client';

import { useState, useEffect, useMemo } from 'react';

interface MemberWithDetails {
  id: string;
  nickname: string;
  email: string;
  name: string;
  joinDate: string;
  paymentDate: string;
  depositStatus: string;
  createdAt: string;
  youtubeEmail: string;
  youtubeNickname?: string;
  appleEmail: string;
}

type SortOrder = 'oldest' | 'newest';

// 날짜 포맷팅 함수
const formatDateOnly = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

// 상태에 따른 스타일
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// 상태 텍스트
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '대기';
    case 'completed':
      return '완료';
    case 'failed':
      return '실패';
    default:
      return '대기';
  }
};

export default function AllMembersPage() {
  // 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // 데이터 상태
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 정렬된 회원 목록
  const sortedAndFilteredMembers = useMemo(() => {
    let filtered = members;
    
    // 검색 필터
    if (searchTerm) {
      filtered = members.filter(member => 
        member.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.youtubeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.appleEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.depositStatus === statusFilter);
    }
    
    // 결제일 기준 정렬
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.paymentDate).getTime();
      const dateB = new Date(b.paymentDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [members, sortOrder, searchTerm, statusFilter]);

  useEffect(() => {
    // 세션 스토리지에서 인증 상태 확인
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllMembers();
    }
  }, [isAuthenticated]);

  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/all-members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch all members:', error);
    } finally {
      setLoading(false);
    }
  };

  // 다음 상태 결정 함수
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'completed';
      case 'completed':
        return 'failed';
      case 'failed':
        return 'pending';
      default:
        return 'pending';
    }
  };

  // 상태 변경 함수
  const handleUpdateMemberStatus = async (memberId: string, newStatus: string) => {
    try {
      setUpdatingMember(memberId);
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, depositStatus: newStatus }),
      });
      
      if (res.ok) {
        // 성공 시 목록 새로고침
        await fetchAllMembers();
      } else {
        console.error('Failed to update member status');
        alert('상태 변경에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error updating member status:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setUpdatingMember(null);
    }
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

      if (response.ok) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setAuthError('비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      setAuthError('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    setPassword('');
    setAuthError('');
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  // 인증되지 않은 경우 로그인 폼 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              전체 회원 목록 - 관리자 로그인
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              관리자 비밀번호를 입력하세요
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="관리자 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {authError && (
              <div className="text-red-600 text-sm text-center">{authError}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                로그인
              </button>
            </div>

            <div className="text-center">
              <a
                href="/admin"
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                ← 관리자 대시보드로 돌아가기
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <a
                href="/admin"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ← 관리자 대시보드로 돌아가기
              </a>
              <h1 className="text-2xl font-bold text-gray-900">전체 회원 목록</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                총 {sortedAndFilteredMembers.length}명
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                placeholder="닉네임, 이메일, 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">입금 상태</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="pending">대기</option>
                <option value="completed">완료</option>
                <option value="failed">실패</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">결제일 정렬</label>
              <button
                onClick={handleSortToggle}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOrder === 'newest' ? '최신순' : '오래된순'}
              </button>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchAllMembers}
                disabled={loading}
                className="w-full px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? '새로고침 중...' : '새로고침'}
              </button>
            </div>
          </div>
        </div>

        {/* 회원 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      회원 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      계정 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결제일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      입금 상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAndFilteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {member.nickname}
                          </div>
                          <div className="text-sm text-gray-600">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">Apple:</span> {member.appleEmail}
                          </div>
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">YouTube:</span> {member.youtubeEmail}
                            {member.youtubeNickname && (
                              <span className="text-blue-600 ml-1">({member.youtubeNickname})</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateOnly(member.joinDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateOnly(member.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(member.depositStatus)}`}>
                          {getStatusText(member.depositStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleUpdateMemberStatus(member.id, getNextStatus(member.depositStatus))}
                          disabled={updatingMember === member.id}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            updatingMember === member.id
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : member.depositStatus === 'pending'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : member.depositStatus === 'completed'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {updatingMember === member.id ? (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              처리중...
                            </span>
                          ) : (
                            <>
                              {member.depositStatus === 'pending' && '완료로 변경'}
                              {member.depositStatus === 'completed' && '실패로 변경'}
                              {member.depositStatus === 'failed' && '대기로 변경'}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {sortedAndFilteredMembers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? '검색 조건에 맞는 회원이 없습니다.' 
                      : '등록된 회원이 없습니다.'
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}