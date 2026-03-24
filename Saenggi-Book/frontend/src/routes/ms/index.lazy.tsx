import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { USER_API } from "@/stores/server/features/me/apis";
import {
  BookOpen,
  BarChart3,
  Target,
  GraduationCap,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/custom/button";
import { cn } from "@/lib/utils";

export const Route = createLazyFileRoute("/ms/")(
  {
    component: MsLandingPage,
  },
);

const features = [
  {
    icon: FileText,
    title: "생기부 입력",
    description: "생기부 PDF를 업로드하면 자동으로 데이터를 파싱하여 저장합니다.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: BarChart3,
    title: "성적 분석",
    description: "교과 성적을 다양한 관점에서 분석하고 트렌드를 파악합니다.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Target,
    title: "계열 적합성 진단",
    description: "나의 성적과 활동을 바탕으로 적합한 계열을 진단합니다.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: BookOpen,
    title: "세특 관리",
    description: "세부능력 및 특기사항을 한눈에 확인하고 관리합니다.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: GraduationCap,
    title: "전형 탐색",
    description: "교과, 학종, 논술 전형을 탐색하고 나에게 맞는 전형을 찾습니다.",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    icon: Sparkles,
    title: "AI/사정관 평가",
    description: "AI와 전문 사정관이 생기부를 분석하여 맞춤 피드백을 제공합니다.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

const highlights = [
  "생기부 PDF 자동 파싱 및 데이터 관리",
  "교과/비교과 통합 분석 리포트",
  "AI 기반 계열 적합성 진단",
  "수시 전형별 맞춤 탐색",
  "관심대학 저장 및 모의지원",
];

function MsLandingPage() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: USER_API.fetchCurrentUserAPI,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="w-full">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-olive-50 via-white to-amber-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-olive-100/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-screen-xl px-4 py-20 sm:py-28 lg:py-36">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-olive-100 px-4 py-1.5 text-sm font-medium text-olive-700">
              <Sparkles className="h-4 w-4" />
              수시 대입을 위한 생기부 분석 플랫폼
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              <span className="text-olive-600">생기북</span>로
              <br className="sm:hidden" />{" "}
              시작하는 대입 전략
            </h1>
            <p className="mb-10 max-w-2xl text-lg text-gray-600 sm:text-xl">
              생기부를 업로드하면 성적 분석부터 전형 탐색, AI 평가까지
              <br className="hidden sm:block" />
              수시 대입에 필요한 모든 것을 한 곳에서 관리하세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              {user ? (
                <Link
                  to="/ms/dashboard"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "gap-2 rounded-full bg-olive-600 px-8 text-base font-semibold shadow-lg hover:bg-olive-700",
                  )}
                >
                  대시보드로 이동
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "gap-2 rounded-full bg-olive-600 px-8 text-base font-semibold shadow-lg hover:bg-olive-700",
                    )}
                  >
                    시작하기
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/auth/register"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "rounded-full border-olive-300 px-8 text-base font-semibold text-olive-700 hover:bg-olive-50",
                    )}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 소개 */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            생기부 관리의 모든 것
          </h2>
          <p className="text-lg text-gray-600">
            업로드부터 분석, 전형 탐색까지 한 번에
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={cn(
                  "mb-4 inline-flex rounded-xl p-3",
                  feature.bgColor,
                )}
              >
                <feature.icon className={cn("h-6 w-6", feature.color)} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 하이라이트 섹션 */}
      <section className="bg-olive-600">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:py-20">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="mb-4 text-3xl font-bold text-white">
                왜 생기북인가요?
              </h2>
              <p className="text-lg text-olive-100">
                복잡한 생기부 데이터를 간편하게 관리하고,
                <br />
                데이터 기반의 전략적 수시 대비를 시작하세요.
              </p>
            </div>
            <div className="flex-1">
              <ul className="space-y-4">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-olive-200" />
                    <span className="text-base font-medium text-white">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:py-24">
        <div className="rounded-3xl bg-gradient-to-r from-olive-50 to-amber-50 p-8 text-center sm:p-16">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            지금 바로 시작하세요
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            생기부 하나로 수시 대입 전략을 세워보세요.
          </p>
          {user ? (
            <Link
              to="/ms/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 rounded-full bg-olive-600 px-10 text-base font-semibold shadow-lg hover:bg-olive-700",
              )}
            >
              대시보드로 이동
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 rounded-full bg-olive-600 px-10 text-base font-semibold shadow-lg hover:bg-olive-700",
              )}
            >
              무료로 시작하기
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
