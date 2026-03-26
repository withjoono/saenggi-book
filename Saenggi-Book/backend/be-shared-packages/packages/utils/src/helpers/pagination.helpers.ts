/**
 * 페이지네이션 헬퍼 함수
 */

import { PaginationParams, PaginationMeta, PaginatedResponse } from '@geobuk/shared-types';

/**
 * 기본 페이지네이션 설정
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * 페이지네이션 파라미터 정규화
 */
export function normalizePaginationParams(params: PaginationParams): Required<PaginationParams> {
  return {
    page: Math.max(1, params.page || DEFAULT_PAGE),
    limit: Math.min(MAX_LIMIT, Math.max(1, params.limit || DEFAULT_LIMIT)),
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'DESC',
  };
}

/**
 * offset 계산
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * 페이지네이션 메타 정보 생성
 */
export function createPaginationMeta(
  totalCount: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * 페이지네이션 응답 생성
 */
export function createPaginatedResponse<T>(
  items: T[],
  totalCount: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  const normalized = normalizePaginationParams(params);
  const meta = createPaginationMeta(totalCount, normalized.page, normalized.limit);

  return {
    items,
    meta,
  };
}

/**
 * TypeORM 쿼리빌더용 페이지네이션 옵션 생성
 */
export function getTypeOrmPaginationOptions(params: PaginationParams): {
  skip: number;
  take: number;
  order: Record<string, 'ASC' | 'DESC'>;
} {
  const normalized = normalizePaginationParams(params);

  return {
    skip: calculateOffset(normalized.page, normalized.limit),
    take: normalized.limit,
    order: {
      [normalized.sortBy]: normalized.sortOrder,
    },
  };
}

/**
 * 페이지 번호 배열 생성 (페이지네이션 UI용)
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5,
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxVisible + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
