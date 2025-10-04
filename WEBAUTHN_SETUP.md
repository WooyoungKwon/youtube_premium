# WebAuthn (Face ID / Touch ID) 인증 설정 가이드

## 🔐 개요
관리자 페이지에 Face ID, Touch ID, Windows Hello 등의 생체 인증으로 로그인할 수 있는 기능이 추가되었습니다.

## 📋 Vercel 환경 변수 설정

배포하기 전에 다음 환경 변수를 Vercel 대시보드에서 설정해야 합니다:

### 1. WebAuthn 설정

#### `NEXT_PUBLIC_RP_ID`
- **설명**: Relying Party ID (도메인 이름)
- **로컬**: `localhost`
- **프로덕션**: `your-domain.vercel.app` (실제 도메인으로 변경)
- **예시**: `youtube-premium.vercel.app`

#### `NEXT_PUBLIC_ORIGIN`
- **설명**: 애플리케이션의 전체 URL
- **로컬**: `http://localhost:3000`
- **프로덕션**: `https://your-domain.vercel.app` (실제 URL로 변경)
- **예시**: `https://youtube-premium.vercel.app`

### 2. JWT Secret

#### `JWT_SECRET`
- **설명**: JWT 토큰 서명에 사용되는 비밀 키
- **중요**: 반드시 강력한 랜덤 문자열 사용
- **생성 방법**:
  ```bash
  # 터미널에서 실행
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- **예시**: `a1b2c3d4e5f6...` (최소 64자 이상의 랜덤 문자열)

### 3. 기존 환경 변수 (이미 설정됨)
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `CRON_SECRET`

## 🚀 Vercel 환경 변수 설정 방법

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - YouTube Premium 프로젝트 클릭

3. **Settings → Environment Variables**
   - 좌측 메뉴에서 "Settings" 클릭
   - "Environment Variables" 탭 선택

4. **환경 변수 추가**
   ```
   Name: NEXT_PUBLIC_RP_ID
   Value: your-domain.vercel.app
   Environments: Production, Preview, Development
   ```

   ```
   Name: NEXT_PUBLIC_ORIGIN
   Value: https://your-domain.vercel.app
   Environments: Production, Preview, Development
   ```

   ```
   Name: JWT_SECRET
   Value: [64자 이상의 랜덤 문자열]
   Environments: Production, Preview, Development
   ```

5. **Redeploy 필요**
   - 환경 변수 변경 후 재배포 필요
   - Deployments → 최신 배포 → "Redeploy" 클릭

## 📱 사용 방법

### 첫 기기 등록
1. `/admin` 페이지 접속
2. "새 기기 등록" 클릭
3. 기존 비밀번호 입력: `love@2618`
4. "Face ID / Touch ID 등록" 버튼 클릭
5. Face ID 또는 Touch ID로 인증

### 로그인
1. `/admin` 페이지 접속
2. "Face ID / Touch ID로 로그인" 버튼 클릭
3. Face ID 또는 Touch ID로 인증

### 지원 기기
- **iPhone/iPad**: Face ID 또는 Touch ID
- **Mac**: Touch ID (M1/M2/M3 Mac) 또는 Apple Watch
- **Windows**: Windows Hello (얼굴 인식, 지문, PIN)
- **Android**: 지문 인식

## 🔒 보안 특징

1. **Passkey 기반 인증**: FIDO2/WebAuthn 표준 사용
2. **생체 정보 미전송**: 생체 정보는 디바이스에만 저장
3. **공개키 암호화**: 서버에는 공개키만 저장
4. **Phishing 방지**: 도메인 검증으로 피싱 불가능
5. **JWT + httpOnly Cookie**: 안전한 세션 관리

## ⚠️ 주의사항

1. **HTTPS 필수**: 프로덕션에서는 반드시 HTTPS 사용
2. **도메인 일치**: `NEXT_PUBLIC_RP_ID`와 실제 도메인이 일치해야 함
3. **JWT Secret 보안**: 절대 공개 저장소에 커밋하지 말것
4. **기기별 등록**: 각 디바이스마다 한 번씩 등록 필요

## 🐛 트러블슈팅

### "등록된 기기가 없습니다" 오류
- 먼저 "새 기기 등록"으로 기기를 등록해야 합니다.

### QR 코드가 나타남
- 현재 디바이스에 등록된 Passkey가 없는 경우
- "새 기기 등록"으로 현재 기기를 등록하세요.

### Face ID/Touch ID 프롬프트가 나타나지 않음
- 브라우저가 WebAuthn을 지원하는지 확인
- Safari, Chrome, Edge 최신 버전 사용 권장
- iOS는 iOS 14 이상, macOS는 Big Sur 이상 필요

### "도메인이 일치하지 않습니다" 오류
- Vercel 환경 변수의 `NEXT_PUBLIC_RP_ID`를 실제 도메인으로 설정
- 환경 변수 변경 후 Redeploy 필요

## 📚 관련 파일

- `/app/api/admin/webauthn/register/route.ts` - 기기 등록 API
- `/app/api/admin/webauthn/authenticate/route.ts` - 인증 API
- `/app/admin/components/WebAuthnLogin.tsx` - 로그인 UI
- `/lib/auth.ts` - JWT 토큰 관리
- `/lib/storage.ts` - DB 스키마 (admin_credentials 테이블)

## 🔄 기존 비밀번호 변경 (선택사항)

기존 비밀번호(`love@2618`)를 변경하려면:
1. `/app/api/admin/auth/route.ts` 수정
2. `/app/api/admin/webauthn/register/route.ts`의 비밀번호 확인 부분 수정

WebAuthn을 사용하면 비밀번호가 필요없지만, 첫 등록 시 본인 확인용으로만 사용됩니다.
