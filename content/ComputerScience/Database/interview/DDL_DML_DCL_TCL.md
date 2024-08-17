---
title: DDL & DML & DCL & TCL
---

## DDL
- `데이터 정의 언어`이며 `Data Definition Language` 의 약자이다.
- 데이터의 전체적인 뼈대를 결정하는 역할을 하며, Schema, Domain, Table, View, Index 등을 정의, 변경, 삭제할 때 사용된다.
- `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME` 문이 DDL 에 해당된다.

> [!note]
> DDL(CREATE, ALTER, RENAME, DROP) 명령어는 입력하는 순간 AUTO COMMIT 된다.

## DML
- `데이터 조작 언어`이며 `Data Manipulation Language` 의 약자이다.
- 저장된 데이터를 CRUD (Create, Read, Update, Delete) 하는 용도로 사용된다.
- `Insert`, `Select`, `Update`, `Delete` 문이 DML 에 해당된다.

## DCL
- `데이터 제어 언어`이며 `Data Controll Language` 의 약자이다.
- 데이터의 보안, 무결성, 회복, 병행 수행제어 등을 정의하는데 사용된다.
- 권한을 주고 뺏는 `Grant`, `Revoke` 문 그리고 트랜잭션과 관련된 `Commit`, `Rollback` 이 DCL 에 포함된다.

> [!note] DDL 은 Transaction 을 지원하지 않는다?
>  DBMS 마다 다르지만 MYSQL 의 경우에는 DDL 문에 대해 Transaction 을 지원하지 않는다. 하지만 RECYCLE BIN 혹은 FLASHBACK 을 지원하여 복구가 가능하게 해주는 DBMS 도 있다. 

## TCL
- `트랜잭션 제어 언어`이며 `Transaction Controll Language` 의 약자이다.
- DCL 에서 트랜잭션을 제어하는 명령인 `Commit` 과 `Rollback` 을 따로 분리하여 표현한 것이다.
- Commit 과 Rollback 은 데이터의 무결성을 보장하는 역할을 한다.

## Link
[Transaction](ComputerScience/Database/interview/Transaction.md)