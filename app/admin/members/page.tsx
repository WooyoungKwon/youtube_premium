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
  const [newWillRenew, setNewWillRenew] = useState<boolean>(false);
  const [newRenewMonths, setNewRenewMonths] = useState<number>(1);

  const [editingCreditId, setEditingCreditId] = useState<string | null>(null);
  const [editingCreditValue, setEditingCreditValue] = useState(0);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; appleId?: string } | null>(null);

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

    // 모바일에서 YouTube 섹션으로 스크롤
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('youtube-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleYoutubeSelect = async (youtube: YoutubeAccount) => {
    setSelectedYoutube(youtube);
    await fetchMembers(youtube.id);

    // 모바일에서 회원 목록 섹션으로 스크롤
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('members-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
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
        showToastMessage('Apple 계정이 추가되었습니다.');
      } else {
        const errorData = await res.json();
        showToastMessage('Apple 계정 추가 실패: ' + errorData.error, 'error');
      }
    } catch (error) {
      console.error('Apple 계정 추가 실패:', error);
      showToastMessage('Apple 계정 추가 실패', 'error');
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

  const handleDeleteApple = (id: string) => {
    setConfirmAction({ type: 'deleteApple', id });
  };

  const executeDeleteApple = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/apple-accounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAppleAccounts();
        if (selectedApple?.id === id) setSelectedApple(null);
        showToastMessage('Apple 계정이 삭제되었습니다.');
      } else {
        showToastMessage('삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Apple 계정 삭제 실패:', error);
      showToastMessage('삭제에 실패했습니다.', 'error');
    }
  };

  const handleAddYoutube = async () => {
    if (!selectedApple || !newYoutubeEmail.trim() || !newYoutubeRenewalDate) {
      showToastMessage('이메일과 갱신일을 모두 입력해주세요.', 'error');
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
        showToastMessage('YouTube 계정이 추가되었습니다.');
      } else {
        showToastMessage('YouTube 계정 추가 실패', 'error');
      }
    } catch (error) {
      console.error('YouTube 계정 추가 실패:', error);
      showToastMessage('YouTube 계정 추가 실패', 'error');
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
      showToastMessage('이메일과 갱신일을 모두 입력해주세요.', 'error');
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
        showToastMessage('YouTube 계정이 수정되었습니다.');
      } else {
        showToastMessage('YouTube 계정 수정 실패', 'error');
      }
    } catch (error) {
      console.error('YouTube 계정 수정 실패:', error);
      showToastMessage('YouTube 계정 수정 실패', 'error');
    }
  };

  const handleDeleteYoutube = (id: string) => {
    setConfirmAction({ type: 'deleteYoutube', id, appleId: selectedApple?.id });
  };

  const executeDeleteYoutube = async (id: string, appleId?: string) => {
    try {
      const res = await fetch(`/api/admin/youtube-accounts/${id}`, { method: 'DELETE' });
      if (res.ok && appleId) {
        fetchYoutubeAccounts(appleId);
        if (selectedYoutube?.id === id) setSelectedYoutube(null);
        showToastMessage('YouTube 계정이 삭제되었습니다.');
      } else {
        showToastMessage('삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('YouTube 계정 삭제 실패:', error);
      showToastMessage('삭제에 실패했습니다.', 'error');
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
          willRenew: newWillRenew,
          renewMonths: newWillRenew ? newRenewMonths : undefined
        }),
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
    setNewWillRenew(member.willRenew ?? false);
    setNewRenewMonths(member.renewMonths ?? 1);
    setShowAddMember(true);
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
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
          willRenew: newWillRenew,
          renewMonths: newWillRenew ? newRenewMonths : undefined
        }),
      });
      if (res.ok) {
        handleCancelEdit();
        if (selectedYoutube) fetchMembers(selectedYoutube.id);
      }
    } catch (error) {
      console.error('회원 수정 실패:', error);
    }
  };

  const handleDeleteMember = (id: string) => {
    setConfirmAction({ type: 'deleteMember', id, appleId: selectedYoutube?.id });
  };

  const executeDeleteMember = async (id: string, youtubeId?: string) => {
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
      if (res.ok && youtubeId) {
        fetchMembers(youtubeId);
        showToastMessage('회원이 삭제되었습니다.');
      } else {
        showToastMessage('삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('회원 삭제 실패:', error);
      showToastMessage('삭제에 실패했습니다.', 'error');
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

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

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
    setNewWillRenew(false);
    setNewRenewMonths(1);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">관리자 인증</h2>
              <p className="text-sm text-neutral-400">멤버 관리 시스템에 로그인하세요</p>
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
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {authError && (
                <div className="bg-red-950 border border-red-800 text-red-200 px-3 py-2 rounded text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-white text-neutral-900 font-medium py-2 px-4 rounded hover:bg-neutral-100 transition"
              >
                로그인
              </button>

              <div className="text-center pt-2">
                <Link href="/admin" className="text-neutral-400 hover:text-white text-sm transition">
                  ← 대시보드로 돌아가기
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-[1800px] mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">멤버 관리</h1>
              <p className="text-sm text-neutral-400 mt-1">Apple, YouTube 계정 및 회원 정보 관리</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin" className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded hover:bg-neutral-700 transition text-sm font-medium">
                대시보드
              </Link>
              <Link href="/admin/all-members" className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded hover:bg-neutral-700 transition text-sm font-medium">
                전체 회원
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-900 border border-red-800 text-red-100 rounded hover:bg-red-800 transition text-sm font-medium">
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {(showAddApple || editingApple) && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-md">
              <div className="px-6 py-4 border-b border-neutral-800">
                <h3 className="text-lg font-semibold text-white">{editingApple ? 'Apple 계정 수정' : 'Apple 계정 추가'}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">이메일</label>
                  <input
                    type="email"
                    placeholder="apple@example.com"
                    value={newAppleEmail}
                    onChange={(e) => setNewAppleEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">크레딧</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newAppleCredit}
                    onChange={(e) => setNewAppleCredit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleCancelEdit} className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition">
                    취소
                  </button>
                  <button onClick={editingApple ? handleUpdateApple : handleAddApple} className="flex-1 px-4 py-2 bg-white text-neutral-900 rounded hover:bg-neutral-100 transition font-medium">
                    {editingApple ? '저장' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(showAddYoutube || editingYoutube) && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-md">
              <div className="px-6 py-4 border-b border-neutral-800">
                <h3 className="text-lg font-semibold text-white">{editingYoutube ? 'YouTube 계정 수정' : 'YouTube 계정 추가'}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">이메일</label>
                  <input
                    type="email"
                    placeholder="youtube@example.com"
                    value={newYoutubeEmail}
                    onChange={(e) => setNewYoutubeEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">닉네임 (선택)</label>
                  <input
                    type="text"
                    placeholder="닉네임"
                    value={newYoutubeNickname}
                    onChange={(e) => setNewYoutubeNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">갱신일</label>
                  <input
                    type="date"
                    value={newYoutubeRenewalDate}
                    onChange={(e) => setNewYoutubeRenewalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleCancelEdit} className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition">
                    취소
                  </button>
                  <button onClick={editingYoutube ? handleUpdateYoutube : handleAddYoutube} className="flex-1 px-4 py-2 bg-white text-neutral-900 rounded hover:bg-neutral-100 transition font-medium">
                    {editingYoutube ? '저장' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(showAddMember || editingMember) && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-lg">
              <div className="px-6 py-4 border-b border-neutral-800">
                <h3 className="text-lg font-semibold text-white">{editingMember ? '회원 수정' : '회원 추가'}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">닉네임</label>
                  <input
                    type="text"
                    placeholder="닉네임"
                    value={newMemberNickname}
                    onChange={(e) => setNewMemberNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">이메일</label>
                  <input
                    type="email"
                    placeholder="member@example.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">이름</label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">가입 날짜</label>
                    <input
                      type="date"
                      value={newLastPaymentDate}
                      onChange={(e) => setNewLastPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-neutral-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">다음 결제일</label>
                    <input
                      type="date"
                      value={newPaymentDate}
                      onChange={(e) => setNewPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-neutral-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">입금 상태</label>
                  <select
                    value={newDepositStatus}
                    onChange={(e) => setNewDepositStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-neutral-500 transition"
                  >
                    <option value="pending">대기</option>
                    <option value="completed">완료</option>
                  </select>
                </div>
                <div className="border-t border-neutral-700 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="willRenew"
                      checked={newWillRenew}
                      onChange={(e) => setNewWillRenew(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-white focus:ring-2 focus:ring-white"
                    />
                    <label htmlFor="willRenew" className="text-sm font-medium text-neutral-300">
                      갱신 예정
                    </label>
                  </div>
                  {newWillRenew && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1.5">갱신 기간 (개월)</label>
                      <select
                        value={newRenewMonths}
                        onChange={(e) => setNewRenewMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-neutral-500 transition"
                      >
                        <option value={1}>1개월</option>
                        <option value={2}>2개월</option>
                        <option value={3}>3개월</option>
                        <option value={6}>6개월</option>
                        <option value={12}>12개월</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleCancelEdit} className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition">
                    취소
                  </button>
                  <button onClick={editingMember ? handleUpdateMember : handleAddMember} className="flex-1 px-4 py-2 bg-white text-neutral-900 rounded hover:bg-neutral-100 transition font-medium">
                    {editingMember ? '저장' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Apple Accounts Column */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white">Apple 계정</h2>
              <div className="flex gap-2">
                <button onClick={handleSortApple} className="px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition">
                  {appleSortOrder === 'oldest' ? '오래된순' : '최신순'}
                </button>
                <button onClick={() => setShowAddApple(true)} className="px-2 py-1 text-xs bg-white text-neutral-900 rounded hover:bg-neutral-100 transition font-medium">
                  추가
                </button>
              </div>
            </div>

            <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {sortedAppleAccounts.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  Apple 계정이 없습니다
                </div>
              ) : (
                sortedAppleAccounts.map(apple => (
                  <div
                    key={apple.id}
                    onClick={() => handleAppleSelect(apple)}
                    className={`p-3 rounded border cursor-pointer transition ${
                      selectedApple?.id === apple.id
                        ? 'bg-neutral-800 border-neutral-600'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{apple.appleEmail}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{formatDateOnly(apple.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditApple(apple); }}
                          className="text-neutral-400 hover:text-white transition text-sm"
                        >
                          ✎
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteApple(apple.id); }}
                          className="text-neutral-400 hover:text-red-400 transition text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {editingCreditId === apple.id ? (
                      <div className="flex items-center gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          value={editingCreditValue}
                          onChange={(e) => setEditingCreditValue(Number(e.target.value))}
                          className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-neutral-500"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateCredit(apple.id)}
                        />
                        <button onClick={() => handleUpdateCredit(apple.id)} className="text-green-400 hover:text-green-300 text-sm">✓</button>
                        <button onClick={handleCancelEditCredit} className="text-red-400 hover:text-red-300 text-sm">×</button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartEditCredit(apple); }}
                        className="mt-2 text-xs px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition"
                      >
                        크레딧: {apple.remainingCredit?.toLocaleString() || 0}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* YouTube Accounts Column */}
          <div id="youtube-section" className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden scroll-mt-4">
            <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white">YouTube 계정</h2>
              {selectedApple && (
                <button onClick={() => setShowAddYoutube(true)} className="px-2 py-1 text-xs bg-white text-neutral-900 rounded hover:bg-neutral-100 transition font-medium">
                  추가
                </button>
              )}
            </div>

            <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {!selectedApple ? (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  Apple 계정을 선택하세요
                </div>
              ) : sortedYoutubeAccounts.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  YouTube 계정이 없습니다
                </div>
              ) : (
                sortedYoutubeAccounts.map(youtube => (
                  <div
                    key={youtube.id}
                    onClick={() => handleYoutubeSelect(youtube)}
                    className={`p-3 rounded border cursor-pointer transition ${
                      selectedYoutube?.id === youtube.id
                        ? 'bg-neutral-800 border-neutral-600'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{youtube.youtubeEmail}</p>
                        {youtube.nickname && <p className="text-xs text-neutral-400 mt-0.5">{youtube.nickname}</p>}
                        <p className="text-xs text-neutral-500 mt-1">갱신일: {formatDateOnly(youtube.renewalDate)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditYoutube(youtube); }}
                          className="text-neutral-400 hover:text-white transition text-sm"
                        >
                          ✎
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteYoutube(youtube.id); }}
                          className="text-neutral-400 hover:text-red-400 transition text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Members Column */}
          <div id="members-section" className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden scroll-mt-4">
            <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white">회원 목록</h2>
              {selectedYoutube && (
                <button onClick={() => setShowAddMember(true)} className="px-2 py-1 text-xs bg-white text-neutral-900 rounded hover:bg-neutral-100 transition font-medium">
                  추가
                </button>
              )}
            </div>

            <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {!selectedYoutube ? (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  YouTube 계정을 선택하세요
                </div>
              ) : sortedMembers.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  회원이 없습니다
                </div>
              ) : (
                sortedMembers.map(member => (
                  <div key={member.id} className="p-3 bg-neutral-900 border border-neutral-800 rounded hover:border-neutral-700 transition">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {member.nickname} <span className="text-neutral-500 font-normal">({member.name})</span>
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate">{member.email}</p>
                        <div className="mt-2 space-y-0.5 text-xs text-neutral-500">
                          <p>이전 결제일: {formatDateOnly(member.lastPaymentDate)}</p>
                          <p>다음 결제일: {formatDateOnly(member.paymentDate)}</p>
                          {member.willRenew && (
                            <p className="text-blue-400 font-medium">
                              갱신 예정: {member.renewMonths}개월
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="text-neutral-400 hover:text-white transition text-sm"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-neutral-400 hover:text-red-400 transition text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateMemberStatus(member.id, cycleStatus(member.depositStatus))}
                      className={`mt-2 w-full text-xs px-2 py-1.5 rounded font-medium transition ${
                        member.depositStatus === 'completed'
                          ? 'bg-green-900 border border-green-800 text-green-100 hover:bg-green-800'
                          : 'bg-yellow-900 border border-yellow-800 text-yellow-100 hover:bg-yellow-800'
                      }`}
                    >
                      {member.depositStatus === 'completed' ? '완료' : '대기'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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
                  if (confirmAction.type === 'deleteApple') {
                    executeDeleteApple(confirmAction.id);
                  } else if (confirmAction.type === 'deleteYoutube') {
                    executeDeleteYoutube(confirmAction.id, confirmAction.appleId);
                  } else if (confirmAction.type === 'deleteMember') {
                    executeDeleteMember(confirmAction.id, confirmAction.appleId);
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
