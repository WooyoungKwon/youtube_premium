'use client';

import { useState, useEffect, useMemo } from 'react';

interface AppleAccount {
  id: string;
  appleEmail: string;
  createdAt: string;
}

interface YoutubeAccount {
  id: string;
  appleAccountId: string;
  youtubeEmail: string;
  nickname?: string;
  createdAt: string;
}

interface Member {
  id: string;
  youtubeAccountId: string;
  requestId?: string;
  nickname: string;
  email: string;
  name: string;
  joinDate: string;
  paymentDate: string;
  depositStatus: string;
  createdAt: string;
}

type Step = 'apple' | 'youtube' | 'members';

// Sortable 아이템 컴포넌트들
function SortableAppleItem({ account, onSelect, onDelete, isSelected }: {
  account: AppleAccount;
  onSelect: () => void;
  onDelete: () => void;
  isSelected: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: account.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 6h10v1H3zM3 9h10v1H3z"/>
        </svg>
      </div>
      <div className="flex-1" onClick={onSelect}>
        <p className="text-gray-900 font-medium">{account.appleEmail}</p>
        <p className="text-sm text-gray-600">{new Date(account.createdAt).toLocaleString()}</p>
      </div>
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
  );
}

function SortableYoutubeItem({ account, onSelect, onDelete, isSelected }: {
  account: YoutubeAccount;
  onSelect: () => void;
  onDelete: () => void;
  isSelected: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: account.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 6h10v1H3zM3 9h10v1H3z"/>
        </svg>
      </div>
      <div className="flex-1" onClick={onSelect}>
        <p className="text-gray-900 font-medium">{account.youtubeEmail}</p>
        {account.nickname && <p className="text-sm text-blue-600 font-medium">닉네임: {account.nickname}</p>}
        <p className="text-sm text-gray-600">{new Date(account.createdAt).toLocaleString()}</p>
      </div>
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
  );
}

