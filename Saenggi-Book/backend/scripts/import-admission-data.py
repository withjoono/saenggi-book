#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
엑셀 파일에서 입학 전형 데이터를 데이터베이스에 삽입하는 스크립트
"""
import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
import sys
import io

# Windows 콘솔 UTF-8 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 데이터베이스 연결 정보
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 5432,
    'database': 'geobukschool_dev',
    'user': 'tsuser',
    'password': 'tsuser1234'
}

def get_db_connection():
    """데이터베이스 연결"""
    return psycopg2.connect(**DB_CONFIG)

def insert_categories(conn):
    """입학 카테고리 삽입"""
    print("=== 1. 입학 카테고리 삽입 ===")
    cursor = conn.cursor()

    categories = [
        (1, '학생부교과'),
        (2, '학생부종합'),
        (3, '논술'),
    ]

    for cat_id, cat_name in categories:
        cursor.execute("""
            INSERT INTO ts_admission_categories (id, name)
            VALUES (%s, %s)
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
        """, (cat_id, cat_name))
        print(f"  - {cat_name} (ID: {cat_id})")

    conn.commit()
    cursor.close()
    print("✅ 카테고리 삽입 완료\n")

def get_or_create_university(cursor, univ_name):
    """대학명으로 대학 ID 조회 (없으면 None 반환)"""
    # 정확한 매칭
    cursor.execute("SELECT id FROM ts_universities WHERE name = %s", (univ_name,))
    result = cursor.fetchone()
    if result:
        return result[0]

    # 비슷한 이름 찾기 (예: "가천대" -> "가천대학교")
    cursor.execute("SELECT id, name FROM ts_universities WHERE name LIKE %s", (f"%{univ_name}%",))
    result = cursor.fetchone()
    if result:
        print(f"    ⚠️  '{univ_name}' -> '{result[1]}' (ID: {result[0]}) 매칭")
        return result[0]

    print(f"    ❌ 대학 '{univ_name}' 찾을 수 없음")
    return None

def get_or_create_general_field(cursor, field_name):
    """계열명으로 계열 ID 조회 또는 생성"""
    if not field_name or pd.isna(field_name):
        return None

    cursor.execute("SELECT id FROM ts_general_fields WHERE name = %s", (field_name,))
    result = cursor.fetchone()
    if result:
        return result[0]

    # 없으면 생성
    cursor.execute("""
        INSERT INTO ts_general_fields (name)
        VALUES (%s)
        RETURNING id
    """, (field_name,))
    field_id = cursor.fetchone()[0]
    print(f"    ✅ 계열 생성: {field_name} (ID: {field_id})")
    return field_id

def import_gyogwa_data(conn, excel_file):
    """교과 전형 데이터 삽입"""
    print("\n=== 2. 교과 전형 데이터 삽입 ===")

    # 엑셀 읽기
    df = pd.read_excel(excel_file, sheet_name='교과', header=1)
    print(f"총 {len(df)}개 행 읽음")

    cursor = conn.cursor()

    # 카운터
    admissions_inserted = 0
    units_inserted = 0
    scores_inserted = 0
    skipped = 0

    for idx, row in df.iterrows():
        try:
            # 필수 데이터 확인
            year = row.get('년도')
            univ_name = row.get('대학명')
            admission_name = row.get('전형명')
            basic_type = row.get('일반특별', '일반')
            unit_name = row.get('모집단위명')
            category_name = row.get('중심전형분류')  # "학생부교과"
            general_field_name = row.get('대계열')

            if pd.isna(year) or pd.isna(univ_name) or pd.isna(admission_name) or pd.isna(unit_name):
                skipped += 1
                continue

            # 대학 ID 조회
            univ_id = get_or_create_university(cursor, univ_name)
            if not univ_id:
                skipped += 1
                continue

            # 계열 ID 조회/생성
            general_field_id = get_or_create_general_field(cursor, general_field_name)

            # 카테고리 ID (학생부교과 = 1)
            category_id = 1

            # Admission 삽입 (중복 시 기존 ID 사용)
            cursor.execute("""
                INSERT INTO ts_admissions (name, year, basic_type, university_id, category_id)
                VALUES (%s, %s, %s::ts_admissions_basic_type_enum, %s, %s)
                ON CONFLICT (name, year, university_id, category_id)
                DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            """, (admission_name, int(year), basic_type, univ_id, category_id))

            admission_id = cursor.fetchone()[0]
            admissions_inserted += 1

            # Recruitment Unit 삽입
            recruitment_number = row.get('모집\n인원')
            if pd.isna(recruitment_number):
                recruitment_number = None
            else:
                recruitment_number = int(recruitment_number)

            cursor.execute("""
                INSERT INTO ts_recruitment_units (name, recruitment_number, admission_id, general_field_id)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (admission_id, name)
                DO UPDATE SET recruitment_number = EXCLUDED.recruitment_number
                RETURNING id
            """, (unit_name, recruitment_number, admission_id, general_field_id))

            unit_id = cursor.fetchone()[0]
            units_inserted += 1

            # Scores 삽입 (등급50, 등급70)
            def safe_numeric(value):
                """숫자로 변환 가능한지 확인하고 변환, 아니면 None 반환"""
                if pd.isna(value):
                    return None
                if isinstance(value, (int, float)):
                    return float(value)
                # 문자열인 경우 숫자로 변환 시도
                try:
                    return float(str(value).strip())
                except (ValueError, AttributeError):
                    return None

            grade_50 = safe_numeric(row.get('등급50'))
            grade_70 = safe_numeric(row.get('등급70'))
            convert_50 = safe_numeric(row.get('변환50'))
            convert_70 = safe_numeric(row.get('변환70'))

            # 위험도 컬럼들
            risk_cols = {
                'risk_plus_5': safe_numeric(row.get('위험도(+)5')),
                'risk_plus_4': safe_numeric(row.get('위험도(+)4')),
                'risk_plus_3': safe_numeric(row.get('위험도(+)3')),
                'risk_plus_2': safe_numeric(row.get('위험도(+)2')),
                'risk_plus_1': safe_numeric(row.get('위험도(+)1')),
                'risk_minus_1': safe_numeric(row.get('위험도(-1)')),
                'risk_minus_2': safe_numeric(row.get('위험도(-2)')),
                'risk_minus_3': safe_numeric(row.get('위험도(-3)')),
                'risk_minus_4': safe_numeric(row.get('위험도(-4)')),
                'risk_minus_5': safe_numeric(row.get('위험도(-5)')),
            }

            # 점수 데이터가 있으면 삽입
            if not all(pd.isna(v) for v in [grade_50, grade_70, convert_50, convert_70]):
                cursor.execute("""
                    INSERT INTO ts_recruitment_unit_scores (
                        recruitment_unit_id, grade_50_cut, grade_70_cut,
                        convert_50_cut, convert_70_cut,
                        risk_plus_5, risk_plus_4, risk_plus_3, risk_plus_2, risk_plus_1,
                        risk_minus_1, risk_minus_2, risk_minus_3, risk_minus_4, risk_minus_5
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                """, (
                    unit_id,
                    grade_50,
                    grade_70,
                    convert_50,
                    convert_70,
                    risk_cols['risk_plus_5'],
                    risk_cols['risk_plus_4'],
                    risk_cols['risk_plus_3'],
                    risk_cols['risk_plus_2'],
                    risk_cols['risk_plus_1'],
                    risk_cols['risk_minus_1'],
                    risk_cols['risk_minus_2'],
                    risk_cols['risk_minus_3'],
                    risk_cols['risk_minus_4'],
                    risk_cols['risk_minus_5'],
                ))
                scores_inserted += 1

            # 주기적으로 커밋 (배치 처리)
            if (idx + 1) % 100 == 0:
                conn.commit()
                print(f"  진행: {idx + 1}/{len(df)} ({admissions_inserted} admissions, {units_inserted} units, {scores_inserted} scores)")

        except Exception as e:
            print(f"  ❌ 오류 (행 {idx}): {e}")
            conn.rollback()  # 트랜잭션 롤백
            skipped += 1
            continue

    conn.commit()
    cursor.close()

    print(f"\n✅ 교과 전형 삽입 완료:")
    print(f"  - Admissions: {admissions_inserted}")
    print(f"  - Recruitment Units: {units_inserted}")
    print(f"  - Scores: {scores_inserted}")
    print(f"  - 건너뛴 행: {skipped}")

def import_hakjong_data(conn, excel_file):
    """학종 전형 데이터 삽입"""
    print("\n=== 3. 학종 전형 데이터 삽입 ===")

    # 엑셀 읽기
    df = pd.read_excel(excel_file, sheet_name='학종', header=1)
    print(f"총 {len(df)}개 행 읽음")

    cursor = conn.cursor()

    admissions_inserted = 0
    units_inserted = 0
    skipped = 0

    for idx, row in df.iterrows():
        try:
            year = row.get('년도')
            univ_name = row.get('대학명')
            admission_name = row.get('전형명')
            basic_type = row.get('일반특별', '일반')
            unit_name = row.get('모집단위명')
            general_field_name = row.get('대계열')

            if pd.isna(year) or pd.isna(univ_name) or pd.isna(admission_name) or pd.isna(unit_name):
                skipped += 1
                continue

            univ_id = get_or_create_university(cursor, univ_name)
            if not univ_id:
                skipped += 1
                continue

            general_field_id = get_or_create_general_field(cursor, general_field_name)

            # 카테고리 ID (학생부종합 = 2)
            category_id = 2

            cursor.execute("""
                INSERT INTO ts_admissions (name, year, basic_type, university_id, category_id)
                VALUES (%s, %s, %s::ts_admissions_basic_type_enum, %s, %s)
                ON CONFLICT (name, year, university_id, category_id)
                DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            """, (admission_name, int(year), basic_type, univ_id, category_id))

            admission_id = cursor.fetchone()[0]
            admissions_inserted += 1

            recruitment_number = row.get('모집\n인원')
            if pd.isna(recruitment_number):
                recruitment_number = None
            else:
                recruitment_number = int(recruitment_number)

            cursor.execute("""
                INSERT INTO ts_recruitment_units (name, recruitment_number, admission_id, general_field_id)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (admission_id, name)
                DO UPDATE SET recruitment_number = EXCLUDED.recruitment_number
                RETURNING id
            """, (unit_name, recruitment_number, admission_id, general_field_id))

            units_inserted += 1

            if (idx + 1) % 100 == 0:
                conn.commit()
                print(f"  진행: {idx + 1}/{len(df)} ({admissions_inserted} admissions, {units_inserted} units)")

        except Exception as e:
            print(f"  ❌ 오류 (행 {idx}): {e}")
            conn.rollback()  # 트랜잭션 롤백
            skipped += 1
            continue

    conn.commit()
    cursor.close()

    print(f"\n✅ 학종 전형 삽입 완료:")
    print(f"  - Admissions: {admissions_inserted}")
    print(f"  - Recruitment Units: {units_inserted}")
    print(f"  - 건너뛴 행: {skipped}")

def main():
    excel_file = r"e:\Dev\github\Susi\susi-back\uploads\교과 학종 out 240823.xlsx"

    try:
        print("데이터베이스 연결 중...")
        conn = get_db_connection()
        print("✅ 연결 성공\n")

        # 1. 카테고리 삽입
        insert_categories(conn)

        # 2. 교과 전형 데이터 삽입
        import_gyogwa_data(conn, excel_file)

        # 3. 학종 전형 데이터 삽입
        import_hakjong_data(conn, excel_file)

        conn.close()
        print("\n🎉 모든 데이터 삽입 완료!")

    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
