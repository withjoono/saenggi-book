/**
 * School Record Parser Types
 * 학생부 파서 타입 정의
 */

export interface SubjectCodeMapping {
  mainSubjectName: string;
  mainSubjectCode: string;
  subjectName: string;
  subjectCode: string;
}

export interface ParsedSubjectLearning {
  grade: string;
  semester: string;
  mainSubjectCode: string;
  mainSubjectName: string;
  subjectCode: string;
  subjectName: string;
  unit: string;
  rawScore: string;
  subSubjectAverage: string;
  standardDeviation: string;
  achievement: string;
  studentsNum: string;
  ranking: string;
  etc: string;
  detailAndSpecialty?: string;
}

export interface ParsedSelectSubject {
  grade: string;
  semester: string;
  mainSubjectCode: string;
  mainSubjectName: string;
  subjectCode: string;
  subjectName: string;
  unit: string;
  rawScore: string;
  subSubjectAverage: string;
  achievement: string;
  studentsNum: string;
  achievementA: string;
  achievementB: string;
  achievementC: string;
  etc: string;
  detailAndSpecialty?: string;
}

export interface ParsedVolunteer {
  grade: string;
  date: string;
  place: string;
  activityContent: string;
  activityTime: string;
  accumulateTime: string;
}

export interface ParsedCreativeActivity {
  grade: string;
  activityType: string; // 자치활동, 동아리활동, 봉사활동, 진로활동
  content: string;
}

export interface ParsedBehaviorOpinion {
  grade: string;
  content: string;
}

export interface ParsedAttendance {
  grade: string;
  class_days: number | null;
  absent_disease: number | null;
  absent_unrecognized: number | null;
  absent_etc: number | null;
  late_disease: number | null;
  late_unrecognized: number | null;
  late_etc: number | null;
  leave_early_disease: number | null;
  leave_early_unrecognized: number | null;
  leave_early_etc: number | null;
  result_disease: number | null;
  result_unrecognized: number | null;
  result_early_etc: number | null;
  etc: string | null;
}

export interface ParsedSchoolRecord {
  subjectLearnings: ParsedSubjectLearning[];
  selectSubjects: ParsedSelectSubject[];
  volunteers: ParsedVolunteer[];
  creativeActivities: ParsedCreativeActivity[];
  behaviorOpinions: ParsedBehaviorOpinion[];
  attendances: ParsedAttendance[];
}

export interface ParsedSchoolRecordPdf {
  subjectLearnings: ParsedSubjectLearning[];
  selectSubjects: ParsedSelectSubject[];
  creativeActivities: ParsedCreativeActivity[];
  behaviorOpinions: ParsedBehaviorOpinion[];
  attendances: ParsedAttendance[];
}

// 과목 목록 (PDF 파싱용)
export const SUBJECT_LIST =
  '국어,수학,영어,사회(역사/도덕포함),과학,기술・가정/제2외국어/한문/교양,예술,체육,한국사';

// 기본 과목 코드 (매핑되지 않은 과목용)
export const DEFAULT_MAIN_SUBJECT_CODE = 'HH10';
export const DEFAULT_SUBJECT_CODE_LEARNING = 'HHS224';
export const DEFAULT_SUBJECT_CODE_SELECT = 'HHS225';
