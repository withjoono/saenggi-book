/**
 * 플래너 주간 루틴 타입 정의
 */

/**
 * 루틴 카테고리
 */
export enum RoutineCategory {
    FIXED = 'fixed',       // 고정 일과 (수업, 식사, 수면 등)
    STUDY = 'study',       // 학습 시간 (과목별)
    REST = 'rest',         // 휴식
    OTHER = 'other',       // 기타
}

/**
 * 주간 루틴 기본 타입
 */
export interface PlannerRoutineBase {
    id: number;
    memberId: number;

    title: string;
    category: RoutineCategory;
    subject?: string;

    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"

    repeat: boolean;
    days: boolean[]; // [일, 월, 화, 수, 목, 금, 토]

    color?: string;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * 루틴 생성 DTO
 */
export interface CreatePlannerRoutineDto {
    title: string;
    category?: RoutineCategory;
    subject?: string;
    startTime: string;
    endTime: string;
    repeat?: boolean;
    days?: boolean[];
    color?: string;
}

/**
 * 루틴 업데이트 DTO
 */
export interface UpdatePlannerRoutineDto extends Partial<CreatePlannerRoutineDto> {
    isActive?: boolean;
}

/**
 * 루틴 조회 필터
 */
export interface PlannerRoutineFilter {
    memberId?: number;
    category?: RoutineCategory;
    isActive?: boolean;
    dayOfWeek?: number; // 0-6 (일-토)
}

/**
 * 루틴 시간 계산 유틸
 */
export function calculateRoutineDuration(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
}
