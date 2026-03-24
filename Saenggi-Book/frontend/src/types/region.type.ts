export const REGIONS = [
  "서울",
  "경기",
  "인천",
  "대전",
  "세종",
  "충남",
  "충북",
  "광주",
  "전남",
  "전북",
  "대구",
  "경북",
  "경남",
  "부산",
  "울산",
  "강원",
  "제주",
] as const;

export type IRegion = (typeof REGIONS)[number];
