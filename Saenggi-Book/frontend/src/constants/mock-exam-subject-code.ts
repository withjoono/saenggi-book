export type ISubjectInfo = {
  label: string;
  subjectCode: string;
  parentCode: string;
  isScore: string;
};

type ISubjectCategory = {
  code: string;
  require?: ISubjectInfo;
  select?: ISubjectInfo[];
};

type IMockExamSubjectCode = {
  [key: string]: ISubjectCategory;
};

export const MOCK_EXAM_SUBJECT_CODE: IMockExamSubjectCode = {
  kor: {
    code: "SB1",
    require: {
      label: "공통국어",
      subjectCode: "S3",
      parentCode: "SO",
      isScore: "0",
    },
    select: [
      {
        label: "화작",
        subjectCode: "S1",
        parentCode: "S3",
        isScore: "0",
      },
      {
        label: "언매",
        subjectCode: "S2",
        parentCode: "S3",
        isScore: "0",
      },
    ],
  },
  math: {
    code: "SB2",
    require: {
      label: "공통수학",
      subjectCode: "S7",
      parentCode: "SO",
      isScore: "0",
    },
    select: [
      {
        label: "미적",
        subjectCode: "S4",
        parentCode: "S7",
        isScore: "0",
      },
      {
        label: "기하",
        subjectCode: "S5",
        parentCode: "S7",
        isScore: "0",
      },
      {
        label: "확통",
        subjectCode: "S6",
        parentCode: "S7",
        isScore: "0",
      },
    ],
  },
  eng: {
    code: "SB3",
    require: {
      label: "영어",
      subjectCode: "S8",
      parentCode: "SO",
      isScore: "1",
    },
  },
  history: {
    code: "SB4",
    require: {
      label: "한국사",
      subjectCode: "S9",
      parentCode: "SO",
      isScore: "1",
    },
  },
  science: {
    code: "SB5",
    select: [
      {
        label: "물리학 Ⅰ",
        subjectCode: "S10",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "물리학 Ⅱ",
        subjectCode: "S11",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "생명과학 Ⅰ",
        subjectCode: "S12",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "생명과학 Ⅱ",
        subjectCode: "S13",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "지구과학 Ⅰ",
        subjectCode: "S14",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "지구과학 Ⅱ",
        subjectCode: "S15",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "화학 Ⅰ",
        subjectCode: "S16",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "화학 Ⅱ",
        subjectCode: "S17",
        parentCode: "S0",
        isScore: "0",
      },
    ],
  },

  society: {
    code: "SB6",
    select: [
      {
        label: "경제",
        subjectCode: "S18",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "동아시아사",
        subjectCode: "S19",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "사회·문화",
        subjectCode: "S20",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "생활과 윤리",
        subjectCode: "S21",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "세계사",
        subjectCode: "S22",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "세계지리",
        subjectCode: "S23",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "윤리와 사상",
        subjectCode: "S24",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "정치와 법",
        subjectCode: "S25",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "한국지리",
        subjectCode: "S26",
        parentCode: "S0",
        isScore: "0",
      },
    ],
  },
  //

  lang: {
    code: "SB7",
    select: [
      {
        label: "독일어 Ⅰ",
        subjectCode: "S27",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "러시아어 Ⅰ",
        subjectCode: "S28",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "베트남어 Ⅰ",
        subjectCode: "S29",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "스페인어 Ⅰ",
        subjectCode: "S30",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "아랍어 Ⅰ",
        subjectCode: "S31",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "일본어 Ⅰ",
        subjectCode: "S32",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "중국어 Ⅰ",
        subjectCode: "S33",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "프랑스어 Ⅰ",
        subjectCode: "S34",
        parentCode: "S0",
        isScore: "0",
      },
      {
        label: "한문 Ⅰ",
        subjectCode: "S35",
        parentCode: "S0",
        isScore: "0",
      },
    ],
  },
};
