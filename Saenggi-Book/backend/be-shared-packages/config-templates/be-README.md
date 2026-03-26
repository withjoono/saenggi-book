# 분리 개발 프로젝트 설정 템플릿

GB-Back-Nest에 통합될 분리 개발 프로젝트용 설정 파일 모음입니다.

## 파일 목록

| 파일 | 용도 | 복사 위치 |
|-----|------|----------|
| `prettierrc.json` | 코드 포맷팅 | `.prettierrc` |
| `editorconfig` | 에디터 공통 설정 | `.editorconfig` |
| `eslintrc.js` | 린트 규칙 (명명 규칙 포함) | `.eslintrc.js` |
| `commitlint.config.js` | 커밋 메시지 검사 | `commitlint.config.js` |
| `vscode-settings.json` | VS Code 설정 | `.vscode/settings.json` |

## 빠른 설정

### 방법 1: 스크립트 사용 (Linux/Mac)

```bash
cd docs/config-templates
bash setup.sh
```

### 방법 2: 수동 복사

```bash
# 프로젝트 루트에서 실행
cp docs/config-templates/prettierrc.json .prettierrc
cp docs/config-templates/editorconfig .editorconfig
cp docs/config-templates/eslintrc.js .eslintrc.js
cp docs/config-templates/commitlint.config.js commitlint.config.js

mkdir -p .vscode
cp docs/config-templates/vscode-settings.json .vscode/settings.json
```

### 방법 3: Windows (PowerShell)

```powershell
Copy-Item docs\config-templates\prettierrc.json .prettierrc
Copy-Item docs\config-templates\editorconfig .editorconfig
Copy-Item docs\config-templates\eslintrc.js .eslintrc.js
Copy-Item docs\config-templates\commitlint.config.js commitlint.config.js

New-Item -ItemType Directory -Force -Path .vscode
Copy-Item docs\config-templates\vscode-settings.json .vscode\settings.json
```

## 필수 의존성

```bash
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
```

## package.json 추가 설정

```json
{
  "scripts": {
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "validate": "yarn lint && yarn type-check",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Husky 설정

```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

## 검증

```bash
# 린트 검사
yarn lint

# 타입 검사
yarn type-check

# 테스트 커밋
git commit -m "feat(planner): 테스트 커밋"
```

## 참고 문서

- [INTEGRATION-GUIDE.md](../INTEGRATION-GUIDE.md) - 상세 통합 가이드
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - 기여 가이드
