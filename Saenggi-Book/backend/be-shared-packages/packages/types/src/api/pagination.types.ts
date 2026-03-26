/**
 * 페이지네이션 타입 정의
 */

/**
 * 페이지네이션 요청 파라미터
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 페이지네이션 메타 정보
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * 기본 페이지네이션 설정
 */
export const DEFAULT_PAGINATION: Required<PaginationParams> = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};
