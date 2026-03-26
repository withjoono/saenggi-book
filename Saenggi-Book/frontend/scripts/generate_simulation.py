# -*- coding: utf-8 -*-
"""
모의지원 시뮬레이션 데이터 생성 스크립트

로직:
- 실제 지원인원 = 모집인원 * 경쟁률
- 합격자 = 모집인원 + 충원합격순위
- 모집인원 순위 = 최초컷 (안정합격)
- 충원합격 마지막 = 추합컷 (합격가능/추가합격)
- 나머지 = 추합컷 미만 (불합격)
"""

import pandas as pd
import numpy as np
import requests
import sys
import io
import math
import json
from datetime import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ============================================
# 설정
# ============================================
INPUT_FILE = 'Uploads/모의지원현황_전체.xlsx'
OUTPUT_JSON = 'public/data/mock-application-data.json'
OUTPUT_EXCEL = f'Uploads/모의지원_시뮬레이션_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
API_BASE_URL = 'http://localhost:4001'  # NestJS 백엔드

# 파일 크기 최적화: 지원자 목록 포함 여부
INCLUDE_APPLICANTS = False  # True면 전체 지원자 목록 포함 (파일 크기 매우 큼)

# ============================================
# 백엔드 API에서 입결 데이터 가져오기
# ============================================
def fetch_admission_cuts():
    """백엔드에서 정시 입결 데이터(최초컷/추합컷) 가져오기"""
    cuts = {}

    for admission_type in ['가', '나', '다']:
        try:
            # 정시 전형 목록 조회 (2024년)
            response = requests.get(
                f'{API_BASE_URL}/explore/regular',
                params={'year': 2024, 'admission_type': admission_type},
                timeout=30
            )
            if response.status_code == 200:
                data = response.json()

                # API 응답 구조: { success: true, data: { items: [...] } }
                if isinstance(data, dict):
                    if 'data' in data and isinstance(data['data'], dict):
                        admissions = data['data'].get('items', [])
                    elif 'items' in data:
                        admissions = data['items']
                    else:
                        admissions = data.get('data', [])
                else:
                    admissions = data

                # 대학명+모집단위로 인덱싱
                for adm in admissions:
                    if not isinstance(adm, dict):
                        continue

                    univ = adm.get('university', {})
                    univ_name = univ.get('name', '') if isinstance(univ, dict) else ''
                    recruitment_name = adm.get('recruitmentName', '')

                    if univ_name and recruitment_name:
                        key = (univ_name, recruitment_name)
                        min_cut = adm.get('minCut')
                        max_cut = adm.get('maxCut')
                        total_score = adm.get('totalScore')

                        cuts[key] = {
                            'minCut': float(min_cut) if min_cut else 0,
                            'maxCut': float(max_cut) if max_cut else 0,
                            'totalScore': float(total_score) if total_score else 1000,
                        }

                print(f'  - {admission_type}군: {len(admissions)}개 로드')

        except requests.exceptions.ConnectionError:
            print(f'  - {admission_type}군: 백엔드 연결 실패 (서버 확인 필요)')
        except Exception as e:
            print(f'  - {admission_type}군: 오류 - {e}')

    print(f'  총 {len(cuts)}개 입결 데이터 로드')
    return cuts

