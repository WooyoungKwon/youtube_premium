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
  const [sortOrder, setSortOrder] = useState<SortOrder>('oldest');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 개월 수 선택 모달 상태
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithDetails | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(1);
  
  // 회원 정보 수정 모달 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberWithDetails | null>(null);

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
    
    // 입금 상태별 우선순위와 결제일 기준 정렬
    return [...filtered].sort((a, b) => {
    // 1. 입금 상태 우선순위 (pending > completed)
    const statusPriority = { pending: 2, completed: 1 };
    const statusA = statusPriority[a.depositStatus as keyof typeof statusPriority] || 0;
    const statusB = statusPriority[b.depositStatus as keyof typeof statusPriority] || 0;      if (statusA !== statusB) {
        return statusB - statusA; // 높은 우선순위가 먼저
      }
      
      // 2. 같은 상태 내에서는 결제일 기준 정렬
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

  // 다음 상태 결정 함수 (pending ↔ completed)
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'completed';
      case 'completed':
        return 'pending';
      default:
        return 'pending';
    }
  };

  // 상태 변경 함수 (완료가 아닌 경우)
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

  // 완료 상태로 변경 시 개월 수 선택 모달 열기
  const handleCompletePayment = (member: MemberWithDetails) => {
    setSelectedMember(member);
    setSelectedMonths(1);
    setShowMonthModal(true);
  };

  // 회원 정보 수정 모달 열기
  const handleEditMember = (member: MemberWithDetails) => {
    setEditingMember(member);
    setShowEditModal(true);
  };

  // 회원 정보 수정
  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      const res = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: editingMember.nickname,
          email: editingMember.email,
          name: editingMember.name,
          joinDate: editingMember.joinDate,
          paymentDate: editingMember.paymentDate,
          depositStatus: editingMember.depositStatus,
        }),
      });

      if (res.ok) {
        await fetchAllMembers();
        setShowEditModal(false);
        setEditingMember(null);
        alert('회원 정보가 수정되었습니다.');
      } else {
        alert('회원 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      alert('오류가 발생했습니다.');
    }
  };

  // 개월 수 선택 완료 후 결제일 업데이트
  const handleConfirmPayment = async () => {
    if (!selectedMember) return;

    try {
      setUpdatingMember(selectedMember.id);
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedMember.id, 
          depositStatus: 'completed',
          months: selectedMonths 
        }),
      });
      
      if (res.ok) {
        // 성공 시 목록 새로고침
        await fetchAllMembers();
        setShowMonthModal(false);
        setSelectedMember(null);
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
              <label className="block text-sm font-medium text-gray-700 mb-2">다음 결제일 정렬</label>
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
                      다음 결제일
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => {
                              const nextStatus = getNextStatus(member.depositStatus);
                              if (nextStatus === 'completed') {
                                handleCompletePayment(member);
                              } else {
                                handleUpdateMemberStatus(member.id, nextStatus);
                              }
                            }}
                            disabled={updatingMember === member.id}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                              updatingMember === member.id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : member.depositStatus === 'pending'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
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
                                {member.depositStatus === 'pending' && '완료'}
                                {member.depositStatus === 'completed' && '대기'}
                              </>
                            )}
                          </button>
                        </div>
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

      {/* 개월 수 선택 모달 */}
      {showMonthModal && selectedMember && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">결제 완료 처리</h3>
              <button
                onClick={() => setShowMonthModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{selectedMember.nickname}</span>님의 결제를 완료 처리합니다.
              </p>
              <p className="text-xs text-gray-500">
                현재 다음 결제일: {formatDateOnly(selectedMember.paymentDate)}
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                결제한 개월 수를 선택하세요
              </label>
              <select
                value={selectedMonths}
                onChange={(e) => setSelectedMonths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                  <option key={month} value={month}>
                    {month}개월
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedMonths}개월 선택 시 다음 결제일이 {
                  (() => {
                    try {
                      // YYYY-MM-DD 형식의 문자열을 로컬 시간으로 파싱
                      if (!selectedMember.paymentDate) return '날짜 없음';
                      const parts = selectedMember.paymentDate.split('-');
                      if (parts.length !== 3) return '날짜 형식 오류';
                      
                      const [year, month, day] = parts.map(Number);
                      if (isNaN(year) || isNaN(month) || isNaN(day)) return '날짜 형식 오류';
                      
                      const newDate = new Date(year, month - 1, day);
                      if (isNaN(newDate.getTime())) return '날짜 오류';
                      
                      newDate.setMonth(newDate.getMonth() + selectedMonths);
                      const resultStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
                      return formatDateOnly(resultStr);
                    } catch (e) {
                      return '날짜 계산 오류';
                    }
                  })()
                }로 변경됩니다.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMonthModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                취소
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={updatingMember === selectedMember.id}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {updatingMember === selectedMember.id ? '처리 중...' : '완료 처리'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원 정보 수정 모달 */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">회원 정보 수정</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMember(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                <input
                  type="text"
                  value={editingMember.nickname}
                  onChange={(e) => setEditingMember({...editingMember, nickname: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">다음 결제일</label>
                <input
                  type="date"
                  value={editingMember.paymentDate}
                  onChange={(e) => setEditingMember({...editingMember, paymentDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Apple 계정:</span> {editingMember.appleEmail}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">YouTube 계정:</span> {editingMember.youtubeEmail}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMember(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                취소
              </button>
              <button
                onClick={handleUpdateMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}