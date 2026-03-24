/**
 * 토큰 상태 관리 (Zustand + localStorage persist)
 * Reference 프로젝트의 Recoil atoms 패턴을 Zustand로 구현
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
}

interface TokenActions {
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearTokens: () => void;
  hasTokens: () => boolean;
}

type TokenStore = TokenState & TokenActions;

/**
 * 토큰 스토어
 * - localStorage에 자동 영속화
 * - 어디서든 접근 가능한 전역 상태
 */
export const useTokenStore = create<TokenStore>()(
  persist(
    (set, get) => ({
      // State
      accessToken: null,
      refreshToken: null,

      // Actions
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });

        // token-manager의 localStorage와 동기화
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      },

      setAccessToken: (accessToken) => {
        set({ accessToken });

        // token-manager의 localStorage와 동기화
        localStorage.setItem('accessToken', accessToken);
      },

      clearTokens: () => {
        set({ accessToken: null, refreshToken: null });

        // token-manager의 localStorage와 동기화
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // localStorage에서 persist 스토어 직접 삭제하여 확실하게 제거
        localStorage.removeItem('token-storage');
      },

      hasTokens: () => {
        const state = get();
        return !!state.accessToken && !!state.refreshToken;
      },
    }),
    {
      name: 'token-storage', // localStorage key
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

/**
 * 토큰 선택자 (Recoil selector 스타일)
 */
export const selectAccessToken = (state: TokenStore) => state.accessToken;
export const selectRefreshToken = (state: TokenStore) => state.refreshToken;
export const selectHasTokens = (state: TokenStore) => state.hasTokens();
