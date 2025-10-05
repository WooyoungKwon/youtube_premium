'use client';

import { useState, useEffect, useMemo } from 'react';
import { AppleAccount, YoutubeAccount, Member } from '@/types';

type SortOrder = 'oldest' | 'newest';

// 날짜 포맷팅 함수 (시간 제거, 날짜만 표시)
const formatDateOnly = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

// input date 형식으로 변환 (YYYY-MM-DD)
const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export default function MembersPage() {
  // 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // 데이터 상태
  const [appleAccounts, setAppleAccounts] = useState<AppleAccount[]>([]);
  const [youtubeAccounts, setYoutubeAccounts] = useState<YoutubeAccount[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  // 선택된 계정 상태
  const [selectedApple, setSelectedApple] = useState<AppleAccount | null>(null);
  const [selectedYoutube, setSelectedYoutube] = useState<YoutubeAccount | null>(null);
  
  // 정렬 상태
  const [appleSortOrder, setAppleSortOrder] = useState<SortOrder>('newest');
  const [youtubeSortOrder, setYoutubeSortOrder] = useState<SortOrder>('newest');
  const [memberSortOrder, setMemberSortOrder] = useState<SortOrder>('newest');
  
  // 편집 상태
  const [editingApple, setEditingApple] = useState<AppleAccount | null>(null);
  const [editingYoutube, setEditingYoutube] = useState<YoutubeAccount | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  // 추가 폼 상태
  const [showAddApple, setShowAddApple] = useState(false);
  const [showAddYoutube, setShowAddYoutube] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  
  // 개월 수 선택 모달 상태
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<Member | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(1);
  
  // 폼 입력 상태
  const [newAppleEmail, setNewAppleEmail] = useState('');
  const [newAppleCredit, setNewAppleCredit] = useState(0);
  const [newYoutubeEmail, setNewYoutubeEmail] = useState('');
  const [newYoutubeNickname, setNewYoutubeNickname] = useState('');
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newLastPaymentDate, setNewLastPaymentDate] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState('');
  const [newDepositStatus, setNewDepositStatus] = useState('pending');
  
  // 크레딧 편집 상태
  const [editingCreditId, setEditingCreditId] = useState<string | null>(null);
  const [editingCreditValue, setEditingCreditValue] = useState(0);

  // 정렬된 배열들
  const sortedAppleAccounts = useMemo(() => {
    return [...appleAccounts].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return appleSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [appleAccounts, appleSortOrder]);

  const sortedYoutubeAccounts = useMemo(() => {
    return [...youtubeAccounts].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return youtubeSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [youtubeAccounts, youtubeSortOrder]);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return memberSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [members, memberSortOrder]);

  useEffect(() => {
    // 세션 스토리지에서 인증 상태 확인
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppleAccounts();
    }
  }, [isAuthenticated]);

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

  // API 호출 함수들
  const fetchAppleAccounts = async () => {
    try {
      const res = await fetch('/api/admin/apple-accounts');
      if (res.ok) {
        const data = await res.json();
        setAppleAccounts(data);
      }
    } catch (error) {
      console.error('Apple 계정을 가져오는데 실패했습니다:', error);
    }
  };

  const fetchYoutubeAccounts = async (appleId: string) => {
    try {
      const res = await fetch(`/api/admin/youtube-accounts?appleId=${appleId}`);
      if (res.ok) {
        const data = await res.json();
        setYoutubeAccounts(data);
      }
    } catch (error) {
      console.error('YouTube 계정을 가져오는데 실패했습니다:', error);
    }
  };

  const fetchMembers = async (youtubeId: string) => {
    try {
      const res = await fetch(`/api/admin/members?youtubeId=${youtubeId}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('회원을 가져오는데 실패했습니다:', error);
    }
  };

  // 정렬 핸들러
  const handleSortApple = () => {
    setAppleSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleSortYoutube = () => {
    setYoutubeSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleSortMember = () => {
    setMemberSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  // 선택 핸들러
  const handleAppleSelect = async (apple: AppleAccount) => {
    setSelectedApple(apple);
    setSelectedYoutube(null);
    setMembers([]);
    await fetchYoutubeAccounts(apple.id);
  };

  const handleYoutubeSelect = async (youtube: YoutubeAccount) => {
    setSelectedYoutube(youtube);
    await fetchMembers(youtube.id);
  };

  // CRUD 핸들러들 (기존과 동일)
  const handleAddApple = async () => {
    if (!newAppleEmail.trim()) return;
    
    try {
      console.log('Sending request with:', {
        appleEmail: newAppleEmail, 
        remainingCredit: newAppleCredit,
      });
      
      const res = await fetch('/api/admin/apple-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appleEmail: newAppleEmail, 
          remainingCredit: newAppleCredit,
        }),
      });
      
      console.log('Response status:', res.status);
      const responseData = await res.json();
      console.log('Response data:', responseData);
      
      if (res.ok) {
        setNewAppleEmail('');
        setNewAppleCredit(0);
        setShowAddApple(false);
        await fetchAppleAccounts();
      } else {
        alert('애플 계정 추가에 실패했습니다: ' + (responseData.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Apple 계정 추가에 실패했습니다:', error);
      alert('Apple 계정 추가에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleEditApple = (apple: AppleAccount) => {
    setEditingApple(apple);
    setNewAppleEmail(apple.appleEmail);
    setNewAppleCredit(apple.remainingCredit || 0);
    setShowAddApple(true);
  };

  const handleUpdateApple = async () => {
    if (!editingApple || !newAppleEmail.trim()) return;
    
    try {
      const res = await fetch(`/api/admin/apple-accounts/${editingApple.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appleEmail: newAppleEmail, 
          remainingCredit: newAppleCredit,
        }),
      });
      
      if (res.ok) {
        setEditingApple(null);
        setNewAppleEmail('');
        setNewAppleCredit(0);
        setShowAddApple(false);
        await fetchAppleAccounts();
      }
    } catch (error) {
      console.error('Apple 계정 수정에 실패했습니다:', error);
    }
  };

  // 크레딧만 업데이트하는 함수
  const handleStartEditCredit = (account: AppleAccount) => {
    setEditingCreditId(account.id);
    setEditingCreditValue(account.remainingCredit || 0);
  };

  const handleUpdateCredit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/apple-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remainingCredit: editingCreditValue }),
      });
      
      if (res.ok) {
        setEditingCreditId(null);
        setEditingCreditValue(0);
        await fetchAppleAccounts();
      }
    } catch (error) {
      console.error('크레딧 업데이트에 실패했습니다:', error);
    }
  };

  const handleCancelEditCredit = () => {
    setEditingCreditId(null);
    setEditingCreditValue(0);
  };

  const handleDeleteApple = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`/api/admin/apple-accounts/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        await fetchAppleAccounts();
        if (selectedApple?.id === id) {
          setSelectedApple(null);
          setYoutubeAccounts([]);
          setSelectedYoutube(null);
          setMembers([]);
        }
      }
    } catch (error) {
      console.error('Apple 계정 삭제에 실패했습니다:', error);
    }
  };

  const handleAddYoutube = async () => {
    if (!selectedApple || !newYoutubeEmail.trim()) return;
    
    try {
      const res = await fetch('/api/admin/youtube-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appleAccountId: selectedApple.id,
          youtubeEmail: newYoutubeEmail,
          nickname: newYoutubeNickname,
        }),
      });
      
      if (res.ok) {
        setNewYoutubeEmail('');
        setNewYoutubeNickname('');
        setShowAddYoutube(false);
        await fetchYoutubeAccounts(selectedApple.id);
      }
    } catch (error) {
      console.error('YouTube 계정 추가에 실패했습니다:', error);
    }
  };

  const handleEditYoutube = (youtube: YoutubeAccount) => {
    setEditingYoutube(youtube);
    setNewYoutubeEmail(youtube.youtubeEmail);
    setNewYoutubeNickname(youtube.nickname || '');
    setShowAddYoutube(true);
  };

  const handleUpdateYoutube = async () => {
    if (!editingYoutube || !newYoutubeEmail.trim()) return;
    
    try {
      const res = await fetch(`/api/admin/youtube-accounts/${editingYoutube.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeEmail: newYoutubeEmail,
          nickname: newYoutubeNickname,
        }),
      });
      
      if (res.ok) {
        setEditingYoutube(null);
        setNewYoutubeEmail('');
        setNewYoutubeNickname('');
        setShowAddYoutube(false);
        if (selectedApple) {
          await fetchYoutubeAccounts(selectedApple.id);
        }
      }
    } catch (error) {
      console.error('YouTube 계정 수정에 실패했습니다:', error);
    }
  };

  const handleDeleteYoutube = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`/api/admin/youtube-accounts/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok && selectedApple) {
        await fetchYoutubeAccounts(selectedApple.id);
        if (selectedYoutube?.id === id) {
          setSelectedYoutube(null);
          setMembers([]);
        }
      }
    } catch (error) {
      console.error('YouTube 계정 삭제에 실패했습니다:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedYoutube || !newMemberNickname.trim() || !newMemberEmail.trim() || !newMemberName.trim()) return;
    
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeAccountId: selectedYoutube.id,
          nickname: newMemberNickname,
          email: newMemberEmail,
          name: newMemberName,
          lastPaymentDate: newLastPaymentDate,
          paymentDate: newPaymentDate,
          depositStatus: newDepositStatus,
        }),
      });
      
      if (res.ok) {
        setNewMemberNickname('');
        setNewMemberEmail('');
        setNewMemberName('');
        setNewLastPaymentDate('');
        setNewPaymentDate('');
        setNewDepositStatus('pending');
        setShowAddMember(false);
        await fetchMembers(selectedYoutube.id);
      }
    } catch (error) {
      console.error('회원 추가에 실패했습니다:', error);
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setNewMemberNickname(member.nickname);
    setNewMemberEmail(member.email);
    setNewMemberName(member.name);
    setNewLastPaymentDate(formatDateForInput(member.lastPaymentDate));
    setNewPaymentDate(formatDateForInput(member.paymentDate));
    setNewDepositStatus(member.depositStatus);
    setShowAddMember(true);
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !newMemberNickname.trim() || !newMemberEmail.trim() || !newMemberName.trim()) return;
    
    try {
      const res = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: newMemberNickname,
          email: newMemberEmail,
          name: newMemberName,
          lastPaymentDate: newLastPaymentDate,
          paymentDate: newPaymentDate,
          depositStatus: newDepositStatus,
        }),
      });
      
      if (res.ok) {
        setEditingMember(null);
        setNewMemberNickname('');
        setNewMemberEmail('');
        setNewMemberName('');
        setNewLastPaymentDate('');
        setNewPaymentDate('');
        setNewDepositStatus('pending');
        setShowAddMember(false);
        if (selectedYoutube) {
          await fetchMembers(selectedYoutube.id);
        }
      }
    } catch (error) {
      console.error('회원 수정에 실패했습니다:', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok && selectedYoutube) {
        await fetchMembers(selectedYoutube.id);
      }
    } catch (error) {
      console.error('회원 삭제에 실패했습니다:', error);
    }
  };

  const handleUpdateMemberStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositStatus: status }),
      });
      
      if (res.ok && selectedYoutube) {
        await fetchMembers(selectedYoutube.id);
      }
    } catch (error) {
      console.error('회원 상태 수정에 실패했습니다:', error);
    }
  };

  // 상태 순환 함수 (pending → completed → pending)
  const cycleStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'completed';
      case 'completed':
        return 'pending';
      default:
        return 'pending';
    }
  };  // 상태에 따른 버튼 스타일
  const getStatusButtonStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'completed':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'failed':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
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

  const handleCancelEdit = () => {
    if (editingApple) {
      setEditingApple(null);
      setNewAppleEmail('');
      setNewAppleCredit(0);
      setShowAddApple(false);
    }
    if (editingYoutube) {
      setEditingYoutube(null);
      setNewYoutubeEmail('');
      setNewYoutubeNickname('');
      setShowAddYoutube(false);
    }
    if (editingMember) {
      setEditingMember(null);
      setNewMemberNickname('');
      setNewMemberEmail('');
      setNewMemberName('');
      setNewLastPaymentDate('');
      setNewPaymentDate('');
      setNewDepositStatus('pending');
      setShowAddMember(false);
    }
  };

  // 인증되지 않은 경우 로그인 폼 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              회원 관리 - 관리자 로그인
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
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      {isAuthenticated ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">멤버 관리</h1>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              로그아웃
            </button>
          </div>
          
          {/* 추가/수정 모달 */}
          {(showAddApple) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{editingApple ? 'Apple 계정 수정' : 'Apple 계정 추가'}</h3>
                <input
                  type="email"
                  placeholder="Apple 이메일"
                  className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                  value={newAppleEmail}
                  onChange={(e) => setNewAppleEmail(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="크레딧"
                  className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                  value={newAppleCredit}
                  onChange={(e) => setNewAppleCredit(Number(e.target.value))}
                />
                <div className="flex justify-end">
                  <button onClick={() => {
                    setShowAddApple(false);
                    setEditingApple(null);
                    setNewAppleEmail('');
                    setNewAppleCredit(0);
                  }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                    취소
                  </button>
                  <button onClick={editingApple ? handleUpdateApple : handleAddApple} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    {editingApple ? '수정' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* YouTube 추가/수정 모달 */}
          {(showAddYoutube) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{editingYoutube ? 'YouTube 계정 수정' : 'YouTube 계정 추가'}</h3>
                <input
                  type="email"
                  placeholder="YouTube 이메일"
                  className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                  value={newYoutubeEmail}
                  onChange={(e) => setNewYoutubeEmail(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="닉네임 (선택사항)"
                  className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                  value={newYoutubeNickname}
                  onChange={(e) => setNewYoutubeNickname(e.target.value)}
                />
                <div className="flex justify-end">
                  <button onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                    취소
                  </button>
                  <button onClick={editingYoutube ? handleUpdateYoutube : handleAddYoutube} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    {editingYoutube ? '수정' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 회원 추가/수정 모달 */}
          {(showAddMember) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{editingMember ? '회원 수정' : '회원 추가'}</h3>
                <input
                  type="text"
                  placeholder="닉네임"
                  className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                  value={newMemberNickname}
                  onChange={(e) => setNewMemberNickname(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="이메일"
                  className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="이름"
                  className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
                <input
                  type="date"
                  placeholder="이전 결제일"
                  className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                  value={newLastPaymentDate}
                  onChange={(e) => setNewLastPaymentDate(e.target.value)}
                />
                <input
                  type="date"
                  placeholder="다음 결제일"
                  className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                  value={newPaymentDate}
                  onChange={(e) => setNewPaymentDate(e.target.value)}
                />
                <select
                  className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                  value={newDepositStatus}
                  onChange={(e) => setNewDepositStatus(e.target.value)}
                >
                  <option value="pending">대기</option>
                  <option value="completed">완료</option>
                  <option value="failed">실패</option>
                </select>
                <div className="flex justify-end">
                  <button onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                    취소
                  </button>
                  <button onClick={editingMember ? handleUpdateMember : handleAddMember} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    {editingMember ? '수정' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Apple 계정 목록 */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">🍎 Apple 계정</h2>
              <div className="flex justify-between items-center mb-2">
                <button
                  onClick={handleSortApple}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  {appleSortOrder === 'oldest' ? '오래된순' : '최신순'}
                </button>
                <button
                  onClick={() => setShowAddApple(!showAddApple)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  + 추가
                </button>
              </div>
              <ul className="space-y-2">
                {sortedAppleAccounts.map(apple => (
                  <li key={apple.id} 
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedApple?.id === apple.id ? 'bg-blue-800' : 'bg-gray-700 hover:bg-gray-600'}`}
                      onClick={() => handleAppleSelect(apple)}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{apple.appleEmail}</span>
                      <div className="flex items-center space-x-2">
                        {editingCreditId === apple.id ? (
                          <>
                            <input 
                              type="number"
                              value={editingCreditValue}
                              onChange={(e) => setEditingCreditValue(Number(e.target.value))}
                              className="w-24 p-1 bg-gray-900 text-white rounded"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleUpdateCredit(apple.id)}
                            />
                            <button onClick={() => handleUpdateCredit(apple.id)} className="text-green-400 hover:text-green-300">✓</button>
                            <button onClick={handleCancelEditCredit} className="text-red-400 hover:text-red-300">✗</button>
                          </>
                        ) : (
                          <>
                            <span 
                              className="text-yellow-400 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditCredit(apple);
                              }}
                            >
                              ₹{apple.remainingCredit?.toLocaleString() || 0}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); handleEditApple(apple); }} className="text-sm text-blue-400 hover:text-blue-300">✏️</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteApple(apple.id); }} className="text-sm text-red-400 hover:text-red-300">🗑️</button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      <span>생성일: {formatDateOnly(apple.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* YouTube 계정 목록 */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">📺 YouTube 계정</h2>
              {selectedApple ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={handleSortYoutube}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      {youtubeSortOrder === 'oldest' ? '오래된순' : '최신순'}
                    </button>
                    <button
                      onClick={() => setShowAddYoutube(!showAddYoutube)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      + 추가
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {sortedYoutubeAccounts.map(youtube => (
                      <li key={youtube.id} 
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedYoutube?.id === youtube.id ? 'bg-red-800' : 'bg-gray-700 hover:bg-gray-600'}`}
                          onClick={() => handleYoutubeSelect(youtube)}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{youtube.youtubeEmail}</span>
                          <div className="flex items-center space-x-2">
                            <button onClick={(e) => { e.stopPropagation(); handleEditYoutube(youtube); }} className="text-sm text-blue-400 hover:text-blue-300">✏️</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteYoutube(youtube.id); }} className="text-sm text-red-400 hover:text-red-300">🗑️</button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          <span>생성일: {formatDateOnly(youtube.createdAt)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  YouTube 계정을 보려면<br/>먼저 Apple 계정을 선택하세요
                </div>
              )}
            </div>

            {/* 회원 목록 */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">👥 회원 목록</h2>
              {selectedYoutube ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={handleSortMember}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      {memberSortOrder === 'oldest' ? '오래된순' : '최신순'}
                    </button>
                    <button
                      onClick={() => setShowAddMember(!showAddMember)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      + 추가
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {sortedMembers.map(member => (
                      <li key={member.id} className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {member.nickname}
                            </p>
                            <p className="text-xs text-gray-300 truncate">
                              {member.email}
                            </p>
                            <p className="text-xs text-gray-400">
                              {member.name}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                이전 결제: {formatDateOnly(member.lastPaymentDate)}
                              </span>
                              <span className="text-xs text-gray-400">
                                결제: {formatDateOnly(member.paymentDate)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleUpdateMemberStatus(member.id, cycleStatus(member.depositStatus))}
                              className={`mt-2 text-xs px-3 py-1 rounded transition-colors ${getStatusButtonStyle(member.depositStatus)}`}
                            >
                              {getStatusText(member.depositStatus)}
                            </button>
                          </div>
                          <div className="flex flex-col gap-1 ml-2">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  회원 목록을 보려면<br/>먼저 YouTube 계정을 선택하세요
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                회원 관리 - 관리자 로그인
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
      )}
    </div>
  );
}