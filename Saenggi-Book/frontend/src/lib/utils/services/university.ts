import { UNIVERSITY_LEVELS } from "@/constants/univ-levels";

/**
 * 대학 코드로 레벨 조회 (ex. U006)
 */
export const getUnivLevelByCode = (
  univCode: string,
  generalFieldName: string,
) => {
  if (generalFieldName.trim() === "의치한약수") return 1;

  return UNIVERSITY_LEVELS[univCode] || 0;
};
