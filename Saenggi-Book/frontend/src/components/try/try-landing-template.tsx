/**
 * Try 랜딩 페이지 템플릿
 * 무료 체험 서비스를 위한 공통 레이아웃
 */

import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconSparkles,
  IconLock,
  IconCheck,
  IconArrowRight,
  IconGift,
} from "@tabler/icons-react";

export interface TryFeature {
  title: string;
  description: string;
  icon?: React.ReactNode;
  available: boolean; // Try에서 사용 가능 여부
}

export interface TryLandingTemplateProps {
  // 서비스 정보
  serviceName: string;
  serviceDescription: string;
  serviceColor: string; // Tailwind 색상 (예: "amber", "blue")

  // Try 상태
  remainingCount: number;
  totalCount: number;

  // 기능 목록
  features: TryFeature[];

  // 구매 링크
  purchaseLink: string;

  // 체험하기 버튼 클릭 핸들러
  onStartTry: () => void;

  // 추가 콘텐츠
  children?: React.ReactNode;

  // 히어로 이미지
  heroImage?: string;

  // 사용자 로그인 상태
  isLoggedIn: boolean;
}

export function TryLandingTemplate({
  serviceName,
  serviceDescription,
  serviceColor,
  remainingCount,
  totalCount,
  features,
  purchaseLink,
  onStartTry,
  children,
  heroImage,
  isLoggedIn,
}: TryLandingTemplateProps) {
  const colorClasses = {
    // 정시 - Orange
    orange: {
      bg: "bg-orange-500",
      bgLight: "bg-orange-50",
      bgGradient: "from-orange-500 to-orange-600",
      text: "text-orange-500",
      border: "border-orange-200",
      hover: "hover:bg-orange-600",
    },
    // 수시 - Olive Leaf (#3e5622)
    olive: {
      bg: "bg-olive-500",
      bgLight: "bg-olive-50",
      bgGradient: "from-olive-500 to-olive-600",
      text: "text-olive-500",
      border: "border-olive-200",
      hover: "hover:bg-olive-600",
    },
    // Legacy - Teal
    teal: {
      bg: "bg-teal-600",
      bgLight: "bg-teal-50",
      bgGradient: "from-teal-500 to-teal-600",
      text: "text-teal-600",
      border: "border-teal-200",
      hover: "hover:bg-teal-700",
    },
    // 플래너 - Indigo
    indigo: {
      bg: "bg-indigo-700",
      bgLight: "bg-indigo-50",
      bgGradient: "from-indigo-600 to-indigo-700",
      text: "text-indigo-700",
      border: "border-indigo-200",
      hover: "hover:bg-indigo-800",
    },
    // 수업현황 - Rose
    rose: {
      bg: "bg-rose-500",
      bgLight: "bg-rose-50",
      bgGradient: "from-rose-500 to-rose-600",
      text: "text-rose-600",
      border: "border-rose-200",
      hover: "hover:bg-rose-600",
    },
    // 생기부 - Emerald
    emerald: {
      bg: "bg-emerald-500",
      bgLight: "bg-emerald-50",
      bgGradient: "from-emerald-500 to-emerald-600",
      text: "text-emerald-600",
      border: "border-emerald-200",
      hover: "hover:bg-emerald-600",
    },
    // 모의고사 - Violet
    violet: {
      bg: "bg-violet-500",
      bgLight: "bg-violet-50",
      bgGradient: "from-violet-500 to-violet-600",
      text: "text-violet-600",
      border: "border-violet-200",
      hover: "hover:bg-violet-600",
    },
    // 전형 검색 - Sky
    sky: {
      bg: "bg-sky-500",
      bgLight: "bg-sky-50",
      bgGradient: "from-sky-500 to-sky-600",
      text: "text-sky-600",
      border: "border-sky-200",
      hover: "hover:bg-sky-600",
    },
    // 마이 그룹 - Fuchsia
    fuchsia: {
      bg: "bg-fuchsia-500",
      bgLight: "bg-fuchsia-50",
      bgGradient: "from-fuchsia-500 to-fuchsia-600",
      text: "text-fuchsia-600",
      border: "border-fuchsia-200",
      hover: "hover:bg-fuchsia-600",
    },
    // 그룹 스터디 - Lime
    lime: {
      bg: "bg-lime-500",
      bgLight: "bg-lime-50",
      bgGradient: "from-lime-500 to-lime-600",
      text: "text-lime-600",
      border: "border-lime-200",
      hover: "hover:bg-lime-600",
    },
    // 계정 연동 - Blue
    blue: {
      bg: "bg-blue-500",
      bgLight: "bg-blue-50",
      bgGradient: "from-blue-500 to-blue-600",
      text: "text-blue-600",
      border: "border-blue-200",
      hover: "hover:bg-blue-600",
    },
    // 입시정보 - Cyan
    cyan: {
      bg: "bg-cyan-500",
      bgLight: "bg-cyan-50",
      bgGradient: "from-cyan-500 to-cyan-600",
      text: "text-cyan-600",
      border: "border-cyan-200",
      hover: "hover:bg-cyan-600",
    },
    // Legacy colors
    amber: {
      bg: "bg-amber-500",
      bgLight: "bg-amber-50",
      bgGradient: "from-amber-500 to-amber-600",
      text: "text-amber-600",
      border: "border-amber-200",
      hover: "hover:bg-amber-600",
    },
    green: {
      bg: "bg-green-500",
      bgLight: "bg-green-50",
      bgGradient: "from-green-500 to-green-600",
      text: "text-green-600",
      border: "border-green-200",
      hover: "hover:bg-green-600",
    },
    purple: {
      bg: "bg-purple-500",
      bgLight: "bg-purple-50",
      bgGradient: "from-purple-500 to-purple-600",
      text: "text-purple-600",
      border: "border-purple-200",
      hover: "hover:bg-purple-600",
    },
  };

  const colors = colorClasses[serviceColor as keyof typeof colorClasses] || colorClasses.orange;
  const canTry = remainingCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 히어로 섹션 */}
      <div className={cn("w-full bg-gradient-to-r py-16", colors.bgGradient)}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center md:flex-row md:text-left md:justify-between">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <IconGift className="w-4 h-4 mr-1" />
                무료 체험
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl mb-4">
                {serviceName}
                <span className="block text-xl font-normal text-white/80 mt-2">
                  무료로 미리 체험해보세요
                </span>
              </h1>
              <p className="text-white/90 text-lg mb-6">
                {serviceDescription}
              </p>

              {/* Try 잔여 횟수 */}
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
                <IconSparkles className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  무료 체험 <span className="font-bold">{remainingCount}</span>/{totalCount}회 남음
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {canTry ? (
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                    onClick={onStartTry}
                  >
                    지금 체험하기
                    <IconArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-white/20 text-white cursor-not-allowed"
                    disabled
                  >
                    체험 횟수 소진
                  </Button>
                )}
                <Link to={purchaseLink}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 w-full"
                  >
                    정식 서비스 구매
                  </Button>
                </Link>
              </div>
            </div>

            {heroImage && (
              <div className="mt-8 md:mt-0">
                <img
                  src={heroImage}
                  alt={serviceName}
                  className="w-64 h-64 object-contain drop-shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 기능 비교 섹션 */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            체험 버전 vs 정식 버전
          </h2>
          <p className="text-gray-600">
            체험 버전에서 제공되는 기능을 확인하세요
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={cn(
                "relative overflow-hidden transition-all",
                feature.available
                  ? "border-green-200 bg-green-50/30"
                  : "border-gray-200 bg-gray-50/30 opacity-75"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    {feature.title}
                  </CardTitle>
                  {feature.available ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <IconCheck className="w-3 h-3 mr-1" />
                      체험 가능
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      <IconLock className="w-3 h-3 mr-1" />
                      정식 전용
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 추가 콘텐츠 영역 */}
      {children && (
        <div className="container mx-auto px-4 pb-16">
          {children}
        </div>
      )}

      {/* CTA 섹션 */}
      <div className={cn("w-full py-16", colors.bgLight)}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            더 많은 기능을 이용하고 싶으신가요?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            정식 서비스에서는 모든 기능을 제한 없이 이용하실 수 있습니다.
            지금 바로 시작하세요!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoggedIn && (
              <Link to="/auth/register">
                <Button size="lg" variant="outline">
                  회원가입
                </Button>
              </Link>
            )}
            <Link to={purchaseLink}>
              <Button
                size="lg"
                className={cn(colors.bg, colors.hover, "text-white")}
              >
                정식 서비스 구매하기
                <IconArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
