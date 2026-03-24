/**
 * ============================================
 * Spring 백엔드 API (더 이상 사용하지 않음)
 * 2024-12 NestJS로 완전 마이그레이션 완료
 * ============================================
 *
 * 이 파일의 모든 API는 NestJS 백엔드로 마이그레이션되었습니다.
 * 기존 컴포넌트에서 이 파일을 import하면 에러가 발생합니다.
 * NestJS 백엔드의 해당 API를 사용하세요.
 */

// import { springApiClient } from "../../api-client";

export interface IOfficerApplyListInfo {
  studentId: string;
  studentName: string;
  series: string;
  progressStatus: string;
  readyCount: string;
  phone: string;
  email: string;
}

export type IEvaludationListItem = {
  studentId: string;
  studentName: string;
  completeDt: string;
  series: string;
  phone: string;
  email: string;
};

export interface IEvaluationStudentInfo {
  studentName: string;
  series: string;
}

export interface IOfficerEvaluationResponse {
  status: boolean;
  officerSurveyList: {
    surveyId: string;
    score: string;
  }[];
  officerCommentList: {
    comment: string;
    mainSurveyType: string;
  }[];
}

// ============================================
// 아래 모든 API 함수들은 더 이상 사용하지 않습니다.
// NestJS 백엔드로 마이그레이션되었습니다.
// ============================================

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 */
const fetchOfficerApplyListAPI = async (): Promise<IOfficerApplyListInfo> => {
  throw new Error('Spring 백엔드는 더 이상 사용하지 않습니다. NestJS API를 사용하세요.');
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 */
export const fetchCompleteEvaluationList = async () => {
  throw new Error('Spring 백엔드는 더 이상 사용하지 않습니다. NestJS API를 사용하세요.');
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 */
export const fetchSurveyScoreList = async (
  _studentId: string | undefined | null,
): Promise<IOfficerEvaluationResponse> => {
  throw new Error('Spring 백엔드는 더 이상 사용하지 않습니다. NestJS API를 사용하세요.');
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 */
export const fetchStudentInfo = async (
  _studentId: string | undefined | null,
): Promise<IEvaluationStudentInfo> => {
  throw new Error('Spring 백엔드는 더 이상 사용하지 않습니다. NestJS API를 사용하세요.');
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 */
const updateOfficerProfileAPI = async (
  _name: string | undefined,
  _university: string | undefined,
  _education: string | undefined,
  _files: File | null,
): Promise<{ status: boolean; message: string }> => {
  throw new Error('Spring 백엔드는 더 이상 사용하지 않습니다. NestJS API를 사용하세요.');
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 */
export const uploadEarlyThreeGradeHtmlFile = async (
  _file: File,
): Promise<{ code: string; message: string; status: boolean }> => {
  throw new Error('Spring 백엔드는 더 이상 사용하지 않습니다. NestJS API를 사용하세요.');
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 */
export const uploadEarlyThreeGradeGraduatePdfFile = async (
  _file: File,
): Promise<{ code: string; message: string; status: boolean }> => {
  throw new Error('Spring 백엔드는 더 이상 사용하지 않습니다. NestJS API를 사용하세요.');
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 */
export const checkEarlydStudentSchoolRecordFileUpload = async (
  _selectFileType: string,
): Promise<{ code: string; message: string; status: boolean }> => {
  throw new Error('Spring 백엔드는 더 이상 사용하지 않습니다. NestJS API를 사용하세요.');
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 * 모든 API가 비활성화되었습니다.
 */
export const SPRING_API = {
  fetchOfficerApplyListAPI,
  fetchCompleteEvaluationList,
  fetchSurveyScoreList,
  fetchStudentInfo,
  updateOfficerProfileAPI,
  uploadEarlyThreeGradeGraduatePdfFile,
  uploadEarlyThreeGradeHtmlFile,
  checkEarlydStudentSchoolRecordFileUpload,
};
