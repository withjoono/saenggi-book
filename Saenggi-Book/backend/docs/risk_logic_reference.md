# University Admission Risk Score Logic

This document defines the finalized logic for calculating and categorizing university admission risk scores accurately.

## 1. Core Logic: Normal Distribution Percentile Estimation

The risk score is calculated by estimating the user's percentile within the applicant distribution, based on the university's 50% cut (Mean) and 70% cut (0.5244 Sigma).

### Formula
1.  **Estimate Sigma**: `(70% Cut - 50% Cut) / 0.5244`
    *   *0.5244 is the Z-score for the top 70% cumulative probability in a normal distribution.*
2.  **Calculate Z-Score**: `(User Grade - 50% Cut) / Sigma`
3.  **Estimate Percentile**: Convert Z-Score to Cumulative Probability (Percentile).

## 2. Risk Score Lookup Table (11 Stages)

The estimated percentile is mapped to a specific **Risk Stage Score** (-5 to +5) using the following table.

| Stage (Score) | Percentile Range | Description |
| :--- | :--- | :--- |
| **+5** | ~30% | 매우 안정 |
| **+4** | 30 ~ 50% | 안정 |
| **+3** | 50 ~ 60% | 적정 |
| **+2** | 60 ~ 70% | 적정 (하위) |
| **+1** | 70 ~ 73% | 소신 (상위) |
| **0** | 74 ~ 76% | 소신 (경계) |
| **-1** | 77 ~ 79% | 소신 (하위) |
| **-2** | 80 ~ 84% | 위험 |
| **-3** | 85 ~ 90% | 매우 위험 |
| **-4** | 91 ~ 97% | 광탈 주의 |
| **-5** | 98% ~ | 지원 불가 |

## 3. Risk Badge Definitions (5 Groups)

For UI display, the 11 scores are grouped into 5 intuitive categories.

| Category | Score Range | Percentile | Color | Description |
| :--- | :--- | :--- | :--- | :--- |
| **안전** | **+4 ~ +5** | **~50%** | 🔵 Blue | 최초합 보장 |
| **적정** | **+2 ~ +3** | **50% ~ 70%** | 🟢 Green | 최초합 가능 |
| **소신** | **-1 ~ +1** | **70% ~ 80%** | 🟡 Yellow | 추합 가능 |
| **위험** | **-2 ~ -3** | **80% ~ 90%** | 🟠 Orange | 추합 불확실 |
| **결격** | **-4 ~ -5** | **90% ~** | 🔴 Red | 추합 불가 |
