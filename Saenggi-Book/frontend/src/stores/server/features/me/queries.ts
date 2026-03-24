import { useQuery } from "@tanstack/react-query";
import { USER_API } from "./apis";
import { ISchoolRecord, ISchoolRecordAttendance, ISchoolRecordSubject } from "./interfaces";

export const meQueryKeys = {
  all: ["me"] as const,
  activeServices: () => [...meQueryKeys.all, "activeServices"] as const,
  schoolRecords: () => [...meQueryKeys.all, "schoolRecords"] as const,
};

/**
 * 로그인한 유저 조회
 */
export const useGetCurrentUser = () =>
  useQuery({
    queryKey: meQueryKeys.all,
    queryFn: USER_API.fetchCurrentUserAPI,
    retry: false, // 401 에러 시 재시도하지 않음
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재시도하지 않음
    refetchOnMount: false, // 마운트 시 재시도하지 않음
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });

/**
 * 유저의 활성화 중인 서비스 조회
 */
export const useGetActiveServices = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: meQueryKeys.activeServices(),
    queryFn: USER_API.fetchCurrentUserActiveServicesAPI,
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * Hub API의 camelCase 출결 필드를 프론트엔드 snake_case 인터페이스로 변환
 * Hub Controller의 convertKeysToCamel()이 DB snake_case → camelCase로 변환하므로,
 * 프론트엔드에서 사용하는 snake_case 형태로 다시 매핑
 */
const normalizeAttendance = (att: any): ISchoolRecordAttendance => ({
  id: att.id,
  grade: att.grade,
  class_days: att.classDays ?? att.class_days ?? null,
  absent_disease: att.absentDisease ?? att.absent_disease ?? null,
  absent_unrecognized: att.absentUnrecognized ?? att.absent_unrecognized ?? null,
  absent_etc: att.absentEtc ?? att.absent_etc ?? null,
  late_disease: att.lateDisease ?? att.late_disease ?? null,
  late_unrecognized: att.lateUnrecognized ?? att.late_unrecognized ?? null,
  late_etc: att.lateEtc ?? att.late_etc ?? null,
  leave_early_disease: att.leaveEarlyDisease ?? att.leave_early_disease ?? null,
  leave_early_unrecognized: att.leaveEarlyUnrecognized ?? att.leave_early_unrecognized ?? null,
  leave_early_etc: att.leaveEarlyEtc ?? att.leave_early_etc ?? null,
  result_disease: att.resultDisease ?? att.result_disease ?? null,
  result_unrecognized: att.resultUnrecognized ?? att.result_unrecognized ?? null,
  result_early_etc: att.resultEarlyEtc ?? att.result_early_etc ?? null,
  etc: att.etc ?? null,
});

/**
 * [생기부] 통합 데이터 조회 (Hub 중앙 API 사용)
 * Hub-Backend의 단일 엔드포인트로 전체 데이터를 한 번에 조회합니다.
 */
export const useGetSchoolRecords = () => {
  const { data: currentUser } = useGetCurrentUser();

  return useQuery<ISchoolRecord>({
    queryKey: meQueryKeys.schoolRecords(),
    queryFn: async () => {
      if (!currentUser) throw new Error("User not found");
      const data = await USER_API.fetchAllSchoolRecordsAPI(currentUser.id);

      const rawAttendance = data?.attendanceDetails || [];
      const attendance = rawAttendance.map(normalizeAttendance);
      const selectSubjects = data?.selectSubjects || [];
      const subjects = data?.subjectLearnings || [];
      const volunteers = data?.volunteers || [];
      const creativeActivities = data?.creativeActivities || [];
      const behaviorOpinions = data?.behaviorOpinions || [];

      return {
        attendance,
        selectSubjects,
        subjects,
        volunteers,
        creativeActivities,
        behaviorOpinions,
        isEmpty:
          attendance.length === 0 &&
          selectSubjects.length === 0 &&
          subjects.length === 0 &&
          volunteers.length === 0,
      };
    },
    enabled: !!currentUser, // currentUser가 있을 때만 실행
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

// 전과목 평균 등급 계산 (PerformanceAnalysis1과 동일한 로직)
const SUBJECT_CODES = {
  KOREAN: "HH1",
  MATH: "HH2",
  SOCIETY: "HH4",
  SCIENCE: "HH5",
  ENGLISH: "HH3",
};

const calculateAverageRanking = (
  subjects: ISchoolRecordSubject[],
  subjectCodes: string[],
): string => {
  let totalWeightedGrade = 0;
  let totalUnits = 0;

  subjects.forEach((subject) => {
    if (
      subject.mainSubjectCode &&
      subject.ranking &&
      subject.unit &&
      subjectCodes.includes(subject.mainSubjectCode)
    ) {
      const grade = parseFloat(subject.ranking);
      const units = parseFloat(subject.unit);
      if (!isNaN(grade) && !isNaN(units)) {
        totalWeightedGrade += grade * units;
        totalUnits += units;
      }
    }
  });

  if (totalUnits === 0) return "0.00";

  return (totalWeightedGrade / totalUnits).toFixed(2);
};

/**
 * 내 평균 등급 조회 (전과목 평균)
 */
export const useGetMyGrade = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: schoolRecords } = useGetSchoolRecords();

  return useQuery<number>({
    queryKey: ["myGrade", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        throw new Error("유저를 찾을 수 없습니다.");
      }

      if (!schoolRecords) {
        throw new Error("생기부 데이터를 찾을 수 없습니다");
      }

      // 전과목 평균 등급 계산 (국어, 수학, 영어, 사회, 과학)
      const averageGrade = calculateAverageRanking(
        schoolRecords.subjects || [],
        Object.values(SUBJECT_CODES),
      );

      return parseFloat(averageGrade);
    },
    enabled: !!currentUser && !!schoolRecords,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};
