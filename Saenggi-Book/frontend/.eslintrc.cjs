module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "_reference", "node_modules", "*.gen.ts"],
  parser: "@typescript-eslint/parser",
  plugins: [
    "react-refresh",
  ],
  rules: {
    "react-refresh/only-export-components": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn",

    // 🔥 camelCase 강제 - 회귀 방지
    "@typescript-eslint/naming-convention": [
      "warn", // error 대신 warn으로 시작 (점진적 적용)
      {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE", "PascalCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: "function",
        format: ["camelCase", "PascalCase"],
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
      {
        selector: "property",
        format: ["camelCase", "PascalCase"],
        leadingUnderscore: "allow",
        // 레거시 snake_case 필드는 허용 (점진적 마이그레이션)
        filter: {
          regex: "^(create_dt|update_dt|member_id|student_id|bottom_survey_id|officer_relation_id|main_survey_type|order_num|evaluate_content|s_type_id|hst_type_id|g_type_id)$",
          match: true,
        },
      },
    ],
  },
};


