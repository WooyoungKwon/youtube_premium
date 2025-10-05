#!/usr/bin/env python3
import os
import re

# API routes 디렉토리
api_dir = 'app/api'

# 파일 찾기
for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)

            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # SSL 설정 변경: { rejectUnauthorized: false } -> false
            original = content
            content = re.sub(
                r'ssl: \{\s*rejectUnauthorized: false\s*\}',
                'ssl: false',
                content,
                flags=re.MULTILINE | re.DOTALL
            )

            # 변경사항이 있으면 파일 저장
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'✅ Updated: {filepath}')

print('\n✨ All files updated!')
