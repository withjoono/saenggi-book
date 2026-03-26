import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import { SMSConfig } from './sms-config.type';
import { validateConfig } from 'src/common/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  NHN_ACCESS_KEY: string;

  @IsString()
  @IsOptional()
  NHN_SECRET_KEY: string;

  @IsString()
  @IsOptional()
  NHN_SERVICE_ID: string;

  @IsString()
  @IsOptional()
  SMS_SENDER_PHONE: string;

  @IsString()
  @IsOptional()
  SMS_TEST_MODE: string;
}

export default registerAs<SMSConfig>('sms', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nhnAccessKey: process.env.NHN_ACCESS_KEY,
    nhnSecretKey: process.env.NHN_SECRET_KEY,
    nhnServiceId: process.env.NHN_SERVICE_ID,
    senderPhone: process.env.SMS_SENDER_PHONE,
    testMode: process.env.SMS_TEST_MODE || 'N',
  };
});
