import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/client/use-auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/oauth/callback")({
  component: OAuthCallback,
});

function OAuthCallback() {
  const navigate = useNavigate();
  const { setTokens } = useAuthStore();

  useEffect(() => {
    // URL에서 토큰 추출
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const tokenExpiry = params.get('token_expiry');

    if (!accessToken || !refreshToken || !tokenExpiry) {
      console.error('❌ OAuth 콜백: 토큰 정보 누락', { accessToken, refreshToken, tokenExpiry });
      toast.error('로그인에 실패했습니다. 다시 시도해주세요.');
      navigate({ to: '/auth/login' });
      return;
    }

    console.log('✅ OAuth 콜백: 토큰 받음', {
      accessTokenLength: accessToken.length,
      refreshTokenLength: refreshToken.length,
      tokenExpiry,
    });

    // Zustand 스토어에 토큰 저장 (localStorage에 자동 persist)
    setTokens(accessToken, refreshToken, parseInt(tokenExpiry, 10));

    toast.success('환영합니다. T Skool 수시입니다. 😄');

    // 메인 페이지로 리다이렉트
    navigate({ to: '/' });
  }, [navigate, setTokens]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}
