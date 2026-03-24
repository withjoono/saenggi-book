import { cn } from "@/lib/utils";
import { AnimationProps, MotionProps } from "framer-motion";
import React from "react";
import Balancer from "react-wrap-balancer";

export const Subheading = ({
  className,
  as: Tag = "h2",
  children,
}: {
  className?: string;
  as?: any;
  children: any;
  props?: React.HTMLAttributes<HTMLHeadingElement | AnimationProps>;
} & MotionProps &
  React.HTMLAttributes<HTMLHeadingElement | AnimationProps>) => {
  return (
    <Tag
      className={cn(
        "mx-auto my-4 max-w-4xl text-left text-sm md:text-base",
        "text-center font-normal text-foreground/60 dark:text-foreground/60",
        className,
      )}
    >
      <Balancer>{children}</Balancer>
    </Tag>
  );
};
