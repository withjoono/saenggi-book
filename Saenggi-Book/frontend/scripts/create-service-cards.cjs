const fs = require('fs');

const serviceCardsContent = `import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, FileText, BarChart3, BookOpen } from "lucide-react";

interface ServiceCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgGradient: string;
  features: string[];
}

const services: ServiceCard[] = [
  {
    id: "jungsi",
    title: "정시 서비스",
    subtitle: "2026 정시",
    description: "수능 성적 기반 정시 지원 전략 분석",
    icon: <Calendar className="w-8 h-8" />,
    href: "/jungsi",
    color: "text-blue-600",
    bgGradient: "from-blue-500 to-blue-600",
    features: ["성적 입력 & 분석", "군별 컨설팅", "모의지원"],
  },
  {
    id: "susi",
    title: "수시 서비스",
    subtitle: "2027 입시",
    description: "생기부 기반 수시 지원 전략 분석",
    icon: <FileText className="w-8 h-8" />,
    href: "/susi",
    color: "text-emerald-600",
    bgGradient: "from-emerald-500 to-emerald-600",
    features: ["생기부 입력 & 분석", "AI/사정관 평가", "전형 탐색"],
  },
  {
    id: "mock-analysis",
    title: "모의고사 분석",
    subtitle: "성적 추이 분석",
    description: "모의고사 성적 관리 및 대학 예측",
    icon: <BarChart3 className="w-8 h-8" />,
    href: "/mock-analysis/score-input",
    color: "text-indigo-600",
    bgGradient: "from-indigo-500 to-indigo-600",
    features: ["성적입력 & 분석", "대학예측", "누적분석"],
  },
  {
    id: "grade-analysis",
    title: "성적 분석",
    subtitle: "내신 성적 관리",
    description: "내신 성적 분석 및 전형 탐색",
    icon: <BookOpen className="w-8 h-8" />,
    href: "/grade-analysis/school-record",
    color: "text-rose-600",
    bgGradient: "from-rose-500 to-rose-600",
    features: ["생기부 입력", "성적 분석", "전형 탐색"],
  },
];

export function ServiceCardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            G Skool에 오신 것을 환영합니다
          </h1>
          <p className="text-gray-600 text-lg">
            원하는 서비스를 선택하여 입시 준비를 시작하세요
          </p>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((service) => (
            <Link
              key={service.id}
              to={service.href}
              className={cn(
                "group relative flex flex-col rounded-2xl overflow-hidden",
                "bg-white border border-gray-100",
                "shadow-sm hover:shadow-xl transition-all duration-300",
                "hover:-translate-y-1"
              )}
            >
              {/* Card Header with Gradient */}
              <div className={cn(
                "relative px-6 py-8 text-white",
                "bg-gradient-to-r",
                service.bgGradient
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="opacity-90 text-sm font-medium mb-1">
                      {service.subtitle}
                    </div>
                    <h2 className="text-2xl font-bold">{service.title}</h2>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {service.icon}
                  </div>
                </div>
                <p className="mt-4 text-white/90 text-sm">
                  {service.description}
                </p>
              </div>

              {/* Card Body */}
              <div className="px-6 py-5 flex-1">
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        "bg-gray-100 text-gray-700"
                      )}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className={cn(
                  "flex items-center gap-2 text-sm font-semibold",
                  service.color,
                  "group-hover:gap-3 transition-all"
                )}>
                  시작하기
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/service-cards-page.tsx', serviceCardsContent, 'utf8');
console.log('Service cards page created successfully!');
