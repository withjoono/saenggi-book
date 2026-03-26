import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// 스프링에서 bcrypt를 해시하면 {bcrypt} 라는 접두사를 붙이기 때문에
// 동일하게 작동하기 위한 헬퍼 서비스
@Injectable()
export class BcryptService {
  private readonly prefix = '{bcrypt}';

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return this.prefix + hash;
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // 접두사 제거
    if (hashedPassword.startsWith(this.prefix)) {
      hashedPassword = hashedPassword.slice(this.prefix.length);
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
