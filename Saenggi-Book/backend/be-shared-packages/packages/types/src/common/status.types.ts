/**
 * 공통 상태 타입 정의
 */

/**
 * 활성화 상태
 */
export type ActiveStatus = 'Y' | 'N';

/**
 * 일반적인 상태
 */
export enum CommonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted',
}

/**
 * 결제 상태
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

/**
 * 계약 상태
 */
export enum ContractStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

/**
 * 서비스 타입
 */
export enum ServiceType {
  SUSI_SUBJECT = 'susi_subject', // 수시 교과
  SUSI_COMPREHENSIVE = 'susi_comprehensive', // 수시 종합
  ESSAY = 'essay', // 논술
  MOCK_EXAM = 'mock_exam', // 모의고사
  JUNGSI = 'jungsi', // 정시
  PLANNER = 'planner', // 플래너
}

/**
 * 상태 변환 유틸리티
 */
export function isActive(status: ActiveStatus): boolean {
  return status === 'Y';
}

export function toActiveStatus(value: boolean): ActiveStatus {
  return value ? 'Y' : 'N';
}

/**
 * 상태 텍스트 변환
 */
export const STATUS_LABELS: Record<CommonStatus, string> = {
  [CommonStatus.ACTIVE]: '활성',
  [CommonStatus.INACTIVE]: '비활성',
  [CommonStatus.PENDING]: '대기',
  [CommonStatus.DELETED]: '삭제됨',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: '결제 대기',
  [PaymentStatus.PAID]: '결제 완료',
  [PaymentStatus.CANCELLED]: '결제 취소',
  [PaymentStatus.REFUNDED]: '환불 완료',
  [PaymentStatus.FAILED]: '결제 실패',
};
