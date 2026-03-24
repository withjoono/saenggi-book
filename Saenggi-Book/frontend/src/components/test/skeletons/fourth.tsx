import { cn } from "@/lib/utils";
import { InfiniteMovingCards } from "../infinite-moving-cards";
import {
  IconCalculator,
  IconChartBar,
  IconSchool,
  IconSearch,
} from "@tabler/icons-react";
import { IconHeart } from "@tabler/icons-react";

export const SkeletonFour = () => {
  return (
    <div className="relative mt-10 flex h-full flex-col items-center bg-white dark:bg-black">
      <InfiniteMovingCards speed="slow" direction="left">
        <MovingGrid />
      </InfiniteMovingCards>
      <InfiniteMovingCards speed="slow" direction="right">
        <MovingGrid />
      </InfiniteMovingCards>
      <InfiniteMovingCards speed="slow" direction="left">
        <MovingGrid />
      </InfiniteMovingCards>

      {/* <Globe className="absolute -right-2 md:-right-40 -bottom-40" /> */}
    </div>
  );
};

const MovingGrid = () => {
  return (
    <div className="relative z-40 mb-4 flex flex-shrink-0 space-x-4">
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <span>일반전형</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <IconHeart className="mr-1 h-4 w-4" />
        <span>관심대학</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <span>학교장추천전형</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <IconSearch className="mr-1 h-4 w-4" />
        <span>학종탐색</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <span>교과우수자전형</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <IconSchool className="mr-1 h-4 w-4" />
        <span>교과탐색</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <span>지역인재전형</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <IconCalculator className="mr-1 h-4 w-4" />
        <span>정시탐색</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <span>농어촌전형</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <IconChartBar className="mr-1 h-4 w-4" />
        <span>성적분석</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <span>특성화고전형</span>
      </span>
      <span
        className={cn(
          "flex min-w-24 items-center justify-center space-x-1 rounded-md bg-white px-2 py-1 text-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:bg-neutral-900",
        )}
      >
        <span>SW우수자전형</span>
      </span>
    </div>
  );
};
