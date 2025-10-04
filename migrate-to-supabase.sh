#!/bin/bash

echo "🚀 Supabase 마이그레이션 시작..."
echo ""

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 환경 변수 확인
if [ -z "$POSTGRES_URL_NON_POOLING" ]; then
    echo -e "${RED}❌ POSTGRES_URL_NON_POOLING 환경 변수가 설정되지 않았습니다.${NC}"
    exit 1
fi

# 2. 백업 디렉토리 생성
BACKUP_DIR="./database_backup"
mkdir -p $BACKUP_DIR

# 3. 백업 생성
echo -e "${YELLOW}📦 데이터베이스 백업 중...${NC}"
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

pg_dump $POSTGRES_URL_NON_POOLING \
  --no-owner \
  --no-acl \
  > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 백업 완료: $BACKUP_FILE${NC}"
else
    echo -e "${RED}❌ 백업 실패!${NC}"
    exit 1
fi

# 4. 스키마와 데이터 분리 Export
echo -e "${YELLOW}📋 스키마 Export 중...${NC}"
pg_dump $POSTGRES_URL_NON_POOLING \
  --schema-only \
  --no-owner \
  --no-acl \
  > $BACKUP_DIR/schema.sql

echo -e "${YELLOW}📊 데이터 Export 중...${NC}"
pg_dump $POSTGRES_URL_NON_POOLING \
  --data-only \
  --no-owner \
  --no-acl \
  > $BACKUP_DIR/data.sql

echo ""
echo -e "${GREEN}✅ Export 완료!${NC}"
echo ""
echo "다음 단계:"
echo "1. https://supabase.com 에서 새 프로젝트 생성"
echo "2. Region을 'Northeast Asia (Tokyo)' 로 선택"
echo "3. 생성된 프로젝트의 Connection String을 복사"
echo "4. 아래 명령어로 Import:"
echo ""
echo -e "${YELLOW}psql YOUR_SUPABASE_CONNECTION_STRING < $BACKUP_DIR/schema.sql${NC}"
echo -e "${YELLOW}psql YOUR_SUPABASE_CONNECTION_STRING < $BACKUP_DIR/data.sql${NC}"
echo ""
echo "5. .env.local 파일의 POSTGRES_URL을 Supabase URL로 업데이트"
echo ""
echo -e "${GREEN}🎉 마이그레이션 준비 완료!${NC}"
