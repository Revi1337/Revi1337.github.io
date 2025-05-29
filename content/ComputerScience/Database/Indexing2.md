---
title: Index 는 얼마나 빠를까?
tags: ['database', 'index']
---

## 들어가며
"Index 를 사용하면 쿼리 퍼포먼스가 좋아진다" 라는 소리는 들어본적 있을것입니다. 이번 포스팅에서는 이 Index 가 과연 얼마나 빠른지 확인해보는 과정을 적어보려고 합니다.

## 비교군 테이블 확인
### Index 없는 테이블
우선 Index 가 없는 테이블 구조는 아래와 같습니다.

```sql
SHOW CREATE TABLE crew_participant;  
SHOW INDEX FROM crew_participant;
SELECT COUNT(id) FROM crew_participant;  
```


해당 테이블이 만들어진 DDL 은 아래와 같으며

![](ComputerScience/Database/images/Pasted%20image%2020241007215031.png)


PK 에서 만들어진 인덱스를 제외하면 어떠한 Index 도 없는 것을 확인할 수 있습니다.

![](ComputerScience/Database/images/Pasted%20image%2020241007215213.png)


그리고 해당 테이블는 총 400 만개의 row 가 존재하는 것을 알 수 있습니다.

![](ComputerScience/Database/images/Pasted%20image%2020241007215122.png)

### Index 있는 테이블
Index 가 있는 테이블은 `Index 가 없는 테이블을 복사` 하고, crew_id, member_id 컬럼을 하나로 묶어 `Unique Index(Multi Column Index)` 를 추가해주었습니다.

> **CREATE TABLE 새로운_테이블명 LIKE 복사할_테이블명;** 는 테이블 복사 시 제약조건까지 모두 복사합니다.

```sql
CREATE TABLE new_crew_participant LIKE crew_participant;  
INSERT INTO  
    new_crew_participant  
SELECT  
    *  
FROM  
    crew_participant;  
  
ALTER TABLE new_crew_participant  
    ADD UNIQUE INDEX crew_member_index (crew_id, member_id);
```


이제 Index 가 있는 테이블 구조는 아래와 같습니다.

```sql
SHOW CREATE TABLE new_crew_participant;  
SHOW INDEX FROM new_crew_participant;  
SELECT COUNT(id) FROM new_crew_participant;
```


DDL 쿼리에 Unique Index 가 생긴것을 확인할 수 있습니다.

![](ComputerScience/Database/images/Pasted%20image%2020241007220708.png)


그리고 PK 에서 만들어진 Index 를 제외하고도, Multi Column Index 가 생긴것을 확인할 수 있습니다.

![](ComputerScience/Database/images/Pasted%20image%2020241007215808.png)


마지막으로 정상적으로 복사에 성공해 동일하게 400 만개의 row 가 있는것을 확인할 수 있습니다.

![](ComputerScience/Database/images/Pasted%20image%2020241007215833.png)

## 테스트
이제 Index 가 없는 테이블과 Index 가 있는 테이블에 동일한 쿼리를 날려봅니다.

```sql
SET PROFILING = 1;  
SELECT * FROM crew_participant WHERE crew_id = 1700 AND member_id = 300;  
SELECT * from new_crew_participant WHERE crew_id = 1700 AND member_id = 300;  
SET PROFILING = 0;  
SHOW PROFILES;
```


프로파일링 결과 Index 가 없는 테이블은 `0.54053425`, Index 가 있는 테이블은 `0.00025350` 인것을 확인할 수 있습니다. 두 테이블 모두 `400 만개의 row` 가 있었지만 Index 여부로 `2000 배` 이상 차이나게 되는 것을 확인할 수 있습니다.

![](ComputerScience/Database/images/Pasted%20image%2020241007220942.png)

