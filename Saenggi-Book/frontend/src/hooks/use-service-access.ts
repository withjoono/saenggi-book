/**
 * 서비스 접근 권한 및 Try 모드 관리 훅
 */

import { useQuery } from "@tanstack/react-query";
import { USER_API } from "@/stores/server/features/me/apis";
import { meQueryKeys } from "@/stores/server/features/me/queries";

export type ServiceCode = "S" | "J" | "E" | "M"; // 수시, 정시, 평가, 모의고사

export interface ServiceAccessResult {
  isLoggedIn: boolean;
  isLoading: boolean;
  hasService: boolean;
  isTryMode: boolean;
  tryUsageCount: number;
  tryLimit: number;
  canUseTry: boolean;
  remainingTryCount: number;
  serviceCode: ServiceCode;
}

// Try 모드 사용 횟수 저장소 키
const TRY_USAGE_KEY = "gb_try_usage";

// Try 모드 제한 횟수 설정
const TRY_LIMITS: Record<ServiceCode, number> = {
  S: 3, // 수시 - 3회
  J: 3, // 정시 - 3회
  E: 2, // 평가 - 2회
  M: 5, // 모의고사 - 5회
};

/**
 * Try 사용 횟수 가져오기
 */
function getTryUsage(serviceCode: ServiceCode): number {
  try {
    const stored = localStorage.getItem(TRY_USAGE_KEY);
    if (!stored) return 0;
    const usage = JSON.parse(stored);
    return usage[serviceCode] || 0;
  } catch {
    return 0;
  }
}

/**
 * Try 사용 횟수 증가
 */
export function incrementTryUsage(serviceCode: ServiceCode): number {
  try {
    const stored = localStorage.getItem(TRY_USAGE_KEY);
    const usage = stored ? JSON.parse(stored) : {};
    usage[serviceCode] = (usage[serviceCode] || 0) + 1;
    localStorage.setItem(TRY_USAGE_KEY, JSON.stringify(usage));
    return usage[serviceCode];
  } catch {
    return 0;
  }
}

/**
 * Try 사용 횟수 초기화
 */
export function resetTryUsage(serviceCode?: ServiceCode): void {
  try {
    if (serviceCode) {
      const stored = localStorage.getItem(TRY_USAGE_KEY);
      const usage = stored ? JSON.parse(stored) : {};
      delete usage[serviceCode];
      localStorage.setItem(TRY_USAGE_KEY, JSON.stringify(usage));
    } else {
      localStorage.removeItem(TRY_USAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * 서비스 접근 권한 확인 훅
 * @param serviceCode 확인할 서비스 코드
 */
export function useServiceAccess(serviceCode: ServiceCode): ServiceAccessResult {
  // 사용자 정보 조회
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: meQueryKeys.all,
    queryFn: USER_API.fetchCurrentUserAPI,
    retry: false,
    staleTime: 0,
  });

  // 활성 서비스 조회
  const { data: activeServices, isLoading: isServicesLoading } = useQuery({
    queryKey: meQueryKeys.activeServices(),
    queryFn: USER_API.fetchCurrentUserActiveServicesAPI,
    enabled: !!user,
    retry: false,
    staleTime: 0,
  });

  const isLoggedIn = !!user;
  const isLoading = isUserLoading || isServicesLoading;
  // ALL_PREMIUM은 모든 서비스 접근 권한을 의미
  const hasService = activeServices?.includes(serviceCode) || activeServices?.includes("ALL_PREMIUM") || false;

  const tryLimit = TRY_LIMITS[serviceCode];
  const tryUsageCount = getTryUsage(serviceCode);
  const canUseTry = tryUsageCount < tryLimit;
  const remainingTryCount = Math.max(0, tryLimit - tryUsageCount);

  // Try 모드: 서비스가 없고, Try 횟수가 남아있을 때
  const isTryMode = !hasService && canUseTry;

  return {
    isLoggedIn,
    isLoading,
    hasService,
    isTryMode,
    tryUsageCount,
    tryLimit,
    canUseTry,
    remainingTryCount,
    serviceCode,
  };
}

/**
 * 정시 서비스 접근 권한 확인
 */
export function useJungsiAccess() {
  return useServiceAccess("J");
}

/**
 * 수시 서비스 접근 권한 확인
 */
export function useSusiAccess() {
  return useServiceAccess("S");
}

/**
 * 평가 서비스 접근 권한 확인
 */
export function useEvaluationAccess() {
  return useServiceAccess("E");
}

/**
 * 모의고사 서비스 접근 권한 확인
 */
export function useMockExamAccess() {
  return useServiceAccess("M");
}
