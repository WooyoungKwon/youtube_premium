'use client';

import { useState, useEffect } from 'react';

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
  const [newAppleEmail, setNewAppleEmail] = useState('');
  const [newYoutubeEmail, setNewYoutubeEmail] = useState('');
  const [newYoutubeNickname, setNewYoutubeNickname] = useState('');
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newJoinDate, setNewJoinDate] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState('');
  const [newDepositStatus, setNewDepositStatus] = useState('pending');

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
      body: JSON.stringify({ id, status }),
    });
    if (selectedYoutube) fetchMembers(selectedYoutube.id);
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

              <div className="grid gap-3">
                {appleAccounts.map((apple) => (
                  <div
                    key={apple.id}
                    className="p-4 border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex justify-between items-center"
                  >
                    <div
                      onClick={() => handleAppleSelect(apple)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-bold text-lg text-gray-900">{apple.appleEmail}</div>
                      <div className="text-sm text-gray-600 font-medium">
                        생성일: {new Date(apple.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteApple(apple.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
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

              <div className="grid gap-3">
                {youtubeAccounts.map((youtube) => (
                  <div
                    key={youtube.id}
                    className="p-4 border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex justify-between items-center"
                  >
                    <div
                      onClick={() => handleYoutubeSelect(youtube)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-bold text-lg text-gray-900">
                        {youtube.youtubeEmail}
                        {youtube.nickname && (
                          <span className="ml-2 text-blue-600">({youtube.nickname})</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        생성일: {new Date(youtube.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteYoutube(youtube.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
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

              {showAddMember && (
                <div className="mb-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
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
                      onClick={handleAddMember}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      추가
                    </button>
                    <button
                      onClick={() => setShowAddMember(false)}
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
                    {members.map((member) => (
                      <tr key={member.id} className="border-b-2 border-gray-200 hover:bg-blue-50">
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
                            onChange={(e) => handleUpdateMemberStatus(member.id, e.target.value)}
                            className="px-2 py-1 border-2 border-gray-300 rounded bg-white text-gray-900 font-medium"
                          >
                            <option value="pending">대기</option>
                            <option value="completed">완료</option>
                            <option value="failed">실패</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
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
