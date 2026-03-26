const fs = require('fs');

const serviceCardsContent = `import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  FileText,
  Search,
  UserPlus,
  ClipboardList,
  Target,
  Bell,
  Snowflake,
  Sprout,
  Zap,
  ArrowRight
} from "lucide-react";

interface ServiceCard {
  id: string;
  title: string;
  price: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgGradient: string;
  features: string[];
  disabled?: boolean;
}

// 현재 서비스 중
const currentServices: ServiceCard[] = [
  {
    id: "jungsi",
    title: "정시 예측 분석",
    price: "유료",
    description: "기존 정시 서비스랑은 차원이 다른, 초격차 정시 예측 서비스!",
    icon: <Calendar className="w-6 h-6" />,
    href: "/jungsi",
    color: "text-blue-600",
    bgGradient: "from-blue-500 to-blue-600",
    features: [
      "대학별 유불리(특허)",
      "모의지원 상황 기반 정시 시뮬레이션",
      "단계별 프로세스식 진행",
      "정시 모의지원 앱",
      "계정연동으로 선생님과 앱 상담"
    ],
  },
  {
    id: "account-link",
    title: "계정 연동",
    price: "무료",
    description: "조회하고 싶은 사람들 여기 다 부르자!",
    icon: <Users className="w-6 h-6" />,
    href: "/users/profile",
    color: "text-emerald-600",
    bgGradient: "from-emerald-500 to-emerald-600",
    features: [
      "학부모와 연동",
      "선생님과 연동"
    ],
  },
];

// 겨울방학부터 서비스
const winterServices: ServiceCard[] = [
  {
    id: "planner",
    title: "플래너",
    price: "무료",
    description: "제대로 만든 수험생 전용 학습 플래너",
    icon: <ClipboardList className="w-6 h-6" />,
    href: "/planner",
    color: "text-violet-600",
    bgGradient: "from-violet-500 to-violet-600",
    features: [
      "장기계획과 주간 루틴 자동 계획",
      "교과서, 참고서 분량 자동 생성"
    ],
    disabled: true,
  },
  {
    id: "class-status",
    title: "수업 현황",
    price: "무료",
    description: "학원 수업이든 학교 수업이든 모든 수업 계획과 현황을 이곳에!",
    icon: <BookOpen className="w-6 h-6" />,
    href: "/class-status",
    color: "text-sky-600",
    bgGradient: "from-sky-500 to-sky-600",
    features: [
      "수업 계획",
      "수업 진도",
      "과제 현황"
    ],
    disabled: true,
  },
  {
    id: "school-record",
    title: "생기부관리",
    price: "AI 사정관 평가 유료",
    description: "AI 사정관이 비교과 평가 및 조언",
    icon: <FileText className="w-6 h-6" />,
    href: "/grade-analysis/school-record",
    color: "text-rose-600",
    bgGradient: "from-rose-500 to-rose-600",
    features: [
      "교과 관리",
      "비교과 관리"
    ],
    disabled: true,
  },
  {
    id: "mock-exam",
    title: "모의고사 관리",
    price: "무료",
    description: "모든 시험 성적 데이터 관리",
    icon: <BarChart3 className="w-6 h-6" />,
    href: "/mock-analysis/score-input",
    color: "text-indigo-600",
    bgGradient: "from-indigo-500 to-indigo-600",
    features: [
      "취약부분 분석",
      "오답 분석",
      "사설 모의고사(유료)"
    ],
    disabled: true,
  },
  {
    id: "susi-2027",
    title: "2027 수시 예측 분석",
    price: "유료",
    description: "수시 예측 분석 서비스를 겨울방학때부터!",
    icon: <GraduationCap className="w-6 h-6" />,
    href: "/susi",
    color: "text-amber-600",
    bgGradient: "from-amber-500 to-amber-600",
    features: [
      "AI 사정관의 생기부 평가",
      "대학별 유불리(특허)",
      "단계별 프로세스식 진행",
      "무료 수시 모의지원 앱",
      "계정연동 선생님 상담"
    ],
    disabled: true,
  },
  {
    id: "admission-search",
    title: "전형 검색 및 입시 상담",
    price: "무료 + Members",
    description: "데이터베이스와 AI 상담의 만남!",
    icon: <Search className="w-6 h-6" />,
    href: "/explore",
    color: "text-teal-600",
    bgGradient: "from-teal-500 to-teal-600",
    features: [
      "전형 검색 데이터베이스(무료)",
      "AI 거북쌤의 입시 상담(Members)"
    ],
    disabled: true,
  },
  {
    id: "my-group",
    title: "마이 그룹",
    price: "Members",
    description: "학생들끼리의 학업성취도와 성적 비교로 경쟁 유도",
    icon: <UserPlus className="w-6 h-6" />,
    href: "/my-group",
    color: "text-pink-600",
    bgGradient: "from-pink-500 to-pink-600",
    features: [
      "플래너 실행 상황 비교(일간/주간/월간)",
      "퀴즈 점수 비교"
    ],
    disabled: true,
  },
  {
    id: "group-study",
    title: "그룹 스터디",
    price: "Members",
    description: "함께 공부하는 그룹 스터디 관리",
    icon: <Target className="w-6 h-6" />,
    href: "/group-study",
    color: "text-orange-600",
    bgGradient: "from-orange-500 to-orange-600",
    features: [
      "그룹 스터디 조짜기",
      "실행 계획 및 실행 여부"
    ],
    disabled: true,
  },
];

// 3월 신학기부터 서비스
const springServices: ServiceCard[] = [
  {
    id: "admission-delivery",
    title: "맞춤 입시 정보 딜리버리",
    price: "Members",
    description: "이제 입시 정보를 찾으려고 시간 낭비하실 필요없습니다. 나에게 맞는 정보만 배달 서비스!",
    icon: <Bell className="w-6 h-6" />,
    href: "/admission-info",
    color: "text-cyan-600",
    bgGradient: "from-cyan-500 to-cyan-600",
    features: [
      "맞춤형 입시 정보 제공",
      "개인화된 알림 서비스"
    ],
    disabled: true,
  },
];

interface ServiceSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  services: ServiceCard[];
  badgeColor: string;
  bgColor: string;
}

function ServiceSection({ title, subtitle, icon, services, badgeColor, bgColor }: ServiceSectionProps) {
  return (
    <div className={cn("py-12", bgColor)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={cn("p-3 rounded-xl", badgeColor)}>
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-500 text-sm">{subtitle}</p>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((service) => {
            const cardContent = (
              <>
                {service.disabled && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5">
                    <span className="px-3 py-1 bg-gray-800 text-white text-xs font-medium rounded-full">
                      준비 중
                    </span>
                  </div>
                )}

                {/* Card Header with Gradient */}
                <div className={cn(
                  "relative px-5 py-6 text-white",
                  "bg-gradient-to-r",
                  service.bgGradient
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                          {service.price}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">{service.title}</h3>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      {service.icon}
                    </div>
                  </div>
                  <p className="mt-3 text-white/90 text-sm line-clamp-2">
                    {service.description}
                  </p>
                </div>

                {/* Card Body */}
                <div className="px-5 py-4 flex-1">
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className={cn("mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0", service.color.replace('text-', 'bg-'))} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 border-t border-gray-100">
                  <div className={cn(
                    "flex items-center gap-2 text-sm font-semibold",
                    service.disabled ? "text-gray-400" : service.color,
                    !service.disabled && "group-hover:gap-3 transition-all"
                  )}>
                    {service.disabled ? "준비 중" : "바로가기"}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </>
            );

            if (service.disabled) {
              return (
                <div
                  key={service.id}
                  className={cn(
                    "group relative flex flex-col rounded-2xl overflow-hidden",
                    "bg-white border border-gray-100",
                    "shadow-sm transition-all duration-300",
                    "opacity-70 cursor-not-allowed"
                  )}
                >
                  {cardContent}
                </div>
              );
            }

            return (
              <Link
                key={service.id}
                to={service.href}
                className={cn(
                  "group relative flex flex-col rounded-2xl overflow-hidden",
                  "bg-white border border-gray-100",
                  "shadow-sm transition-all duration-300",
                  "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                )}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ServiceCardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 pb-6">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            G Skool의 AI 앱 서비스
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            입시의 모든 것을 한 곳에서
          </h1>
          <p className="text-gray-600 text-lg">
            AI 기반 맞춤형 입시 서비스로 여러분의 합격을 응원합니다
          </p>
        </div>
      </div>

      {/* 현재 서비스 중 */}
      <ServiceSection
        title="현재 서비스 중"
        subtitle="지금 바로 이용 가능한 서비스"
        icon={<Zap className="w-6 h-6 text-blue-600" />}
        services={currentServices}
        badgeColor="bg-blue-100"
        bgColor="bg-white"
      />

      {/* 겨울방학부터 서비스 */}
      <ServiceSection
        title="겨울방학부터 서비스"
        subtitle="2025년 겨울방학부터 만나볼 수 있어요"
        icon={<Snowflake className="w-6 h-6 text-sky-600" />}
        services={winterServices}
        badgeColor="bg-sky-100"
        bgColor="bg-slate-50"
      />

      {/* 3월 신학기부터 서비스 */}
      <ServiceSection
        title="3월 신학기부터 서비스"
        subtitle="2025년 3월 새학기부터 만나볼 수 있어요"
        icon={<Sprout className="w-6 h-6 text-green-600" />}
        services={springServices}
        badgeColor="bg-green-100"
        bgColor="bg-white"
      />

      {/* Footer padding */}
      <div className="pb-16" />
    </div>
  );
}
`;

fs.writeFileSync('src/components/service-cards-page.tsx', serviceCardsContent, 'utf8');
console.log('Service cards page updated - entire card is now clickable!');
