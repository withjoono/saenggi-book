# -*- coding: utf-8 -*-
import pandas as pd
import json
import math
import sys
import io

# Force UTF-8 for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def safe_value(val):
    """NaN, Inf를 None으로 변환"""
    if pd.isna(val) or (isinstance(val, float) and (math.isnan(val) or math.isinf(val))):
        return None
    return val

def safe_float(val, default=0.0):
    """NaN, Inf를 기본값으로 변환"""
    if pd.isna(val) or (isinstance(val, float) and (math.isnan(val) or math.isinf(val))):
        return default
    return float(val)

def safe_int(val, default=0):
    """NaN, Inf를 기본값으로 변환"""
    if pd.isna(val) or (isinstance(val, float) and (math.isnan(val) or math.isinf(val))):
        return default
    return int(val)

def safe_str(val, default=""):
    """None, NaN을 빈 문자열로 변환"""
    if pd.isna(val):
        return default
    return str(val)

# Excel 파일 읽기
excel_path = 'Uploads/모의지원현황_전체.xlsx'

print('Reading Excel file...')
df_basic = pd.read_excel(excel_path, sheet_name='기본정보')
df_freq = pd.read_excel(excel_path, sheet_name='도수분포')
df_applicants = pd.read_excel(excel_path, sheet_name='지원자목록')

print(f'기본정보: {len(df_basic)} rows')
print(f'도수분포: {len(df_freq)} rows')
print(f'지원자목록: {len(df_applicants)} rows')

# 컬럼명 확인
print(f'\n기본정보 컬럼: {df_basic.columns.tolist()}')
print(f'도수분포 컬럼: {df_freq.columns.tolist()}')
print(f'지원자목록 컬럼: {df_applicants.columns.tolist()}')

# 데이터 구조 만들기
mock_data = {
    "basicInfo": {},
    "frequencyDistribution": {},
    "applicants": {}
}

# 기본정보 변환 - 컬럼명: row_id, 대학코드, 대학명, 구분, 모집단위, 모집인원, 경쟁률, 충원합격순위, 총합격자, 모의지원자수
for _, row in df_basic.iterrows():
    row_id = str(safe_int(row['row_id']))
    mock_data["basicInfo"][row_id] = {
        "universityCode": safe_str(row['대학코드']),
        "universityName": safe_str(row['대학명']),
        "admissionType": safe_str(row['구분']),  # 구분 = 군 (가군, 나군, 다군)
        "recruitmentUnit": safe_str(row['모집단위']),
        "recruitmentCount": safe_int(row['모집인원']),
        "competitionRate": safe_float(row['경쟁률']),
        "additionalPassRank": safe_int(row['충원합격순위']),
        "totalPassCount": safe_int(row['총합격자']),
        "mockApplicantCount": safe_int(row['모의지원자수'])
    }

print(f'\nConverted {len(mock_data["basicInfo"])} basicInfo entries')

# 도수분포 변환 - 컬럼명: row_id, 점수하한, 점수상한, 지원자수, 누적인원, 합격상태
for _, row in df_freq.iterrows():
    row_id = str(safe_int(row['row_id']))
    if row_id not in mock_data["frequencyDistribution"]:
        mock_data["frequencyDistribution"][row_id] = []

    mock_data["frequencyDistribution"][row_id].append({
        "scoreLower": safe_float(row['점수하한']),
        "scoreUpper": safe_float(row['점수상한']),
        "applicantCount": safe_int(row['지원자수']),
        "cumulativeCount": safe_int(row['누적인원']),
        "passStatus": safe_str(row['합격상태'])
    })

print(f'Converted {len(mock_data["frequencyDistribution"])} frequencyDistribution entries')

# 지원자목록 변환 - 컬럼명: row_id, 순위, 점수, 합격상태, 비고
for _, row in df_applicants.iterrows():
    row_id = str(safe_int(row['row_id']))
    if row_id not in mock_data["applicants"]:
        mock_data["applicants"][row_id] = []

    mock_data["applicants"][row_id].append({
        "rank": safe_int(row['순위']),
        "score": safe_float(row['점수']),
        "passStatus": safe_str(row['합격상태']),
        "note": safe_value(row['비고'])
    })

print(f'Converted {len(mock_data["applicants"])} applicants entries')

# lookup 테이블 생성 - 대학명_모집단위_구분 -> row_id
# 추가로 대학코드_모집단위_구분 -> row_id
lookup = {}
for row_id, info in mock_data["basicInfo"].items():
    # 대학명 기반 키 (프론트엔드에서 대학명으로 검색할 수 있도록)
    key_by_name = f"{info['universityName']}_{info['recruitmentUnit']}_{info['admissionType']}"
    lookup[key_by_name] = row_id

    # 대학코드 기반 키
    key_by_code = f"{info['universityCode']}_{info['recruitmentUnit']}_{info['admissionType']}"
    lookup[key_by_code] = row_id

print(f'\nCreated lookup with {len(lookup)} entries')

# JSON 파일로 저장
with open('public/data/mock-application-data.json', 'w', encoding='utf-8') as f:
    json.dump(mock_data, f, ensure_ascii=False, indent=2)
print('Saved mock-application-data.json')

with open('public/data/university-lookup.json', 'w', encoding='utf-8') as f:
    json.dump(lookup, f, ensure_ascii=False, indent=2)
print('Saved university-lookup.json')

# 샘플 출력
print('\n=== 강원대 샘플 데이터 ===')
for row_id, info in mock_data["basicInfo"].items():
    if '강원' in info['universityName']:
        print(f"row_id: {row_id}, {info['universityName']}, {info['admissionType']}, {info['recruitmentUnit']}")
        if int(row_id) > 130:
            break

print('\nDone!')