# ============================================
# 지원자 점수 시뮬레이션
# ============================================
def simulate_applicants(row, cuts):
    """
    한 모집단위에 대한 지원자 점수 시뮬레이션

    Args:
        row: 기본정보 시트의 한 행
        cuts: 백엔드에서 가져온 컷 데이터

    Returns:
        applicants: 지원자 목록 [{순위, 점수, 합격상태, 비고}]
        freq_dist: 도수분포표 [{점수하한, 점수상한, 지원자수, 누적인원, 합격상태}]
    """
    모집인원 = int(row['모집인원']) if pd.notna(row['모집인원']) else 0
    경쟁률 = float(row['경쟁률']) if pd.notna(row['경쟁률']) else 0
    충원합격순위 = int(row['충원합격순위']) if pd.notna(row['충원합격순위']) else 0

    # 모집인원이 0이면 빈 데이터 반환
    if 모집인원 <= 0:
        return [], []

    # 지원인원 계산 (최소 1명)
    지원인원 = max(math.ceil(모집인원 * 경쟁률), 1)
    합격자수 = 모집인원 + 충원합격순위

    # 컷 데이터 가져오기
    key = (row['대학명'], row['모집단위'])
    cut_data = cuts.get(key, {})

    최초컷 = cut_data.get('minCut', 0)
    추합컷 = cut_data.get('maxCut', 0)
    총점 = cut_data.get('totalScore', 1000)

    # 컷 데이터가 없으면 기본값 설정 (총점의 60~70% 수준)
    if 최초컷 == 0:
        최초컷 = 총점 * 0.65
    if 추합컷 == 0:
        추합컷 = 최초컷 * 0.98  # 최초컷의 98%

    # 점수 범위 설정
    최고점 = min(최초컷 * 1.05, 총점)  # 최초컷 +5% 또는 총점
    최저점 = 추합컷 * 0.85  # 추합컷 -15%

    applicants = []

    # 정규분포 기반 점수 생성
    평균 = (최초컷 + 추합컷) / 2
    표준편차 = (최초컷 - 추합컷) / 3  # 최초컷과 추합컷 사이가 약 3σ

    if 표준편차 <= 0:
        표준편차 = (최고점 - 최저점) / 6

    # 점수 생성 (내림차순 정렬됨)
    scores = np.random.normal(평균, 표준편차, 지원인원)
    scores = np.clip(scores, 최저점, 최고점)
    scores = np.sort(scores)[::-1]  # 내림차순

    # 특정 순위에 컷 점수 고정
    if 모집인원 <= len(scores):
        scores[모집인원 - 1] = 최초컷  # 모집인원 순위 = 최초컷
    if 합격자수 <= len(scores) and 합격자수 > 모집인원:
        scores[합격자수 - 1] = 추합컷  # 충원합격 마지막 = 추합컷

    # 다시 정렬 (컷 고정 후)
    scores = np.sort(scores)[::-1]

    # 지원자 목록 생성
    for i, score in enumerate(scores):
        순위 = i + 1

        # 합격상태 결정
        if 순위 <= 모집인원:
            합격상태 = '안정합격'
        elif 순위 <= 합격자수:
            합격상태 = '합격가능' if 순위 > 모집인원 + 충원합격순위 // 2 else '추가합격'
        else:
            합격상태 = '불합격'

        # 비고
        비고 = None
        if 순위 == 모집인원:
            비고 = '50%컷'
        elif 순위 == 합격자수:
            비고 = '70%컷'

        applicants.append({
            '순위': 순위,
            '점수': round(score, 2),
            '합격상태': 합격상태,
            '비고': 비고
        })

    # 도수분포표 생성
    freq_dist = generate_frequency_distribution(applicants, 모집인원, 합격자수)

    return applicants, freq_dist

def generate_frequency_distribution(applicants, 모집인원, 합격자수):
    """도수분포표 생성 (5점 간격)"""
    if not applicants:
        return []

    scores = [a['점수'] for a in applicants]
    min_score = math.floor(min(scores) / 5) * 5
    max_score = math.ceil(max(scores) / 5) * 5

    bins = {}
    for start in range(int(max_score), int(min_score) - 1, -5):
        bins[start] = {'count': 0, 'statuses': []}

    for a in applicants:
        bin_start = math.floor(a['점수'] / 5) * 5
        if bin_start in bins:
            bins[bin_start]['count'] += 1
            bins[bin_start]['statuses'].append(a['합격상태'])

    freq_dist = []
    누적인원 = 0

    for start in sorted(bins.keys(), reverse=True):
        if bins[start]['count'] == 0:
            continue

        누적인원 += bins[start]['count']

        # 해당 구간의 대표 합격상태 결정
        statuses = bins[start]['statuses']
        if '안정합격' in statuses:
            합격상태 = '안정합격'
        elif '추가합격' in statuses:
            합격상태 = '추가합격'
        elif '합격가능' in statuses:
            합격상태 = '합격가능'
        else:
            합격상태 = '불합격'

        freq_dist.append({
            '점수하한': start,
            '점수상한': start + 5,
            '지원자수': bins[start]['count'],
            '누적인원': 누적인원,
            '합격상태': 합격상태
        })

    return freq_dist

