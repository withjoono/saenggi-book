/**
 * SSO (Single Sign-On) 헬퍼 유틸리티
 * Backend Token Exchange 방식으로 안전하게 구현
 *
 * 보안 향상:
 * - Hub에서 일회용 SSO 코드 받기
 * - Susi Backend가 Hub Backend에 코드 검증 및 토큰 교환
 * - 코드는 즉시 URL에서 제거 (서버 로그 노출 최소화)
 */

import { publicClient } from '@/lib/api/instances';
import { useAuthStore } from '@/stores/client/use-auth-store';

/**
 * SSO 코드 처리 (Backend Token Exchange)
 * URL에서 SSO 코드를 추출하여 Susi Backend에 토큰 교환 요청
 *
 * @returns 토큰 처리 성공 여부
 */
export async function processSSOLogin(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const ssoCode = params.get('sso_code');

  if (!ssoCode) {
    // SSO 코드가 없으면 일반 로그인 상태
    return false;
  }

  console.log('✅ SSO 코드 감지:', ssoCode.substring(0, 20) + '...');

  try {
    // Susi Backend에 코드 교환 요청 (Hub Backend와 통신)
    const response = await publicClient.post('/auth/sso/exchange', {
      code: ssoCode,
    });

    const tokenData = response.data.data || response.data;

    console.log('✅ SSO 코드 교환 성공 - 토큰을 받았습니다');

    // Zustand 스토어에 토큰 저장 (localStorage에 자동 persist)
    const { setTokens } = useAuthStore.getState();
    setTokens(
      tokenData.accessToken,
      tokenData.refreshToken,
      tokenData.tokenExpiry || Date.now() + 3600 * 1000,
    );

    // api-client의 getAccessToken()은 localStorage.getItem('accessToken')을 직접 읽으므로 별도 저장 필요
    localStorage.setItem('accessToken', tokenData.accessToken);
    localStorage.setItem('refreshToken', tokenData.refreshToken);

    // ⚠️ 보안: URL에서 코드 제거하여 브라우저 히스토리에 남지 않도록 함
    params.delete('sso_code');

    // URL 업데이트 (히스토리에 추가하지 않고 현재 URL 교체)
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);

    console.log('✅ SSO 자동 로그인 완료 - URL에서 코드 제거됨');
    return true;
  } catch (error) {
    console.error('❌ SSO 코드 교환 실패:', error);

    // 실패 시 URL에서 코드 제거
    params.delete('sso_code');
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);

    return false;
  }
}
