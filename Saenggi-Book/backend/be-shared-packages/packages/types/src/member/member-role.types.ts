/**
 * 회원 역할 및 타입 정의
 */

/**
 * 회원 역할 (권한)
 */
export enum MemberRole {
  USER = 'ROLE_USER',
  ADMIN = 'ROLE_ADMIN',
  SUPER_ADMIN = 'ROLE_SUPER_ADMIN',
  MENTOR = 'ROLE_MENTOR',
  TEACHER = 'ROLE_TEACHER',
}

/**
 * 회원 타입 (분류)
 */
export enum MemberType {
  STUDENT = 'student',
  TEACHER = 'teacher',
  PARENT = 'parent',
  GRADUATE = 'graduate',
  OTHER = 'other',
}

/**
 * 인증 제공자
 */
export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  NAVER = 'naver',
  KAKAO = 'kakao',
  APPLE = 'apple',
}

/**
 * 역할 계층 구조 (높은 숫자 = 높은 권한)
 */
export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  [MemberRole.USER]: 1,
  [MemberRole.MENTOR]: 2,
  [MemberRole.TEACHER]: 3,
  [MemberRole.ADMIN]: 4,
  [MemberRole.SUPER_ADMIN]: 5,
};

/**
 * 역할 권한 체크 헬퍼
 */
export function hasRole(userRole: MemberRole, requiredRole: MemberRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * 관리자 역할 체크
 */
export function isAdmin(role: MemberRole): boolean {
  return role === MemberRole.ADMIN || role === MemberRole.SUPER_ADMIN;
}
