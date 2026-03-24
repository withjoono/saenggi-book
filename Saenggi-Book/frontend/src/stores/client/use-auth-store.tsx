import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    tokenExpiry: number,
  ) => void;
  clearTokens: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      setTokens: (accessToken, refreshToken, tokenExpiry) => {
        set({ accessToken, refreshToken, tokenExpiry });
        // token-manager와 동기화 (SSO 및 API 호출에서 사용)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      },
      clearTokens: () => {
        set({ accessToken: null, refreshToken: null, tokenExpiry: null });
        // localStorage에서 직접 삭제하여 확실하게 제거
        localStorage.removeItem("auth-storage");
        // token-manager도 함께 정리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
