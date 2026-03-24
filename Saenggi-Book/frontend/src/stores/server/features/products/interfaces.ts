export interface IProduct {
  id: number;
  createDt: Date | null;
  explainComment: string | null;
  productImage: string | null;
  productNm: string;
  productPaymentType: string | null;
  productPrice: string;
  promotionDiscount: number;
  term: Date | null;
  updateDt: Date | null;
  refundPolicy: string | null;
  deleteFlag: number;
  productCateCode: string | null;
  productTypeCode: string | null;
  serviceRangeCode: string | null;
  availableCount: number | null;
  availableTerm: string | null;
}
