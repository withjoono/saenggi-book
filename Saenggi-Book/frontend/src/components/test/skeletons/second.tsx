"use client";
import { stagger, useAnimate } from "framer-motion";
import React, { useState } from "react";

export const SkeletonTwo = () => {
  const [scope, animate] = useAnimate();
  const [animating, setAnimating] = useState(false);

  const handleAnimation = async () => {
    if (animating) return;

    setAnimating(true);
    await animate(
      ".message",
      {
        opacity: [0, 1],
        y: [20, 0],
      },
      {
        delay: stagger(0.5),
      },
    );
    setAnimating(false);
  };
  return (
    <div className="relative mt-4 h-full w-full">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black" />
      <div className="z-20 h-full rounded-[32px] border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="h-full rounded-[24px] border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-black">
          <div className="mx-auto h-6 w-20 rounded-full bg-neutral-200/80 dark:bg-neutral-800/80" />
          <div
            onMouseEnter={handleAnimation}
            ref={scope}
            className="content mx-auto mt-4 w-[90%]"
          >
            <AIMessage>
              자신이 속하는 특별전형 자격이나 원하는 지역/계열이 있나요?
            </AIMessage>
            <UserMessage>농어촌, 서울, 통합</UserMessage>
            <AIMessage>
              최저등급 조건을 확인하고 원하는 전형을 선택해주세요
            </AIMessage>
            <UserMessage>
              홍익대-농어촌전형
              <br /> 명지대-기회균형전형
            </UserMessage>
            <AIMessage>
              서류/면접/실기 등 비교과 여부를 확인하고 원하는 전형을
              선택해주세요.
            </AIMessage>
            <UserMessage>홍익대-농어촌전형</UserMessage>
            <AIMessage>
              모집단위와 각 위험도/리포트를 확인하고 원하는 모집단위를
              선택해주세요.
            </AIMessage>
            <UserMessage>국어국문학과, 영어영문학과</UserMessage>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="message my-4 rounded-md bg-black p-2 text-[10px] text-white dark:bg-white dark:text-black sm:p-4 sm:text-xs">
      {children}
    </div>
  );
};
const AIMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="message my-4 rounded-md bg-neutral-100 p-2 text-[10px] text-black dark:bg-neutral-800 dark:text-white sm:p-4 sm:text-xs">
      {children}
    </div>
  );
};
