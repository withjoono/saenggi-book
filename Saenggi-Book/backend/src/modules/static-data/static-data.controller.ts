import { Controller, Get, Post } from '@nestjs/common';
import { StaticDataService } from './static-data.service';
import { StaticDataDto } from './static-data.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('static-data')
export class StaticDataController {
  constructor(private readonly staticDataService: StaticDataService) { }

  @Get()
  @Public()
  getStaticData(): Promise<StaticDataDto> {
    return this.staticDataService.getStaticData();
  }

  @Get('test-status')
  @Public()
  testStatus() {
    return { status: 'alive' };
  }

  @Post('refresh')
  @Public()
  async refreshStaticData(): Promise<{ message: string }> {
    await this.staticDataService.refreshStaticData();
    return { message: 'Static data cache refreshed successfully' };
  }
}
