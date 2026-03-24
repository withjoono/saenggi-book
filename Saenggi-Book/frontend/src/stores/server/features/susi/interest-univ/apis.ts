import { makeApiCall } from "@/stores/server/common-utils";
import {
  IInterestRecruitment,
  IInterestSusiComprehensive,
  IInterestSusiSubject,
} from "./interfaces";

/**
 * [관심대학] 교과 전형 조회
 */
const fetchInterestSusiSubjectAPI = async (memberId: string) => {
  const res = await makeApiCall<void, IInterestSusiSubject[]>(
    "GET",
    `/members/${memberId}/interests/susi-subject`,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * [관심대학] 학종 전형 조회
 */
const fetchInterestSusiComprehensiveAPI = async (memberId: string) => {
  const res = await makeApiCall<void, IInterestSusiComprehensive[]>(
    "GET",
    `/members/${memberId}/interests/susi-comprehensive`,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * [관심대학] 학종 전형 조회
 */
const fetchInterestRecruitmentAPI = async (
  memberId: string,
  admissionType:
    | "susi_subject_tb"
    | "susi_comprehensive_tb"
    | "early_subject"
    | "early_comprehensive",
) => {
  const res = await makeApiCall<void, IInterestRecruitment[]>(
    "GET",
    `/members/${memberId}/interests`,
    undefined,
    {
      params: {
        admissionType: admissionType,
      },
    },
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

export const INTEREST_UNIV_API = {
  fetchInterestSusiSubjectAPI,
  fetchInterestSusiComprehensiveAPI,
  fetchInterestRecruitmentAPI,
};
