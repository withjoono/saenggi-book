import React from "react";
import { Heading } from "./heading";
import { Subheading } from "./subheading";
import { cn } from "@/lib/utils";
import { GridLineHorizontal, GridLineVertical } from "./grid-lines";
import { SkeletonOne } from "./skeletons/first";
import { SkeletonTwo } from "./skeletons/second";
import { SkeletonFour } from "./skeletons/fourth";
import { SkeletonThree } from "./skeletons/third";

export const Features = () => {
  const features = [
    {
      title: "수시/정시 예측 서비스",
      description:
        "내신 성적과 생기부, 모의고사 성적을 분석하여 각 전형별 합격 가능성을 예측합니다.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 md:col-span-4 border-b border-r dark:border-neutral-800",
    },
    {
      title: "단계별 필터링 검색",
      description:
        "300개 이상의 대학의 모든 전형을 펼처두고 T Skool만의 단계별 필터링 검색을 통해 원하는 전형을 찾아보세요.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 md:col-span-2 dark:border-neutral-800",
    },
    {
      title: "전직 입학사정관의 생기부 평가",
      description:
        "멘토 선생님이 직접 생기부를 검토하고 전문적인 평가와 조언을 제공하며 전형 탐색 시 점수를 반영합니다.",
      skeleton: <SkeletonThree />,
      className: "col-span-1 md:col-span-3 border-r dark:border-neutral-800",
    },
    {
      title: "지속적인 데이터 및 기능 업데이트",
      description:
        "대입 전형 관련 최신 정보를 지속적으로 업데이트하여 최신 정보를 제공하며 지속적인 기능 업데이트를 통해 대입 전형 탐색 서비스를 지속적으로 개선합니다.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 md:col-span-3",
    },
  ];
  return (
    <div className="relative z-20 py-10 md:py-20">
      <Heading as="h2">적합한 대학을 찾기 위한 모든 서비스</Heading>
      <Subheading className="text-center">
        수시부터 정시까지, 전문가의 평가와 함께 최적의 대입 전략을 세워보세요.
      </Subheading>

      <div className="relative">
        <div className="mt-12 grid grid-cols-1 md:grid-cols-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
        <GridLineHorizontal
          style={{
            top: 0,
            left: "-10%",
            width: "120%",
          }}
        />

        <GridLineHorizontal
          style={{
            bottom: 0,
            left: "-10%",
            width: "120%",
          }}
        />

        <GridLineVertical
          style={{
            top: "-10%",
            right: 0,
            height: "120%",
          }}
        />
        <GridLineVertical
          style={{
            top: "-10%",
            left: 0,
            height: "120%",
          }}
        />
      </div>
    </div>
  );
};

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`relative overflow-hidden p-4 sm:p-8`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Heading as="h3" size="sm" className="text-left">
      {children}
    </Heading>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Subheading className="mx-0 my-2 max-w-sm text-left md:text-sm">
      {children}
    </Subheading>
  );
};
