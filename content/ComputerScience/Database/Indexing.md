---
title: Index 는 얼마나 빠를까?
tags: ['database', 'index']
---
## Index 없는 테이블 생성
### DDL

```sql
DROP TABLE IF EXISTS member;  
CREATE TABLE member  
(  
    id         bigint      NOT NULL AUTO_INCREMENT,  
    nickname   varchar(8)  NOT NULL,  
    created_at datetime(6) NOT NULL,  
    PRIMARY KEY (id)  
) ENGINE = InnoDB;  
  
  
DROP TABLE IF EXISTS crew;  
CREATE TABLE crew  
(  
    id         bigint      NOT NULL AUTO_INCREMENT,  
    name       varchar(45) NOT NULL,  
    created_at datetime(6) NOT NULL,  
    updated_at datetime(6) NOT NULL,  
    PRIMARY KEY (id)  
) ENGINE = InnoDB;  
  
  
DROP TABLE IF EXISTS crew_participant;  
CREATE TABLE crew_participant  
(  
    id         bigint      NOT NULL AUTO_INCREMENT,  
    crew_id    bigint      NOT NULL,  
    member_id  bigint      NOT NULL,  
    request_at datetime(6) NOT NULL,  
    PRIMARY KEY (id)  
) ENGINE = InnoDB;
```


### Dummy 데이터 삽입
#### Procedure 생성
```sql
DELIMITER $$  
DROP PROCEDURE IF EXISTS member_loop $$  
CREATE PROCEDURE member_loop()  
BEGIN  
    DECLARE idx INT DEFAULT 1;  
    WHILE idx <= 2000  
        DO  
            INSERT INTO                member(nickname, created_at)  
            VALUES  
                (CONCAT('n_', idx), NOW());  
  
            SET idx = idx + 1;  
        END WHILE;  
END $$  
DELIMITER ;
```


```sql
DELIMITER $$  
DROP PROCEDURE IF EXISTS crew_loop $$  
CREATE PROCEDURE crew_loop()  
BEGIN  
    DECLARE idx INT DEFAULT 1;  
    WHILE idx <= 2000  
        DO  
            INSERT INTO                crew(name, created_at, updated_at)  
            VALUES  
                (CONCAT('n_', idx), NOW(), NOW());  
  
            SET idx = idx + 1;  
        END WHILE;  
END $$  
DELIMITER ;
```


```sql
DELIMITER $$  
DROP PROCEDURE IF EXISTS crew_participant_loop $$  
CREATE PROCEDURE crew_participant_loop()  
BEGIN  
    DECLARE i INT DEFAULT 1;  
    DECLARE j INT DEFAULT 1;  
  
    SET @member_count = ( SELECT COUNT(id) FROM member );  
    SET @crew_count = ( SELECT COUNT(id) FROM crew );  
  
    WHILE i <= @member_count  
        DO  
            SET j = 1;  
            WHILE j <= @crew_count  
                DO  
                    INSERT INTO crew_participant(crew_id, member_id, request_at) VALUES (i, j, NOW());  
  
                    SET j = j + 1;  
                END WHILE;  
            SET i = i + 1;  
        END WHILE;  
END $$  
DELIMITER ;
```

#### Procedure 실행

```sql
CALL member_loop;  
CALL crew_loop;  
CALL crew_participant_loop;
```

### 테이블 확인
```sql
SELECT COUNT(id) FROM member  
UNION ALL SELECT COUNT(id) FROM crew  
UNION ALL SELECT COUNT(id) FROM crew_participant;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007131018.png)


## Index 있는 테이블 생성
### 테이블 복사
`crew_participant` 테이블 구조를 복사하여 새로운 `new_crew_participant` 테이블을 만들어 주고 crew_participant 테이블 내용을 new_crew_participant 테이블에 복사해준다. 그리고 `UNIQUE INDEX` 가 있는 테이블을 만들어줄 것이기 때문에 `crew_id, member_id` 을 묶어 Unique Multi Column 인덱스 제약조건을 걸어준다.

> **CREATE TABLE 새로운_테이블명 LIKE 복사할_테이블명;** 쿼리는 테이블 구조를 복사할 때 제약조건까지 모두 복사한다.

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

### 데이터 및 제약조건 확인

```sql
SELECT COUNT(id) FROM new_crew_participant;  
SHOW CREATE TABLE new_crew_participant;  
SHOW INDEX FROM new_crew_participant;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007133000.png)

![](ComputerScience/Database/images/Pasted%20image%2020241007132657.png)

![](ComputerScience/Database/images/Pasted%20image%2020241007132824.png)


## 테스트

### Index 여부 확인

```sql
SHOW INDEX FROM crew_participant;
SHOW INDEX FROM new_crew_participant;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007133306.png)

### 프로파일링

```sql
SHOW VARIABLES LIKE '%profiling_history_size%';  
SET profiling_history_size = 2;  
SET PROFILING = 1;  
SELECT * FROM crew_participant WHERE crew_id = 1700 AND member_id = 300;  
SELECT * from new_crew_participant WHERE crew_id = 1700 AND member_id = 300;  
SET PROFILING = 0;  
SHOW PROFILES;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007133656.png)

### 사용하는 Index 확인

```sql
EXPLAIN SELECT * FROM crew_participant WHERE crew_id = 1700 AND member_id = 300;  
EXPLAIN SELECT * FROM new_crew_participant WHERE crew_id = 1700 AND member_id = 300;
```


![](ComputerScience/Database/images/Pasted%20image%2020241007134056.png)

![](ComputerScience/Database/images/Pasted%20image%2020241007134118.png)

