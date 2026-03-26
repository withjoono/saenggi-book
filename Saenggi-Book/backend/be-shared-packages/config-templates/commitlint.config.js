/**
 * Commitlint 설정 (GB-Back-Nest 표준)
 *
 * 설치:
 * yarn add -D @commitlint/cli @commitlint/config-conventional husky lint-staged
 *
 * Husky 설정:
 * npx husky install
 * npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
 * npx husky add .husky/pre-commit 'npx lint-staged'
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type 규칙
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 새로운 기능
        'fix',      // 버그 수정
        'docs',     // 문서 수정
        'style',    // 코드 포맷팅
        'refactor', // 리팩토링
        'test',     // 테스트
        'chore',    // 빌드, 설정
        'perf',     // 성능 개선
        'revert',   // 되돌리기
        'ci',       // CI/CD
        'build',    // 빌드 시스템
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Scope 규칙 (프로젝트에 맞게 수정)
    'scope-enum': [
      1, // warning (필수 아님)
      'always',
      [
        // 분리 개발 프로젝트 scope
        'planner',      // 플래너

        // 공용
        'shared',       // 공용 파일
        'common',       // 공용 유틸
        'config',       // 설정
        'deps',         // 의존성
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],

    // Subject 규칙
    'subject-case': [0], // 한글 허용
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 72],

    // Header 규칙
    'header-max-length': [2, 'always', 100],

    // Body/Footer 규칙
    'body-max-line-length': [1, 'always', 100],
    'footer-max-line-length': [1, 'always', 100],
  },
};
