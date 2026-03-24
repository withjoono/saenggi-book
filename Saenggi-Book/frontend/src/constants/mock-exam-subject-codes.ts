/**
 * 모의고사 교과 코드 관리
 */
export const MOCK_EXAM_SUBJECTS = {
  S1: "화작",
  S2: "언매",
  S3: "공통국어",
  S4: "미적",
  S5: "기하",
  S6: "확통",
  S7: "공통수학",
  S8: "영어",
  S9: "한국사",
  S10: "물리학 Ⅰ",
  S11: "물리학 Ⅱ",
  S12: "생명과학 Ⅰ",
  S13: "생명과학 Ⅱ",
  S14: "지구과학 Ⅰ",
  S15: "지구과학 Ⅱ",
  S16: "화학 Ⅰ",
  S17: "화학 Ⅱ",
  S18: "경제",
  S19: "동아시아사",
  S20: "사회·문화",
  S21: "생활과 윤리",
  S22: "세계사",
  S23: "세계지리",
  S24: "윤리와 사상",
  S25: "정치와 법",
  S26: "한국지리",
  S27: "독일어 Ⅰ",
  S28: "러시아어 Ⅰ",
  S29: "베트남어 Ⅰ",
  S30: "스페인어 Ⅰ",
  S31: "아랍어 Ⅰ",
  S32: "일본어 Ⅰ",
  S33: "중국어 Ⅰ",
  S34: "프랑스어 Ⅰ",
  S35: "한문 Ⅰ",
};

export const getMockExamSubjectName = (code: string) => {
  if (code in MOCK_EXAM_SUBJECTS) {
    return MOCK_EXAM_SUBJECTS[code as keyof typeof MOCK_EXAM_SUBJECTS];
  } else {
    return "";
  }
};
