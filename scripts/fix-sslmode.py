#!/usr/bin/env python3
import os
import re

# API routes 디렉토리
api_dir = 'app/api'

# 찾을 패턴과 교체할 패턴
old_pattern = r"const pool = new Pool\(\{\s*connectionString: process\.env\.YOUTUBE_DB_POSTGRES_PRISMA_URL \|\| process\.env\.POSTGRES_URL,"
new_code = """const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '')
  .replace('sslmode=require', '')
  .replace('&&', '&');

const pool = new Pool({
  connectionString,"""

# 파일 찾기
for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)

            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # connectionString 설정 변경
            original = content
            content = re.sub(
                old_pattern,
                new_code,
                content,
                flags=re.MULTILINE | re.DOTALL
            )

            # 변경사항이 있으면 파일 저장
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'✅ Updated: {filepath}')

print('\n✨ All files updated!')
