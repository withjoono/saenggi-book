#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
교과전형 입결 데이터 업로드 스크립트
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
import sys

# 데이터베이스 연결 정보
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'geobukschool_dev',
    'user': 'tsuser',
    'password': 'tsuser1234'
}

# 엑셀 파일 경로
EXCEL_FILE = 'uploads/26_kyokwa_ipkyul.xlsx'

def main():
    try:
        # 1. 엑셀 파일 읽기
        print(f"[1/7] Reading Excel file: {EXCEL_FILE}")
        df = pd.read_excel(EXCEL_FILE)

        # 첫 번째 행이 헤더이므로 스킵
        print(f"      Total rows (with header): {len(df)}")

        # 첫 행을 헤더로 사용
        headers = df.iloc[0]
        df = df.iloc[1:]  # 첫 행 제거
        df.reset_index(drop=True, inplace=True)

        print(f"      Data rows: {len(df)}")

        # 2. 데이터베이스 연결
        print(f"\n[2/7] Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 3. 기존 데이터 삭제
        print(f"\n[3/7] Deleting existing data...")
        cursor.execute("DELETE FROM susi_kyokwa_cut")
        deleted_count = cursor.rowcount
        print(f"      Deleted {deleted_count} rows")

        # 4. INSERT 쿼리 준비
        insert_query = """
        INSERT INTO susi_kyokwa_cut (
            ida_id,
            grade_avg,
            grade_initial_cut,
            grade_additional_cut,
            converted_score_initial_cut,
            converted_score_avg,
            converted_score_additional_cut,
            converted_total_score,
            recruitment_2023,
            competition_rate_2023,
            additional_pass_rank_2023,
            actual_competition_rate_2023,
            converted_score_50p_2023,
            converted_score_70p_2023,
            total_score_2023,
            grade_50p_2023,
            grade_70p_2023,
            recruitment_2024,
            competition_rate_2024,
            additional_pass_rank_2024,
            actual_competition_rate_2024,
            converted_score_50p_2024,
            converted_score_70p_2024,
            total_score_2024,
            grade_50p_2024,
            grade_70p_2024,
            recruitment_2025,
            competition_rate_2025,
            additional_pass_rank_2025,
            actual_competition_rate_2025,
            converted_score_50p_2025,
            converted_score_70p_2025,
            total_score_2025,
            grade_50p_2025,
            grade_70p_2025,
            recruitment_2026,
            competition_rate_2026,
            additional_pass_rank_2026,
            actual_competition_rate_2026,
            converted_score_50p_2026,
            converted_score_70p_2026,
            total_score_2026,
            grade_50p_2026,
            grade_70p_2026
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (ida_id) DO UPDATE SET
            grade_avg = EXCLUDED.grade_avg,
            grade_initial_cut = EXCLUDED.grade_initial_cut,
            grade_additional_cut = EXCLUDED.grade_additional_cut,
            converted_score_initial_cut = EXCLUDED.converted_score_initial_cut,
            converted_score_avg = EXCLUDED.converted_score_avg,
            converted_score_additional_cut = EXCLUDED.converted_score_additional_cut,
            converted_total_score = EXCLUDED.converted_total_score,
            recruitment_2023 = EXCLUDED.recruitment_2023,
            competition_rate_2023 = EXCLUDED.competition_rate_2023,
            additional_pass_rank_2023 = EXCLUDED.additional_pass_rank_2023,
            actual_competition_rate_2023 = EXCLUDED.actual_competition_rate_2023,
            converted_score_50p_2023 = EXCLUDED.converted_score_50p_2023,
            converted_score_70p_2023 = EXCLUDED.converted_score_70p_2023,
            total_score_2023 = EXCLUDED.total_score_2023,
            grade_50p_2023 = EXCLUDED.grade_50p_2023,
            grade_70p_2023 = EXCLUDED.grade_70p_2023,
            recruitment_2024 = EXCLUDED.recruitment_2024,
            competition_rate_2024 = EXCLUDED.competition_rate_2024,
            additional_pass_rank_2024 = EXCLUDED.additional_pass_rank_2024,
            actual_competition_rate_2024 = EXCLUDED.actual_competition_rate_2024,
            converted_score_50p_2024 = EXCLUDED.converted_score_50p_2024,
            converted_score_70p_2024 = EXCLUDED.converted_score_70p_2024,
            total_score_2024 = EXCLUDED.total_score_2024,
            grade_50p_2024 = EXCLUDED.grade_50p_2024,
            grade_70p_2024 = EXCLUDED.grade_70p_2024,
            recruitment_2025 = EXCLUDED.recruitment_2025,
            competition_rate_2025 = EXCLUDED.competition_rate_2025,
            additional_pass_rank_2025 = EXCLUDED.additional_pass_rank_2025,
            actual_competition_rate_2025 = EXCLUDED.actual_competition_rate_2025,
            converted_score_50p_2025 = EXCLUDED.converted_score_50p_2025,
            converted_score_70p_2025 = EXCLUDED.converted_score_70p_2025,
            total_score_2025 = EXCLUDED.total_score_2025,
            grade_50p_2025 = EXCLUDED.grade_50p_2025,
            grade_70p_2025 = EXCLUDED.grade_70p_2025,
            recruitment_2026 = EXCLUDED.recruitment_2026,
            competition_rate_2026 = EXCLUDED.competition_rate_2026,
            additional_pass_rank_2026 = EXCLUDED.additional_pass_rank_2026,
            actual_competition_rate_2026 = EXCLUDED.actual_competition_rate_2026,
            converted_score_50p_2026 = EXCLUDED.converted_score_50p_2026,
            converted_score_70p_2026 = EXCLUDED.converted_score_70p_2026,
            total_score_2026 = EXCLUDED.total_score_2026,
            grade_50p_2026 = EXCLUDED.grade_50p_2026,
            grade_70p_2026 = EXCLUDED.grade_70p_2026,
            updated_at = NOW()
        """

        # 5. 데이터 변환 및 삽입
        print(f"\n[4/7] Preparing data...")
        data_to_insert = []

        for idx, row in df.iterrows():
            # NaN을 None으로 변환
            values = []
            for i in range(44):  # 44개 컬럼
                val = row.iloc[i]
                if pd.isna(val):
                    values.append(None)
                elif i == 0:  # ida_id (문자열)
                    values.append(str(val))
                elif i in [8, 10, 17, 19, 26, 28, 35, 37]:  # integer 컬럼들
                    values.append(int(val) if val != 0 and not pd.isna(val) else None)
                else:  # numeric 컬럼들
                    values.append(float(val) if val != 0 and not pd.isna(val) else None)

            data_to_insert.append(tuple(values))

            # 진행상황 출력 (1000개마다)
            if (idx + 1) % 1000 == 0:
                print(f"      Processing {idx + 1}/{len(df)} rows...")

        # Batch insert
        print(f"\n[5/7] Executing batch insert...")
        execute_batch(cursor, insert_query, data_to_insert, page_size=1000)

        # 6. 커밋
        conn.commit()

        # 7. 결과 확인
        cursor.execute("SELECT COUNT(*) FROM susi_kyokwa_cut")
        final_count = cursor.fetchone()[0]

        print(f"\n[6/7] Upload completed!")
        print(f"      Total rows inserted: {final_count}")

        # 8. 샘플 데이터 확인
        print(f"\n[7/7] Sample data:")
        cursor.execute("""
            SELECT ida_id, grade_avg, recruitment_2026, competition_rate_2026
            FROM susi_kyokwa_cut
            LIMIT 5
        """)
        samples = cursor.fetchall()
        for sample in samples:
            print(f"      {sample}")

        # 연결 종료
        cursor.close()
        conn.close()

        print(f"\n=== SUCCESS: Data upload completed! ===")

    except Exception as e:
        print(f"\n=== ERROR: {e} ===")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
