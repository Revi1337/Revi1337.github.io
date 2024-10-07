---
title: Table 을 복사하는 2가지 방법
tags: ['database', 'copy-table']
---

## 들어가며
간혹 SQL 성능 테스트를 하다보면 기존 Table 을 유지한 상태로, 제약조건 하나만 더 추가한 새로운 테이블을 만들어서 테스트해보고 싶을 때가 있습니다. 따라서 해당 포스팅에서는 기존 테이블을 복사하는 2가지 방법을 소개하고자 합니다.

## 기존 테이블
우선, 복사하고자하는 테이블의 row 수는 총 400만개입니다.

```sql
SELECT COUNT(id) from crew_participant;  
```

![](ComputerScience/Database/images/Pasted%20image%2020241007133000.png)


또한, 복사하고자하는 테이블을 구조는 아래와 같습니다. `PK` 에 `AUTO_INCREMENT`. 그리고 crew_id, member_id, member_id, request_at 컬럼에는 `NOT NULL` 제약조건이 걸려있는 것을 확인할 수 있습니다.

```sql
SHOW CREATE TABLE crew_participant;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007144142.png)


## 테이블 복사
### 복사 방법 1
테이블 자체를 복사하는 첫번째 방법은 `CREATE TABLE 새로운_테이블명 AS SELECT * FROM 복사할 테이블명` 을 사용하는 것입니다.  하지만 해당 방법은 `NOT NULL Constriant 제외한 나머지 Constraint(Index, PK, FK, CHECK 등)은 복사되지 않습니다`. 해당 방법은 복사된 테이블에 새롭게 제약조건을 추가하고싶을때 사용하면 좋을 것 같습니다.

```sql
CREATE TABLE shallow_copy_crew_participant AS  
SELECT  
    *  
FROM  
    crew_participant;
```


새롭게 만든 `shallow_copy_crew_participant` 테이블의 총 row 개수가 400 만개. 즉, 정상적으로 복사된 것을 알 수 있습니다.

```sql
SELECT COUNT(id) from shallow_copy_crew_participant;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007133000.png)


복사한 `shallow_copy_crew_participant` 을 보면 `NOT NULL` 을 제외한 나머지 제약조건이 복사되지 않은 것을 확인할 수 있습니다. 

```sql
SHOW CREATE TABLE shallow_copy_crew_participant;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007145432.png)

#### 테이블 구조만 복사
복사하는 테이블의 제약조건을 따르지 않고, 내용들(row) 들도 복사하고 싶지 않을 떄가 있습니다. 그럴때는 `CREATE TABLE 새로운_테이블명 AS SELECT * FROM 복사할 테이블명` 에서 무조건 `False 로 만드는 Where 절을 명시`해주면 됩니다.

```sql
CREATE TABLE shallow_copy_crew_participant_2 AS  
SELECT  
    *  
FROM  
    crew_participant
WHERE 
	 1 = 0;
```


새롭게 만들어진 `shallow_copy_crew_participant_2` 에는 crew_participant 의 row 들이 복사되지 않을 것을 확인할 수 있습니다.

```sql
SELECT COUNT(id) from shallow_copy_crew_participant_2;  
```

![](ComputerScience/Database/images/Pasted%20image%2020241007150508.png)


당연히 `NOT NULL` 을 제외한 나머지 제약조건이 복사되지 않은 것도 확인할 수 있습니다.

```sql
SHOW CREATE TABLE shallow_copy_crew_participant_2;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007150634.png)

### 복사 방법 2
테이블 자체를 복사하는 두번째 방법은 `CREATE TABLE 새로운_테이블명 LIKE 복사할_테이블명` 로 테이블 구조를 먼저 복사한 다음, `INSERT INTO 새로운_테이블명 SELECT * FROM 복사할_테이블명` 로 데이터를 삽입하는 방식입니다. **해당 방법은 모든 제약조건(Index, PK, FK, CHECK 등)을 복사하게 됩니다.**

```sql
CREATE TABLE deep_copy_crew_participant LIKE crew_participant;  
INSERT INTO  
    deep_copy_crew_participant  
SELECT  
    *  
FROM  
    crew_participant;
```


새롭게 만들어진 `deep_copy_crew_participant` 에는 crew_participant 의 모든 row 가 복사된 것을 확인할 수 있습니다.

```sql
SELECT COUNT(id) FROM deep_copy_crew_participant;  
```

![](ComputerScience/Database/images/Pasted%20image%2020241007133000.png)


또한, crew_participant 의 모든 제약조건도 복사된것도 확인할 수 있습니다.

```sql
SHOW CREATE TABLE deep_copy_crew_participant;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007151627.png)

## 마치며
이상으로 테이블을 복사하는 2가지 방법을 알아보았습니다. 정리하면 아래와 같습니다.

- `CREATE TABLE 새로운_테이블명 AS SELECT * FROM 복사할 테이블명` 는 NOT NULL Constriant 제외한 나머지 Constraint(Index, PK, FK, CHECK 등) 은 복사되지 않습니다.
- `CREATE TABLE 새로운_테이블명 LIKE 복사할_테이블명` 는 모든 Constraint 를 복사합니다.
