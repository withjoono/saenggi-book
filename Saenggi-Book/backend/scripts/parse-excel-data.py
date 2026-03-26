#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
엑셀 파일에서 교과/학종 전형 데이터를 파싱하는 스크립트
"""
import pandas as pd
import sys
import json

def main():
    excel_file = r"e:\Dev\github\Susi\susi-back\uploads\교과 학종 out 240823.xlsx"

    try:
        # 엑셀 파일의 모든 시트 이름 확인
        excel = pd.ExcelFile(excel_file)
        print("=== 시트 목록 ===")
        print(excel.sheet_names)
        print()

        # 교과 시트 읽기
        if '교과' in excel.sheet_names:
            print("=== 교과 시트 구조 ===")
            df_gyogwa = pd.read_excel(excel_file, sheet_name='교과', nrows=5)
            print("컬럼명:", df_gyogwa.columns.tolist())
            print("\n첫 5행 샘플:")
            print(df_gyogwa.head())
            print(f"\n전체 행 수: {len(pd.read_excel(excel_file, sheet_name='교과'))}")
            print()

        # 학종/종합 시트 읽기
        hakjong_sheet = None
        for sheet_name in ['학종', '종합', '학생부종합']:
            if sheet_name in excel.sheet_names:
                hakjong_sheet = sheet_name
                break

        if hakjong_sheet:
            print(f"=== {hakjong_sheet} 시트 구조 ===")
            df_hakjong = pd.read_excel(excel_file, sheet_name=hakjong_sheet, nrows=5)
            print("컬럼명:", df_hakjong.columns.tolist())
            print("\n첫 5행 샘플:")
            print(df_hakjong.head())
            print(f"\n전체 행 수: {len(pd.read_excel(excel_file, sheet_name=hakjong_sheet))}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
