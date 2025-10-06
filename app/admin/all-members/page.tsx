'use client';

import { useState, useEffect, useMemo } from 'react';

interface MemberWithDetails {
  id: string;
  nickname: string;
  email: string;
  name: string;
  lastPaymentDate: string;
  paymentDate: string;
  depositStatus: string;
  createdAt: string;
  youtubeEmail: string;
  youtubeNickname?: string;
  appleEmail: string;
}

type SortOrder = 'oldest' | 'newest';

const formatDateOnly = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  return dateString;
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-900 text-yellow-100 border-yellow-800';
    case 'completed':
      return 'bg-green-900 text-green-100 border-green-800';
    default:
      return 'bg-neutral-800 text-neutral-400 border-neutral-700';
  }
};

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('oldest');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithDetails | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(1);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberWithDetails | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const sortedAndFilteredMembers = useMemo(() => {
    let filtered = members;

    if (searchTerm) {
      filtered = members.filter(member =>
        member.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.youtubeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.appleEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.depositStatus === statusFilter);
    }

    return [...filtered].sort((a, b) => {
      const statusPriority = { pending: 2, completed: 1 };
      const statusA = statusPriority[a.depositStatus as keyof typeof statusPriority] || 0;
      const statusB = statusPriority[b.depositStatus as keyof typeof statusPriority] || 0;
      if (statusA !== statusB) {
        return statusB - statusA;
      }

      const dateA = new Date(a.paymentDate).getTime();
      const dateB = new Date(b.paymentDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [members, sortOrder, searchTerm, statusFilter]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(sortedAndFilteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = sortedAndFilteredMembers.slice(startIndex, endIndex);

  // 필터/검색 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOrder]);

  useEffect(() => {
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

  const handleUpdateMemberStatus = async (memberId: string, newStatus: string) => {
    try {
      setUpdatingMember(memberId);
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, depositStatus: newStatus }),
      });

      if (res.ok) {
        await fetchAllMembers();
      } else {
        const errorData = await res.json();
        alert(`상태 변경에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error updating member status:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleCompletePayment = (member: MemberWithDetails) => {
    setSelectedMember(member);
    setSelectedMonths(1);
    setShowMonthModal(true);
  };

  const handleEditMember = (member: MemberWithDetails) => {
    setEditingMember(member);
    setShowEditModal(true);
  };

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
          lastPaymentDate: editingMember.lastPaymentDate,
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
        await fetchAllMembers();
        setShowMonthModal(false);
        setSelectedMember(null);
      } else {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">전체 회원 목록</h2>
              <p className="text-sm text-neutral-400">관리자 비밀번호를 입력하세요</p>
            </div>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1.5">비밀번호</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                  placeholder="관리자 비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {authError && (
                <div className="bg-red-950 border border-red-800 text-red-200 px-3 py-2 rounded text-sm">{authError}</div>
              )}

              <button
                type="submit"
                className="w-full bg-white text-neutral-900 font-medium py-2 px-4 rounded hover:bg-neutral-100 transition"
              >
                로그인
              </button>

              <div className="text-center">
                <a href="/admin" className="text-neutral-400 hover:text-white text-sm transition">
                  ← 관리자 대시보드로 돌아가기
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <a href="/admin" className="px-3 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition text-sm font-medium">
                ← 대시보드
              </a>
              <h1 className="text-xl font-semibold text-white">전체 회원 목록</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-100 border border-blue-800">
                총 {sortedAndFilteredMembers.length}명
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-900 border border-red-800 text-red-100 rounded hover:bg-red-800 transition text-sm font-medium"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">검색</label>
              <input
                type="text"
                placeholder="닉네임, 이메일, 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">입금 상태</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-neutral-500"
              >
                <option value="all">전체</option>
                <option value="pending">대기</option>
                <option value="completed">완료</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">다음 결제일 정렬</label>
              <button
                onClick={handleSortToggle}
                className="w-full px-3 py-2 bg-blue-900 border border-blue-800 text-blue-100 rounded text-sm hover:bg-blue-800 transition"
              >
                {sortOrder === 'newest' ? '최신순' : '오래된순'}
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchAllMembers}
                disabled={loading}
                className="w-full px-3 py-2 bg-green-900 border border-green-800 text-green-100 rounded text-sm hover:bg-green-800 transition disabled:opacity-50"
              >
                {loading ? '새로고침 중...' : '새로고침'}
              </button>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-neutral-500">로딩 중...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-800">
                <thead className="bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">번호</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">회원 정보</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">계정 정보</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">이전 결제일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">다음 결제일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">입금 상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="bg-neutral-900 divide-y divide-neutral-800">
                  {paginatedMembers.map((member, index) => (
                    <tr key={member.id} className="hover:bg-neutral-850">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white">{startIndex + index + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-white">{member.nickname}</div>
                          <div className="text-sm text-neutral-400">{member.name}</div>
                          <div className="text-sm text-neutral-500">{member.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm text-neutral-300">
                            <span className="font-medium text-neutral-400">Apple:</span> {member.appleEmail}
                          </div>
                          <div className="text-sm text-neutral-300">
                            <span className="font-medium text-neutral-400">YouTube:</span> {member.youtubeEmail}
                            {member.youtubeNickname && (
                              <span className="text-blue-400 ml-1">({member.youtubeNickname})</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                        {formatDateOnly(member.lastPaymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
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
                            className="px-3 py-1 text-xs font-medium rounded bg-blue-900 border border-blue-800 text-blue-100 hover:bg-blue-800 transition"
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
                            className={`px-3 py-1 text-xs font-medium rounded transition ${
                              updatingMember === member.id
                                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                                : member.depositStatus === 'pending'
                                ? 'bg-green-900 border border-green-800 text-green-100 hover:bg-green-800'
                                : 'bg-yellow-900 border border-yellow-800 text-yellow-100 hover:bg-yellow-800'
                            }`}
                          >
                            {updatingMember === member.id ? '처리중...' : (member.depositStatus === 'pending' ? '완료' : '대기')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {sortedAndFilteredMembers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-neutral-500">
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

        {/* Pagination */}
        {!loading && sortedAndFilteredMembers.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              전체 {sortedAndFilteredMembers.length}개 중 {startIndex + 1}-{Math.min(endIndex, sortedAndFilteredMembers.length)}개 표시
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
                  let pageNumber;
                  if (totalPages <= 10) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 4) {
                    pageNumber = totalPages - 9 + i;
                  } else {
                    pageNumber = currentPage - 4 + i;
                  }
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 rounded text-sm font-medium transition ${
                        currentPage === pageNumber
                          ? 'bg-white text-neutral-900'
                          : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {pageNumber}
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

      {/* Month Modal */}
      {showMonthModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">결제 완료 처리</h3>
              <button
                onClick={() => setShowMonthModal(false)}
                className="text-neutral-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-neutral-300 mb-2">
                <span className="font-medium text-white">{selectedMember.nickname}</span>님의 결제를 완료 처리합니다.
              </p>
              <p className="text-xs text-neutral-500">
                현재 다음 결제일: {formatDateOnly(selectedMember.paymentDate)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                결제한 개월 수를 선택하세요
              </label>
              <select
                value={selectedMonths}
                onChange={(e) => setSelectedMonths(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-neutral-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                  <option key={month} value={month}>{month}개월</option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                {selectedMonths}개월 선택 시 다음 결제일이 {
                  (() => {
                    try {
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
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition"
              >
                취소
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={updatingMember === selectedMember.id}
                className="px-4 py-2 bg-green-900 border border-green-800 text-green-100 rounded hover:bg-green-800 transition disabled:opacity-50"
              >
                {updatingMember === selectedMember.id ? '처리 중...' : '완료 처리'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">회원 정보 수정</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMember(null);
                }}
                className="text-neutral-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">닉네임</label>
                <input
                  type="text"
                  value={editingMember.nickname}
                  onChange={(e) => setEditingMember({...editingMember, nickname: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">이메일</label>
                <input
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">이름</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">이전 결제일</label>
                <input
                  type="date"
                  value={formatDateForInput(editingMember.lastPaymentDate)}
                  onChange={(e) => setEditingMember({...editingMember, lastPaymentDate: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">다음 결제일</label>
                <input
                  type="date"
                  value={formatDateForInput(editingMember.paymentDate)}
                  onChange={(e) => setEditingMember({...editingMember, paymentDate: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="bg-neutral-800 p-3 rounded border border-neutral-700">
                <p className="text-xs text-neutral-400">
                  <span className="font-medium text-neutral-300">Apple 계정:</span> {editingMember.appleEmail}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  <span className="font-medium text-neutral-300">YouTube 계정:</span> {editingMember.youtubeEmail}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMember(null);
                }}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition"
              >
                취소
              </button>
              <button
                onClick={handleUpdateMember}
                className="px-4 py-2 bg-blue-900 border border-blue-800 text-blue-100 rounded hover:bg-blue-800 transition"
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
