import { RequireLoginMessage } from "@/components/require-login-message";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { Skeleton } from "@/components/ui/skeleton";

interface RequireLoginProps {
  /** 기능 이름 (표시용) */
  featureName?: string;
  /** 로딩 시 표시할 컴포넌트 */
  loadingFallback?: React.ReactNode;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
}

/**
 * 로그인 필수 래퍼 컴포넌트
 *
 * 사용법:
 * ```tsx
 * <RequireLogin featureName="관심대학">
 *   <InterestComponent />
 * </RequireLogin>
 * ```
 */
export function RequireLogin({
  featureName: _featureName,
  loadingFallback,
  children,
}: RequireLoginProps) {
  const { data: currentUser, isLoading } = useGetCurrentUser();

  // 로딩 중
  if (isLoading) {
    return (
      loadingFallback || (
        <div className="space-y-4 py-8">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
    );
  }

  // 로그인하지 않은 경우
  if (!currentUser) {
    return <RequireLoginMessage />;
  }

  // 로그인된 경우 - 자식 컴포넌트 렌더링
  return <>{children}</>;
}
