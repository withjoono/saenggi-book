export const SUSI_SUBJECT_BASIC_TYPE = ["일반전형", "특별전형"] as const;
export type ISusiSubjectBasicType = (typeof SUSI_SUBJECT_BASIC_TYPE)[number];
export const SUSI_COMP_BASIC_TYPE = ["일반", "특별"] as const;
export type ISusiCompBasicType = (typeof SUSI_COMP_BASIC_TYPE)[number];

export const SUSI_REGIONS = [
  "",
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
export type ISusiRegions = (typeof SUSI_REGIONS)[number];

export const SUSI_DEPARTMENTS = ["인문", "자연", "의치한약수", "통합"] as const; // '예체능'
export type ISusiDepartments = (typeof SUSI_DEPARTMENTS)[number];

export const SUSI_DETAILED_TYPE_MAPPER = {
  "지역인재-강원": 11,
  "지역인재-대경": 12,
  "지역인재-부울경": 13,
  "지역인재-제주": 14,
  "지역인재-충청": 15,
  "지역인재-호남": 16,
  특기자: 20,
  농어촌: 21,
  저소득: 22,
  특성화고졸: 23,
  특성화고졸재직: 24,
  "보훈,유공": 25,
  특수교육: 26,
  "군인,경찰": 27,
  "집배원,소방관,미화원,교도관": 28,
  다문화: 29,
  다자녀: 30,
  교직원: 31,
  농생명고: 32,
  "대안학교졸(예정)자": 33,
  도서벽지근무: 34,
  만학도: 35,
  민주화: 36,
  병결: 37,
  봉사: 38,
  북한: 39,
  사회봉사자: 40,
  서해5도: 41,
  "선교,목회": 42,
  선효행: 43,
  소년소녀가장: 44,
  어학: 45,
  "위탁,아동복지,입양": 46,
  임관: 47,
  임원: 48,
  입상: 49,
  자격증: 50,
  "조손,장애부모": 51,
  종교: 52,
  창업: 53,
  해녀: 54,
  해외고: 55,
};

export const SUSI_DETAILED_TYPE = Object.keys(SUSI_DETAILED_TYPE_MAPPER);
export type ISusiDetailedType = (typeof SUSI_DETAILED_TYPE)[number];

export function getSusiDetailedTypeName(typeNumber: number): string | null {
  const entry = Object.entries(SUSI_DETAILED_TYPE_MAPPER).find(
    ([, value]) => value === typeNumber,
  );

  return entry ? entry[0] : null;
}
