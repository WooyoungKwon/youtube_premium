'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppleAccount, YoutubeAccount, Member } from '@/types';

type SortOrder = 'oldest' | 'newest';

const formatDateOnly = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ko-KR');
};

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

export default function MembersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [appleAccounts, setAppleAccounts] = useState<AppleAccount[]>([]);
  const [youtubeAccounts, setYoutubeAccounts] = useState<YoutubeAccount[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  const [selectedApple, setSelectedApple] = useState<AppleAccount | null>(null);
  const [selectedYoutube, setSelectedYoutube] = useState<YoutubeAccount | null>(null);
  
  const [appleSortOrder, setAppleSortOrder] = useState<SortOrder>('newest');
  const [youtubeSortOrder, setYoutubeSortOrder] = useState<SortOrder>('newest');
  const [memberSortOrder, setMemberSortOrder] = useState<SortOrder>('newest');
  
  const [editingApple, setEditingApple] = useState<AppleAccount | null>(null);
  const [editingYoutube, setEditingYoutube] = useState<YoutubeAccount | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  const [showAddApple, setShowAddApple] = useState(false);
  const [showAddYoutube, setShowAddYoutube] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  
  const [newAppleEmail, setNewAppleEmail] = useState('');
  const [newAppleCredit, setNewAppleCredit] = useState(0);
  const [newYoutubeEmail, setNewYoutubeEmail] = useState('');
  const [newYoutubeNickname, setNewYoutubeNickname] = useState('');
  const [newYoutubeRenewalDate, setNewYoutubeRenewalDate] = useState('');

  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newLastPaymentDate, setNewLastPaymentDate] = useState(formatDateForInput(new Date().toISOString()));
  const [newPaymentDate, setNewPaymentDate] = useState(formatDateForInput(new Date().toISOString()));
  const [newDepositStatus, setNewDepositStatus] = useState('pending');
  
  const [editingCreditId, setEditingCreditId] = useState<string | null>(null);
  const [editingCreditValue, setEditingCreditValue] = useState(0);

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
        headers: { 'Content-Type': 'application/json' },
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

  const fetchAppleAccounts = async () => {
    try {
      const res = await fetch('/api/admin/apple-accounts');
      if (res.ok) setAppleAccounts(await res.json());
    } catch (error) {
      console.error('Apple 계정을 가져오는데 실패했습니다:', error);
    }
  };

  const fetchYoutubeAccounts = async (appleId: string) => {
    try {
      const res = await fetch(`/api/admin/youtube-accounts?appleId=${appleId}`);
      if (res.ok) setYoutubeAccounts(await res.json());
    } catch (error) {
      console.error('YouTube 계정을 가져오는데 실패했습니다:', error);
    }
  };

  const fetchMembers = async (youtubeId: string) => {
    try {
      const res = await fetch(`/api/admin/members?youtubeId=${youtubeId}`);
      if (res.ok) setMembers(await res.json());
    } catch (error) {
      console.error('회원을 가져오는데 실패했습니다:', error);
    }
  };

  const handleSortApple = () => setAppleSortOrder(p => p === 'newest' ? 'oldest' : 'newest');
  const handleSortYoutube = () => setYoutubeSortOrder(p => p === 'newest' ? 'oldest' : 'newest');
  const handleSortMember = () => setMemberSortOrder(p => p === 'newest' ? 'oldest' : 'newest');

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

  const handleAddApple = async () => {
    if (!newAppleEmail.trim()) return;
    try {
      const res = await fetch('/api/admin/apple-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appleEmail: newAppleEmail, remainingCredit: newAppleCredit }),
      });
      if (res.ok) {
        handleCancelEdit();
        fetchAppleAccounts();
      } else {
        alert('Apple 계정 추가 실패: ' + (await res.json()).error);
      }
    } catch (error) {
      console.error('Apple 계정 추가 실패:', error);
    }
  };

  const handleEditApple = (apple: AppleAccount) => {
    setEditingApple(apple);
    setNewAppleEmail(apple.appleEmail);
    setNewAppleCredit(apple.remainingCredit || 0);
    setShowAddApple(true);
  };

  const handleUpdateApple = async () => {
    if (!editingApple) return;
    try {
      const res = await fetch(`/api/admin/apple-accounts/${editingApple.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appleEmail: newAppleEmail, remainingCredit: newAppleCredit }),
      });
      if (res.ok) {
        handleCancelEdit();
        fetchAppleAccounts();
      }
    } catch (error) {
      console.error('Apple 계정 수정 실패:', error);
    }
  };

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
        fetchAppleAccounts();
      }
    } catch (error) {
      console.error('크레딧 업데이트 실패:', error);
    }
  };

  const handleCancelEditCredit = () => setEditingCreditId(null);

  const handleDeleteApple = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/admin/apple-accounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAppleAccounts();
        if (selectedApple?.id === id) setSelectedApple(null);
      }
    } catch (error) {
      console.error('Apple 계정 삭제 실패:', error);
    }
  };

  const handleAddYoutube = async () => {
    if (!selectedApple || !newYoutubeEmail.trim() || !newYoutubeRenewalDate) {
      alert('이메일과 갱신일을 모두 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/admin/youtube-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appleAccountId: selectedApple.id, 
          youtubeEmail: newYoutubeEmail, 
          nickname: newYoutubeNickname, 
          renewalDate: newYoutubeRenewalDate 
        }),
      });
      if (res.ok) {
        handleCancelEdit();
        fetchYoutubeAccounts(selectedApple.id);
      }
    } catch (error) {
      console.error('YouTube 계정 추가 실패:', error);
    }
  };

  const handleEditYoutube = (youtube: YoutubeAccount) => {
    setEditingYoutube(youtube);
    setNewYoutubeEmail(youtube.youtubeEmail);
    setNewYoutubeNickname(youtube.nickname || '');
    setNewYoutubeRenewalDate(formatDateForInput(youtube.renewalDate));
    setShowAddYoutube(true);
  };

  const handleUpdateYoutube = async () => {
    if (!editingYoutube || !newYoutubeEmail.trim() || !newYoutubeRenewalDate) {
      alert('이메일과 갱신일을 모두 입력해주세요.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/youtube-accounts/${editingYoutube.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          youtubeEmail: newYoutubeEmail, 
          nickname: newYoutubeNickname, 
          renewalDate: newYoutubeRenewalDate 
        }),
      });
      if (res.ok) {
        handleCancelEdit();
        if (selectedApple) fetchYoutubeAccounts(selectedApple.id);
      }
    } catch (error) {
      console.error('YouTube 계정 수정 실패:', error);
    }
  };

  const handleDeleteYoutube = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/admin/youtube-accounts/${id}`, { method: 'DELETE' });
      if (res.ok && selectedApple) {
        fetchYoutubeAccounts(selectedApple.id);
        if (selectedYoutube?.id === id) setSelectedYoutube(null);
      }
    } catch (error) {
      console.error('YouTube 계정 삭제 실패:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedYoutube || !newMemberNickname.trim() || !newMemberEmail.trim() || !newMemberName.trim()) return;
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeAccountId: selectedYoutube.id, nickname: newMemberNickname, email: newMemberEmail, name: newMemberName, lastPaymentDate: newLastPaymentDate, paymentDate: newPaymentDate, depositStatus: newDepositStatus }),
      });
      if (res.ok) {
        handleCancelEdit();
        fetchMembers(selectedYoutube.id);
      }
    } catch (error) {
      console.error('회원 추가 실패:', error);
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
    if (!editingMember) return;
    try {
      const res = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: newMemberNickname, email: newMemberEmail, name: newMemberName, lastPaymentDate: newLastPaymentDate, paymentDate: newPaymentDate, depositStatus: newDepositStatus }),
      });
      if (res.ok) {
        handleCancelEdit();
        if (selectedYoutube) fetchMembers(selectedYoutube.id);
      }
    } catch (error) {
      console.error('회원 수정 실패:', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
      if (res.ok && selectedYoutube) fetchMembers(selectedYoutube.id);
    } catch (error) {
      console.error('회원 삭제 실패:', error);
    }
  };

  const handleUpdateMemberStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositStatus: status }),
      });
      if (res.ok && selectedYoutube) fetchMembers(selectedYoutube.id);
    } catch (error) {
      console.error('회원 상태 수정 실패:', error);
    }
  };

  const cycleStatus = (currentStatus: string) => currentStatus === 'pending' ? 'completed' : 'pending';
  const getStatusButtonStyle = (status: string) => status === 'completed' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white';
  const getStatusText = (status: string) => status === 'completed' ? '완료' : '대기';

  const handleCancelEdit = () => {
    setShowAddApple(false);
    setEditingApple(null);
    setNewAppleEmail('');
    setNewAppleCredit(0);

    setShowAddYoutube(false);
    setEditingYoutube(null);
    setNewYoutubeEmail('');
    setNewYoutubeNickname('');
    setNewYoutubeRenewalDate('');

    setShowAddMember(false);
    setEditingMember(null);
    setNewMemberNickname('');
    setNewMemberEmail('');
    setNewMemberName('');
    const today = formatDateForInput(new Date().toISOString());
    setNewLastPaymentDate(today);
    setNewPaymentDate(today);
    setNewDepositStatus('pending');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">멤버 관리 - 관리자 로그인</h2>
          <p className="mt-2 text-center text-sm text-gray-600">관리자 비밀번호를 입력하세요</p>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <input id="password" name="password" type="password" autoComplete="current-password" required
                   className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                   placeholder="관리자 비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
            {authError && <div className="text-red-600 text-sm text-center">{authError}</div>}
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              로그인
            </button>
            <div className="text-center">
              <Link href="/admin" className="text-indigo-600 hover:text-indigo-500 text-sm">← 관리자 대시보드로 돌아가기</Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">멤버 관리</h1>
              <p className="text-gray-600 mt-1">Apple, YouTube 계정 및 회원 정보를 관리합니다.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2">
                대시보드
              </Link>
              <Link href="/admin/all-members" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                전체 회원 목록
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {(showAddApple || editingApple) && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{editingApple ? 'Apple 계정 수정' : 'Apple 계정 추가'}</h3>
              <input type="email" placeholder="Apple 이메일" value={newAppleEmail} onChange={(e) => setNewAppleEmail(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 placeholder-gray-500 text-gray-900" />
              <input type="number" placeholder="크레딧" value={newAppleCredit} onChange={(e) => setNewAppleCredit(Number(e.target.value))} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-4 placeholder-gray-500 text-gray-900" />
              <div className="flex justify-end gap-2">
                <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600">취소</button>
                <button onClick={editingApple ? handleUpdateApple : handleAddApple} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">{editingApple ? '저장' : '추가'}</button>
              </div>
            </div>
          </div>
        )}

        {(showAddYoutube || editingYoutube) && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{editingYoutube ? 'YouTube 계정 수정' : 'YouTube 계정 추가'}</h3>
              <input type="email" placeholder="YouTube 이메일" value={newYoutubeEmail} onChange={(e) => setNewYoutubeEmail(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 placeholder-gray-500 text-gray-900" />
              <input type="text" placeholder="닉네임 (선택사항)" value={newYoutubeNickname} onChange={(e) => setNewYoutubeNickname(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 placeholder-gray-500 text-gray-900" />
              <input type="date" placeholder="갱신일" value={newYoutubeRenewalDate} onChange={(e) => setNewYoutubeRenewalDate(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-4 placeholder-gray-500 text-gray-900" />
              <div className="flex justify-end gap-2">
                <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600">취소</button>
                <button onClick={editingYoutube ? handleUpdateYoutube : handleAddYoutube} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">{editingYoutube ? '저장' : '추가'}</button>
              </div>
            </div>
          </div>
        )}

        {(showAddMember || editingMember) && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{editingMember ? '회원 수정' : '회원 추가'}</h3>
              <div className="space-y-3">
                <input type="text" placeholder="닉네임" value={newMemberNickname} onChange={(e) => setNewMemberNickname(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg placeholder-gray-500 text-gray-900" />
                <input type="email" placeholder="이메일" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg placeholder-gray-500 text-gray-900" />
                <input type="text" placeholder="이름" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg placeholder-gray-500 text-gray-900" />
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-600">가입 날짜</label><input type="date" value={newLastPaymentDate} onChange={(e) => setNewLastPaymentDate(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900" /></div>
                  <div><label className="text-sm text-gray-600">다음 결제일</label><input type="date" value={newPaymentDate} onChange={(e) => setNewPaymentDate(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900" /></div>
                </div>
                <select value={newDepositStatus} onChange={(e) => setNewDepositStatus(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900">
                  <option value="pending">대기</option>
                  <option value="completed">완료</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600">취소</button>
                <button onClick={editingMember ? handleUpdateMember : handleAddMember} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">{editingMember ? '저장' : '추가'}</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Apple Accounts Column */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">🍎 Apple 계정</h2>
              <div className="flex gap-2">
                <button onClick={handleSortApple} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">{appleSortOrder === 'oldest' ? '오래된순' : '최신순'}</button>
                <button onClick={() => setShowAddApple(true)} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">+ 추가</button>
              </div>
            </div>
            <div className="space-y-3">
              {sortedAppleAccounts.map(apple => (
                <div key={apple.id} onClick={() => handleAppleSelect(apple)} className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedApple?.id === apple.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1"><p className="font-semibold text-gray-800">{apple.appleEmail}</p><p className="text-sm text-gray-500">생성일: {formatDateOnly(apple.createdAt)}</p></div>
                    <div className="flex items-center gap-2 ml-2"><button onClick={(e) => { e.stopPropagation(); handleEditApple(apple); }} className="text-blue-500 hover:text-blue-700">✏️</button><button onClick={(e) => { e.stopPropagation(); handleDeleteApple(apple.id); }} className="text-red-500 hover:text-red-700">🗑️</button></div>
                  </div>
                  {editingCreditId === apple.id ? (
                    <div className="flex items-center gap-1 mt-2">
                      <input type="number" value={editingCreditValue} onChange={(e) => setEditingCreditValue(Number(e.target.value))} className="w-24 p-1 border border-gray-300 rounded text-sm" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdateCredit(apple.id)} />
                      <button onClick={() => handleUpdateCredit(apple.id)} className="text-green-500 hover:text-green-700">✓</button>
                      <button onClick={handleCancelEditCredit} className="text-gray-500 hover:text-gray-700">✗</button>
                    </div>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); handleStartEditCredit(apple); }} className="mt-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200">크레딧: {apple.remainingCredit?.toLocaleString() || 0}</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* YouTube Accounts Column */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-gray-800">📺 YouTube 계정</h2>{selectedApple && <button onClick={() => setShowAddYoutube(true)} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">+ 추가</button>}</div>
            {selectedApple ? (
              <div className="space-y-3">
                {sortedYoutubeAccounts.map(youtube => (
                  <div key={youtube.id} onClick={() => handleYoutubeSelect(youtube)} className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedYoutube?.id === youtube.id ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-300 hover:bg-red-50'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1"><p className="font-semibold text-gray-800">{youtube.youtubeEmail}</p>{youtube.nickname && <p className="text-sm text-blue-600">{youtube.nickname}</p>}<p className="text-sm text-green-600 font-semibold">갱신일: {formatDateOnly(youtube.renewalDate)}</p></div>
                      <div className="flex items-center gap-2 ml-2"><button onClick={(e) => { e.stopPropagation(); handleEditYoutube(youtube); }} className="text-blue-500 hover:text-blue-700">✏️</button><button onClick={(e) => { e.stopPropagation(); handleDeleteYoutube(youtube.id); }} className="text-red-500 hover:text-red-700">🗑️</button></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-center text-gray-500 py-10">Apple 계정을 선택하세요.</div>}
          </div>

          {/* Members Column */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-gray-800">👥 회원 목록</h2>{selectedYoutube && <button onClick={() => setShowAddMember(true)} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">+ 추가</button>}</div>
            {selectedYoutube ? (
              <div className="space-y-3">
                {sortedMembers.map(member => (
                  <div key={member.id} className="p-3 border border-gray-300 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1"><p className="font-semibold text-gray-800">{member.nickname} ({member.name})</p><p className="text-sm text-gray-600">{member.email}</p><p className="text-sm text-gray-500">가입: {formatDateOnly(member.lastPaymentDate)} / 다음 결제: {formatDateOnly(member.paymentDate)}</p></div>
                      <div className="flex items-center gap-2 ml-2"><button onClick={() => handleEditMember(member)} className="text-blue-500 hover:text-blue-700">✏️</button><button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-700">🗑️</button></div>
                    </div>
                    <button onClick={() => handleUpdateMemberStatus(member.id, cycleStatus(member.depositStatus))} className={`mt-2 text-sm px-2 py-1 rounded ${getStatusButtonStyle(member.depositStatus)}`}>{getStatusText(member.depositStatus)}</button>
                  </div>
                ))}
              </div>
            ) : <div className="text-center text-gray-500 py-10">YouTube 계정을 선택하세요.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}