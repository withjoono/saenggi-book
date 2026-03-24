/**
 * 계열 적합성 평가 API 클라이언트
 *
 * Note: NestJS 백엔드는 camelCase를 기대하므로 authClient 사용
 * (authClient는 케이스 변환을 하지 않음)
 */

import { authClient } from '@/lib/api';
import type {
  UniversityLevel,
  HumanitiesCriteria,
  ScienceCriteria,
  CalculateSeriesEvaluationRequest,
  CalculateSeriesEvaluationResponse,
} from '@/types/series-evaluation.type';

const BASE_URL = '/series-evaluation';

/**
 * 전체 대학 목록 조회
 */
export const getAllUniversities = async (): Promise<UniversityLevel[]> => {
  const response = await authClient.get<{ success: boolean; data: UniversityLevel[] }>(
    `${BASE_URL}/universities`
  );
  return response.data.data;
};

/**
 * 대학 레벨 조회
 */
export const getUniversityLevel = async (
  universityName: string
): Promise<UniversityLevel> => {
  const response = await authClient.get<{ success: boolean; data: UniversityLevel }>(
    `${BASE_URL}/university-level/${encodeURIComponent(universityName)}`
  );
  return response.data.data;
};

/**
 * 문과 계열 평가 기준 조회
 */
export const getHumanitiesCriteria = async (
  level: number
): Promise<HumanitiesCriteria> => {
  const response = await authClient.get<{ success: boolean; data: HumanitiesCriteria }>(
    `${BASE_URL}/criteria/humanities/${level}`
  );
  return response.data.data;
};

/**
 * 이과 계열 평가 기준 조회
 */
export const getScienceCriteria = async (level: number): Promise<ScienceCriteria> => {
  const response = await authClient.get<{ success: boolean; data: ScienceCriteria }>(
    `${BASE_URL}/criteria/science/${level}`
  );
  return response.data.data;
};

/**
 * 계열 적합성 계산
 */
export const calculateSeriesEvaluation = async (
  request: CalculateSeriesEvaluationRequest
): Promise<CalculateSeriesEvaluationResponse> => {
  const response = await authClient.post<{
    success: boolean;
    data: CalculateSeriesEvaluationResponse;
  }>(`${BASE_URL}/calculate`, request);
  return response.data.data;
};
