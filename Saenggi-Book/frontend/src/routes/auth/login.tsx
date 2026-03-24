import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { redirectToHubLogin } from "@/lib/auth/hub-login";

export const Route = createFileRoute("/auth/login")({
  component: LoginRedirect,
});

/**
 * 생기북은 자체 로그인 페이지를 사용하지 않습니다.
 * Hub의 중앙 인증 시스템으로 리디렉트합니다.
 */
function LoginRedirect() {
  useEffect(() => {
    // Hub 로그인 페이지로 리디렉트 (로그인 후 생기북으로 돌아옴)
    redirectToHubLogin('/');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-sm text-gray-500">T Skool 로그인 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
