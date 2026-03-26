/**
 * 플래너 클래스 (멘토링) 타입 정의
 */

/**
 * 클래스 기본 타입
 */
export interface PlannerClassBase {
  id: number;
  plannerId: number; // 멘토 ID (member_tb.id)

  classCode: string;
  className?: string;
  startDate: string; // YYYYMMDD
  endDate?: string;
  useYn: 'Y' | 'N';

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 클래스 생성 DTO
 */
export interface CreatePlannerClassDto {
  classCode: string;
  className?: string;
  startDate: string;
  endDate?: string;
}

/**
 * 클래스 업데이트 DTO
 */
export interface UpdatePlannerClassDto {
  className?: string;
  endDate?: string;
  useYn?: 'Y' | 'N';
}

/**
 * 학생 관리 (멘토-학생 연결)
 */
export interface PlannerManagementBase {
  id: number;
  classId: number;
  studentId: number;
  createdAt?: Date;
}

/**
 * 학생 추가 DTO
 */
export interface AddStudentToClassDto {
  classId: number;
  studentId: number;
}

/**
 * 클래스 조회 필터
 */
export interface PlannerClassFilter {
  plannerId?: number;
  useYn?: 'Y' | 'N';
  startDateFrom?: string;
  startDateTo?: string;
}

/**
 * 클래스 코드 생성 (6자리 랜덤)
 */
export function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
