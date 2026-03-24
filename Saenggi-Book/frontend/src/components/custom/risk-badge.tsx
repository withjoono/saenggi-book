import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  risk: number;
  className?: string;
}

export const RiskBadge = ({ risk, className }: RiskBadgeProps) => {
  // +4 ~ +5: 😆 안전 (50% 이상) - Blue
  if (risk >= 4) {
    return <p className={cn("text-blue-600 font-bold", className)}>😆 안전 (50% 이상)</p>;
  }

  // +2 ~ +3: 👍 적정 (50%~70%) - Green
  else if (risk >= 2) {
    return <p className={cn("text-green-600 font-bold", className)}>👍 적정 (50%~70%)</p>;
  }

  // -1 ~ +1: 👊 소신 (70%~80%) - Amber
  else if (risk >= -1) {
    return <p className={cn("text-amber-500 font-bold", className)}>👊 소신 (70%~80%)</p>;
  }

  // -2 ~ -3: 😓 위험 (80%~90%) - Orange
  else if (risk >= -3) {
    return <p className={cn("text-orange-600 font-bold", className)}>😓 위험 (80%~90%)</p>;
  }

  // -4 ~ -5: 💀 결격 (90%~) - Red
  return (
    <p className={cn("font-bold text-red-600", className)}>💀 결격 (90%~)</p>
  );
};
