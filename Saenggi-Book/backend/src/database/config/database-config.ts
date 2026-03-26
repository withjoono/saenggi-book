import { registerAs } from '@nestjs/config';
import { IsOptional, IsInt, Min, Max, IsString, IsBoolean } from 'class-validator';
import { validateConfig } from '../../common/utils/validate-config';
import { DatabaseConfig } from './database-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  DB_TYPE: string;

  @IsString()
  @IsOptional()
  DB_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  DB_PORT: number;

  @IsString()
  @IsOptional()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  @IsOptional()
  DB_USER: string;

  @IsBoolean()
  @IsOptional()
  DB_SYNCHRONIZE: boolean;
}

export default registerAs<DatabaseConfig>('database', () => {
  // DATABASE_URL이 존재하면 (운영 환경), 개별 DB 변수 검증을 건너뜁니다.
  if (!process.env.DATABASE_URL) {
    validateConfig(process.env, EnvironmentVariablesValidator);
  }

  // 실수로 동기화를 킬 경우를 대비해 config를 구성할 때 사전 차단
  // 로컬 개발 환경(development)이나 SQLite 사용 시에는 동기화 허용
  if (
    process.env.DB_SYNCHRONIZE === 'true' &&
    process.env.NODE_ENV !== 'development' &&
    process.env.DB_TYPE !== 'better-sqlite3'
  ) {
    throw new Error(
      'DB 동기화 설정이 켜져있습니다. DB의 데이터가 날아갈 수 있음으로 서버를 실행시킬 수 없습니다.',
    );
  }

  return {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    username: process.env.DB_USER,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    schema: process.env.DB_SCHEMA || 'public',
  };
});
