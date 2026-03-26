// @ts-nocheck

export class PayHistoryDto {
  id: PayOrderEntity['id'];
  cancel_amount: PayOrderEntity['cancel_amount'];
  paid_amount: PayOrderEntity['paid_amount'];
  card_name: PayOrderEntity['card_name'];
  create_dt: PayOrderEntity['update_dt'];
  order_state: PayOrderEntity['order_state'];

  pay_service: {
    product_nm: PayServiceEntity['product_nm'];
    term: PayServiceEntity['term'];
    product_price: PayServiceEntity['product_price'];
  };
}
