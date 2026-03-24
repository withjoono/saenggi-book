import { hubApiClient } from "../../hub-api-client";
import {
  ISchoolRecordAttendance,
  ISchoolRecordBehaviorOpinion,
  ISchoolRecordCreativeActivity,
  ISchoolRecordSelectSubject,
  ISchoolRecordSubject,
  ISchoolRecordVolunteer,
  IUser,
} from "./interfaces";

/**
 * Hub API 응답에서 실제 데이터 추출
 * Hub API는 { data: ... } 또는 { success: true, data: ... } 형식으로 응답할 수 있음
 */
const extractHubApiData = <T>(responseData: any): T => {
  // 응답이 객체이고 data 필드가 있으면 추출
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data as T;
  }
  // 그렇지 않으면 응답 자체가 데이터
  return responseData as T;
};

/**
 * 로그인한 유저 조회
 * Hub 중앙 인증 서버(/api-hub)를 통해 현재 로그인한 사용자 정보를 조회합니다.
 * SSO 토큰은 Hub에서 발급되므로 Hub 서버에서만 검증 가능합니다.
 */
const fetchCurrentUserAPI = async (): Promise<IUser | null> => {
  // 토큰이 없으면 API 호출 없이 바로 null 반환 (게스트 사용자 401 방지)
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return null;
  }

  try {
    const res = await hubApiClient.get("/auth/me");
    const userData = extractHubApiData<IUser>(res.data);
    console.log('[fetchCurrentUserAPI] 사용자 정보:', userData);
    return userData;
  } catch (error) {
    console.warn('[fetchCurrentUserAPI] 사용자 정보 조회 실패:', error);
    return null;
  }
};

/**
 * 유저의 활성화 중인 서비스 조회
 * Hub 중앙 인증 서버(/api-hub)를 통해 사용자의 활성화된 서비스 목록을 조회합니다.
 */
const fetchCurrentUserActiveServicesAPI = async (): Promise<string[]> => {
  try {
    const res = await hubApiClient.get("/auth/me/active");
    const services = extractHubApiData<string[]>(res.data);
    console.log('[fetchCurrentUserActiveServicesAPI] 활성 서비스:', services);
    // 배열이 아닌 경우 빈 배열 반환 (방어적 처리)
    return Array.isArray(services) ? services : [];
  } catch (error) {
    console.warn('[fetchCurrentUserActiveServicesAPI] 활성 서비스 조회 실패:', error);
    return [];
  }
};

/**
 * [생기부] 전체 데이터 통합 조회 (Hub 중앙 API)
 * Hub-Backend의 GET /schoolrecord/:memberId 단일 엔드포인트에서 전체 데이터를 조회합니다.
 */
const fetchAllSchoolRecordsAPI = async (memberId: string): Promise<{
  attendanceDetails: ISchoolRecordAttendance[];
  selectSubjects: ISchoolRecordSelectSubject[];
  subjectLearnings: ISchoolRecordSubject[];
  volunteers: ISchoolRecordVolunteer[];
  creativeActivities: ISchoolRecordCreativeActivity[];
  behaviorOpinions: ISchoolRecordBehaviorOpinion[];
} | null> => {
  try {
    const res = await hubApiClient.get(`/schoolrecord/${memberId}`);
    const data = extractHubApiData<any>(res.data);
    return data;
  } catch (error) {
    console.warn('[fetchAllSchoolRecordsAPI] 생기부 데이터 조회 실패:', error);
    return null;
  }
};

export const USER_API = {
  fetchCurrentUserAPI,
  fetchCurrentUserActiveServicesAPI,
  fetchAllSchoolRecordsAPI,
};
