import * as bcrypt from 'bcrypt';

/**
 * Bcrypt 서비스
 *
 * Spring 백엔드와 호환되는 비밀번호 해싱 서비스
 * {bcrypt} 접두사를 사용하여 크로스 호환성 보장
 *
 * @example
 * const bcryptService = new BcryptService();
 *
 * // 비밀번호 해싱
 * const hashed = await bcryptService.hash('password123');
 *
 * // 비밀번호 검증
 * const isValid = await bcryptService.compare('password123', hashed);
 */
export class BcryptService {
  private readonly saltRounds: number;
  private readonly prefix: string;

  constructor(saltRounds: number = 10, prefix: string = '{bcrypt}') {
    this.saltRounds = saltRounds;
    this.prefix = prefix;
  }

  /**
   * 비밀번호 해싱
   *
   * @param password - 원본 비밀번호
   * @returns {bcrypt} 접두사가 포함된 해시된 비밀번호
   */
  async hash(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    return `${this.prefix}${hashedPassword}`;
  }

  /**
   * 비밀번호 검증
   *
   * @param password - 검증할 원본 비밀번호
   * @param hashedPassword - 저장된 해시 비밀번호 ({bcrypt} 접두사 포함 또는 미포함)
   * @returns 일치 여부
   */
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    // {bcrypt} 접두사 제거
    const hash = this.removePrefix(hashedPassword);
    return bcrypt.compare(password, hash);
  }

  /**
   * {bcrypt} 접두사 제거
   */
  private removePrefix(hashedPassword: string): string {
    if (hashedPassword.startsWith(this.prefix)) {
      return hashedPassword.substring(this.prefix.length);
    }
    return hashedPassword;
  }

  /**
   * 해시 포맷 검증
   */
  isValidHashFormat(hashedPassword: string): boolean {
    const hash = this.removePrefix(hashedPassword);
    // bcrypt 해시는 $2a$, $2b$, $2y$ 로 시작
    return /^\$2[aby]\$\d{2}\$.{53}$/.test(hash);
  }
}

/**
 * BcryptService 싱글톤 인스턴스
 */
let bcryptServiceInstance: BcryptService | null = null;

/**
 * BcryptService 싱글톤 가져오기
 */
export function getBcryptService(saltRounds?: number): BcryptService {
  if (!bcryptServiceInstance) {
    bcryptServiceInstance = new BcryptService(saltRounds);
  }
  return bcryptServiceInstance;
}

/**
 * 간편 해싱 함수
 */
export async function hashPassword(password: string): Promise<string> {
  return getBcryptService().hash(password);
}

/**
 * 간편 검증 함수
 */
export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return getBcryptService().compare(password, hashedPassword);
}
