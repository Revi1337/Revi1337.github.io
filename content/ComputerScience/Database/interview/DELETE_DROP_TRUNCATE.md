---
title: DELETE vs DROP vs TRUNCATE
---

## DELETE
- `하나 이상의 Record(row) 를 삭제하는데 사용`되며, DML 에 해당된다.
- Record 를 다루는 커맨드이기 때문에 Index, Constraint(무결성 제약조건 포함) 이 모두 유지된다.
- Undo Log 에 저장되기 때문에 Transaction 으로 `Rollback 이 가능`하다.
- Where 절로 Condition Check 를 할 수 있기때문에 Index 를 탄다해도 DELETE, DROP, TRUNCATE 중 속도가 가장 느리다.
- 할당된 메모리 공간을 반환하지 않는다.
- 무결성 제약조건을 유지한다.
- DML + DELETE 권한이 필요하다.

## DROP
- `Table 자체를 삭제하는데 사용` 되며, DDL 에 해당된다.
- Table 자체를 삭제하기 때문에 관련된 `Index, Constraint(무결성 제약조건 포함) 가 모두 삭제`된다.
- DDL 에 속하기 때문에 일반적으로 Transaction 을 타지 않는다. 따라서 `Rollback 이 불가능`하다.
- Record 를 모두 지우고 Table 을 지우기 때문에 DELETE, DROP, TRUNCATE 중 두번째로 빠르다(중간).
- 할당된 메모리 공간을 반환한다.
- ALTER + DROP 권한이 필요하다.

## TRUNCATE
- `Table 은 유지하면서 모든 Record 를 삭제하는데 사용`되며 DDL 에 해당된다.
- Table 은 유지하고 모든 Record 만 삭제하기 때문에 Index, Constraint(무결성 제약조건 포함) 는 그대로 유지된다. 하지만 `Auto Increment 는 초기화`된다.
- DDL 에 속하기 때문에 일반적으로 Transaction 을 타지 않는다. 따라서 `Rollback 이 불가능`하다.
- DELETE, DROP, TRUNCATE 중 가장 빠르다.
- 할당된 메모리 공간을 반환하지 않는다.
- ALTER 권한이 필요하다.

## DELETE vs DROP vs TRUNCATE

|          | 종류  | Rollback |              용도              |      권한      | 속도  | 메모리 반환 | Index | Constraint | Auto Increment |
| -------- | :-: | :------: | :--------------------------: | :----------: | :-: | :----: | ----- | ---------- | -------------- |
| DELETE   | DML |    O     |      하나 이상의 Record 를 삭제      | DML + DELETE | 느림  |   X    | 유지    | 유지         | 유지 (이전 값 이어감)  |
| DROP     | DDL |    X     |         Table 자체를 삭제         | ALTER + DROP | 중간  |   O    | 삭제    | 삭제         | 삭제             |
| TRUNCATE | DDL |    X     | Table 은 유지하면서 Record 만 전체 삭제 |    ALTER     | 빠름  |   X    | 유지    | 유지         | 초기화            |

## Reference
[김희성님 유튜브 DB 파트](https://www.youtube.com/watch?app=desktop&v=syDPRdaxme0&list=PLHOy1E8axXrfJJtDIXIOQBmWRPwM-GxSf&index=4)

## Link 
[DDL & DML & DCL & TCL](ComputerScience/Database/interview/DDL_DML_DCL.md)
[Transaction](ComputerScience/Database/interview/Transaction.md)

