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
  ignorePatterns: ['.eslintrc.js', '*.js', '*.json'],
  rules: {
    // 기존 규칙
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],

    // 명명 규칙 (Naming Conventions)
    '@typescript-eslint/naming-convention': [
      'warn', // error 대신 warn으로 점진적 적용
      // 변수: camelCase
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
      // 인터페이스: PascalCase (I 접두사 없음)
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
      // Enum 멤버: UPPER_CASE 또는 PascalCase
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
      // 프로퍼티: camelCase (DB 컬럼 매핑용 예외 허용)
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

    // 미사용 변수 규칙 (_prefix 허용)
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // 코드 품질 규칙
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
    'eqeqeq': ['warn', 'always', { null: 'ignore' }],
  },
};

















