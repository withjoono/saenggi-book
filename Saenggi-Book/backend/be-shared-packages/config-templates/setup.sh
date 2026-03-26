#!/bin/bash

# GB-Back-Nest 통합용 설정 스크립트
# 사용법: bash setup.sh

echo "🚀 GB-Back-Nest 표준 설정 적용 중..."

# 1. 설정 파일 복사
echo "📁 설정 파일 복사..."
cp prettierrc.json ../.prettierrc 2>/dev/null && echo "  ✅ .prettierrc"
cp editorconfig ../.editorconfig 2>/dev/null && echo "  ✅ .editorconfig"
cp eslintrc.js ../.eslintrc.js 2>/dev/null && echo "  ✅ .eslintrc.js"
cp commitlint.config.js ../commitlint.config.js 2>/dev/null && echo "  ✅ commitlint.config.js"

# 2. VS Code 설정
echo "📁 VS Code 설정..."
mkdir -p ../.vscode
cp vscode-settings.json ../.vscode/settings.json 2>/dev/null && echo "  ✅ .vscode/settings.json"

# 3. 필요한 패키지 설치
echo "📦 개발 의존성 설치..."
cd ..
yarn add -D \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint \
  eslint-config-prettier \
  eslint-plugin-prettier \
  prettier \
  @commitlint/cli \
  @commitlint/config-conventional \
  husky \
  lint-staged

# 4. Husky 초기화
echo "🐶 Husky 설정..."
npx husky install

# pre-commit 훅
npx husky add .husky/pre-commit "npx lint-staged" 2>/dev/null

# commit-msg 훅
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"' 2>/dev/null

# 5. package.json에 lint-staged 추가 안내
echo ""
echo "⚠️  package.json에 다음 내용을 수동으로 추가하세요:"
echo ""
echo '  "lint-staged": {'
echo '    "*.ts": ['
echo '      "eslint --fix",'
echo '      "prettier --write"'
echo '    ]'
echo '  },'
echo ""
echo '  "scripts": {'
echo '    "lint": "eslint \"{src,test}/**/*.ts\" --fix",'
echo '    "format": "prettier --write \"src/**/*.ts\"",'
echo '    "type-check": "tsc --noEmit",'
echo '    "validate": "yarn lint && yarn type-check",'
echo '    "prepare": "husky install"'
echo '  }'
echo ""
echo "✅ 설정 완료!"
echo ""
echo "📖 자세한 내용은 INTEGRATION-GUIDE.md를 참조하세요."
