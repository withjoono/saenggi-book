import { CalendarClock } from "lucide-react";

// 서비스 오픈 날짜 설정
const SERVICE_LAUNCH_DATE = new Date("2025-12-29T00:00:00+09:00");

// 정시 서비스는 제외할 경로들
const EXCLUDED_PATHS = [
  "/jungsi",
  "/j",
  "/products",
  "/auth",
  "/explain",
  "/notice",
  "/users",
  "/order",
  "/account-linkage",
];

/**
 * 서비스 오픈 전인지 확인
 */
export function isBeforeLaunch(): boolean {
  return new Date() < SERVICE_LAUNCH_DATE;
}

/**
 * 현재 경로가 제한 대상인지 확인
 */
export function isRestrictedPath(pathname: string): boolean {
  // 홈페이지(/)는 제한하지 않음
  if (pathname === "/" || pathname === "") {
    return false;
  }

  // 제외 경로에 해당하면 제한하지 않음
  return !EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * 서비스 오픈 전 오버레이 컴포넌트
 * 정시 서비스를 제외한 모든 서비스에 표시
 */
export function ServiceLaunchOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <CalendarClock className="h-8 w-8 text-amber-600" />
        </div>

        <p className="mb-4 text-gray-600">
          2026 정시 서비스를 제외한 모든 서비스는
          <br />
          <span className="font-semibold text-amber-600">
            2025년 12월 29일
          </span>
          부터 이용 가능합니다.
        </p>

        <p className="text-sm text-gray-500">
          페이지를 둘러보실 수는 있지만,
          <br />
          서비스 이용은 오픈일 이후 가능합니다.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/j"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            2026 정시 서비스 이용하기
          </a>
          <button
            onClick={() => window.history.back()}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            뒤로가기
          </button>
        </div>
      </div>
    </div>
  );
}
