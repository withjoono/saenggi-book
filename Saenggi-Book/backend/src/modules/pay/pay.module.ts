import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './pay.controller';
import { PaymentService } from './pay.service';
import { CouponService } from './services/coupon.service';
import { ContractService } from './services/contract.service';
import { IamPortService } from './services/iamport.service';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => MembersModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, CouponService, ContractService, IamPortService],
  exports: [PaymentService],
})
export class PaymentModule {}
