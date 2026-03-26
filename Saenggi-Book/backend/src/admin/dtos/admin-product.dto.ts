import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// 공통 검색 DTO
export class AdminSearchDto {
  @ApiPropertyOptional({ description: '검색 조건1' })
  @IsOptional()
  @IsString()
  searchKey1?: string;

  @ApiPropertyOptional({ description: '검색어' })
  @IsOptional()
  @IsString()
  searchWord?: string;

  @ApiPropertyOptional({ description: '상품 카테고리 코드 (J=정시, S=수시, C=컨설팅, T=티켓)' })
  @IsOptional()
  @IsString()
  productCateCode?: string;

  @ApiPropertyOptional({ description: '페이지 시작점 (offset)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({ description: '페이지 크기', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}

// 상품 DTO (서비스에 연결할 상품 정보)
export class ProductDto {
  @ApiPropertyOptional({ description: '상품 ID' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: '상품 ID (프론트엔드 호환)' })
  @IsOptional()
  @IsNumber()
  payProductId?: number;

  @ApiPropertyOptional({ description: '상품 코드' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({ description: '상품 타입' })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiPropertyOptional({ description: '상품명' })
  @IsOptional()
  @IsString()
  productName?: string;
}

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductDto] })
  list: ProductDto[];

  @ApiProperty({ description: '전체 개수' })
  totalCount: number;
}

// 서비스 DTO
export class ServiceDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ description: '서비스명' })
  productNm: string;

  @ApiProperty({ description: '가격' })
  productPrice: string;

  @ApiPropertyOptional({ description: '계약 기간' })
  term?: Date;

  @ApiPropertyOptional()
  createDt?: Date;

  @ApiPropertyOptional()
  updateDt?: Date;

  @ApiProperty({ description: '결제 방식' })
  productPaymentType: string;

  @ApiProperty({ description: '프로모션 할인율' })
  promotionDiscount: number;

  @ApiPropertyOptional({ description: '이미지 URL' })
  productImage?: string;

  @ApiProperty({ description: '삭제 여부' })
  deleteFlag: number;

  @ApiPropertyOptional({ description: '설명' })
  explainComment?: string;

  @ApiPropertyOptional({ description: '환불 정책' })
  refundPolicy?: string;

  @ApiPropertyOptional({ description: '상품 카테고리 코드' })
  productCateCode?: string;

  @ApiPropertyOptional({ description: '상품 타입 코드' })
  productTypeCode?: string;

  @ApiPropertyOptional({ description: '서비스 범위 코드' })
  serviceRangeCode?: string;

  @ApiPropertyOptional({ description: '사용 가능 횟수' })
  availableCount?: number;
}

export class CreateServiceDto {
  @ApiPropertyOptional({ description: '서비스 ID (수정 시)' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: '서비스명' })
  @IsString()
  productNm: string;

  @ApiProperty({ description: '가격' })
  @IsString()
  productPrice: string;

  @ApiPropertyOptional({ description: '계약 기간' })
  @IsOptional()
  term?: Date | null;

  @ApiPropertyOptional({ description: '삭제 플래그' })
  @IsOptional()
  @IsNumber()
  deleteFlag?: number;

  @ApiPropertyOptional({ description: '생성일' })
  @IsOptional()
  createDt?: Date | string | null;

  @ApiPropertyOptional({ description: '수정일' })
  @IsOptional()
  updateDt?: Date | string | null;

  @ApiPropertyOptional({ description: '결제 방식' })
  @IsOptional()
  @IsString()
  productPaymentType?: string;

  @ApiPropertyOptional({ description: '프로모션 할인율' })
  @IsOptional()
  @IsNumber()
  promotionDiscount?: number;

  @ApiPropertyOptional({ description: '이미지 URL' })
  @IsOptional()
  @IsString()
  productImage?: string;

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional()
  @IsString()
  explainComment?: string;

  @ApiPropertyOptional({ description: '환불 정책' })
  @IsOptional()
  @IsString()
  refundPolicy?: string;

  @ApiPropertyOptional({ description: '상품 카테고리 코드 (J, S, C, T)' })
  @IsOptional()
  @IsString()
  productCateCode?: string;

  @ApiPropertyOptional({ description: '상품 타입 코드 (FIXEDTERM, TICKET, PACKAGE)' })
  @IsOptional()
  @IsString()
  productTypeCode?: string;

  @ApiPropertyOptional({ description: '서비스 범위 코드 (S, J, T)' })
  @IsOptional()
  @IsString()
  serviceRangeCode?: string;

  @ApiPropertyOptional({ description: '사용 가능 횟수' })
  @IsOptional()
  @IsNumber()
  availableCount?: number;

  @ApiPropertyOptional({
    description: '포함할 상품 목록',
    type: [ProductDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  productListInfo?: ProductDto[];
}

export class ServiceListResponseDto {
  @ApiProperty({ type: [ServiceDto] })
  list: ServiceDto[];

  @ApiProperty()
  totalCount: number;
}

export class ServiceDetailResponseDto {
  @ApiProperty({ type: ServiceDto })
  serviceInfo: ServiceDto;

  @ApiProperty({ type: [ProductDto] })
  productionInfo: ProductDto[];
}
