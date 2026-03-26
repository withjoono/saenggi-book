# 멘토링 기능 API 가이드

거북스쿨의 멘토-멘티 계정 연동 기능입니다.

---

## API 엔드포인트

### 1. 연계 코드 생성

멘토가 멘티에게 공유할 6자리 임시 코드를 생성합니다.

```
POST /mentoring/generate-code
```

**Headers:**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| Authorization | string | O | Bearer {accessToken} |

**응답:**
```json
{
  "success": true,
  "data": {
    "code": "ABC123",
    "expireAt": "2024-01-01T12:05:00.000Z"
  }
}
```

**비즈니스 로직:**
1. 사용자 인증 확인
2. 회원 유형(member_type) 확인 - 모든 유형(student, parent, teacher)이 코드 생성 가능
3. 6자리 랜덤 코드 생성 (영문 대소문자 + 숫자)
4. `mentoring_temp_code_tb` 테이블에 저장 (유효시간: 5분)
5. 코드와 만료시간 반환

---

### 2. 연계 코드 확인

입력된 6자리 코드가 유효한지 확인하고 멘토 정보를 조회합니다.

```
GET /mentoring/verify-code?code={code}
```

**Headers:**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| Authorization | string | O | Bearer {accessToken} |

**Query Parameters:**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| code | string | O | 6자리 연계 코드 |

**성공 응답:**
```json
{
  "success": true,
  "data": {
    "mentorId": 123,
    "info": {
      "nickname": "홍길동",
      "memberType": "student",
      "email": "test@example.com"
    }
  }
}
```

**실패 케이스:**
| success 값 | 메시지 |
|------------|--------|
| "over" | 이미 연동된 계정입니다 |
| "self" | 자신과 연동할 수 없습니다 |
| "overlap" | 같은 직종끼리 연동할 수 없습니다 |
| "par" | 학부모는 학생만 연동 가능합니다 |
| "teach" | 선생님은 학생만 연동 가능합니다 |
| "no match" | 유효하지 않은 코드입니다 |

---

### 3. 계정 연동 추가

코드 확인 후 두 계정을 연동합니다.

```
POST /mentoring/add-link
```

**Headers:**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| Authorization | string | O | Bearer {accessToken} |

**Body:**
```json
{
  "mentorId": 123
}
```

**응답:**
```json
{
  "success": true
}
```

**비즈니스 로직:**
1. 사용자 인증 확인
2. `mentoring_account_link_tb` 테이블에 연동 관계 추가
3. `mentoring_admin_class_tb` 테이블에 양방향 관계 추가:
   - 멘티 → 멘토 방향
   - 멘토 → 멘티 방향

---

### 4. 연동된 계정 목록 조회

현재 사용자와 연동된 모든 계정을 조회합니다.

```
GET /mentoring/get-links
```

**Headers:**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| Authorization | string | O | Bearer {accessToken} |

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nickname": "나 (현재 사용자)",
      "memberType": "parent",
      "email": "me@example.com",
      "phone": "010-1234-5678",
      "profileImageUrl": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "introduction": null
    },
    {
      "id": 123,
      "nickname": "홍길동",
      "memberType": "student",
      "email": "test@example.com",
      "phone": "010-9876-5432",
      "profileImageUrl": "https://example.com/profile.jpg",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "introduction": "고3 수험생입니다"
    }
  ]
}
```

**비즈니스 로직:**
1. 사용자 인증 확인
2. 현재 사용자 정보를 맨 앞에 추가
3. `mentoring_account_link_tb`에서 연동된 계정 ID 목록 조회
4. 각 계정의 상세 정보 조회 (`member_tb` 테이블)

---

### 5. 계정 연동 해제

연동된 계정을 해제합니다.

```
DELETE /mentoring/remove-link
```

**Headers:**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| Authorization | string | O | Bearer {accessToken} |

**Body:**
```json
{
  "linkedMemberId": 123
}
```

**응답:**
```json
{
  "success": true
}
```

---

## 데이터베이스 스키마

### 1. mentoring_temp_code_tb (임시 코드)

6자리 연계 코드를 저장합니다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| member_id | bigint (PK) | 코드 생성자 ID |
| code | varchar(6) | 6자리 랜덤 코드 |
| expire_at | timestamp | 만료 시간 |
| created_at | timestamp | 생성 시간 |

### 2. mentoring_account_link_tb (계정 연동)

연동된 계정 쌍을 저장합니다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| member_id | bigint (PK) | 연동 요청자 ID |
| linked_member_id | bigint (PK) | 연동 대상자 ID |
| created_at | timestamp | 생성 시간 |

### 3. mentoring_admin_class_tb (관리자 클래스)

멘토-멘티 관계를 양방향으로 저장합니다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| member_id | bigint (PK) | 관리하는 사람 ID |
| target_member_id | bigint (PK) | 관리받는 사람 ID |
| use_yn | char(1) | 사용 여부 (Y/N) |
| first_reg_dt | date | 최초 등록일 |
| last_mod_dt | date | 최종 수정일 |
| group_id | varchar(50) | 그룹 ID |
| group_name | varchar(100) | 그룹 이름 |

---

## 회원 유형별 연동 규칙

| 회원 유형 | 코드 생성 | 연동 가능 대상 |
|----------|----------|---------------|
| student | O | parent, teacher |
| parent | O | student만 |
| teacher | O | student만 |

---

## 멘토-멘티 연동 흐름

```
1. 멘토가 "코드 생성" 버튼 클릭
   └─> 6자리 랜덤 코드 생성 (5분 유효)

2. 멘토가 코드를 멘티에게 전달 (카카오톡, 문자 등)

3. 멘티가 코드 입력 후 "조회" 클릭
   └─> 멘토 정보 표시 (이름, 유형, 이메일)

4. 멘티가 "계정 등록" 클릭
   └─> 양방향 연동 완료

5. 연동 후
   └─> 멘토: 멘티의 플래너, 성적 등 조회 가능
   └─> 멘티: 연동된 멘토 목록 확인 가능
```

---

## 구현 시 주의사항

1. **코드 유효시간**: 5분
2. **코드 형식**: 영문 대소문자 + 숫자 조합 6자리
3. **양방향 연동**: `mentoring_admin_class_tb`에 양방향으로 관계 저장 필요
4. **중복 방지**: 이미 연동된 경우 에러 반환
5. **만료 코드 정리**: 코드 조회 시 만료된 코드 자동 삭제
