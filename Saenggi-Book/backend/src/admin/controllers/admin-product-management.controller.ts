import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminProductManagementService } from '../services/admin-product-management.service';
import {
  AdminSearchDto,
  CreateServiceDto,
  ProductListResponseDto,
  ServiceListResponseDto,
  ServiceDetailResponseDto,
} from '../dtos/admin-product.dto';
import {
  CreateCouponDto,
  UpdateCouponDto,
  DeleteCouponsDto,
  CouponListResponseDto,
} from '../dtos/admin-coupon.dto';

@ApiTags('Admin - 상품/서비스/쿠폰 관리')
@ApiBearerAuth()
@Controller('admin')
export class AdminProductManagementController {
  constructor(private readonly productManagementService: AdminProductManagementService) {}

  // ==================== 상품 API ====================

  @Get('products/codes')
  @ApiOperation({ summary: '상품 코드 전체 조회' })
  @ApiResponse({ status: 200, description: '상품 코드 목록 반환' })
  async getProductCodes() {
    const data = await this.productManagementService.findAllProductCodes();
    return { data };
  }

  @Get('products')
  @ApiOperation({ summary: '상품 목록 조회 (페이징/검색)' })
  @ApiResponse({ status: 200, type: ProductListResponseDto })
  async getProducts(@Query() searchDto: AdminSearchDto) {
    return this.productManagementService.findProducts(searchDto);
  }

  // ==================== 서비스 API ====================

  @Get('services')
  @ApiOperation({ summary: '서비스 목록 조회 (페이징/검색)' })
  @ApiResponse({ status: 200, type: ServiceListResponseDto })
  async getServices(@Query() searchDto: AdminSearchDto) {
    return this.productManagementService.findServices(searchDto);
  }

  @Get('services/:id')
  @ApiOperation({ summary: '서비스 단건 조회 (상품 목록 포함)' })
  @ApiResponse({ status: 200, type: ServiceDetailResponseDto })
  async getServiceById(@Param('id', ParseIntPipe) id: number) {
    return this.productManagementService.findServiceById(id);
  }

  @Post('services')
  @ApiOperation({ summary: '서비스 등록' })
  @ApiResponse({ status: 201, description: '서비스 등록 성공' })
  async createService(@Body() dto: CreateServiceDto) {
    await this.productManagementService.saveService(dto);
    return { status: true, message: '서비스 등록 성공' };
  }

  @Put('services/:id')
  @ApiOperation({ summary: '서비스 수정' })
  @ApiResponse({ status: 200, description: '서비스 수정 성공' })
  async updateService(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateServiceDto) {
    dto.id = id;
    await this.productManagementService.saveService(dto);
    return { status: true, message: '서비스 수정 성공' };
  }

  @Delete('services/:id')
  @ApiOperation({ summary: '서비스 삭제 (soft delete)' })
  @ApiResponse({ status: 200, description: '서비스 삭제 성공' })
  async deleteService(@Param('id', ParseIntPipe) id: number) {
    await this.productManagementService.deleteService(id);
    return { status: true, message: '서비스 삭제 성공' };
  }

  // ==================== 쿠폰 API ====================

  @Get('coupons')
  @ApiOperation({ summary: '쿠폰 목록 조회 (서비스 정보 포함)' })
  @ApiResponse({ status: 200, type: CouponListResponseDto })
  async getCoupons(@Query() searchDto: AdminSearchDto) {
    return this.productManagementService.findCoupons(searchDto);
  }

  @Post('coupons')
  @ApiOperation({ summary: '쿠폰 등록 (25자리 쿠폰번호 자동 생성)' })
  @ApiResponse({ status: 201, description: '쿠폰 등록 성공' })
  async createCoupon(@Body() dto: CreateCouponDto) {
    try {
      await this.productManagementService.createCoupon(dto);
      return { status: true, message: '쿠폰 정보 등록 성공' };
    } catch (error) {
      return { status: false, message: error.message };
    }
  }

  @Put('coupons/:id')
  @ApiOperation({ summary: '쿠폰 수정 (쿠폰번호는 수정 불가)' })
  @ApiResponse({ status: 200, description: '쿠폰 수정 성공' })
  async updateCoupon(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    try {
      await this.productManagementService.updateCoupon(id, dto);
      return { status: true, message: '쿠폰 정보 수정 성공' };
    } catch (error) {
      return { status: false, message: error.message };
    }
  }

  @Delete('coupons')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '쿠폰 다중 삭제 (Hard delete)' })
  @ApiResponse({ status: 200, description: '쿠폰 삭제 성공' })
  async deleteCoupons(@Body() dto: DeleteCouponsDto) {
    try {
      await this.productManagementService.deleteCoupons(dto.ids);
      return { status: true, message: '쿠폰 정보 삭제 성공' };
    } catch (error) {
      return { status: false, message: error.message };
    }
  }
}
