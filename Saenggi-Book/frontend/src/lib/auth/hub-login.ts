/**
 * Hub 로그인 연동 유틸리티
 * 생기북에서 Hub(T Skool) 로그인 페이지로 리디렉트
 * 
 * 생기북은 자체 로그인 페이지를 사용하지 않고,
 * Hub의 중앙 인증 시스템을 통해 로그인합니다.
 */

import { env } from '@/lib/config/env';

// Hub Frontend URL
const HUB_URL = env.hubUrl;

// 생기북 Frontend URL
const FRONT_URL = env.frontUrl;

/**
 * Hub 로그인 URL 생성
 * 로그인 후 생기북으로 SSO 토큰과 함께 돌아옴
 * @param returnPath - 로그인 후 돌아올 경로 (기본: /)
 */
export function getHubLoginUrl(returnPath: string = '/'): string {
    const frontUrl = typeof window !== 'undefined' ? window.location.origin : FRONT_URL;
    const redirectUri = `${frontUrl}${returnPath}`;
    return `${HUB_URL}/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

/**
 * Hub 회원가입 URL 생성
 * @param returnPath - 회원가입 후 돌아올 경로 (기본: /)
 */
export function getHubRegisterUrl(returnPath: string = '/'): string {
    const frontUrl = typeof window !== 'undefined' ? window.location.origin : FRONT_URL;
    const redirectUri = `${frontUrl}${returnPath}`;
    return `${HUB_URL}/auth/register?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

/**
 * Hub 로그인 페이지로 리디렉트
 */
export function redirectToHubLogin(returnPath?: string): void {
    if (typeof window === 'undefined') return;
    window.location.href = getHubLoginUrl(returnPath);
}

/**
 * Hub 회원가입 페이지로 리디렉트
 */
export function redirectToHubRegister(returnPath?: string): void {
    if (typeof window === 'undefined') return;
    window.location.href = getHubRegisterUrl(returnPath);
}

/**
 * Hub 메인 페이지로 이동
 */
export function redirectToHub(): void {
    if (typeof window === 'undefined') return;
    window.location.href = HUB_URL;
}

/**
 * Hub URL 반환
 */
export function getHubUrl(): string {
    return HUB_URL;
}
