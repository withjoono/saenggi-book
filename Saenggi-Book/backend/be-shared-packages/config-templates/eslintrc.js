module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', '*.js', '*.json', 'dist'],
  rules: {
    // 기본 TypeScript 규칙
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],

    // 명명 규칙 (GB-Back-Nest 표준)
    '@typescript-eslint/naming-convention': [
      'warn',
      // 변수: camelCase, UPPER_CASE, PascalCase 허용
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        leadingUnderscore: 'allow',
      },
      // 함수: camelCase
      {
        selector: 'function',
        format: ['camelCase'],
      },
      // 클래스: PascalCase
      {
        selector: 'class',
        format: ['PascalCase'],
      },
      // 인터페이스: PascalCase (I 접두사 금지)
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false,
        },
      },
      // 타입: PascalCase
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
      },
      // Enum: PascalCase
      {
        selector: 'enum',
        format: ['PascalCase'],
      },
      // Enum 멤버: UPPER_CASE
      {
        selector: 'enumMember',
        format: ['UPPER_CASE', 'PascalCase'],
      },
      // 메서드: camelCase
      {
        selector: 'method',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      // 프로퍼티: camelCase (DB 매핑용 snake_case 허용)
      {
        selector: 'property',
        format: ['camelCase', 'snake_case', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      // 파라미터: camelCase
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
    ],

    // 코드 품질
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
    'eqeqeq': ['warn', 'always', { null: 'ignore' }],
  },
};
