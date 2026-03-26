import { SetMetadata } from '@nestjs/common';

/**
 * 앱 전용 API 인증이 필요한 엔드포인트에 사용
 *
 * @example
 * @RequireAppAuth()
 * @Get('app-only-data')
 * getAppOnlyData() { ... }
 */
export const RequireAppAuth = () => SetMetadata('requireAppAuth', true);
