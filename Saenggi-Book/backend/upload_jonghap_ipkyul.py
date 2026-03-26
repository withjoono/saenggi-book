#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
종합전형 입결 데이터 업로드 스크립트
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
EXCEL_FILE = 'uploads/26_jonghap_ipkyul_수정.xlsx'

def main():
    try:
        # 1. 엑셀 파일 읽기
        print(f"[1/7] Reading Excel file: {EXCEL_FILE}")
        df = pd.read_excel(EXCEL_FILE)

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
        cursor.execute("DELETE FROM susi_jonghap_ipkyul")
        deleted_count = cursor.rowcount
        print(f"      Deleted {deleted_count} rows")

        # 4. INSERT 쿼리 준비
        insert_query = """
        INSERT INTO susi_jonghap_ipkyul (
            ida_id,
            university_name,
            university_code,
            admission_type,
            admission_type_code,
            admission_detail,
            category,
            recruitment_unit,
            grade_avg,
            grade_70p_cut,
            grade_90p_cut,
            recruitment_2023,
            competition_rate_2023,
            additional_pass_rank_2023,
            actual_competition_rate_2023,
            grade_50p_2023,
            grade_70p_2023,
            recruitment_2024,
            competition_rate_2024,
            additional_pass_rank_2024,
            actual_competition_rate_2024,
            grade_50p_2024,
            grade_70p_2024,
            recruitment_2025,
            competition_rate_2025,
            additional_pass_rank_2025,
            actual_competition_rate_2025,
            grade_50p_2025,
            grade_70p_2025,
            recruitment_2026,
            competition_rate_2026,
            additional_pass_rank_2026,
            actual_competition_rate_2026,
            grade_50p_2026,
            grade_70p_2026
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (ida_id) DO UPDATE SET
            university_name = EXCLUDED.university_name,
            university_code = EXCLUDED.university_code,
            admission_type = EXCLUDED.admission_type,
            admission_type_code = EXCLUDED.admission_type_code,
            admission_detail = EXCLUDED.admission_detail,
            category = EXCLUDED.category,
            recruitment_unit = EXCLUDED.recruitment_unit,
            grade_avg = EXCLUDED.grade_avg,
            grade_70p_cut = EXCLUDED.grade_70p_cut,
            grade_90p_cut = EXCLUDED.grade_90p_cut,
            recruitment_2023 = EXCLUDED.recruitment_2023,
            competition_rate_2023 = EXCLUDED.competition_rate_2023,
            additional_pass_rank_2023 = EXCLUDED.additional_pass_rank_2023,
            actual_competition_rate_2023 = EXCLUDED.actual_competition_rate_2023,
            grade_50p_2023 = EXCLUDED.grade_50p_2023,
            grade_70p_2023 = EXCLUDED.grade_70p_2023,
            recruitment_2024 = EXCLUDED.recruitment_2024,
            competition_rate_2024 = EXCLUDED.competition_rate_2024,
            additional_pass_rank_2024 = EXCLUDED.additional_pass_rank_2024,
            actual_competition_rate_2024 = EXCLUDED.actual_competition_rate_2024,
            grade_50p_2024 = EXCLUDED.grade_50p_2024,
            grade_70p_2024 = EXCLUDED.grade_70p_2024,
            recruitment_2025 = EXCLUDED.recruitment_2025,
            competition_rate_2025 = EXCLUDED.competition_rate_2025,
            additional_pass_rank_2025 = EXCLUDED.additional_pass_rank_2025,
            actual_competition_rate_2025 = EXCLUDED.actual_competition_rate_2025,
            grade_50p_2025 = EXCLUDED.grade_50p_2025,
            grade_70p_2025 = EXCLUDED.grade_70p_2025,
            recruitment_2026 = EXCLUDED.recruitment_2026,
            competition_rate_2026 = EXCLUDED.competition_rate_2026,
            additional_pass_rank_2026 = EXCLUDED.additional_pass_rank_2026,
            actual_competition_rate_2026 = EXCLUDED.actual_competition_rate_2026,
            grade_50p_2026 = EXCLUDED.grade_50p_2026,
            grade_70p_2026 = EXCLUDED.grade_70p_2026,
            updated_at = NOW()
        """

        # 5. 데이터 변환 및 삽입
        print(f"\n[4/7] Preparing data...")
        data_to_insert = []

        for idx, row in df.iterrows():
            try:
                # 컬럼 인덱스 매핑
                # 0: ida_id (문자열)
                # 1: university_name (문자열)
                # 2: university_code (문자열)
                # 3: admission_type (문자열)
                # 4: admission_type_code (integer)
                # 5: admission_detail (문자열)
                # 6: (스킵)
                # 7: category (문자열)
                # 8: recruitment_unit (문자열)
                # 9: grade_avg (numeric)
                # 10: grade_70p_cut (numeric)
                # 11: grade_90p_cut (numeric)
                # 12-17: 2023년 데이터
                # 18-23: 2024년 데이터
                # 24-29: 2025년 데이터
                # 30-35: 2026년 데이터

                values = []

                # ida_id
                val = row.iloc[0]
                values.append(str(val) if not pd.isna(val) else None)

                # university_name
                val = row.iloc[1]
                values.append(str(val) if not pd.isna(val) else None)

                # university_code
                val = row.iloc[2]
                values.append(str(val) if not pd.isna(val) else None)

                # admission_type
                val = row.iloc[3]
                values.append(str(val) if not pd.isna(val) else None)

                # admission_type_code
                val = row.iloc[4]
                values.append(int(val) if not pd.isna(val) else None)

                # admission_detail
                val = row.iloc[5]
                values.append(str(val) if not pd.isna(val) else None)

                # 6번 컬럼 스킵 (nan)

                # category
                val = row.iloc[7]
                values.append(str(val) if not pd.isna(val) else None)

                # recruitment_unit
                val = row.iloc[8]
                values.append(str(val) if not pd.isna(val) else None)

                # grade_avg, grade_70p_cut, grade_90p_cut
                for i in [9, 10, 11]:
                    val = row.iloc[i]
                    values.append(float(val) if not pd.isna(val) and val != 0 else None)

                # 2023년 데이터 (12-17)
                for i in [12, 13, 14, 15, 16, 17]:
                    val = row.iloc[i]
                    if i in [12, 14]:  # recruitment, additional_pass_rank (integer)
                        values.append(int(val) if not pd.isna(val) and val != 0 else None)
                    else:  # 나머지는 numeric
                        values.append(float(val) if not pd.isna(val) and val != 0 else None)

                # 2024년 데이터 (18-23)
                for i in [18, 19, 20, 21, 22, 23]:
                    val = row.iloc[i]
                    if i in [18, 20]:  # recruitment, additional_pass_rank (integer)
                        values.append(int(val) if not pd.isna(val) and val != 0 else None)
                    else:
                        values.append(float(val) if not pd.isna(val) and val != 0 else None)

                # 2025년 데이터 (24-29)
                for i in [24, 25, 26, 27, 28, 29]:
                    val = row.iloc[i]
                    if i in [24, 26]:  # recruitment, additional_pass_rank (integer)
                        values.append(int(val) if not pd.isna(val) and val != 0 else None)
                    else:
                        values.append(float(val) if not pd.isna(val) and val != 0 else None)

                # 2026년 데이터 (30-35)
                for i in [30, 31, 32, 33, 34, 35]:
                    val = row.iloc[i]
                    if i in [30, 32]:  # recruitment, additional_pass_rank (integer)
                        values.append(int(val) if not pd.isna(val) and val != 0 else None)
                    else:
                        values.append(float(val) if not pd.isna(val) and val != 0 else None)

                data_to_insert.append(tuple(values))

                # 진행상황 출력 (1000개마다)
                if (idx + 1) % 1000 == 0:
                    print(f"      Processing {idx + 1}/{len(df)} rows...")

            except Exception as e:
                print(f"      ERROR at row {idx}: {e}")
                print(f"      Row data: {row.iloc[:12].to_dict()}")
                continue

        # Batch insert
        print(f"\n[5/7] Executing batch insert...")
        execute_batch(cursor, insert_query, data_to_insert, page_size=1000)

        # 6. 커밋
        conn.commit()

        # 7. 결과 확인
        cursor.execute("SELECT COUNT(*) FROM susi_jonghap_ipkyul")
        final_count = cursor.fetchone()[0]

        print(f"\n[6/7] Upload completed!")
        print(f"      Total rows inserted: {final_count}")

        # 8. 샘플 데이터 확인
        print(f"\n[7/7] Sample data:")
        cursor.execute("""
            SELECT ida_id, university_name, admission_type, grade_avg, recruitment_2025
            FROM susi_jonghap_ipkyul
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
