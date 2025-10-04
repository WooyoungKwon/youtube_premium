'use client';

import { useState, useEffect } from 'react';
import { YoutubeAccount, AppleAccount } from '@/types';

interface RegisterMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestEmail: string;
  onSuccess: () => void;
}

export default function RegisterMemberModal({
  isOpen,
  onClose,
  requestId,
  requestEmail,
  onSuccess,
}: RegisterMemberModalProps) {
  const [appleAccounts, setAppleAccounts] = useState<AppleAccount[]>([]);
  const [youtubeAccounts, setYoutubeAccounts] = useState<YoutubeAccount[]>([]);
  const [selectedAppleId, setSelectedAppleId] = useState<string>('');
  const [selectedYoutubeId, setSelectedYoutubeId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'apple' | 'youtube'>('apple');

  useEffect(() => {
    if (isOpen) {
      fetchAppleAccounts();
      setStep('apple');
      setSelectedAppleId('');
      setSelectedYoutubeId('');
      setError('');
    }
  }, [isOpen]);

  const fetchAppleAccounts = async () => {
    try {
      const response = await fetch('/api/admin/apple-accounts');
      if (response.ok) {
        const data = await response.json();
        setAppleAccounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch apple accounts:', error);
      setError('Apple 계정을 불러오는데 실패했습니다.');
    }
  };

  const fetchYoutubeAccounts = async (appleId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/youtube-accounts?appleId=${appleId}`);
      if (response.ok) {
        const data = await response.json();
        setYoutubeAccounts(data);
        setStep('youtube');
      } else {
        setError('YouTube 계정을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch youtube accounts:', error);
      setError('YouTube 계정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSelect = (appleId: string) => {
    setSelectedAppleId(appleId);
    fetchYoutubeAccounts(appleId);
  };

  const handleRegister = async () => {
    if (!selectedYoutubeId) {
      setError('YouTube 계정을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/register-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          youtubeAccountId: selectedYoutubeId,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || '회원 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to register member:', error);
      setError('회원 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              회원 등록
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">신청 이메일:</span> {requestEmail}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {step === 'apple' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                1단계: Apple 계정 선택
              </h3>
              <div className="space-y-2">
                {appleAccounts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    등록된 Apple 계정이 없습니다.
                  </p>
                ) : (
                  appleAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => handleAppleSelect(account.id)}
                      disabled={loading}
                      className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-left disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{account.appleEmail}</p>
                          <p className="text-sm text-gray-500">
                            잔여 크레딧: {account.remainingCredit}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 'youtube' && (
            <div>
              <div className="mb-4">
                <button
                  onClick={() => {
                    setStep('apple');
                    setSelectedYoutubeId('');
                  }}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Apple 계정 다시 선택
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                2단계: YouTube 계정 선택
              </h3>
              <div className="space-y-2">
                {youtubeAccounts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    해당 Apple 계정에 등록된 YouTube 계정이 없습니다.
                  </p>
                ) : (
                  youtubeAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setSelectedYoutubeId(account.id)}
                      className={`w-full p-4 border rounded-lg transition text-left ${
                        selectedYoutubeId === account.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{account.youtubeEmail}</p>
                          {account.nickname && (
                            <p className="text-sm text-gray-500">닉네임: {account.nickname}</p>
                          )}
                        </div>
                        {selectedYoutubeId === account.id && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleRegister}
                  disabled={!selectedYoutubeId || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '등록 중...' : '회원 등록'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
