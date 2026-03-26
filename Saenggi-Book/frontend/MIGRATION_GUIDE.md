# 🔄 API 응답 camelCase 마이그레이션 가이드

## 배경

백엔드 API는 snake_case로 응답하지만, 프론트엔드에서는 `humps` 라이브러리를 통해 자동으로 camelCase로 변환됩니다 (`api-client.ts:73`).

**문제**: TypeScript 인터페이스는 snake_case로 정의되어 있어 런타임 에러 발생

## ✅ 체크리스트

새로운 API를 추가하거나 수정할 때 다음을 확인하세요:

### 1. TypeScript 인터페이스

```typescript
// ❌ 잘못된 예 (snake_case)
export interface IOfficerListItem {
  officer_id: number;
  officer_name: string;
}

// ✅ 올바른 예 (camelCase)
export interface IOfficerListItem {
  officerId: number;
  officerName: string;
}
```

### 2. 컴포넌트에서 사용

```typescript
// ❌ 잘못된 예
const officerId = officer.officer_id;

// ✅ 올바른 예
const officerId = officer.officerId;
```

### 3. API 응답 예외 사항

일부 레거시 필드는 아직 snake_case로 유지됩니다:
- `create_dt`, `update_dt` (Date 타입)
- `member_id`, `student_id` (ID 필드 일부)

이러한 필드는 점진적으로 camelCase로 마이그레이션됩니다.

## 🔍 변환 확인 방법

### 개발자 도구에서 확인

```javascript
// 브라우저 콘솔에서 API 응답 확인
// Network 탭에서 응답을 확인하면:
// - Raw 응답: snake_case
// - 앱에서 사용: camelCase (humps 변환 후)
```

### TypeScript 컴파일 체크

```bash
npm run type-check
```

### ESLint 체크

```bash
npm run lint
```

## 📝 마이그레이션 절차

기존 snake_case 인터페이스를 camelCase로 변경할 때:

1. **인터페이스 수정**
   ```typescript
   // interfaces.ts
   export interface IYourInterface {
     yourField: type; // snake_case → camelCase
   }
   ```

2. **컴포넌트 수정**
   ```typescript
   // 사용하는 모든 곳에서 수정
   data.yourField // data.your_field → data.yourField
   ```

3. **테스트**
   ```bash
   npm run type-check  # TypeScript 체크
   npm run lint        # ESLint 체크
   npm run test        # E2E 테스트
   ```

4. **커밋**
   ```bash
   git add .
   git commit -m "fix: [interface-name] snake_case를 camelCase로 마이그레이션"
   ```

## 🚨 주의사항

### 절대 하지 말 것

1. **인터페이스와 코드의 불일치**
   - 인터페이스는 camelCase인데 코드는 snake_case 사용
   - 이는 런타임 에러를 발생시킵니다!

2. **부분적 마이그레이션**
   - 한 인터페이스 내에서 일부는 snake_case, 일부는 camelCase
   - 모두 camelCase로 통일하세요!

3. **API 호출 직전에 변환**
   - humps가 자동으로 처리하므로 수동 변환 불필요
   - 중복 변환은 오류의 원인!

## 🛡️ 회귀 방지

### Pre-commit Hook

모든 커밋 전에 자동으로 다음을 실행:
- TypeScript 타입 체크
- ESLint 검사

### CI/CD

GitHub Actions를 통해 자동으로:
- TypeScript 컴파일
- ESLint 검사
- Playwright E2E 테스트
- 빌드 검증

### ESLint 규칙

`.eslintrc.cjs`에 `naming-convention` 규칙이 추가되어 snake_case 사용 시 경고합니다.

## 📚 참고

- `src/stores/server/api-client.ts:73` - camelizeKeys 적용
- `src/stores/server/features/susi/evaluation/interfaces.ts` - 마이그레이션 완료 예시
- `.eslintrc.cjs` - naming-convention 규칙
- `.husky/pre-commit` - Pre-commit hook 설정