function SortableMemberRow({ member, onEdit, onDelete, onUpdateStatus }: {
  member: Member;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b-2 border-gray-200 hover:bg-blue-50">
      <td className="px-4 py-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 inline-block">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 6h10v1H3zM3 9h10v1H3z"/>
          </svg>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-900 font-medium">{member.nickname}</td>
      <td className="px-4 py-3 text-gray-900">{member.email}</td>
      <td className="px-4 py-3 text-gray-900">
        {new Date(member.joinDate).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-gray-900">
        {new Date(member.paymentDate).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-gray-900">{member.name}</td>
      <td className="px-4 py-3">
        <select
          value={member.depositStatus}
          onChange={(e) => onUpdateStatus(member.id, e.target.value)}
          className="px-2 py-1 border-2 border-gray-300 rounded bg-white text-gray-900 font-medium"
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
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function MemberManagementModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('apple');
  const [appleAccounts, setAppleAccounts] = useState<AppleAccount[]>([]);
  const [youtubeAccounts, setYoutubeAccounts] = useState<YoutubeAccount[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedApple, setSelectedApple] = useState<AppleAccount | null>(null);
  const [selectedYoutube, setSelectedYoutube] = useState<YoutubeAccount | null>(null);
  
  // 새 계정/회원 추가 상태
  const [showAddApple, setShowAddApple] = useState(false);
  const [showAddYoutube, setShowAddYoutube] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newAppleEmail, setNewAppleEmail] = useState('');
  const [newYoutubeEmail, setNewYoutubeEmail] = useState('');
  const [newYoutubeNickname, setNewYoutubeNickname] = useState('');
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newJoinDate, setNewJoinDate] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState('');
  const [newDepositStatus, setNewDepositStatus] = useState('pending');

  // 드래그 앤 드롭 상태
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchAppleAccounts();
  }, []);

  const fetchAppleAccounts = async () => {
    const res = await fetch('/api/admin/apple-accounts');
    const data = await res.json();
    setAppleAccounts(data);
  };

  const fetchYoutubeAccounts = async (appleId: string) => {
    const res = await fetch(`/api/admin/youtube-accounts?appleId=${appleId}`);
    const data = await res.json();
    setYoutubeAccounts(data);
  };

  const fetchMembers = async (youtubeId: string) => {
    const res = await fetch(`/api/admin/members?youtubeId=${youtubeId}`);
    const data = await res.json();
    setMembers(data);
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
    await fetch('/api/admin/apple-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appleEmail: newAppleEmail }),
    });
    setNewAppleEmail('');
    setShowAddApple(false);
    fetchAppleAccounts();
  };

  const handleDeleteApple = async (id: string) => {
    if (!confirm('이 Apple 계정과 연결된 모든 데이터가 삭제됩니다. 계속하시겠습니까?')) return;
    await fetch(`/api/admin/apple-accounts?id=${id}`, { method: 'DELETE' });
    fetchAppleAccounts();
  };

  const handleAddYoutube = async () => {
    if (!newYoutubeEmail.trim() || !selectedApple) return;
    await fetch('/api/admin/youtube-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appleAccountId: selectedApple.id,
        youtubeEmail: newYoutubeEmail,
        nickname: newYoutubeNickname,
      }),
    });
    setNewYoutubeEmail('');
    setNewYoutubeNickname('');
    setShowAddYoutube(false);
    fetchYoutubeAccounts(selectedApple.id);
  };

  const handleDeleteYoutube = async (id: string) => {
    if (!confirm('이 YouTube 계정과 연결된 모든 회원이 삭제됩니다. 계속하시겠습니까?')) return;
    await fetch(`/api/admin/youtube-accounts?id=${id}`, { method: 'DELETE' });
    if (selectedApple) fetchYoutubeAccounts(selectedApple.id);
  };

  const handleAddMember = async () => {
    if (!newMemberNickname.trim() || !newMemberEmail.trim() || !newMemberName.trim() || !selectedYoutube) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        youtubeAccountId: selectedYoutube.id,
        nickname: newMemberNickname,
        email: newMemberEmail,
        name: newMemberName,
        joinDate: newJoinDate ? newJoinDate : today,
        paymentDate: newPaymentDate ? newPaymentDate : today,
        depositStatus: newDepositStatus,
      }),
    });
    setNewMemberNickname('');
    setNewMemberEmail('');
    setNewMemberName('');
    setNewJoinDate('');
    setNewPaymentDate('');
    setNewDepositStatus('pending');
    setShowAddMember(false);
    fetchMembers(selectedYoutube.id);
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('이 회원을 삭제하시겠습니까?')) return;
    await fetch(`/api/admin/members?id=${id}`, { method: 'DELETE' });
    if (selectedYoutube) fetchMembers(selectedYoutube.id);
  };

  const handleUpdateMemberStatus = async (id: string, status: string) => {
    await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, depositStatus: status }),
    });
    if (selectedYoutube) fetchMembers(selectedYoutube.id);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setNewMemberNickname(member.nickname);
    setNewMemberEmail(member.email);
    setNewMemberName(member.name);
    
    // 날짜 형식을 YYYY-MM-DD로 변환
    const formatDateForInput = (dateString: string) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };
    
    setNewJoinDate(formatDateForInput(member.joinDate));
    setNewPaymentDate(formatDateForInput(member.paymentDate));
    setNewDepositStatus(member.depositStatus);
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !newMemberNickname.trim() || !newMemberEmail.trim() || !newMemberName.trim()) return;
    
    await fetch('/api/admin/members', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingMember.id,
        nickname: newMemberNickname,
        email: newMemberEmail,
        name: newMemberName,
        joinDate: newJoinDate,
        paymentDate: newPaymentDate,
        depositStatus: newDepositStatus,
      }),
    });
    
    setEditingMember(null);
    setNewMemberNickname('');
    setNewMemberEmail('');
    setNewMemberName('');
    setNewJoinDate('');
    setNewPaymentDate('');
    setNewDepositStatus('pending');
    if (selectedYoutube) fetchMembers(selectedYoutube.id);
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setNewMemberNickname('');
    setNewMemberEmail('');
    setNewMemberName('');
    setNewJoinDate('');
    setNewPaymentDate('');
    setNewDepositStatus('pending');
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    if (step === 'apple') {
      const oldIndex = appleAccounts.findIndex(item => item.id === active.id);
      const newIndex = appleAccounts.findIndex(item => item.id === over.id);
      setAppleAccounts(arrayMove(appleAccounts, oldIndex, newIndex));
    } else if (step === 'youtube') {
      const oldIndex = youtubeAccounts.findIndex(item => item.id === active.id);
      const newIndex = youtubeAccounts.findIndex(item => item.id === over.id);
      setYoutubeAccounts(arrayMove(youtubeAccounts, oldIndex, newIndex));
    } else if (step === 'members') {
      const oldIndex = members.findIndex(item => item.id === active.id);
      const newIndex = members.findIndex(item => item.id === over.id);
      setMembers(arrayMove(members, oldIndex, newIndex));
    }
  };

  const goBack = () => {
    if (step === 'members') {
      setStep('youtube');
      setSelectedYoutube(null);
    } else if (step === 'youtube') {
      setStep('apple');
      setSelectedApple(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {step !== 'apple' && (
              <button
                onClick={goBack}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← 뒤로
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 'apple' && '회원 관리 - Apple 계정 선택'}
              {step === 'youtube' && `회원 관리 - YouTube 계정 선택 (${selectedApple?.appleEmail})`}
              {step === 'members' && `가입 회원 목록 (${selectedYoutube?.youtubeEmail})`}
            </h2>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="p-6">
          {/* Apple 계정 선택 단계 */}
          {step === 'apple' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-700 font-medium">관리할 Apple 계정을 선택해주세요</p>
                <button
                  onClick={() => setShowAddApple(!showAddApple)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  + Apple 계정 추가
                </button>
              </div>

              {showAddApple && (
                <div className="mb-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <input
                    type="email"
                    value={newAppleEmail}
                    onChange={(e) => setNewAppleEmail(e.target.value)}
                    placeholder="Apple 이메일"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddApple}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      추가
                    </button>
                    <button
                      onClick={() => setShowAddApple(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              <SortableContext items={appleAccounts.map(a => a.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-3">
                  {appleAccounts.map((apple) => (
                    <SortableAppleItem
                      key={apple.id}
                      account={apple}
                      onSelect={() => handleAppleSelect(apple)}
                      onDelete={() => handleDeleteApple(apple.id)}
                      isSelected={false}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )}

          {/* YouTube 계정 선택 단계 */}
          {step === 'youtube' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-700 font-medium">관리할 YouTube 계정을 선택해주세요</p>
                <button
                  onClick={() => setShowAddYoutube(!showAddYoutube)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  + YouTube 계정 추가
                </button>
              </div>

              {showAddYoutube && (
                <div className="mb-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <input
                    type="email"
                    value={newYoutubeEmail}
                    onChange={(e) => setNewYoutubeEmail(e.target.value)}
                    placeholder="YouTube 이메일"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <input
                    type="text"
                    value={newYoutubeNickname}
                    onChange={(e) => setNewYoutubeNickname(e.target.value)}
                    placeholder="닉네임"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddYoutube}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      추가
                    </button>
                    <button
                      onClick={() => setShowAddYoutube(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              <SortableContext items={youtubeAccounts.map(y => y.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-3">
                  {youtubeAccounts.map((youtube) => (
                    <SortableYoutubeItem
                      key={youtube.id}
                      account={youtube}
                      onSelect={() => handleYoutubeSelect(youtube)}
                      onDelete={() => handleDeleteYoutube(youtube.id)}
                      isSelected={false}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )}

          {/* 회원 목록 단계 */}
          {step === 'members' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-700 font-medium">가입된 회원 목록입니다</p>
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  + 회원 추가
                </button>
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
                        onKeyDown={(e) => {
                          // Allow keyboard input for date
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || e.key === 'Enter') {
                            return;
                          }
                          if (!/[0-9-]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="yyyy-mm-dd"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-800 font-semibold mb-1">결제일</label>
                      <input
                        type="date"
                        value={newPaymentDate}
                        onChange={(e) => setNewPaymentDate(e.target.value)}
                        onKeyDown={(e) => {
                          // Allow keyboard input for date
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || e.key === 'Enter') {
                            return;
                          }
                          if (!/[0-9-]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="yyyy-mm-dd"
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
                      <th className="px-4 py-3 text-left font-bold text-gray-900"></th>
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
                    <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
                      {members.map((member) => (
                        <SortableMemberRow
                          key={member.id}
                          member={member}
                          onEdit={() => handleEditMember(member)}
                          onDelete={() => handleDeleteMember(member.id)}
                          onUpdateStatus={handleUpdateMemberStatus}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
