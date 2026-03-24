export interface IUser {
  id: string;
  email: string | null;
  roleType: string | null;
  phone: string | null;
  ckSmsAgree: boolean;
  nickname: string;
  sTypeId: string | null;
  hstTypeId: string;
  gTypeId: string | null;
  graduateYear: string;
  major: string;
  memberType: 'student' | 'teacher' | 'parent';
}

// 출결
export interface ISchoolRecordAttendance {
  id: number;
  absent_disease: number | null;
  absent_etc: number | null;
  absent_unrecognized: number | null;
  class_days: number | null;
  etc: string | null;
  grade: string | null;
  late_disease: number | null;
  late_etc: number | null;
  late_unrecognized: number | null;
  leave_early_disease: number | null;
  leave_early_etc: number | null;
  leave_early_unrecognized: number | null;
  result_disease: number | null;
  result_early_etc: number | null;
  result_unrecognized: number | null;
}

// 비교과 성적 (API 응답은 humps에 의해 camelCase로 변환됨)
export interface ISchoolRecordSelectSubject {
  id: number;
  achievement: string | null;
  achievementa: string | null;
  achievementb: string | null;
  achievementc: string | null;
  etc: string | null;
  grade: string | null;
  mainSubjectCode: string | null;
  mainSubjectName: string;
  rawScore: string | null;
  semester: string | null;
  studentsNum: string | null;
  subSubjectAverage: string | null;
  subjectCode: string | null;
  subjectName: string;
  unit: string | null;
  detailAndSpecialty: string | null;
}

// 교과 성적 (API 응답은 humps에 의해 camelCase로 변환됨)
export interface ISchoolRecordSubject {
  id: number;
  achievement: string | null; // 성취도
  etc: string | null; // 비고
  grade: string | null; // 학년
  mainSubjectCode: string | null; // 교과코드
  mainSubjectName: string; // 교과이름
  ranking: string | null; // 석차등급
  rawScore: string | null; // 원점수
  semester: string | null; // 학기
  standardDeviation: string | null; // 표준편차
  studentsNum: string | null; // 수강자수
  subSubjectAverage: string | null; // 과목평균
  subjectCode: string | null; // 과목
  subjectName: string | null; // 과목이름
  unit: string | null; // 단위수
  detailAndSpecialty: string | null; // 세부능력 및 특기사항
}

export interface ISchoolRecordCreativeActivity {
  id: number;
  grade: string | null;
  activityType: string | null; // 활동유형 (자치활동, 동아리활동, 봉사활동, 진로활동)
  content: string | null; // 특기사항
}

export interface ISchoolRecordBehaviorOpinion {
  id: number;
  grade: string | null;
  content: string | null; // 행동특성 및 종합의견
}

export interface ISchoolRecord {
  attendance: ISchoolRecordAttendance[];
  selectSubjects: ISchoolRecordSelectSubject[];
  subjects: ISchoolRecordSubject[];
  volunteers: ISchoolRecordVolunteer[];
  creativeActivities: ISchoolRecordCreativeActivity[];
  behaviorOpinions: ISchoolRecordBehaviorOpinion[];
  isEmpty: boolean;
}

// *************** 내 모의고사 성적 평균낼때 사용 *************

// 과목별 합 (과목, 학년, 학기)
export interface ISubjectSumInfo {
  subject: string;
  grade: string;
  semester: string;
  totalRanking: number;
  totalUnits: number;
}

// 과목별 평균 등급
export interface IEachSubjectAverage {
  korean: { average: string; totalUnits: number };
  english: { average: string; totalUnits: number };
  science: { average: string; totalUnits: number };
  society: { average: string; totalUnits: number };
  math: { average: string; totalUnits: number };
}

// 봉사
export interface ISchoolRecordVolunteer {
  id: number;
  accumulate_time: string | null;
  activity_content: string | null;
  activity_time: string | null;
  date: string | null;
  grade: string | null;
  place: string | null;
}

// *************** Mutation *************

export interface IEditProfileBody {
  graduate_year: string;
  major: number; // 0 문과, 1 이과
  hst_type_id: number | null;
  ck_sms_agree: boolean;
}

export interface IEditLifeRecordBody {
  attendances: Omit<ISchoolRecordAttendance, "id">[];
  subjects: Omit<ISchoolRecordSubject, "id">[];
  selectSubjects: Omit<ISchoolRecordSelectSubject, "id">[];
}
