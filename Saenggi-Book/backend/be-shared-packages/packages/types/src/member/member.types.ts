/**
 * 회원 기본 타입 정의
 */

import { MemberRole, MemberType, AuthProvider } from './member-role.types';

/**
 * 회원 기본 정보 (읽기 전용)
 */
export interface MemberBase {
  id: number;
  email: string;
  nickname?: string;
  phone?: string;
  memberType: MemberType;
  memberRole: MemberRole;
  provider?: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 회원 생성 DTO
 */
export interface CreateMemberDto {
  email: string;
  password?: string;
  nickname?: string;
  phone?: string;
  memberType?: MemberType;
  provider?: AuthProvider;
  providerId?: string;
}

/**
 * 회원 업데이트 DTO
 */
export interface UpdateMemberDto {
  nickname?: string;
  phone?: string;
  memberType?: MemberType;
}

/**
 * 회원 조회 필터
 */
export interface MemberFilter {
  memberType?: MemberType;
  memberRole?: MemberRole;
  provider?: AuthProvider;
  searchTerm?: string;
}

/**
 * JWT 토큰 페이로드
 */
export interface JwtPayload {
  sub: 'ATK' | 'RTK';
  jti: string; // memberId
  iat: number;
  exp: number;
}

/**
 * 인증된 사용자 정보
 */
export interface AuthenticatedUser {
  memberId: number;
  email: string;
  memberRole: MemberRole;
}
