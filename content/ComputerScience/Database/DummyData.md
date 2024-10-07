---
title: 더미 데이터를 생성하는 방법
tags: ['database', 'procedure', 'mock']
---

## 들어가며
SQL 에서 성능체크 및 쿼리 튜닝을 하려면 테스트를 위한 더미데이터가 필요합니다. 해당 포스팅에서는 이러한 더미 데이터를 보다 쉽게 만들 수 있는 방법을 소개하고자 합니다.

## DDL 정의
제일 먼저 테스트 데이터를 저장할 Table 을 만들어주기 위한 DDL 을 아래와 같이 작성합니다.

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

## Dummy 데이터 삽입
앞서 만들어준 Table 에 하나하나 insert 쿼리를 여러번 날리는 것은 매우 비효율적입니다. 하지만 Procedure 를 사용하면 이를 개선시켜줄 수 있습니다.

> Procedure 는 프로그래밍 언어에서의 Function(함수) 이라고 생각하면 됩니다.
### Procedure 생성
프로시저 안에서는 `while` 문을 사용해서 반복적으로 insert 쿼리를 날려줄 수 있습니다. 사용할 Variable idx 를 1 로 초기화해주고, 각 Loop 마다 초기화된 idx 를 +1 시켜 2000 까지 키워갈 수 있습니다. 따라서 해당 프로시저에서는 `member` 테이블에 `2000` 개의 row 가 삽입되게 됩니다.

```sql
DELIMITER $$  
DROP PROCEDURE IF EXISTS member_loop $$  
CREATE PROCEDURE member_loop()  
BEGIN  
    DECLARE idx INT DEFAULT 1;  
    WHILE idx <= 2000  
        DO  
            INSERT INTO member(nickname, created_at)  
            VALUES  
                (CONCAT('n_', idx), NOW());  
  
            SET idx = idx + 1;  
        END WHILE;  
END $$  
DELIMITER ;
```


아래 프로시저도 마찬가지입니다. 아래의 프로시저는 `crew`  테이블에 `2000` 개의 row 를 삽입하게 됩니다.

```sql
DELIMITER $$  
DROP PROCEDURE IF EXISTS crew_loop $$  
CREATE PROCEDURE crew_loop()  
BEGIN  
    DECLARE idx INT DEFAULT 1;  
    WHILE idx <= 2000  
        DO  
            INSERT INTO crew(name, created_at, updated_at)  
            VALUES  
                (CONCAT('n_', idx), NOW(), NOW());  
  
            SET idx = idx + 1;  
        END WHILE;  
END $$  
DELIMITER ;
```


아래 프로시저는 좀 복잡해 보이지만 별로 다를게 없습니다. 단지, member 와 crew 의 총 개수를 변수로 할당해주고, 2중 While 문을 사용했을 뿐입니다. 따라서 `crew_participant` 테이블에는 총 `400 만개` 의 row 를 삽입하게 됩니다.

> 해당 작업은 매우 오래걸리는 작업입니다. 400 만개를 insert 하는 시간은 맥북 M3 Pro 기준 20 분이 소요되었습니다. 해당 쿼리는 5000 개 정도로 끊어서 batch insert 하는 방향으로 최적화 시킬 수있을 것 같습니다.

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

### Procedure 실행
앞서 정의한 `member_loop`, `crew_loop`, `crew_participant_loop` 프로시저는 `CALL` 예약어로 실행시킬 수 있습니다.

```sql
CALL member_loop;  
CALL crew_loop;  
CALL crew_participant_loop;
```

## 결과 확인
3 개의 프로시저를 모두 수행하면 차례대로 `2000, 2000, 4000000` 개의 데이터가 insert 되어있는 것을 확인할 수 있습니다.

```sql
SELECT COUNT(id) FROM member  
UNION ALL SELECT COUNT(id) FROM crew  
UNION ALL SELECT COUNT(id) FROM crew_participant;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007131018.png)

## 마치며
테스트 데이터가 복잡하지 않다면 SQL 의 Procedure 를 사용하여 더미 데이터를 쉽게 만들 수 있습니다. 항상 INSERT 문을 복사하거나 [Mockaroo](https://www.mockaroo.com/) 에서 테스트 데이터를 가져왔었는데, 새로운 방법을 알게되어 기분이 매우 좋습니다.
