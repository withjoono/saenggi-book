/**
 * 서비스 접근 제한 게이트 컴포넌트
 * 유료 서비스 페이지에서 접근 권한을 체크하고 제한하는 래퍼 컴포넌트
 */

import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconLock,
  IconArrowRight,
  IconLogin,
  IconGift,
} from "@tabler/icons-react";
import {
  type ServiceCode,
  useServiceAccess,
  incrementTryUsage,
} from "@/hooks/use-service-access";

interface ServiceGateProps {
  /** 서비스 코드 */
  serviceCode: ServiceCode;
  /** 서비스 이름 (표시용) */
  serviceName: string;
  /** 서비스 색상 */
  serviceColor?: "orange" | "teal" | "olive" | "amber" | "blue" | "green" | "purple" | "indigo" | "rose" | "emerald" | "violet" | "sky" | "fuchsia" | "lime" | "cyan";
  /** 구매 페이지 링크 */
  purchaseLink?: string;
  /** Try 랜딩 페이지 링크 */
  tryLandingLink?: string;
  /** Try 모드 허용 여부 */
  allowTry?: boolean;
  /** Try 모드에서 제한할 기능 설명 */
  tryLimitDescription?: string;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
  /** 로딩 컴포넌트 */
  loadingComponent?: React.ReactNode;
}

/**
 * 서비스 접근 제한 게이트
 *
 * 사용법:
 * ```tsx
 * <ServiceGate
 *   serviceCode="J"
 *   serviceName="정시 합격 예측"
 *   allowTry
 * >
 *   <YourProtectedContent />
 * </ServiceGate>
 * ```
 */
