#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
등급컷 데이터 컬럼 확인
"""
import pandas as pd

def main():
    excel_file = r"e:\Dev\github\Susi\susi-back\uploads\교과 학종 out 240823.xlsx"

    # 교과 시트 읽기 (행 1을 헤더로)
    df = pd.read_excel(excel_file, sheet_name='교과', header=1)

    print("=== 교과 시트 전체 컬럼명 ===")
    for idx, col in enumerate(df.columns):
        print(f"{idx}: {col}")

    print("\n\n=== 샘플 데이터 (주요 컬럼만) ===")
    # 주요 컬럼만 선택해서 출력
    important_cols = ['년도', '지역', '대학명', '전형명', '중심전형분류', '계열', '모집단위명', '대계열', '중계열', '소계열']

    # 등급 관련 컬럼 찾기
    grade_cols = [col for col in df.columns if any(keyword in str(col) for keyword in ['등급', '70', '50', '컷', '2024', '2025'])]

    print(f"\n등급/점수 관련 컬럼: {grade_cols[:10]}")  # 처음 10개만

    # 첫 5개 행 출력
    display_cols = important_cols + grade_cols[:5]
    display_cols = [col for col in display_cols if col in df.columns]

    print(f"\n샘플 데이터:")
    print(df[display_cols].head().to_string())

if __name__ == "__main__":
    main()
