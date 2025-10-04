'use client';

import { useState, useEffect, useMemo } from 'react';
import { AppleAccount, YoutubeAccount, Member } from '@/types';

type Step = 'apple' | 'youtube' | 'members';
type SortOrder = 'oldest' | 'newest';

// 일반 아이템 컴포넌트들
function AppleItem({ 
  account, 
  onSelect, 
  onEdit, 
  onDelete, 
  onStartEditCredit, 
  onUpdateCredit, 
  onCancelEditCredit, 
  editingCreditId, 
  editingCreditValue, 
  onEditingCreditValueChange 
}: {
  account: AppleAccount;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartEditCredit: (account: AppleAccount) => void;
  onUpdateCredit: (id: string) => void;
  onCancelEditCredit: () => void;
  editingCreditId: string | null;
  editingCreditValue: number;
  onEditingCreditValueChange: (value: number) => void;
}) {
  return (
    <div
      className="p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-3"
    >
      <div className="flex-1" onClick={onSelect}>
        <p className="text-gray-900 font-medium">{account.appleEmail}</p>
        <div className="flex items-center gap-2 mt-1">
          {editingCreditId === account.id ? (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">크레딧:</span>
              <input
                type="number"
                value={editingCreditValue}
                onChange={(e) => onEditingCreditValueChange(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                min="0"
                className="w-16 px-1 py-0.5 text-sm border border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">루피</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateCredit(account.id);
                }}
                className="px-1 py-0.5 bg-green-500 text-white rounded text-xs hover:bg-green-600"
              >
                ✓
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelEditCredit();
                }}
                className="px-1 py-0.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartEditCredit(account);
              }}
              className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200"
            >
              잔여 크레딧: {account.remainingCredit || 0}루피
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600">{new Date(account.createdAt).toLocaleString()}</p>
        {account.lastUpdated && (
          <p className="text-xs text-gray-400">
            마지막 업데이트: {new Date(account.lastUpdated).toLocaleDateString()}
          </p>
        )}
        {account.renewalDate && (
          <p className="text-xs text-green-600">
            갱신일: {new Date(account.renewalDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
        >
          수정
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

function YoutubeItem({ account, onSelect, onEdit, onDelete, isSelected }: {
  account: YoutubeAccount;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isSelected: boolean;
}) {
  return (
    <div
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
      }`}
    >
      <div className="flex-1" onClick={onSelect}>
        <p className="text-gray-900 font-medium">{account.youtubeEmail}</p>
        {account.nickname && <p className="text-sm text-blue-600 font-medium">닉네임: {account.nickname}</p>}
        <p className="text-sm text-gray-600">{new Date(account.createdAt).toLocaleString()}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
        >
          수정
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

function MemberRow({ member, onEdit, onDelete, onUpdateStatus }: {
  member: Member;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  return (
    <tr className="border-b border-gray-300 hover:bg-gray-50">
      <td className="px-4 py-3 text-gray-900">{member.nickname}</td>
      <td className="px-4 py-3 text-gray-900">{member.email}</td>
      <td className="px-4 py-3 text-gray-900">{member.joinDate}</td>
      <td className="px-4 py-3 text-gray-900">{member.paymentDate}</td>
      <td className="px-4 py-3 text-gray-900">{member.name}</td>
      <td className="px-4 py-3">
        <select
          value={member.depositStatus}
          onChange={(e) => onUpdateStatus(member.id, e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="pending">대기</option>
          <option value="completed">완료</option>
          <option value="failed">실패</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function MemberManagementModal({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>('apple');
  const [appleAccounts, setAppleAccounts] = useState<AppleAccount[]>([]);
  const [youtubeAccounts, setYoutubeAccounts] = useState<YoutubeAccount[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedApple, setSelectedApple] = useState<AppleAccount | null>(null);
  const [selectedYoutube, setSelectedYoutube] = useState<YoutubeAccount | null>(null);
  
  // 편집 상태
  const [editingApple, setEditingApple] = useState<AppleAccount | null>(null);
  const [editingYoutube, setEditingYoutube] = useState<YoutubeAccount | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  // 크레딧 편집 상태
  const [editingCreditId, setEditingCreditId] = useState<string | null>(null);
  const [editingCreditValue, setEditingCreditValue] = useState(0);
  
  // 추가 관련 상태
  const [showAddApple, setShowAddApple] = useState(false);
  const [showAddYoutube, setShowAddYoutube] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newAppleEmail, setNewAppleEmail] = useState('');
  const [newAppleCredit, setNewAppleCredit] = useState(0);
  const [newAppleRenewalDate, setNewAppleRenewalDate] = useState('');
  const [newYoutubeEmail, setNewYoutubeEmail] = useState('');
  const [newYoutubeNickname, setNewYoutubeNickname] = useState('');
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newJoinDate, setNewJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDepositStatus, setNewDepositStatus] = useState('pending');

  // 정렬 상태
  const [appleSortOrder, setAppleSortOrder] = useState<SortOrder>('newest');
  const [youtubeSortOrder, setYoutubeSortOrder] = useState<SortOrder>('newest');
  const [memberSortOrder, setMemberSortOrder] = useState<SortOrder>('newest');

  // 정렬된 배열들 (useMemo로 정렬 상태 유지)
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
    if (isOpen) {
      fetchAppleAccounts();
    }
  }, [isOpen]);

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

  // 정렬 핸들러 (상태만 변경)
  const handleSortApple = () => {
    setAppleSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleSortYoutube = () => {
    setYoutubeSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleSortMember = () => {
    setMemberSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleAppleSelect = async (apple: AppleAccount) => {
    setSelectedApple(apple);
    await fetchYoutubeAccounts(apple.id);
    setStep('youtube');
  };

  const handleYoutubeSelect = async (youtube: YoutubeAccount) => {
    setSelectedYoutube(youtube);
    await fetchMembers(youtube.id);
    setStep('members');
  };

  const handleAddApple = async () => {
    if (!newAppleEmail.trim()) return;
    
    try {
      const res = await fetch('/api/admin/apple-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appleEmail: newAppleEmail,
          remainingCredit: newAppleCredit,
          renewalDate: newAppleRenewalDate || null
        }),
      });
      
      if (res.ok) {
        setNewAppleEmail('');
        setNewAppleCredit(0);
        setShowAddApple(false);
        await fetchAppleAccounts();
      }
    } catch (error) {
      console.error('Apple 계정 추가에 실패했습니다:', error);
    }
  };

  const handleEditApple = (apple: AppleAccount) => {
    setEditingApple(apple);
    setNewAppleEmail(apple.appleEmail);
    setNewAppleCredit(apple.remainingCredit || 0);
    setNewAppleRenewalDate(apple.renewalDate || '');
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
          renewalDate: newAppleRenewalDate || null
        }),
      });
      
      if (res.ok) {
        setEditingApple(null);
        setNewAppleEmail('');
        setNewAppleCredit(0);
        setNewAppleRenewalDate('');
        setShowAddApple(false);
        await fetchAppleAccounts();
      }
    } catch (error) {
      console.error('Apple 계정 수정에 실패했습니다:', error);
    }
  };

  const handleDeleteApple = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/apple-accounts/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        await fetchAppleAccounts();
      }
    } catch (error) {
      console.error('Apple 계정 삭제에 실패했습니다:', error);
    }
  };

  // 크레딧 편집 관련 함수들
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

  const handleEditingCreditValueChange = (value: number) => {
    setEditingCreditValue(value);
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
    try {
      const res = await fetch(`/api/admin/youtube-accounts/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok && selectedApple) {
        await fetchYoutubeAccounts(selectedApple.id);
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
          joinDate: newJoinDate,
          paymentDate: newPaymentDate,
          depositStatus: newDepositStatus,
        }),
      });
      
      if (res.ok) {
        const today = new Date().toISOString().split('T')[0];
        setNewMemberNickname('');
        setNewMemberEmail('');
        setNewMemberName('');
        setNewJoinDate(today);
        setNewPaymentDate(today);
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
    setNewJoinDate(member.joinDate);
    setNewPaymentDate(member.paymentDate);
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
          joinDate: newJoinDate,
          paymentDate: newPaymentDate,
          depositStatus: newDepositStatus,
        }),
      });
      
      if (res.ok) {
        const today = new Date().toISOString().split('T')[0];
        setEditingMember(null);
        setNewMemberNickname('');
        setNewMemberEmail('');
        setNewMemberName('');
        setNewJoinDate(today);
        setNewPaymentDate(today);
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

  const handleCancelEdit = () => {
    if (editingApple) {
      setEditingApple(null);
      setNewAppleEmail('');
      setNewAppleCredit(0);
      setNewAppleRenewalDate('');
      setShowAddApple(false);
    }
    if (editingYoutube) {
      setEditingYoutube(null);
      setNewYoutubeEmail('');
      setNewYoutubeNickname('');
      setShowAddYoutube(false);
    }
    if (editingMember) {
      const today = new Date().toISOString().split('T')[0];
      setEditingMember(null);
      setNewMemberNickname('');
      setNewMemberEmail('');
      setNewMemberName('');
      setNewJoinDate(today);
      setNewPaymentDate(today);
      setNewDepositStatus('pending');
      setShowAddMember(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">회원 관리</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 네비게이션 */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setStep('apple')}
            className={`px-4 py-2 rounded-lg font-medium ${
              step === 'apple' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Apple 계정
          </button>
          <button
            onClick={() => setStep('youtube')}
            disabled={!selectedApple}
            className={`px-4 py-2 rounded-lg font-medium ${
              step === 'youtube' 
                ? 'bg-blue-500 text-white' 
                : selectedApple 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            YouTube 계정
          </button>
          <button
            onClick={() => setStep('members')}
            disabled={!selectedYoutube}
            className={`px-4 py-2 rounded-lg font-medium ${
              step === 'members' 
                ? 'bg-blue-500 text-white' 
                : selectedYoutube 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            회원 목록
          </button>
        </div>

        <div>
          {/* Apple 계정 단계 */}
          {step === 'apple' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Apple 계정 목록</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSortApple}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    날짜순 정렬 ({appleSortOrder === 'oldest' ? '오래된순' : '최신순'})
                  </button>
                  <button
                    onClick={() => setShowAddApple(!showAddApple)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    + Apple 계정 추가
                  </button>
                </div>
              </div>

              {(showAddApple || editingApple) && (
                <div className="mb-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {editingApple ? 'Apple 계정 수정' : 'Apple 계정 추가'}
                  </h3>
                  <input
                    type="email"
                    value={newAppleEmail}
                    onChange={(e) => setNewAppleEmail(e.target.value)}
                    placeholder="Apple 이메일*"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <input
                    type="number"
                    value={newAppleCredit}
                    onChange={(e) => setNewAppleCredit(Number(e.target.value))}
                    placeholder="크레딧 (루피)"
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <input
                    type="date"
                    value={newAppleRenewalDate}
                    onChange={(e) => setNewAppleRenewalDate(e.target.value)}
                    placeholder="갱신일"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={editingApple ? handleUpdateApple : handleAddApple}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      {editingApple ? '저장' : '추가'}
                    </button>
                    <button
                      onClick={editingApple ? handleCancelEdit : () => setShowAddApple(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {sortedAppleAccounts.map((apple) => (
                  <AppleItem
                    key={apple.id}
                    account={apple}
                    onSelect={() => handleAppleSelect(apple)}
                    onEdit={() => handleEditApple(apple)}
                    onDelete={() => handleDeleteApple(apple.id)}
                    onStartEditCredit={handleStartEditCredit}
                    onUpdateCredit={handleUpdateCredit}
                    onCancelEditCredit={handleCancelEditCredit}
                    editingCreditId={editingCreditId}
                    editingCreditValue={editingCreditValue}
                    onEditingCreditValueChange={handleEditingCreditValueChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* YouTube 계정 단계 */}
          {step === 'youtube' && selectedApple && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">YouTube 계정 목록</h3>
                  <p className="text-sm text-gray-600">선택된 Apple 계정: {selectedApple.appleEmail}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSortYoutube}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                  >
                    날짜순 정렬 ({youtubeSortOrder === 'oldest' ? '오래된순' : '최신순'})
                  </button>
                  <button
                    onClick={() => setShowAddYoutube(!showAddYoutube)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    + YouTube 계정 추가
                  </button>
                </div>
              </div>

              {(showAddYoutube || editingYoutube) && (
                <div className="mb-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {editingYoutube ? 'YouTube 계정 수정' : 'YouTube 계정 추가'}
                  </h3>
                  <input
                    type="email"
                    value={newYoutubeEmail}
                    onChange={(e) => setNewYoutubeEmail(e.target.value)}
                    placeholder="YouTube 이메일*"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <input
                    type="text"
                    value={newYoutubeNickname}
                    onChange={(e) => setNewYoutubeNickname(e.target.value)}
                    placeholder="닉네임 (선택사항)"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={editingYoutube ? handleUpdateYoutube : handleAddYoutube}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      {editingYoutube ? '저장' : '추가'}
                    </button>
                    <button
                      onClick={editingYoutube ? handleCancelEdit : () => setShowAddYoutube(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {sortedYoutubeAccounts.map((youtube) => (
                  <YoutubeItem
                    key={youtube.id}
                    account={youtube}
                    onSelect={() => handleYoutubeSelect(youtube)}
                    onEdit={() => handleEditYoutube(youtube)}
                    onDelete={() => handleDeleteYoutube(youtube.id)}
                    isSelected={selectedYoutube?.id === youtube.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 회원 목록 단계 */}
          {step === 'members' && selectedYoutube && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">회원 목록</h3>
                  <p className="text-sm text-gray-600">선택된 YouTube 계정: {selectedYoutube.youtubeEmail}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSortMember}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                  >
                    날짜순 정렬 ({memberSortOrder === 'oldest' ? '오래된순' : '최신순'})
                  </button>
                  <button
                    onClick={() => setShowAddMember(!showAddMember)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    + 회원 추가
                  </button>
                </div>
              </div>

              {(showAddMember || editingMember) && (
                <div className="mb-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {editingMember ? '회원 정보 수정' : '회원 추가'}
                  </h3>
                  <input
                    type="text"
                    value={newMemberNickname}
                    onChange={(e) => setNewMemberNickname(e.target.value)}
                    placeholder="닉네임*"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="이메일*"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="이름*"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-sm text-gray-800 font-semibold mb-1">가입날짜</label>
                      <input
                        type="date"
                        value={newJoinDate}
                        onChange={(e) => setNewJoinDate(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-800 font-semibold mb-1">결제일</label>
                      <input
                        type="date"
                        value={newPaymentDate}
                        onChange={(e) => setNewPaymentDate(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm text-gray-800 font-semibold mb-1">입금여부*</label>
                    <select
                      value={newDepositStatus}
                      onChange={(e) => setNewDepositStatus(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900"
                    >
                      <option value="pending">대기</option>
                      <option value="completed">완료</option>
                      <option value="failed">실패</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editingMember ? handleUpdateMember : handleAddMember}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      {editingMember ? '저장' : '추가'}
                    </button>
                    <button
                      onClick={editingMember ? handleCancelEdit : () => setShowAddMember(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-2 border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-900">닉네임</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-900">이메일</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-900">가입날짜</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-900">결제일</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-900">이름</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-900">입금여부</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-900">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMembers.map((member) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        onEdit={() => handleEditMember(member)}
                        onDelete={() => handleDeleteMember(member.id)}
                        onUpdateStatus={handleUpdateMemberStatus}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}