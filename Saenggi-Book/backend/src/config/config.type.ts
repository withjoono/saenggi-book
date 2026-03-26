import { DatabaseConfig } from 'src/database/config/database-config.type';
import { AppConfig } from './app-config.type';
import { AuthConfig } from 'src/auth/config/auth-config.type';
import { PayConfig } from 'src/modules/pay/config/pay-config.type';
import { SMSConfig } from 'src/modules/sms/config/sms-config.type';
import { GcsUploadConfig } from 'src/gcs-upload/config/gcs-upload-config.type';
import { OAuthConfigType } from 'src/auth/config/oauth-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  pay: PayConfig;
  sms: SMSConfig;
  gcsUpload: GcsUploadConfig;
  oauth: OAuthConfigType;
};
