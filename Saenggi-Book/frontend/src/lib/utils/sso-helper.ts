/**
 * SSO 헬퍼 - geobuk-shared/auth 위임 및 Zustand 동기화
 */
import { processSSOCode, hasSSOCode, getAccessToken, getRefreshToken } from 'geobuk-shared/auth';
import { useAuthStore } from '@/stores/client/use-auth-store';

export { hasSSOCode };

export async function processSSOLogin(): Promise<boolean> {
  const success = await processSSOCode({
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4007',
  });

  if (success) {
    // Zustand 스토어 동기화 (기존 동작 유지)
    const { setTokens } = useAuthStore.getState();
    const access = getAccessToken();
    const refresh = getRefreshToken();
    
    if (access && refresh) {
      setTokens(access, refresh, Date.now() + 3600 * 1000);
    }
  }
  
  return success;
}
