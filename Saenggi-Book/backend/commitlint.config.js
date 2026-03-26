/**
 * Commitlint 설정
 *
 * 설치 (선택사항):
 * yarn add -D @commitlint/cli @commitlint/config-conventional
 *
 * Husky와 함께 사용 (선택사항):
 * yarn add -D husky
 * npx husky install
 * npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
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

    // Scope 규칙 (기능 모듈명)
    'scope-enum': [
      1, // warning (필수 아님)
      'always',
      [
        // 입시
        'jungsi',       // 정시
        'susi',         // 수시
        'essay',        // 논술

        // 학생 데이터
        'schoolrecord', // 학생부
        'mock-exam',    // 모의고사

        // 서비스
        'pay',          // 결제
        'planner',      // 플래너
        'members',      // 회원
        'board',        // 게시판
        'mentoring',    // 멘토링
        'officer',      // 입학사정관
        'exploration',  // 탐색
        'myclass',      // 마이클래스
        'store',        // 스토어

        // 공용
        'shared',       // 공용 파일
        'core',         // 코어 엔티티
        'common',       // 공용 유틸
        'admin',        // 관리자
        'auth',         // 인증
        'db',           // 데이터베이스
        'api',          // API 전반

        // 기타
        'deps',         // 의존성
        'config',       // 설정
        'release',      // 릴리즈
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],

    // Subject 규칙
    'subject-case': [0], // 한글 허용을 위해 비활성화
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 72],

    // Header 규칙
    'header-max-length': [2, 'always', 100],

    // Body 규칙
    'body-max-line-length': [1, 'always', 100], // warning

    // Footer 규칙
    'footer-max-line-length': [1, 'always', 100], // warning
  },
};
