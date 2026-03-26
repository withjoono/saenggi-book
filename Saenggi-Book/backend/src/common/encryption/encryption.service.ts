import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * 민감정보 암호화 서비스
 * - 주민번호, 전화번호, 이메일 등 개인정보 암호화/복호화
 * - AES-256-GCM 알고리즘 사용 (인증 태그 포함)
 * - IV와 Auth Tag를 암호문에 포함하여 저장
 */
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly authTagLength = 16; // 128 bits
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    // 환경변수에서 암호화 키 로드
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');

    if (!encryptionKey) {
      console.warn(
        '⚠️ ENCRYPTION_KEY 환경변수가 설정되지 않았습니다. 민감정보 암호화가 비활성화됩니다.',
      );
      // 개발 환경용 기본 키 (프로덕션에서는 반드시 환경변수 설정 필요)
      this.key = crypto.scryptSync('dev-only-key', 'salt', this.keyLength);
    } else {
      // 키 파생 함수를 사용하여 안전한 키 생성
      this.key = crypto.scryptSync(encryptionKey, 'geobukschool-salt', this.keyLength);
    }
  }

  /**
   * 텍스트 암호화
   * @param plainText 암호화할 평문
   * @returns base64 인코딩된 암호문 (iv:authTag:cipherText)
   */
  encrypt(plainText: string): string {
    if (!plainText) return plainText;

    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(plainText, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // iv:authTag:encrypted 형식으로 저장 (base64 인코딩)
      const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);

      return combined.toString('base64');
    } catch (error) {
      console.error('암호화 실패:', error);
      throw new Error('데이터 암호화에 실패했습니다.');
    }
  }

  /**
   * 텍스트 복호화
   * @param encryptedText base64 인코딩된 암호문
   * @returns 복호화된 평문
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    try {
      const combined = Buffer.from(encryptedText, 'base64');

      // iv, authTag, encrypted 분리
      const iv = combined.subarray(0, this.ivLength);
      const authTag = combined.subarray(this.ivLength, this.ivLength + this.authTagLength);
      const encrypted = combined.subarray(this.ivLength + this.authTagLength);

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('복호화 실패:', error);
      throw new Error('데이터 복호화에 실패했습니다.');
    }
  }

  /**
   * 전화번호 암호화 (하이픈 유지)
   */
  encryptPhone(phone: string): string {
    return this.encrypt(phone);
  }

  /**
   * 전화번호 복호화
   */
  decryptPhone(encryptedPhone: string): string {
    return this.decrypt(encryptedPhone);
  }

  /**
   * 이메일 암호화
   */
  encryptEmail(email: string): string {
    return this.encrypt(email);
  }

  /**
   * 이메일 복호화
   */
  decryptEmail(encryptedEmail: string): string {
    return this.decrypt(encryptedEmail);
  }

  /**
   * 마스킹된 전화번호 반환 (복호화 후 마스킹)
   * 예: 010-****-5678
   */
  getMaskedPhone(encryptedPhone: string): string {
    try {
      const phone = this.decrypt(encryptedPhone);
      const parts = phone.split('-');
      if (parts.length === 3) {
        return `${parts[0]}-****-${parts[2]}`;
      }
      // 하이픈 없는 경우
      if (phone.length >= 8) {
        return phone.slice(0, 3) + '****' + phone.slice(-4);
      }
      return '***-****-****';
    } catch {
      return '***-****-****';
    }
  }

  /**
   * 마스킹된 이메일 반환 (복호화 후 마스킹)
   * 예: te***@example.com
   */
  getMaskedEmail(encryptedEmail: string): string {
    try {
      const email = this.decrypt(encryptedEmail);
      const [localPart, domain] = email.split('@');
      if (localPart && domain) {
        const maskedLocal = localPart.slice(0, 2) + '***';
        return `${maskedLocal}@${domain}`;
      }
      return '***@***.***';
    } catch {
      return '***@***.***';
    }
  }

  /**
   * 해시 생성 (검색용 - 복호화 불가)
   * 동일한 평문은 항상 동일한 해시값 생성
   */
  hash(plainText: string): string {
    if (!plainText) return plainText;
    return crypto.createHmac('sha256', this.key).update(plainText).digest('hex');
  }

  /**
   * 데이터가 암호화되어 있는지 확인
   */
  isEncrypted(text: string): boolean {
    if (!text) return false;
    try {
      // base64 디코딩 시도
      const decoded = Buffer.from(text, 'base64');
      // 최소 길이 확인 (iv + authTag + 최소 1바이트 데이터)
      return decoded.length > this.ivLength + this.authTagLength;
    } catch {
      return false;
    }
  }
}
