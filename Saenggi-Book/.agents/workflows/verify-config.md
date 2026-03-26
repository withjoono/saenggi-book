---
description: Saenggi-Book 프로덕션 설정 검증 - 핵심 배포 설정이 변경되지 않았는지 확인
---

# Saenggi-Book 프로덕션 설정 검증

이 워크플로우는 Saenggi-Book 프로젝트의 프로덕션 설정이 올바른 상태를 유지하고 있는지 검증합니다.

## 정답 설정 (Golden Config)

| 항목 | 올바른 값 |
|------|-----------|
| GCP 계정 | `geobukacademy@gmail.com` |
| 백엔드 GCP 프로젝트 | `ts-back-nest-479305` |
| 프론트엔드 GCP 프로젝트 | `ts-front-479305` |
| Cloud SQL 인스턴스 | `ts-back-nest-479305:asia-northeast3:geobuk-db` |
| DB 이름 | `geobukschool_prod` |
| App Engine 서비스명 | `saenggiview-backend` |
| Firebase Hosting 사이트 | `ms-front` |
| 프론트엔드 URL | `https://ms-front.web.app` |
| 백엔드 URL | `https://saenggiview-backend-dot-ts-back-nest-479305.du.r.appspot.com` |
| GitHub 리포지토리 | `withjoono/Saenggi-Book` |

## 검증 대상 파일

### 1. backend/app.yaml
- `service` 는 반드시 `saenggiview-backend` 이어야 함
- `cloud_sql_instances` 는 반드시 `ts-back-nest-479305:asia-northeast3:geobuk-db` 이어야 함
- `DB_NAME` 은 반드시 `geobukschool_prod` 이어야 함
- `GCS_PROJECT_ID` 는 반드시 `ts-back-nest-479305` 이어야 함

### 2. frontend/.firebaserc
- `default` 프로젝트는 반드시 `ts-front-479305` 이어야 함
- hosting target `sb` 는 반드시 `ms-front` 이어야 함

### 3. frontend/.env.production
- `VITE_FRONT_URL` 은 반드시 `https://ms-front.web.app` 이어야 함
- `VITE_API_URL_NEST` 는 반드시 `https://saenggiview-backend-dot-ts-back-nest-479305.du.r.appspot.com` 이어야 함
- `VITE_API_URL_HUB` 는 반드시 `https://ts-back-nest-479305.du.r.appspot.com` 이어야 함
- `VITE_FIREBASE_PROJECT_ID` 는 반드시 `ts-back-nest-479305` 이어야 함

## ⚠️ 주의사항

- 위 값들은 **절대 변경하면 안 됩니다**
- 다른 프로젝트(Hub, StudyPlanner, NomuTalk 등)의 설정과 혼동하지 마세요
- 배포 전 반드시 이 워크플로우를 실행하여 설정을 검증하세요
- 변경이 필요한 경우 반드시 팀 리드의 승인을 받으세요
