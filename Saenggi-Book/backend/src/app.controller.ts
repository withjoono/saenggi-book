import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { Roles } from './auth/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ping')
  @Public()
  ping(): string {
    return this.appService.ping();
  }

  @Get('/ping-login')
  loginPing(): string {
    return this.appService.ping();
  }

  @Get('/ping-admin')
  @Roles(['ROLE_ADMIN'])
  adminPing(): string {
    return this.appService.ping();
  }

  @Get('/reset-cache')
  @Roles(['ROLE_ADMIN'])
  resetCache(): Promise<string> {
    return this.appService.resetCache();
  }
}











