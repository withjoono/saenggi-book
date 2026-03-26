export type AuthConfig = {
  secret?: string;
  expires?: number; // 밀리세컨드 (seconds * 1000)
  refreshSecret?: string;
  refreshExpires?: number; // 밀리세컨드 (seconds * 1000)
};
