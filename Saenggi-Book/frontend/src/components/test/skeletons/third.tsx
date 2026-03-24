"use client";
import { IconDots } from "@tabler/icons-react";

export const SkeletonThree = () => {
  return (
    <div className="group mx-auto mt-10 h-full w-full rounded-md bg-white shadow-2xl dark:bg-neutral-800 dark:shadow-white/40 sm:w-[80%]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[11] h-40 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black" />

      <div className="flex h-full w-full flex-1 flex-col space-y-2">
        <div className="flex justify-between border-b p-4 pb-2 dark:border-neutral-700">
          <p className="text-sm font-bold text-foreground/60">
            생기부 평가 항목
          </p>
          <p className="shadow-derek flex flex-shrink-0 items-center space-x-1 rounded-md px-2 py-1 text-sm text-muted dark:bg-neutral-700">
            <span>전체 평가: A</span>
          </p>
        </div>
        <div className="flex flex-col space-y-4 p-4">
          <Row
            title="새로운 지식을 획득하기 위해 자기주도적으로 노력하고 있는가?"
            grade="A"
            comment="교내 과학 동아리에서 주도적인 활동이 돋보임"
          />
          <Row
            title="학업에 대한 열정과 지적 호기심이 있는가?"
            grade="A"
            comment="수학/과학 분야의 꾸준한 성적 향상과 탐구활동"
          />
          <Row
            title="창의적 문제해결력을 보여주는가?"
            grade="B+"
            comment="교내 발명대회 수상, 문제해결 과정이 구체적"
          />
          <Row
            title="리더십과 협동심을 발휘하는가?"
            grade="A"
            comment="학급 임원 활동에서 조정능력 우수"
          />
          <Row
            title="전공 관련 활동이 일관적인가?"
            grade="A+"
            comment="3년간 일관된 공학 분야 진로 탐색"
          />
        </div>
      </div>
    </div>
  );
};

export const Row = ({
  title,
  grade,
  comment,
}: {
  title: string;
  grade: string;
  comment: string;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground">{title}</p>
          <span
            className={`rounded-md px-2 py-1 text-xs font-bold ${
              grade.includes("A")
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : grade.includes("B")
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
            } `}
          >
            {grade}
          </span>
        </div>
        <p className="text-xs italic text-foreground/60">{comment}</p>
      </div>
      <IconDots className="ml-2 h-4 w-4 text-muted" />
    </div>
  );
};
