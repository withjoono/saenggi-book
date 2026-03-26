import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AdminPaymentService } from '../services/admin-pay.service';
import { AdminPayOrderResponseDto, AdminPayOrderSearchQueryDto } from '../dtos/admin-pay-order.dto';

@Controller('admin/payments')
@Roles(['ROLE_ADMIN'])
@ApiTags('[관리자] 결제 관련 API')
export class AdminPaymentController {
  constructor(private readonly adminPaymentService: AdminPaymentService) {}

  @Get('orders')
  @ApiOperation({ summary: '[관리자] 모든 주문 목록 조회' })
  async getAllOrders(
    @Query() payOrderSearchQueryDto: AdminPayOrderSearchQueryDto,
  ): Promise<AdminPayOrderResponseDto> {
    return this.adminPaymentService.getAllOrders(payOrderSearchQueryDto);
  }
}
