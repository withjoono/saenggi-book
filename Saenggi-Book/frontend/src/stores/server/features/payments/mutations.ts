import { createMutation } from "../../common-utils";
import {
  IContractFreeServiceBody,
  IPreRegisterPaymentBody,
  IPreRegisterPaymentResponse,
  IValidCouponBody,
  IValidCouponResponse,
  IVerifyPaymentBody,
} from "./interfaces";

/**
 * 결제 사전등록 API
 * (쿠폰번호와 상품id로 서버에서 결제 할 값을 계산 후 사전등록)
 */
export const usePreRegisterPayment = () => {
  return createMutation<IPreRegisterPaymentBody, IPreRegisterPaymentResponse>(
    "POST",
    "/payments/pre-register",
  );
};

/**
 * 무료 서비스 계약 API
 * 쿠폰을 통해 무료로 구매가 가능할 시 쿠폰번호와 상품id로 서버에서 검증 후 계약 체결
 */
export const useContractFreeService = () => {
  return createMutation<IContractFreeServiceBody, void>(
    "POST",
    "/payments/free",
  );
};

/**
 * 결제 검증 API
 * 결과에 따라 사전 등록된 결제 정보를 업데이트 후 구매한 서비스 적용
 */
export const useVerifyPayment = () => {
  return createMutation<IVerifyPaymentBody, void>("POST", "/payments/verify");
};

/**
 * 쿠폰 검증 API
 * 검증완료 시 실제 할인금액 및 쿠폰정보 반환
 */
export const useValidCoupon = () => {
  return createMutation<IValidCouponBody, IValidCouponResponse>(
    "POST",
    "/payments/coupon/valid",
  );
};
