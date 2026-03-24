import { makeApiCall } from "../../common-utils";
import { IStaticData } from "./interfaces";

/**
 * 정적 데이터 조회
 */
const fetchStaticDataAPI = async () => {
  const res = await makeApiCall<void, IStaticData>("GET", "/static-data");
  if (res.success) {
    return res.data;
  }
  return {
    subjectCodes: [],
    generalFields: [],
    majorFields: [],
    midFields: [],
    minorFields: [],
    admissionSubtypes: [],
    admissionSubtypeCategories: [],
    universityNames: [],
    admissionNames: [],
    recruitmentUnitNames: [],
  };
};

export const STATIC_DATA_APIS = {
  fetchStaticDataAPI,
};