export function ServiceGate({
  serviceCode,
  serviceName,
  serviceColor = "orange",
  purchaseLink = "/products",
  tryLandingLink,
  allowTry = true,
  tryLimitDescription,
  children,
  loadingComponent,
}: ServiceGateProps) {
  const access = useServiceAccess(serviceCode);

  const colorClasses = {
    // 정시 - Orange
    orange: {
      bg: "bg-orange-500",
      bgLight: "bg-orange-50",
      text: "text-orange-500",
      border: "border-orange-200",
    },
    // 수시 - Olive Leaf (#3e5622)
    olive: {
      bg: "bg-olive-500",
      bgLight: "bg-olive-50",
      text: "text-olive-500",
      border: "border-olive-200",
    },
    // Legacy - Teal
    teal: {
      bg: "bg-teal-600",
      bgLight: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-200",
    },
    // 플래너 - Indigo (네이비)
    indigo: {
      bg: "bg-indigo-700",
      bgLight: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    // 수업현황 - Rose
    rose: {
      bg: "bg-rose-500",
      bgLight: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
    },
    // 생기부 - Emerald
    emerald: {
      bg: "bg-emerald-500",
      bgLight: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
    },
    // 모의고사 - Violet
    violet: {
      bg: "bg-violet-500",
      bgLight: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-200",
    },
    // 전형 검색 - Sky
    sky: {
      bg: "bg-sky-500",
      bgLight: "bg-sky-50",
      text: "text-sky-600",
      border: "border-sky-200",
    },
    // 마이 그룹 - Fuchsia
    fuchsia: {
      bg: "bg-fuchsia-500",
      bgLight: "bg-fuchsia-50",
      text: "text-fuchsia-600",
      border: "border-fuchsia-200",
    },
    // 그룹 스터디 - Lime
    lime: {
      bg: "bg-lime-500",
      bgLight: "bg-lime-50",
      text: "text-lime-600",
      border: "border-lime-200",
    },
    // 계정 연동 - Blue
    blue: {
      bg: "bg-blue-500",
      bgLight: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    // 입시정보 - Cyan
    cyan: {
      bg: "bg-cyan-500",
      bgLight: "bg-cyan-50",
      text: "text-cyan-600",
      border: "border-cyan-200",
    },
    // Legacy colors
    amber: {
      bg: "bg-amber-500",
      bgLight: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200",
    },
    green: {
      bg: "bg-green-500",
      bgLight: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200",
    },
    purple: {
      bg: "bg-purple-500",
      bgLight: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
    },
  };

  const colors = colorClasses[serviceColor];

  // 로딩 중
  if (access.isLoading) {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 서비스 이용 중 - 그대로 통과
  if (access.hasService) {
    return <>{children}</>;
  }

  // Try 모드 사용 가능 - 그대로 통과 (단, Try 사용 횟수 증가)
  if (allowTry && access.canUseTry) {
    return (
      <TryModeWrapper
        serviceName={serviceName}
        serviceColor={serviceColor}
        remainingCount={access.remainingTryCount}
        totalCount={access.tryLimit}
        purchaseLink={purchaseLink}
        limitDescription={tryLimitDescription}
      >
        {children}
      </TryModeWrapper>
    );
  }

  // 로그인하지 않은 경우
  if (!access.isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className={cn("w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center", colors.bgLight)}>
              <IconLogin className={cn("w-8 h-8", colors.text)} />
            </div>
            <CardTitle className="text-xl">로그인이 필요합니다</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {serviceName} 서비스를 이용하려면 로그인이 필요합니다.
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/auth/login">
                <Button className={cn(colors.bg, "text-white w-full")}>
                  로그인
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="outline" className="w-full">
                  회원가입
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Try 횟수 소진 또는 Try 불가 - 구매 유도
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className={cn("w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center", colors.bgLight)}>
            <IconLock className={cn("w-8 h-8", colors.text)} />
          </div>
          <CardTitle className="text-xl">서비스 구매가 필요합니다</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {serviceName} 서비스를 이용하려면 구매가 필요합니다.
          </p>
          {!access.canUseTry && (
            <Badge variant="outline" className="text-gray-500">
              무료 체험 횟수를 모두 사용했습니다
            </Badge>
          )}
          <div className="flex flex-col gap-2">
            <Link to={purchaseLink}>
              <Button className={cn(colors.bg, "text-white w-full")}>
                서비스 구매하기
                <IconArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            {tryLandingLink && (
              <Link to={tryLandingLink}>
                <Button variant="outline" className="w-full">
                  체험 안내 보기
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Try 모드 래퍼 컴포넌트
 * Try 모드일 때 상단에 배너를 표시하고 제한 사항을 안내
 */
interface TryModeWrapperProps {
  serviceName: string;
  serviceColor: "amber" | "blue" | "green" | "purple";
  remainingCount: number;
  totalCount: number;
  purchaseLink: string;
  limitDescription?: string;
  children: React.ReactNode;
}

function TryModeWrapper({

  serviceColor,
  remainingCount,
  totalCount,
  purchaseLink,
  limitDescription,
  children,
}: TryModeWrapperProps) {
  const colorClasses = {
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div>
      {/* Try 모드 배너 */}
      <div className={cn("w-full py-3 text-white", colorClasses[serviceColor])}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <IconGift className="w-5 h-5" />
              <span className="font-medium">
                무료 체험 중 ({remainingCount}/{totalCount}회 남음)
              </span>
              {limitDescription && (
                <span className="text-white/80 text-sm hidden sm:inline">
                  | {limitDescription}
                </span>
              )}
            </div>
            <Link to={purchaseLink}>
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                variant="outline"
              >
                정식 버전 구매
                <IconArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 실제 콘텐츠 */}
      {children}
    </div>
  );
}

/**
 * Try 사용 확인 및 카운트 증가 함수
 * 실제 Try 기능을 사용할 때 호출
 */
export function useTryAction(serviceCode: ServiceCode) {
  const access = useServiceAccess(serviceCode);

  const executeTryAction = (action: () => void | Promise<void>) => {
    if (access.hasService) {
      // 정식 서비스 - 그냥 실행
      return action();
    }

    if (access.canUseTry) {
      // Try 횟수 증가
      incrementTryUsage(serviceCode);
      return action();
    }

    // Try 불가
    throw new Error("Try 횟수가 소진되었습니다.");
  };

  return {
    ...access,
    executeTryAction,
  };
}
