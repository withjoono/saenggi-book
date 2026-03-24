import { Link } from "@tanstack/react-router";
import { Button } from "@/components/custom/button";
import { cn } from "@/lib/utils";
import { IconLock, IconArrowRight } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type ServiceCode,
  useServiceAccess,
} from "@/hooks/use-service-access";

interface RequirePremiumProps {
  /** 기능 이름 (표시용) */
  featureName?: string;
  /** 서비스 코드 (기본값: J - 정시) */
  serviceCode?: ServiceCode;
  /** 구매 페이지 링크 */
  purchaseLink?: string;
  /** 로딩 시 표시할 컴포넌트 */
  loadingFallback?: React.ReactNode;
  /** 비구매자에게 표시할 커스텀 메시지 */
  customMessage?: string;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
}

/**
 * 유료 회원 필수 래퍼 컴포넌트
 *
 * 사용법:
 * ```tsx
 * <RequirePremium featureName="상세 분석" serviceCode="J">
 *   <DetailedAnalysis />
 * </RequirePremium>
 * ```
 */
export function RequirePremium({
  featureName = "이 기능",
  serviceCode = "J",
  purchaseLink = "/products",
  loadingFallback,
  customMessage,
  children,
}: RequirePremiumProps) {
  const access = useServiceAccess(serviceCode);

  // 로딩 중
  if (access.isLoading) {
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

  // 서비스 이용 가능 - 자식 컴포넌트 렌더링
  if (access.hasService) {
    return <>{children}</>;
  }

  // 로그인하지 않은 경우
  if (!access.isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <IconLock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">
          로그인이 필요한 서비스입니다
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {customMessage || `${featureName}은(는) 로그인 후 이용하실 수 있습니다.`}
        </p>
        <div className="flex gap-2">
          <Link to="/auth/login">
            <Button>로그인</Button>
          </Link>
          <Link to="/auth/register">
            <Button variant="outline">회원가입</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 유료 서비스 미구매
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
        <IconLock className="h-8 w-8 text-amber-500" />
      </div>
      <h2 className="text-lg font-semibold">유료 서비스입니다</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {customMessage || `${featureName}은(는) 유료 회원만 이용하실 수 있습니다.`}
      </p>
      <Link to={purchaseLink}>
        <Button className={cn("bg-amber-500 hover:bg-amber-600")}>
          서비스 구매하기
          <IconArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
