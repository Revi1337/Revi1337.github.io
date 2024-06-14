---
title: SQL 엔진 실행 순서
---

## SQL 엔진 실행 순서

**1. FROM**

- 데이터를 확인할 Table 명시
- 이름이 너무 길다면 `AS` 로 alias 설정 가능

**2. WHERE**

- FROM 에 명시된 Table 에 저장된 데이터를 필터링 (조건 설정)
- Table 에 있는 컬럼을 조건설정

**3. SELECT**

- Table 에 저장되어 있는 컬럼 선택
- 변환된 Row 들에서 특정 Column 을 추출하는 기능
- 여러 컬럼 명시 가능
- 각 컬럼에 alias 설정 가능