# ============================================
# 메인 실행
# ============================================
def main():
    print('=' * 50)
    print('모의지원 시뮬레이션 데이터 생성')
    print('=' * 50)

    # 1. 백엔드에서 컷 데이터 가져오기
    print('\n1. 백엔드 입결 데이터 조회...')
    cuts = fetch_admission_cuts()

    # 2. 기본정보 시트 읽기
    print('\n2. 기본정보 시트 읽기...')
    xlsx = pd.ExcelFile(INPUT_FILE)
    df_basic = pd.read_excel(xlsx, sheet_name='기본정보')
    print(f'   - {len(df_basic)}개 모집단위 로드')

    # 3. 시뮬레이션 실행 및 JSON 구조 생성
    print('\n3. 시뮬레이션 실행...')

    # JSON 구조 (프론트엔드 형식에 맞춤)
    json_data = {
        'basicInfo': {},           # row_id -> 기본정보 + 통계
        'frequencyDistribution': {},  # row_id -> 도수분포 배열
    }
    if INCLUDE_APPLICANTS:
        json_data['applicants'] = {}  # row_id -> 지원자 배열 (옵션)

    for idx, row in df_basic.iterrows():
        row_id = str(row['row_id'])
        applicants, freq_dist = simulate_applicants(row, cuts)

        if not applicants:
            continue

        # 기본정보
        모집인원 = int(row['모집인원']) if pd.notna(row['모집인원']) else 0
        경쟁률 = float(row['경쟁률']) if pd.notna(row['경쟁률']) else 0
        충원합격순위 = int(row['충원합격순위']) if pd.notna(row['충원합격순위']) else 0
        총합격자 = int(row['총합격자']) if pd.notna(row['총합격자']) else 모집인원

        # 통계 계산 (히스토그램용)
        scores = [a['점수'] for a in applicants]
        mean_score = np.mean(scores) if scores else 0
        std_score = np.std(scores) if scores else 0
        min_score = min(scores) if scores else 0
        max_score = max(scores) if scores else 0

        # 합격 기준점 계산
        safe_pass_scores = [a['점수'] for a in applicants if a['합격상태'] == '안정합격']
        pass_scores = [a['점수'] for a in applicants if a['합격상태'] in ['안정합격', '추가합격', '합격가능']]
        safe_pass_threshold = min(safe_pass_scores) if safe_pass_scores else None
        pass_threshold = min(pass_scores) if pass_scores else None

        json_data['basicInfo'][row_id] = {
            'universityCode': row['대학코드'],
            'universityName': row['대학명'],
            'admissionType': row['구분'],
            'recruitmentUnit': row['모집단위'],
            'recruitmentCount': 모집인원,
            'competitionRate': round(경쟁률, 2),
            'additionalPassRank': 충원합격순위,
            'totalPassCount': 총합격자,
            'mockApplicantCount': len(applicants),
            # 통계 정보 추가
            'stats': {
                'mean': round(mean_score, 2),
                'stdDev': round(std_score, 2),
                'min': round(min_score, 2),
                'max': round(max_score, 2),
                'safePassThreshold': round(safe_pass_threshold, 2) if safe_pass_threshold else None,
                'passThreshold': round(pass_threshold, 2) if pass_threshold else None,
            }
        }

        # 도수분포표 (프론트 형식)
        json_data['frequencyDistribution'][row_id] = [
            {
                'scoreLower': f['점수하한'],
                'scoreUpper': f['점수상한'],
                'applicantCount': f['지원자수'],
                'cumulativeCount': f['누적인원'],
                'passStatus': f['합격상태']
            }
            for f in freq_dist
        ]

        # 지원자 목록 (프론트 형식) - 옵션
        if INCLUDE_APPLICANTS:
            json_data['applicants'][row_id] = [
                {
                    'rank': a['순위'],
                    'score': a['점수'],
                    'passStatus': a['합격상태']
                }
                for a in applicants
            ]

        if (idx + 1) % 500 == 0:
            print(f'   - {idx + 1}/{len(df_basic)} 완료')

    print(f'   - 총 {len(json_data["basicInfo"])}개 모집단위 생성')

    # 4. JSON 파일 저장
    print('\n4. JSON 파일 저장...')

    # NaN 값을 None으로 변환하는 함수
    def convert_nan_to_none(obj):
        if isinstance(obj, dict):
            return {k: convert_nan_to_none(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_nan_to_none(item) for item in obj]
        elif isinstance(obj, float) and (np.isnan(obj) or np.isinf(obj)):
            return None
        return obj

    json_data_clean = convert_nan_to_none(json_data)

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(json_data_clean, f, ensure_ascii=False, indent=2)
    print(f'   ✅ {OUTPUT_JSON}')

    # 5. 엑셀 파일 생성 (기본정보만, 전체 데이터는 너무 큼)
    print('\n5. 엑셀 파일 생성 (기본정보 + 샘플)...')

    # 샘플 데이터 (처음 100개만)
    sample_ids = list(json_data['basicInfo'].keys())[:100]

    sample_freq = []

    for rid in sample_ids:
        for f in json_data['frequencyDistribution'].get(rid, []):
            sample_freq.append({'row_id': rid, **f})

    df_sample_freq = pd.DataFrame(sample_freq)

    with pd.ExcelWriter(OUTPUT_EXCEL, engine='openpyxl') as writer:
        df_basic.to_excel(writer, sheet_name='기본정보', index=False)
        if not df_sample_freq.empty:
            df_sample_freq.to_excel(writer, sheet_name='도수분포_샘플', index=False)

    print(f'   ✅ {OUTPUT_EXCEL}')

    print('\n' + '=' * 50)
    print('✅ 완료!')
    print('=' * 50)

if __name__ == '__main__':
    main()
