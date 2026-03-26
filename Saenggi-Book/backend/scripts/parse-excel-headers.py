#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
엑셀 파일의 헤더 구조를 확인하는 스크립트
"""
import pandas as pd
import sys

def main():
    excel_file = r"e:\Dev\github\Susi\susi-back\uploads\교과 학종 out 240823.xlsx"

    try:
        # 교과 시트 - 헤더 없이 처음 10행 읽기
        print("=== 교과 시트 처음 10행 (헤더 없이) ===")
        df = pd.read_excel(excel_file, sheet_name='교과', header=None, nrows=10)

        # 처음 20개 컬럼만 출력
        for idx, row in df.iterrows():
            print(f"행 {idx}: {row[:20].tolist()}")

        print("\n" + "="*80 + "\n")

        # 학종 시트 - 헤더 없이 처음 10행 읽기
        print("=== 학종 시트 처음 10행 (헤더 없이) ===")
        df2 = pd.read_excel(excel_file, sheet_name='학종', header=None, nrows=10)

        # 처음 20개 컬럼만 출력
        for idx, row in df2.iterrows():
            print(f"행 {idx}: {row[:20].tolist()}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
