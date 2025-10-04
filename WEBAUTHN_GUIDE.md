# WebAuthn 생체 인증 가이드 (Face ID / Touch ID)

## 개요
관리자 페이지에 Face ID, Touch ID를 사용한 생체 인증 시스템이 구현되었습니다.
비밀번호 없이 안전하고 편리하게 로그인할 수 있습니다.

## 주요 기능

### 1. Face ID / Touch ID 로그인
- iPhone, iPad: Face ID 또는 Touch ID
- MacBook: Touch ID
- 패스키(Passkey) 지원
- 30일 동안 자동 로그인 유지

### 2. 보안
- JWT 토큰 기반 인증
- HttpOnly 쿠키로 XSS 공격 방어
- SameSite Strict로 CSRF 공격 방어
- 생체 정보는 기기에만 저장 (서버 전송 안 됨)

### 3. 멀티 디바이스 지원
- 여러 기기를 동시에 등록 가능
- 각 기기마다 이름 설정 가능
- 마지막 사용 시간 추적

## 사용 방법

### 처음 사용 (기기 등록)

1. 관리자 페이지 접속 (`/admin`)
2. "새 기기 등록" 클릭
3. 기존 비밀번호 입력 (최초 1회만)
4. 기기 이름 입력 (선택사항, 예: "내 MacBook Pro")
5. "Face ID / Touch ID 등록" 버튼 클릭
6. Face ID 또는 Touch ID 인증
7. 등록 완료!

### 로그인

1. 관리자 페이지 접속 (`/admin`)
2. "Face ID / Touch ID로 로그인" 버튼 클릭
3. Face ID 또는 Touch ID 인증
4. 즉시 로그인 완료!

## 기술 스택

### Frontend
- `@simplewebauthn/browser`: WebAuthn 클라이언트 라이브러리
- React 컴포넌트: `app/admin/components/WebAuthnLogin.tsx`

### Backend
- `@simplewebauthn/server`: WebAuthn 서버 검증
- `jsonwebtoken`: JWT 토큰 생성/검증
- PostgreSQL: Credential 저장

### 데이터베이스 스키마
```sql
CREATE TABLE IF NOT EXISTS admin_credentials (
  id SERIAL PRIMARY KEY,
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL,
  device_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);
```

## API 엔드포인트

### 기기 등록
```
POST /api/admin/webauthn/register
Body: { 
  action: "generate-options", 
  password: "현재비밀번호" 
}

POST /api/admin/webauthn/register
Body: { 
  action: "verify-registration",
  credential: {...},
  challenge: "...",
  deviceName: "내 MacBook"
}
```

### 로그인
```
POST /api/admin/webauthn/authenticate
Body: { action: "generate-options" }

POST /api/admin/webauthn/authenticate
Body: { 
  action: "verify-authentication",
  credential: {...},
  challenge: "..."
}
```

## 환경 변수 (.env.local)

```bash
# WebAuthn 설정
NEXT_PUBLIC_RP_ID="localhost"  # 개발: localhost, 프로덕션: 실제 도메인
NEXT_PUBLIC_ORIGIN="http://localhost:3000"  # 개발: http://localhost:3000, 프로덕션: https://yourdomain.com
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-2025"
```

## 프로덕션 배포 시 설정

Vercel 환경 변수에 다음을 추가:

```bash
NEXT_PUBLIC_RP_ID="your-domain.vercel.app"
NEXT_PUBLIC_ORIGIN="https://your-domain.vercel.app"
JWT_SECRET="매우-안전한-랜덤-문자열-32자-이상"
```

### JWT_SECRET 생성 방법
```bash
# 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 지원 브라우저 및 기기

### ✅ 지원
- Safari (iOS 14+, macOS 11+)
- Chrome (Android 9+, Windows 10+)
- Edge (Windows 10+)
- Firefox (90+)

### ❌ 미지원
- 오래된 브라우저
- 생체 인증 하드웨어가 없는 기기

## 문제 해결

### "이 브라우저는 생체 인증을 지원하지 않습니다"
→ 최신 브라우저로 업데이트하거나 생체 인증 기능이 있는 기기를 사용하세요.

### "등록된 기기가 없습니다"
→ "새 기기 등록" 버튼을 클릭하여 기기를 먼저 등록하세요.

### "생체 인증이 취소되었습니다"
→ Face ID/Touch ID 프롬프트에서 취소를 누른 경우입니다. 다시 시도하세요.

### "인증 실패"
→ 생체 인증에 실패했거나 기기 정보가 변경된 경우입니다. 기기를 다시 등록하세요.

## 보안 고려사항

1. **생체 정보는 서버에 전송되지 않음**
   - Public Key만 서버에 저장
   - 생체 정보는 기기의 Secure Enclave에만 존재

2. **JWT 토큰은 httpOnly 쿠키로 저장**
   - JavaScript로 접근 불가 (XSS 방어)
   - SameSite=Strict (CSRF 방어)

3. **비밀번호는 최초 등록 시에만 사용**
   - 이후에는 생체 인증만으로 로그인 가능
   - 비밀번호 노출 위험 최소화

4. **토큰 만료 시간: 7일**
   - 자동으로 갱신됨
   - 로그아웃 시 즉시 무효화

## 향후 개선 사항

- [ ] 기기 관리 UI (등록된 기기 목록 보기, 삭제)
- [ ] 마지막 로그인 시간 표시
- [ ] 의심스러운 로그인 알림
- [ ] 2FA 추가 옵션
- [ ] 생체 인증 실패 시 백업 인증 방법

## 참고 자료

- [WebAuthn 표준](https://www.w3.org/TR/webauthn/)
- [SimpleWebAuthn 문서](https://simplewebauthn.dev/)
- [Passkey 가이드](https://developers.google.com/identity/passkeys)
