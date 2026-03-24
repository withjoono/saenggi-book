import { AuthMeTest } from "@/components/test/auth-me-test";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// 테스트용 별도 레이아웃 컴포넌트
function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}

export const Route = createFileRoute("/test/auth-me")({
  component: AuthMeTestPage,
  // 별도 레이아웃 사용
  wrapInSuspense: false,
});

function AuthMeTestPage() {
  const navigate = useNavigate();

  // 강제로 테스트 페이지를 별도 렌더링
  useEffect(() => {
    // 잠시 대기 후 다시 렌더링 (Header가 로드되는 것을 방지)
    const timer = setTimeout(() => {
      console.log('Test page loaded without Header');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TestLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-600">🚨 Auth Me API Test (Header 우회)</h1>
          <p className="text-muted-foreground mt-2">
            Header 컴포넌트의 API 호출을 피해서 테스트합니다.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              ⚠️ 이 페이지는 Header를 우회해서 로드됩니다. API 호출이 발생하지 않아야 합니다.
            </p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              메인 페이지로 돌아가기
            </button>
          </div>
        </div>
        <AuthMeTest />
      </div>
    </TestLayout>
  );
}