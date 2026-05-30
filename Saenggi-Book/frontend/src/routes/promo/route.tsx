import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  ArrowRight,
  Home,
  Upload,
  BarChart3,
  BookOpen,
  Target,
  GraduationCap,
  Sparkles,
  Network,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/promo", label: "홈", icon: Home, exact: true },
  { href: "/promo/input", label: "생기부 입력", icon: Upload },
  { href: "/promo/grades", label: "성적 분석", icon: BarChart3 },
  { href: "/promo/setuk", label: "세특 관리", icon: BookOpen },
  { href: "/promo/fit", label: "계열 적합성", icon: Target },
  { href: "/promo/explore", label: "전형 탐색", icon: GraduationCap },
  { href: "/promo/evaluation", label: "AI 사정관 평가", icon: Sparkles },
  { href: "/promo/ecosystem", label: "생태계", icon: Network },
];

function PromoLayout() {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== TOP NAV ===== */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/promo" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-olive-600 font-bold text-white">
              생
            </div>
            <span className="text-base font-semibold text-gray-900">생기북</span>
          </Link>
          <Link
            to="/sb/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-olive-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            시작하기
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* feature tabs */}
        <nav className="border-t border-gray-100 bg-olive-50/40">
          <div className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
            <ul className="flex min-w-max items-center gap-1 py-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      activeOptions={{ exact: item.exact }}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-olive-100 hover:text-gray-900"
                      activeProps={{
                        className:
                          "inline-flex items-center gap-1.5 rounded-lg bg-olive-600 px-3 py-1.5 text-xs font-medium text-white",
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      <Outlet />

      <footer className="border-t border-gray-100 bg-olive-50/30 py-8 text-center text-xs text-gray-600">
        © 거북스쿨 · 생기북 (Saenggi-Book) ·{" "}
        <a
          href="https://www.tskool.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-olive-700"
        >
          tskool.kr
        </a>
      </footer>
    </div>
  );
}

export const Route = createFileRoute("/promo")({
  component: PromoLayout,
});
