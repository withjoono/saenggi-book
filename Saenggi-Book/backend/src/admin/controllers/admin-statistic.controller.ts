import { Controller, Get } from '@nestjs/common';
import { AdminStatisticService } from '../services/admin-statistic.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('admin/statistic')
@Roles(['ROLE_ADMIN'])
@ApiTags('[관리자] 통계 API')
export class AdminStatisticController {
  constructor(private readonly adminStatisticService: AdminStatisticService) {}

  @Get('recent-signups')
  @ApiOperation({ summary: '[관리자] 가입자 통계 조회' })
  async getRecentSignUps() {
    return this.adminStatisticService.getRecentSignUps();
  }

  @Get('recent-payments')
  @ApiOperation({
    summary: '[관리자] 최근 결제자 20명 조회(1원 이상)',
  })
  async getRecentPayments(): Promise<
    Array<{ name: string; email: string; amount: number; date: string }>
  > {
    return this.adminStatisticService.getRecentPayments();
  }

  @Get('daily-sales')
  @ApiOperation({
    summary: '[관리자] 일일 판매량 조회',
  })
  async getDailySales() {
    return this.adminStatisticService.getDailySales();
  }

  @Get('active-contract')
  @ApiOperation({
    summary: '[관리자] 활성화 된 계약 조회 (활성화 유저)',
  })
  async activeContractCount() {
    return this.adminStatisticService.getActiveContractCount();
  }
}
