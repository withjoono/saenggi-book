import { createLazyFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Upload,
  BarChart3,
  BookOpen,
  Target,
  GraduationCap,
  Sparkles,
  Network,
  CheckCircle2,
  FileText,
  Brain,
  Wand2,
} from "lucide-react";

export const Route = createLazyFileRoute("/promo/")({
  component: PromoIndexPage,
});

const VALUE_PROPS = [
  {
    icon: FileText,
    title: "생기부 PDF 한 번 업로드",
    body:
      "생활기록부 PDF를 업로드하면 교과·세특·창체·출결이 자동으로 파싱되어 구조화 데이터로 저장됩니다.",
  },
  {
    icon: Brain,
    title: "AI 계열 적합성 진단",
    body:
      "내신·세특·활동 패턴을 분석해 인문/사회/자연/공학/의약/예체능 등 계열별 적합도와 추천 학과를 제시합니다.",
  },
  {
    icon: GraduationCap,
    title: "전형까지 한 번에 연결",
    body:
      "분석된 생기부 위에 교과·학종·논술 전형 탐색이 그대로 얹혀 — 따로 데이터를 입력할 필요가 없습니다.",
  },
];

const FEATURES = [
  {
    icon: Upload,
    title: "생기부 입력",
    body: "PDF 자동 파싱 · 학년/학기 단위 구조화 · 수기 보정 가능",
  },
  {
    icon: BarChart3,
    title: "성적 분석",
    body: "교과 트렌드 · 학기별 등급 추이 · 주요 과목 강·약점 파악",
  },
  {
    icon: BookOpen,
    title: "세특 관리",
    body: "과목별 세특 정리 · 키워드 추출 · 활동 연계 시각화",
  },
  {
    icon: Target,
    title: "계열 적합성",
    body: "AI가 진로희망·세특·활동을 종합해 계열 매칭 점수 산출",
  },
  {
    icon: GraduationCap,
    title: "전형 탐색",
    body: "교과·학종·논술 전형 비교 · 대학별 조건 매칭 · 모의지원",
  },
  {
    icon: Sparkles,
    title: "AI 사정관 평가",
    body: "입학사정관 관점의 생기부 분석 · 개선 포인트 자동 제안",
  },
];

const ECOSYSTEM = [
  { name: "Hub", desc: "통합 계정 · SSO" },
  { name: "Susi", desc: "수시 전형 분석" },
  { name: "Jungsi", desc: "정시 합격 예측" },
  { name: "ExamHub", desc: "모의고사·시험 분석" },
  { name: "StudyPlanner", desc: "학습 플래너" },
];

const READY = [
  "생기부 PDF 업로드 · 자동 파싱",
  "교과 성적 학기별 트렌드 분석",
  "세부능력 및 특기사항(세특) 통합 관리",
  "창의적 체험활동(자율·동아리·진로) 정리",
  "AI 계열 적합성 진단 리포트",
  "교과/학종/논술 전형 탐색",
  "관심 대학 저장 · 모의지원",
  "AI 사정관 평가 · 개선 가이드",
  "거북스쿨 Hub SSO 한 계정 연동",
];

function PromoIndexPage() {
  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-olive-50 via-white to-amber-50">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:px-12 sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-olive-200 bg-white px-3 py-1 text-xs font-medium text-olive-700">
            <Sparkles className="h-3.5 w-3.5 text-olive-600" />
            거북스쿨 생태계 · 학생부종합 플랫폼
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            생기부·계열 진단·전형 탐색을{" "}
            <span className="text-olive-600">한 플랫폼에서</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
            생기북은 생활기록부 데이터, AI 계열 진단, 수시 전형 탐색을 하나로 잇는 학생부종합 전형 준비 도구입니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/sb/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://www.tskool.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border border-olive-200 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-olive-50"
            >
              거북스쿨 Hub에서 가입
            </a>
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPS ===== */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-12">
        <div className="grid gap-5 md:grid-cols-3">
          {VALUE_PROPS.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-olive-100 text-olive-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {v.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURE GRID ===== */}
      <section className="bg-olive-50/60 px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              무엇이 들어 있나
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              학종 준비에 필요한 분석·관리·탐색 도구가 한 화면 안에서 흐름을 이룹니다.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-olive-100 text-olive-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {f.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {f.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ECOSYSTEM ===== */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            한 학생이 다섯 앱을 따로 쓰지 않습니다
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            거북스쿨의 위성앱이 한 계정·한 데이터로 묶여 있어, 생기북에 올린 생기부가 수시·정시·모의고사 도구에서 그대로 활용됩니다.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-2xl bg-olive-600 p-5 text-white sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              중심
            </p>
            <p className="mt-2 text-lg font-bold">생기북</p>
            <p className="mt-1 text-xs opacity-80">생기부 · 계열 · 학종</p>
          </div>
          {ECOSYSTEM.map((e) => (
            <div
              key={e.name}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                앱
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900">{e.name}</p>
              <p className="mt-1 text-xs text-gray-600">{e.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            to="/promo/ecosystem"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-olive-700 hover:text-olive-800"
          >
            <Network className="h-4 w-4" />
            생태계 연동 자세히 보기
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ===== READY ===== */}
      <section className="bg-olive-50/60 px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            지금 바로 가능한 것
          </h2>
          <p className="mt-4 text-gray-600">아래 모든 기능이 작동 중입니다.</p>
        </div>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-2 sm:grid-cols-2">
          {READY.map((r) => (
            <li
              key={r}
              className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-olive-600" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:px-12">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-olive-100 text-olive-700">
          <Wand2 className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          생기부 하나로 학종 전략을 세우세요
        </h2>
        <p className="mt-4 text-gray-600">
          Hub 계정으로 로그인하고 생기부 PDF를 올리면 됩니다. 나머지는 생기북이 자동으로 분석합니다.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/sb/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://www.tskool.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl border border-olive-200 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-olive-50"
          >
            거북스쿨 Hub
          </a>
        </div>
      </section>
    </main>
  );
}
