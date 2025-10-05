'use client';

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { useState, useEffect } from 'react';

interface WebAuthnLoginProps {
  onSuccess: () => void;
}

export default function WebAuthnLogin({ onSuccess }: WebAuthnLoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
    setIsSupported(window.PublicKeyCredential !== undefined);
  }, []);

  // Face ID / Touch ID로 로그인
  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // 1단계: Challenge 받기
      const optionsRes = await fetch('/api/admin/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-options' }),
      });

      if (!optionsRes.ok) {
        const data = await optionsRes.json();
        throw new Error(data.error || '인증 옵션 생성 실패');
      }

      const { options, challenge } = await optionsRes.json();

      // 2단계: 생체 인증 (Face ID, Touch ID)
      console.log('🔐 Attempting authentication with options:', options);
      
      let credential;
      try {
        credential = await startAuthentication(options);
        console.log('✅ Authentication successful');
      } catch (authError: any) {
        console.error('❌ Biometric authentication error:', authError);
        console.error('Error name:', authError?.name);
        console.error('Error message:', authError?.message);
        
        // 에러 타입별 메시지
        if (authError?.name === 'NotAllowedError') {
          throw new Error('생체 인증이 거부되었습니다. 브라우저 설정을 확인하세요.');
        } else if (authError?.name === 'NotSupportedError') {
          throw new Error('이 브라우저는 생체 인증을 지원하지 않습니다.');
        } else if (authError?.name === 'SecurityError') {
          throw new Error('보안 오류: HTTPS가 필요하거나 도메인 설정이 잘못되었습니다.');
        } else if (authError?.name === 'AbortError') {
          throw new Error('생체 인증 시간이 초과되었습니다.');
        }
        
        throw new Error(`생체 인증 실패: ${authError?.message || '알 수 없는 오류'}`);
      }

      // 3단계: 서버에서 검증
      const verifyRes = await fetch('/api/admin/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-authentication',
          credential,
          challenge,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.verified) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        onSuccess();
      } else {
        throw new Error(verifyData.error || '인증 실패');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 기기 등록 (Face ID / Touch ID)
  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      // 1단계: 등록 옵션 생성 (비밀번호로 인증)
      const optionsRes = await fetch('/api/admin/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'generate-options',
          password 
        }),
      });

      if (!optionsRes.ok) {
        const data = await optionsRes.json();
        throw new Error(data.error || '등록 옵션 생성 실패');
      }

      const { options, challenge } = await optionsRes.json();

      // 2단계: 생체 정보 등록 (Face ID, Touch ID)
      console.log('📝 Attempting registration with options:', options);
      
      let credential;
      try {
        credential = await startRegistration(options);
        console.log('✅ Registration successful');
      } catch (regError: any) {
        console.error('❌ Biometric registration error:', regError);
        console.error('Error name:', regError?.name);
        console.error('Error message:', regError?.message);
        
        // 에러 타입별 메시지
        if (regError?.name === 'NotAllowedError') {
          throw new Error('생체 인증 등록이 거부되었습니다. 브라우저 설정을 확인하세요.');
        } else if (regError?.name === 'NotSupportedError') {
          throw new Error('이 브라우저/기기는 생체 인증 등록을 지원하지 않습니다.');
        } else if (regError?.name === 'SecurityError') {
          throw new Error('보안 오류: HTTPS가 필요하거나 도메인 설정이 잘못되었습니다.');
        } else if (regError?.name === 'InvalidStateError') {
          throw new Error('이미 등록된 기기입니다.');
        }
        
        throw new Error(`생체 인증 등록 실패: ${regError?.message || '알 수 없는 오류'}`);
      }

      // 3단계: 서버에 등록 정보 저장
      const verifyRes = await fetch('/api/admin/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-registration',
          credential,
          challenge,
          deviceName: deviceName || getDeviceName(),
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.verified) {
        alert('기기가 성공적으로 등록되었습니다! 이제 Face ID/Touch ID로 로그인할 수 있습니다.');
        setShowRegister(false);
        setPassword('');
        setDeviceName('');
      } else {
        throw new Error(verifyData.error || '등록 실패');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 기기 이름 자동 감지
  const getDeviceName = () => {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/Macintosh/i.test(ua)) return 'Mac';
    return 'Unknown Device';
  };

  // SSR 중에는 로딩 표시
  if (!isClient) {
    return (
      <div className="w-full px-6 py-4 bg-gray-100 text-gray-500 rounded-xl text-center">
        로딩 중...
      </div>
    );
  }

  // 생체 인증 지원 여부 확인 (클라이언트에서만)
  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        ⚠️ 이 브라우저는 생체 인증을 지원하지 않습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Face ID / Touch ID 로그인 버튼 */}
      <button
        onClick={handleBiometricLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
        </svg>
        {loading ? '인증 중...' : 'Face ID / Touch ID로 로그인'}
      </button>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* 기기 등록 토글 */}
      <div className="text-center">
        <button
          onClick={() => setShowRegister(!showRegister)}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          {showRegister ? '로그인으로 돌아가기' : '새 기기 등록'}
        </button>
      </div>

      {/* 기기 등록 폼 */}
      {showRegister && (
        <form onSubmit={handleRegisterDevice} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900">기기 등록</h3>
          <p className="text-sm text-gray-600">
            첫 등록 시 기존 비밀번호를 입력하여 인증해주세요.
          </p>
          
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
              관리자 비밀번호
            </label>
            <input
              type="password"
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="현재 비밀번호 입력"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="device-name" className="block text-sm font-medium text-gray-700 mb-2">
              기기 이름 (선택사항)
            </label>
            <input
              type="text"
              id="device-name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder={getDeviceName()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '등록 중...' : 'Face ID / Touch ID 등록'}
          </button>
        </form>
      )}
    </div>
  );
}
