# Cron Job 설정 가이드

## 자동 회원 상태 업데이트

매일 자정(KST 기준)에 결제일이 만료된 회원의 상태를 자동으로 `완료` → `대기`로 변경합니다.

### 작동 방식

1. **매일 자정 00:00 (KST)** 에 크론잡 실행
2. `payment_date`가 오늘 이전이고 `deposit_status`가 `completed`인 회원 검색
3. 해당 회원들의 상태를 `pending`으로 변경
4. 로그 기록 및 업데이트된 회원 목록 반환

### Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 추가해야 합니다:

```
CRON_SECRET=youtube_premium_cron_secret_2025
```

### 수동 실행 방법

개발 중이거나 테스트가 필요한 경우:

```bash
curl -X POST http://localhost:3000/api/cron/update-expired-members \
  -H "Authorization: Bearer youtube_premium_cron_secret_2025"
```

또는 배포 후:

```bash
curl -X POST https://your-domain.vercel.app/api/cron/update-expired-members \
  -H "Authorization: Bearer youtube_premium_cron_secret_2025"
```

### 크론잡 스케줄

`vercel.json` 파일에 정의:
- `0 0 * * *`: 매일 자정 00:00 (UTC 기준)
- KST로 변환 시: 매일 오전 9:00 (UTC+9)

**참고**: Vercel Cron은 UTC 시간대를 사용하므로, 한국 시간 00:00에 실행하려면:
- `0 15 * * *` (UTC 15:00 = KST 00:00 다음날)

### 로그 확인

Vercel 대시보드 > 프로젝트 > Logs 에서 크론잡 실행 로그를 확인할 수 있습니다.

```
[Cron Job] Running at KST: 2025-01-15
[Cron Job] Updated 5 members to pending status
[Cron Job] Updated members: [...]
```

### 워크플로우

```
회원 가입 → 대기 상태
↓
3개월 결제 완료 → 완료 상태 (결제일: 3개월 후)
↓
3개월 후 자정 크론잡 실행 → 자동으로 대기 상태로 변경
↓
새로 결제 → 다시 완료 상태 (결제일: 또 3개월 후)
```

### 한국 시간대 처리

모든 날짜는 KST(UTC+9) 기준으로 처리됩니다:
- `lib/dateUtils.ts`의 유틸리티 함수 사용
- 데이터베이스 날짜 비교 시 KST 날짜로 변환
- UI 표시도 KST 기준

### 보안

- Cron Job API는 `CRON_SECRET` 환경 변수로 인증
- 올바른 Bearer 토큰 없이는 실행 불가
- Vercel의 Cron Job만 접근 가능하도록 설정
