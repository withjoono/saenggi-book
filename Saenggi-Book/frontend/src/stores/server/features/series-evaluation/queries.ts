/**
 * 계열 적합성 평가 React Query hooks
 */

import { useQuery, useMutation, type UseQueryOptions } from '@tanstack/react-query';
import {
  getAllUniversities,
  getUniversityLevel,
  getHumanitiesCriteria,
  getScienceCriteria,
  calculateSeriesEvaluation,
} from './api';
import type {
  UniversityLevel,
  HumanitiesCriteria,
  ScienceCriteria,
  CalculateSeriesEvaluationRequest,
  CalculateSeriesEvaluationResponse,
} from '@/types/series-evaluation.type';

/**
 * 전체 대학 목록 조회
 */
export const useGetAllUniversities = (
  options?: Omit<UseQueryOptions<UniversityLevel[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<UniversityLevel[], Error>({
    queryKey: ['series-evaluation', 'universities'],
    queryFn: getAllUniversities,
    staleTime: 1000 * 60 * 60, // 1시간
    ...options,
  });
};

/**
 * 대학 레벨 조회
 */
export const useGetUniversityLevel = (
  universityName: string,
  options?: Omit<UseQueryOptions<UniversityLevel, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<UniversityLevel, Error>({
    queryKey: ['series-evaluation', 'university-level', universityName],
    queryFn: () => getUniversityLevel(universityName),
    enabled: !!universityName,
    staleTime: 1000 * 60 * 60, // 1시간
    ...options,
  });
};

/**
 * 문과 계열 평가 기준 조회
 */
export const useGetHumanitiesCriteria = (
  level: number,
  options?: Omit<UseQueryOptions<HumanitiesCriteria, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<HumanitiesCriteria, Error>({
    queryKey: ['series-evaluation', 'criteria', 'humanities', level],
    queryFn: () => getHumanitiesCriteria(level),
    enabled: level > 0,
    staleTime: 1000 * 60 * 60, // 1시간
    ...options,
  });
};

/**
 * 이과 계열 평가 기준 조회
 */
export const useGetScienceCriteria = (
  level: number,
  options?: Omit<UseQueryOptions<ScienceCriteria, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ScienceCriteria, Error>({
    queryKey: ['series-evaluation', 'criteria', 'science', level],
    queryFn: () => getScienceCriteria(level),
    enabled: level > 0,
    staleTime: 1000 * 60 * 60, // 1시간
    ...options,
  });
};

/**
 * 계열 적합성 계산
 */
export const useCalculateSeriesEvaluation = () => {
  return useMutation<
    CalculateSeriesEvaluationResponse,
    Error,
    CalculateSeriesEvaluationRequest
  >({
    mutationFn: calculateSeriesEvaluation,
  });
};
