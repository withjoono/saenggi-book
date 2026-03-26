# -*- coding: utf-8 -*-
import pandas as pd
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

xlsx = pd.ExcelFile('Uploads/모의지원현황_전체.xlsx')

print('=== 기본정보 시트 ===')
df1 = pd.read_excel(xlsx, sheet_name='기본정보')
print('컬럼:', list(df1.columns))
print(df1.head(3).to_string())
print()

print('=== 도수분포 시트 ===')
df2 = pd.read_excel(xlsx, sheet_name='도수분포')
print('컬럼:', list(df2.columns))
print(df2.head(10).to_string())
print()

print('=== 지원자목록 시트 ===')
df3 = pd.read_excel(xlsx, sheet_name='지원자목록')
print('컬럼:', list(df3.columns))
print(df3.head(10).to_string())
