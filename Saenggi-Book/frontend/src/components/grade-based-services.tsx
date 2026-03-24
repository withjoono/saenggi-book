import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/custom/button";
import { useGradeStore, Grade, gradeThemes, gradeDescriptions } from "@/stores/client/use-grade-store";
import { cn } from "@/lib/utils";
import { IconChartBar, IconBook, IconTarget, IconArrowRight } from "@tabler/icons-react";

interface ServiceItem {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const gradeServices: Record<Grade, string[]> = {
  "0": ["mockAnalysis", "susi"],
  "1": ["mockAnalysis", "susi"],
  "2": ["mockAnalysis", "susi"],
  "2N": ["mockAnalysis", "susi"],
  "3": [],
};

export const GradeBasedServices = () => {
  const { grade } = useGradeStore();
  const theme = gradeThemes[grade];
  const desc = gradeDescriptions[grade];

  // 고3은 정시 프로그램 섹션이 있으므로 이 섹션을 숨김
  if (grade === "3") return null;

  const services: ServiceItem[] = [
    {
      key: "mockAnalysis",
      title: "모의고사 분석",
      description: "성적 입력 및 대학 합격 예측",
      href: "/mock-analysis/score-input",
      icon: <IconChartBar className="w-6 h-6" />,
    },
    {
      key: "susi",
      title: "수시 서비스",
      description: "생기부 분석, 전형 탐색",
      href: "/susi",
      icon: <IconBook className="w-6 h-6" />,
    },
  ];

  const currentServices = services.filter((s) =>
    gradeServices[grade].includes(s.key)
  );

  return (
    <div className="w-full py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* 헤더 - 검정색 텍스트 */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {desc.title}
          </h2>
          <p className="text-gray-500">
            {desc.subtitle}
          </p>
        </div>

        {/* 서비스 카드 - 미니멀 스타일 */}
        <div
          className={cn(
            "grid gap-6",
            currentServices.length === 1
              ? "grid-cols-1 max-w-sm mx-auto"
              : currentServices.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto"
                : "grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto"
          )}
        >
          {currentServices.map((service) => (
            <Link key={service.href} to={service.href} className="group">
              <Card className="cursor-pointer h-full transition-all duration-300 border border-gray-100 hover:shadow-lg hover:-translate-y-1 bg-white">
                <CardHeader className="text-center pb-2">
                  {/* 미니멀 아이콘 */}
                  <div
                    className="mx-auto mb-4 w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {service.icon}
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription className="text-gray-500 mb-4">
                    {service.description}
                  </CardDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:gap-2 transition-all"
                    style={{ color: theme.primary }}
                  >
                    시작하기
                    <IconArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
