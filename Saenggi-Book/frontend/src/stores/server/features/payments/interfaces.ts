/**
 * [iamport] 상점 코드 조회 API 응답
 */
export interface IGetStoreCodeResponse {
  storeCode: string;
}
/**
 * 결제 사전 등록 API 요청
 */
export interface IPreRegisterPaymentBody {
  productId: number;
  couponNumber?: string;
}

/**
 * 결제 사전 등록 API 응답
 */
export interface IPreRegisterPaymentResponse {
  merchantUid: string;
}

/**
 *  무료 결제 API 요청
 */
export interface IContractFreeServiceBody {
  productId: number;
  couponNumber: string;
}

/**
 *  무료 결제 API 응답
 */
export interface IVerifyPaymentBody {
  impUid: string;
  merchantUid: string;
  couponNumber?: string;
}

/**
 * 쿠폰 유효성 확인 API 요청
 */
export interface IValidCouponBody {
  couponNumber: string;
  productId: number;
}

/**
 * 쿠폰 유효성 확인 API 응답
 */
export interface IValidCouponResponse {
  discountPrice: number;
  couponInfo: string;
}

/**
 * 결제 내역
 */
export interface IPaymentHistory {
  id: number;
  cancel_amount: number | null;
  paid_amount: number | null;
  card_name: string | null;
  card_number: string | null;
  create_dt: Date | null;
  update_dt: Date | null;
  order_state: string;
  pay_service: {
    product_nm: string;
    term: Date | null;
    product_price: string;
  };
}
