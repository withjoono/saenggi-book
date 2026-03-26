import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { validateConfig } from 'src/common/utils/validate-config';
import { PayConfig } from './pay-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  IMP_KEY: string;

  @IsString()
  IMP_SECRET: string;

  @IsString()
  IMP_STORE_CODE: string;
}

export default registerAs<PayConfig>('pay', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    impKey: process.env.IMP_KEY,
    impSecret: process.env.IMP_SECRET,
    impStoreCode: process.env.IMP_STORE_CODE,
  };
});
