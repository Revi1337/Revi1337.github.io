---
title: Join
---

## Join
- Join 은 `서로 다른 데이터 테이블을 연결하는 것`
- 공통적으로 존재하는 Key(Column) 이 있다면, Join 할 수 있음.
- 보통 ID 값을 Key 로 많이 사용하고, 특정 범위(예 : Date) 로 Join 도 가능함.

## Join 을 해야하는 이유
- 관계형 데이터베이스 (RDBMS) 설계시 정규화 과정을 거치기 때문.

> [!note] 정규화
> 정규화는 중복을 최소화하게 데이터를 구조화하는 작업. User 테이블에는 유저 데이터만, Order 테이블에는 주문 데이터만, 따라서 데이터를 다양한 Table 에 저장해서 필요할 때 Join 해서 사용

## Join 의 종류
**Inner Join**

- 두테이블의 공통 요소만 연결

**Left/Right (Outer) Join**

- 왼쪽/오른쪽 테이블 기준으로 연결

**Full (Outer) Join**

- 양쪽 기준으로 연결

**Cross Join**

- 두 테이블의 각각의 요소를 곱하기
