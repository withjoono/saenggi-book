import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface LoginAttemptRecord {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil?: number;
}

/**
 * 로그인 시도 제한 및 계정 잠금 서비스
 * - 연속 실패 시 계정 임시 잠금
 * - 브루트포스 공격 방지
 * - IP 기반 + 계정 기반 이중 체크
 */
@Injectable()
export class LoginAttemptService {
  // 설정값
  private readonly MAX_ATTEMPTS = 5; // 최대 실패 허용 횟수
  private readonly LOCK_DURATION_MS = 15 * 60 * 1000; // 잠금 시간: 15분
  private readonly ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // 시도 윈도우: 10분
  private readonly IP_MAX_ATTEMPTS = 20; // IP당 최대 시도 횟수
  private readonly IP_LOCK_DURATION_MS = 30 * 60 * 1000; // IP 잠금: 30분

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * 로그인 시도 전 잠금 상태 확인
   */
  async isLocked(
    email: string,
    ip: string,
  ): Promise<{ locked: boolean; reason?: string; remainingTime?: number }> {
    // 1. 계정 잠금 확인
    const accountRecord = await this.getAttemptRecord(`login:account:${email}`);
    if (accountRecord?.lockedUntil && accountRecord.lockedUntil > Date.now()) {
      const remainingTime = Math.ceil((accountRecord.lockedUntil - Date.now()) / 1000 / 60);
      return {
        locked: true,
        reason: `너무 많은 로그인 시도로 계정이 일시 잠금되었습니다. ${remainingTime}분 후 다시 시도해주세요.`,
        remainingTime,
      };
    }

    // 2. IP 잠금 확인
    const ipRecord = await this.getAttemptRecord(`login:ip:${ip}`);
    if (ipRecord?.lockedUntil && ipRecord.lockedUntil > Date.now()) {
      const remainingTime = Math.ceil((ipRecord.lockedUntil - Date.now()) / 1000 / 60);
      return {
        locked: true,
        reason: `해당 IP에서 너무 많은 로그인 시도가 감지되었습니다. ${remainingTime}분 후 다시 시도해주세요.`,
        remainingTime,
      };
    }

    return { locked: false };
  }

  /**
   * 로그인 실패 기록
   */
  async recordFailedAttempt(
    email: string,
    ip: string,
  ): Promise<{
    accountAttempts: number;
    accountLocked: boolean;
    ipAttempts: number;
    ipLocked: boolean;
  }> {
    // 1. 계정 기반 실패 기록
    const accountResult = await this.incrementAttempt(
      `login:account:${email}`,
      this.MAX_ATTEMPTS,
      this.LOCK_DURATION_MS,
      this.ATTEMPT_WINDOW_MS,
    );

    // 2. IP 기반 실패 기록
    const ipResult = await this.incrementAttempt(
      `login:ip:${ip}`,
      this.IP_MAX_ATTEMPTS,
      this.IP_LOCK_DURATION_MS,
      this.ATTEMPT_WINDOW_MS,
    );

    return {
      accountAttempts: accountResult.attempts,
      accountLocked: accountResult.locked,
      ipAttempts: ipResult.attempts,
      ipLocked: ipResult.locked,
    };
  }

  /**
   * 로그인 성공 시 기록 초기화
   */
  async clearAttempts(email: string, _ip: string): Promise<void> {
    await this.cacheManager.del(`login:account:${email}`);
    // IP 기록은 성공해도 유지 (다른 계정 시도 방지)
  }

  /**
   * 남은 시도 횟수 조회
   */
  async getRemainingAttempts(email: string): Promise<number> {
    const record = await this.getAttemptRecord(`login:account:${email}`);
    if (!record) return this.MAX_ATTEMPTS;
    return Math.max(0, this.MAX_ATTEMPTS - record.attempts);
  }

  /**
   * 계정 잠금 해제 (관리자용)
   */
  async unlockAccount(email: string): Promise<void> {
    await this.cacheManager.del(`login:account:${email}`);
  }

  /**
   * IP 잠금 해제 (관리자용)
   */
  async unlockIp(ip: string): Promise<void> {
    await this.cacheManager.del(`login:ip:${ip}`);
  }

  // Private Methods

  private async getAttemptRecord(key: string): Promise<LoginAttemptRecord | null> {
    return await this.cacheManager.get<LoginAttemptRecord>(key);
  }

  private async incrementAttempt(
    key: string,
    maxAttempts: number,
    lockDuration: number,
    attemptWindow: number,
  ): Promise<{ attempts: number; locked: boolean }> {
    const now = Date.now();
    let record = await this.getAttemptRecord(key);

    if (!record || now - record.firstAttempt > attemptWindow) {
      // 새 기록 시작 또는 윈도우 초과시 리셋
      record = {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      };
    } else {
      // 기존 기록 업데이트
      record.attempts += 1;
      record.lastAttempt = now;

      // 최대 시도 초과시 잠금
      if (record.attempts >= maxAttempts) {
        record.lockedUntil = now + lockDuration;
      }
    }

    // TTL: 잠금 시간 + 윈도우 시간
    const ttl = Math.max(lockDuration, attemptWindow) + 60000; // +1분 여유
    await this.cacheManager.set(key, record, ttl);

    return {
      attempts: record.attempts,
      locked: record.lockedUntil ? record.lockedUntil > now : false,
    };
  }
}
