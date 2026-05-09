import { hubApiClient } from "../../hub-api-client";
import { authClient } from "@/lib/api";
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
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return null;
  }

  try {
    // Saenggi-Book 백엔드의 /auth/me 사용 (자체 JWT 검증)
    const res = await authClient.get("/auth/me");
    return extractHubApiData<IUser>(res.data);
  } catch (error: any) {
    const status = error?.response?.status;
    if (!status || status === 401 || status === 403) {
      console.warn('[fetchCurrentUserAPI] 인증 실패:', error);
      return null;
    }
    // 5xx 서버 오류: throw → React Query가 이전 캐시 유지 (로그아웃 방지)
    console.warn('[fetchCurrentUserAPI] 서버 오류, 기존 로그인 상태 유지:', status);
    throw error;
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
