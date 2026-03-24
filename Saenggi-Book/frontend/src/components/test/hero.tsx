"use client";

import Balancer from "react-wrap-balancer";
import { motion } from "framer-motion";

import { useNavigate } from "@tanstack/react-router";
import { Badge } from "../ui/badge";
import { Button } from "../custom/button";

export const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="relative mx-auto flex max-w-6xl flex-col overflow-hidden py-20 md:py-40">
      <motion.div
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
        }}
        className="flex justify-center gap-2"
      >
        <Badge>정시 예측</Badge>
        <Badge className="bg-green-500 hover:bg-green-600">수시 예측</Badge>
        <Badge className="bg-purple-500 hover:bg-purple-600">생기부 평가</Badge>
      </motion.div>
      <motion.h1
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
        }}
        className="relative z-10 mx-auto mt-6 max-w-6xl text-center text-2xl font-semibold md:text-4xl lg:text-6xl"
      >
        <Balancer>대입 전형 탐색부터 합격 예측까지</Balancer>
      </motion.h1>
      <motion.p
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
          delay: 0.2,
        }}
        className="dark:text-muted-dark relative z-10 mx-auto mt-6 max-w-3xl text-center text-base text-foreground/60 md:text-xl"
      >
        <Balancer>
          T Skool은 수시/정시 지원 전략부터 멘토의 전문적인 평가까지 제공하여
          여러분의 대학 입시를 완벽하게 지원합니다.
        </Balancer>
      </motion.p>
      <motion.div
        initial={{
          y: 80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
          delay: 0.4,
        }}
        className="relative z-10 mt-6 flex items-center justify-center gap-4"
      >
        <Button onClick={() => navigate({ to: "/susi" })} variant="outline">
          수시 서비스
        </Button>
        <Button
          variant="outline"
          className="group flex items-center space-x-2"
          onClick={() => navigate({ to: "/jungsi" })}
        >
          <span>정시 서비스</span>
        </Button>
      </motion.div>
    </div>
  );
};
