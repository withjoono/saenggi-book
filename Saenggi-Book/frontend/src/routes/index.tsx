import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")(
  {
    component: Index,
  },
);

function Index() {
  // 토큰이 있으면 대시보드로, 없으면 랜딩페이지로 리다이렉트
  const hasToken = !!localStorage.getItem("accessToken");
  return <Navigate to={hasToken ? "/ms/dashboard" : "/ms"} />;
}
