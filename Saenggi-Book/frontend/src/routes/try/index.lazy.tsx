/**
 * Try (무료 체험) 인덱스 페이지
 * 체험 가능한 서비스 목록을 보여주는 페이지
 */

import { Link } from "@tanstack/react-router";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconChartBar,
  IconSchool,
  IconFileAnalytics,
  IconTestPipe,
  IconArrowRight,
  IconSparkles,
  IconGift,
} from "@tabler/icons-react";
import {
  useJungsiAccess,
  useSusiAccess,
  useEvaluationAccess,
  useMockExamAccess,
} from "@/hooks/use-service-access";

export const Route = createLazyFileRoute("/try/")({
  component: TryIndexPage,
});

interface TryServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  link: string;
  remainingCount: number;
  totalCount: number;
  hasService: boolean;
}

function TryServiceCard({
  title,
  description,
  icon,
  color,
  bgColor,
  link,
  remainingCount,
  totalCount,
  hasService,
}: TryServiceCardProps) {
  const canTry = remainingCount > 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className={`${bgColor} pb-4`}>
        <div className="flex items-center justify-between">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-white/90`}
          >
            {icon}
          </div>
          {hasService ? (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              이용 중
            </Badge>
          ) : canTry ? (
            <Badge className="bg-white/80 text-gray-700">
              체험 {remainingCount}/{totalCount}회
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-white/80 text-gray-500">
              체험 종료
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg text-white mt-3">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <Link to={link}>
          <Button
            className={`w-full ${hasService ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : canTry ? `${color.replace("text-", "bg-")} text-white` : "bg-gray-100 text-gray-500"}`}
            disabled={!hasService && !canTry}
          >
            {hasService ? "서비스 이용하기" : canTry ? "무료 체험하기" : "체험 종료"}
            <IconArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function TryIndexPage() {
  const jungsiAccess = useJungsiAccess();
  const susiAccess = useSusiAccess();
  const evaluationAccess = useEvaluationAccess();
  const mockExamAccess = useMockExamAccess();

  const services = [
    {
      title: "정시 합격 예측",
      description:
        "수능 성적을 기반으로 대학별 합격 확률을 예측하고, 최적의 지원 전략을 추천받으세요.",
      icon: <IconChartBar className="w-6 h-6" />,
      color: "text-orange-500",
      bgColor: "bg-gradient-to-r from-orange-500 to-orange-600",
      link: "/try/jungsi-prediction",
      ...jungsiAccess,
    },
    {
      title: "수시 적합도 분석",
      description:
        "생기부와 학교 성적을 분석하여 대학별 수시 적합도를 확인하세요.",
      icon: <IconSchool className="w-6 h-6" />,
      color: "text-teal-600",
      bgColor: "bg-gradient-to-r from-teal-500 to-teal-600",
      link: "/try/susi-analysis",
      ...susiAccess,
    },
    {
      title: "생기부 평가",
      description:
        "입학사정관 관점에서 생기부를 평가하고 개선점을 제안받으세요.",
      icon: <IconFileAnalytics className="w-6 h-6" />,
      color: "text-green-500",
      bgColor: "bg-gradient-to-r from-green-500 to-green-600",
      link: "/try/evaluation",
      ...evaluationAccess,
    },
    {
      title: "모의고사 분석",
      description:
        "모의고사 성적을 분석하고 취약점을 파악하여 학습 전략을 세우세요.",
      icon: <IconTestPipe className="w-6 h-6" />,
      color: "text-purple-500",
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
      link: "/try/mock-exam",
      ...mockExamAccess,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 히어로 섹션 */}
      <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <IconGift className="w-4 h-4 mr-1" />
            무료 체험
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            T Skool 서비스를 무료로 체험해보세요
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            각 서비스별로 제한된 횟수 내에서 무료로 체험하실 수 있습니다.
            <br />
            체험 후 마음에 드시면 정식 서비스를 구매하세요.
          </p>
        </div>
      </div>

      {/* 서비스 카드 섹션 */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <TryServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              color={service.color}
              bgColor={service.bgColor}
              link={service.link}
              remainingCount={service.remainingTryCount}
              totalCount={service.tryLimit}
              hasService={service.hasService}
            />
          ))}
        </div>

        {/* 안내 섹션 */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <IconSparkles className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    무료 체험 안내
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      각 서비스별로 정해진 횟수만큼 무료로 체험하실 수 있습니다.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      체험 버전에서는 일부 기능이 제한될 수 있습니다.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      정식 서비스 구매 시 모든 기능을 무제한으로 이용하실 수 있습니다.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      체험 횟수는 기기별로 저장되며, 브라우저 데이터 삭제 시 초기화됩니다.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="w-full bg-white py-16 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            모든 기능을 제한 없이 이용하고 싶으신가요?
          </h2>
          <p className="text-gray-600 mb-8">
            정식 서비스에서는 모든 기능을 무제한으로 이용하실 수 있습니다.
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white">
              서비스 구매하기
              <IconArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
