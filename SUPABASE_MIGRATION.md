# Supabase 마이그레이션 가이드

## 🎯 왜 Supabase인가?

### 성능 비교
| 항목 | Neon (싱가포르) | Supabase (도쿄) |
|------|----------------|-----------------|
| 레이턴시 | 150-200ms | **30-50ms** |
| 속도 개선 | - | **70% 빠름** ⚡ |
| 무료 플랜 | 0.5GB | **500MB** |
| Connection Pooling | 기본 | **고급** |

## 🚀 마이그레이션 단계

### 1. Supabase 프로젝트 생성
```bash
# https://supabase.com 접속
# 1. Sign up (GitHub 계정으로 가능)
# 2. New Project 클릭
# 3. Region: Northeast Asia (Tokyo) 선택 ⭐ 중요!
# 4. Database Password 설정
```

### 2. 기존 스키마 Export
```bash
# Neon에서 스키마 내보내기
pg_dump $POSTGRES_URL_NON_POOLING \
  --schema-only \
  --no-owner \
  --no-acl \
  > schema.sql
```

### 3. 데이터 Export
```bash
# 데이터만 내보내기
pg_dump $POSTGRES_URL_NON_POOLING \
  --data-only \
  --no-owner \
  --no-acl \
  > data.sql
```

### 4. Supabase로 Import
```bash
# Supabase 연결 정보로 Import
psql $SUPABASE_CONNECTION_STRING < schema.sql
psql $SUPABASE_CONNECTION_STRING < data.sql
```

### 5. .env.local 업데이트
```bash
# Supabase Dashboard > Project Settings > Database에서 확인
POSTGRES_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
POSTGRES_PRISMA_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

### 6. 코드 변경 (필요 없음!)
```typescript
// @vercel/postgres는 그대로 사용 가능
// 아무 코드 변경 없이 .env.local만 바꾸면 됨!
```

## 📊 예상 성능 개선

### Before (Neon 싱가포르)
- 초기 로딩: ~4-5초 😫
- API 응답: ~2-3초
- 대시보드 로딩: ~5-7초

### After (Supabase 도쿄)
- 초기 로딩: **~1-2초** ⚡
- API 응답: **~0.5-1초** ⚡
- 대시보드 로딩: **~2-3초** ⚡

**총 개선율: 약 70% 속도 향상!** 🚀

## 🔧 간단 마이그레이션 (자동화)

### 스크립트 실행
```bash
# 1. Supabase 프로젝트 생성 후
# 2. 아래 스크립트 실행
chmod +x migrate-to-supabase.sh
./migrate-to-supabase.sh
```

## ⚠️ 주의사항

1. **마이그레이션 전 백업 필수**
   ```bash
   pg_dump $POSTGRES_URL_NON_POOLING > backup_$(date +%Y%m%d).sql
   ```

2. **다운타임 최소화**
   - 새벽 시간대 마이그레이션 권장
   - 예상 소요 시간: 10-15분

3. **Vercel 환경 변수 업데이트**
   - Vercel Dashboard에서도 환경 변수 변경 필요

## 💰 비용 비교

### Neon
- Free: 0.5GB storage
- Pro: $19/월

### Supabase
- Free: 500MB storage, 2GB transfer
- Pro: $25/월 (더 많은 기능 포함)

## 🎁 추가 혜택 (Supabase)

- ✅ 실시간 데이터베이스 구독
- ✅ 자동 API 생성
- ✅ 인증 시스템 내장
- ✅ Storage (파일 업로드)
- ✅ Edge Functions
- ✅ 대시보드 UI

## 🚀 Quick Start

```bash
# 1. 이 파일 실행으로 자동 마이그레이션
npm run migrate-to-supabase

# 2. .env.local 업데이트 (Supabase 정보로)

# 3. 개발 서버 재시작
npm run dev

# 4. 속도 체감! ⚡
```
