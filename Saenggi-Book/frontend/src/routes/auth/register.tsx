import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { redirectToHubRegister } from "@/lib/auth/hub-login";

export const Route = createFileRoute("/auth/register")({
  component: RegisterRedirect,
});

/**
 * 마이생기부는 자체 회원가입 페이지를 사용하지 않습니다.
 * Hub의 중앙 회원가입 페이지로 리디렉트합니다.
 */
function RegisterRedirect() {
  useEffect(() => {
    redirectToHubRegister('/');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-sm text-gray-500">T Skool 회원가입 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
