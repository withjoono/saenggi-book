import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ClassConstructor } from 'class-transformer/types/interfaces';

export const validateConfig = <T extends object>(
  config: Record<string, unknown>,
  envVariablesClass: ClassConstructor<T>,
) => {
  const validatedConfig = plainToClass(envVariablesClass, config, {
    enableImplicitConversion: true, // 타입 자동 변환 허용
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false, // 프로퍼티가 비어있으면 에러로 잡음
  });

  // 누락된 env 설정 디버깅
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};
