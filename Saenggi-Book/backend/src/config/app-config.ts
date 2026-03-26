import { registerAs } from '@nestjs/config';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { AppConfig } from './app-config.type';
import { validateConfig } from 'src/common/utils/validate-config';

enum Environment {
  Development = 'development',
  Production = 'production',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  SERVER_PORT: number;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT: number; // Google Cloud가 제공하는 포트
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'app',
    workingDirectory: process.env.PWD || process.cwd(),
    // 1순위: Google Cloud의 PORT, 2순위: .env의 SERVER_PORT, 3순위: 기본값 4007 (MS 백엔드)
    port: process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : process.env.SERVER_PORT
        ? parseInt(process.env.SERVER_PORT, 10)
        : 4007,
  };
});
