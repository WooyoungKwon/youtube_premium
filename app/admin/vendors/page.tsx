'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Vendor } from '@/types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string } | null>(null);
  const [newVendorLink, setNewVendorLink] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        const vendorLink = getVendorLink(data.id);
        setNewVendorLink(vendorLink);
        setMessage({
          type: 'success',
          text: `${formData.name}님이 등록되었습니다. 전용 링크를 복사해서 전달해주세요.`
        });
        // 모달은 유지하고 폼만 리셋
        setFormData({ name: '', email: '', phone: '' });
        fetchVendors();
      } else {
        setMessage({ type: 'error', text: data.error || '판매자 등록에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleVendorStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });

      if (response.ok) {
        fetchVendors();
      }
    } catch (error) {
      console.error('Failed to toggle vendor status:', error);
    }
  };

  const deleteVendor = (id: string) => {
    setConfirmAction({ type: 'delete', id });
  };

  const executeDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/vendors?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchVendors();
        setMessage({ type: 'success', text: '판매자가 삭제되었습니다.' });
      } else {
        setMessage({ type: 'error', text: '삭제에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      setMessage({ type: 'error', text: '삭제에 실패했습니다.' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string, vendorName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage({ type: 'success', text: `${vendorName}님의 링크가 복사되었습니다!` });
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const getVendorLink = (vendorId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/?ref=${vendorId}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">판매자 관리</h1>
              <p className="text-sm text-neutral-400 mt-1">영화 예매 판매자 목록 및 관리</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-purple-900 border border-purple-800 text-purple-100 rounded hover:bg-purple-800 transition text-sm font-medium"
              >
                + 판매자 추가
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded hover:bg-neutral-700 transition text-sm font-medium"
              >
                ← 대시보드
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
              <div className="text-sm text-neutral-400">전체 판매자</div>
              <div className="text-2xl font-bold text-white">{vendors.length}명</div>
            </div>
            <div className="bg-neutral-900 border border-green-800 p-4 rounded-lg">
              <div className="text-sm text-green-400">활성 판매자</div>
              <div className="text-2xl font-bold text-green-300">
                {vendors.filter(v => v.isActive).length}명
              </div>
            </div>
            <div className="bg-neutral-900 border border-blue-800 p-4 rounded-lg">
              <div className="text-sm text-blue-400">총 완료 예매</div>
              <div className="text-2xl font-bold text-blue-300">
                {vendors.reduce((sum, v) => sum + v.completedBookings, 0)}건
              </div>
            </div>
            <div className="bg-neutral-900 border border-yellow-800 p-4 rounded-lg">
              <div className="text-sm text-yellow-400">총 지급액</div>
              <div className="text-2xl font-bold text-yellow-300">
                {vendors.reduce((sum, v) => sum + v.totalEarnings, 0).toLocaleString()}원
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-900/30 text-green-300 border-green-800'
              : 'bg-red-900/30 text-red-300 border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Vendors Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-neutral-400">로딩 중...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-neutral-400">등록된 판매자가 없습니다.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-purple-900 text-purple-100 rounded hover:bg-purple-800 transition"
              >
                첫 판매자 등록하기
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-800 border-b border-neutral-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">이름</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">전용 링크</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">이메일</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">전화번호</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">완료 예매</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">총 수익</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-neutral-800/50">
                      <td className="px-4 py-3 text-sm text-white font-medium">{vendor.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 max-w-md">
                          <code className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs text-purple-300 font-mono truncate">
                            {getVendorLink(vendor.id)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(getVendorLink(vendor.id), vendor.name)}
                            className="flex-shrink-0 p-2 bg-purple-900/30 border border-purple-800 text-purple-300 rounded hover:bg-purple-900/50 transition group"
                            title="링크 복사"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-300">{vendor.email}</td>
                      <td className="px-4 py-3 text-sm text-neutral-300">{vendor.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          vendor.isActive
                            ? 'bg-green-900/30 text-green-400 border border-green-800'
                            : 'bg-red-900/30 text-red-400 border border-red-800'
                        }`}>
                          {vendor.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-300">{vendor.completedBookings}건</td>
                      <td className="px-4 py-3 text-sm text-neutral-300">{vendor.totalEarnings.toLocaleString()}원</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleVendorStatus(vendor.id, vendor.isActive)}
                            className={`px-3 py-1 text-xs rounded ${
                              vendor.isActive
                                ? 'bg-red-900 text-red-100 hover:bg-red-800'
                                : 'bg-green-900 text-green-100 hover:bg-green-800'
                            } transition`}
                          >
                            {vendor.isActive ? '비활성화' : '활성화'}
                          </button>
                          <button
                            onClick={() => deleteVendor(vendor.id)}
                            className="px-3 py-1 text-xs bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700 transition"
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

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">판매자 추가</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setMessage(null);
                  setNewVendorLink(null);
                }}
                className="p-2 hover:bg-neutral-800 rounded-full transition"
              >
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {newVendorLink && (
                <div className="p-4 bg-green-900/30 border border-green-800 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-300 mb-3">✅ 판매자 전용 링크</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newVendorLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-neutral-300 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        copyToClipboard(newVendorLink, '판매자');
                        setNewVendorLink(null);
                        setShowAddModal(false);
                      }}
                      className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition text-sm font-medium whitespace-nowrap"
                    >
                      복사하고 닫기
                    </button>
                  </div>
                  <p className="text-xs text-green-300 mt-2">
                    이 링크를 판매자에게 전달하세요. 이 링크로 신청된 예매는 해당 판매자에게만 알림이 갑니다.
                  </p>
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="홍길동"
                  required
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vendor@example.com"
                  required
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-2">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="010-1234-5678"
                  required
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-900/30 text-green-300 border border-green-800'
                    : 'bg-red-900/30 text-red-300 border border-red-800'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setMessage(null);
                    setNewVendorLink(null);
                  }}
                  className="flex-1 px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 bg-purple-900 text-purple-100 rounded-lg hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? '등록 중...' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-4">삭제 확인</h3>
            <p className="text-neutral-300 mb-6">정말 이 판매자를 삭제하시겠습니까?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-700 transition"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'delete') {
                    executeDelete(confirmAction.id);
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
    </div>
  );
}
