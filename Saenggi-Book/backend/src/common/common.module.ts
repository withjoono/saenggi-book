import { Module } from '@nestjs/common';
import { JwtModule } from './jwt/jwt.module';
import { BcryptModule } from './bcrypt/bcrypt.module';

@Module({
  imports: [
    JwtModule, // 스프링과 JWT 토큰의 encode, decode 동작을 동일하게 만든 모듈
    BcryptModule, // 스프링과 bcyrpt 동작을 동일하게 만든 모듈(접두사{bcrypt} 추가)
  ],
  exports: [JwtModule, BcryptModule],
})
export class CommonModule {}
