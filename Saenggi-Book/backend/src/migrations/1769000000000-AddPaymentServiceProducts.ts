// @ts-nocheck

export class AddPaymentServiceProducts1769000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 2027 수시 예측 분석 서비스 추가
    await queryRunner.query(`
      INSERT INTO payment_service (
        product_nm,
        product_price,
        term,
        explain_comment,
        product_cate_code,
        product_type_code,
        service_range_code,
        delete_flag,
        create_dt,
        update_dt,
        refund_policy,
        promotion_discount
      ) VALUES (
        '2027 수시 예측 분석 서비스',
        '59000',
        '2026-11-30 23:59:59',
        '교과, 종합, 논술 전형 예측 분석\n모의지원 시뮬레이션\nAI 생기부 평가/컨설팅 1회',
        'S',
        'FIXEDTERM',
        'S',
        0,
        NOW(),
        NOW(),
        '서비스 구매 후 7일 이내 전액 환불 가능합니다. 단, 서비스를 1회 이상 이용한 경우 환불이 제한될 수 있습니다.',
        50
      )
      ON CONFLICT (product_nm) DO NOTHING;
    `);

    // 추가 AI 생기부 평가/컨설팅 추가
    await queryRunner.query(`
      INSERT INTO payment_service (
        product_nm,
        product_price,
        term,
        explain_comment,
        product_cate_code,
        product_type_code,
        service_range_code,
        delete_flag,
        create_dt,
        update_dt,
        available_count,
        refund_policy,
        promotion_discount
      ) VALUES (
        '추가 AI 생기부 평가/컨설팅',
        '20000',
        '2026-11-30 23:59:59',
        '추가 AI 생기부 평가/컨설팅 1회',
        'T',
        'TICKET',
        'S',
        0,
        NOW(),
        NOW(),
        1,
        '서비스 이용 전 전액 환불 가능합니다. 이용 후에는 환불이 불가능합니다.',
        0
      )
      ON CONFLICT (product_nm) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백: 추가한 상품 삭제
    await queryRunner.query(`
      DELETE FROM payment_service
      WHERE product_nm IN ('2027 수시 예측 분석 서비스', '추가 AI 생기부 평가/컨설팅');
    `);
  }
}
