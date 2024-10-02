---
title: Upsert 쿼리를 통한 쿼리 단순화
tags: ['jpa', 'data-jpa', 'jdbc']
---

## Upsert
UPSERT 쿼리는 DB 에서 Row 를 `INSERT` 하려고 시도할 때, `동일한 Key 가 존재하면 UPDATE`하고, `존재하지 않으면 INSERT` 하는 쿼리이다. DBMS 마다 Upsert 쿼리가 조금씩 다르므로 주의해야 한다.

### 장점
1. **코드 간결화**: 삽입과 갱신을 하나의 쿼리로 처리할 수 있으므로, 별도의 `INSERT` 와 `UPDATE` 를 작성하지 않아도 된다.
2. **경합 조건 방지**: 일반적으로 `SELECT` 후 `INSERT` 또는 `UPDATE` 를 수행하는 방식에서는 경합 조건(Concurrency Issue)이 발생할 수 있다. 하지만 UPSERT 는 하나의 원자적(atomic) 작업으로 수행되므로, 경합 조건을 어느정도 방지할 수 있다. (동시성 문제가 발생할 수 있음.)
3. **성능 최적화**: 하나의 쿼리로 삽입과 업데이트를 처리하기 때문에, 두 번의 데이터베이스 왕복을 피할 수 있다. 
4. **중복 처리**: 데이터 중복을 자동으로 처리하므로, 중복 키가 발생했을 때 별도의 예외 처리를 구현할 필요가 없다.

### 단점
1. **성능 저하 가능성**: 일부 상황에서 UPSERT 는 일반적인 `INSERT` 나 `UPDATE` 보다 성능이 떨어질 수 있다. 특히 중복 키 충돌이 자주 발생할 경우, 내부적으로 추가 검증 작업을 수행해야 하므로 성능 저하가 있을 수 있다.
2. **복잡한 인덱스 관리**: UPSERT 쿼리는 인덱스를 활용하기 때문에, 특히 많은 인덱스가 존재하는 경우 추가적인 인덱스 작업이 필요할 수 있다. 이로인해 성능 저하가 발생할 수 있다.
3. **DBMS 종속성**: UPSERT 는 DBMS 마다 구현하는 방식이 다르다. 따라서 DB 간 이식성이 떨어질 수 있다.
    

## DBMS
### MySQL & H2
MySQL 과 H2 에서의 Upsert 쿼리는 아래와 같이 `ON DUPLICATE KEY UPDATE` 구문을 사용하는 Syntax 를 갖는다.

```sql
INSERT INTO table_name (column1, column2) VALUES (value1, value2) ON DUPLICATE KEY UPDATE column1 = value1, column2 = value2;
```

### PostgreSQL
PostgreSQL 에서의 Upsert 쿼리는 아래와 같이 `ON CONFLICT` 구문을 사용하는 Syntax 를 갖는다.

```sql
INSERT INTO table_name (column1, column2) VALUES (value1, value2) ON CONFLICT (unique_column) DO UPDATE SET column1 = value1, column2 = value2;
```

### Oracle
Oracle 에서의 Upsert 쿼리는 아래와 같이 `MERGE INTO` 구문을 사용하는 Syntax 를 갖는다.

```sql
MERGE INTO table_name t
USING (SELECT value1 AS col1, value2 AS col2 FROM dual) s
ON (t.unique_column = s.col1)
WHEN MATCHED THEN
    UPDATE SET t.column2 = s.col2
WHEN NOT MATCHED THEN
    INSERT (column1, column2) VALUES (s.col1, s.col2);
```


### SQLite
SQLite 에서의 Upsert 쿼리는 아래와 같이 `INSERT OR REPLACE` 구문을 사용하는 Syntax 를 갖는다.

```sql
INSERT OR REPLACE INTO table_name (column1, column2)
VALUES (value1, value2);
```

## Spring
현재 진행하고 있는 프로젝트의 DBMS 는 H2 와 MySQL 이기 떄문에 `ON DUPLICATE KEY UPDATE` 를 사용하여 `Upsert` 쿼리를 수행할 수 있다.

### JdbcTemplate
스프링에서 제공하는 고수준 JDBC API 인 `JdbcTemplate` 으로 Upsert 쿼리를 날릴수 있다. `PreparsedStatement` 로 파라미터 바인딩을 하고 `GeneratedKeyHolder` 로 생성되는 PK 를 받아올 수 있게 구현하면 된다.

```java
@RequiredArgsConstructor  
@Repository  
public class CrewParticipantJdbcRepository {  
  
    private final JdbcTemplate jdbcTemplate;  
  
    public CrewParticipant upsertCrewParticipant(Long crewId, Long memberId, LocalDateTime now) {  
        String sql = "INSERT INTO crew_participant (crew_id, member_id, request_at)" +  
                " VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE request_at = ?";  
  
        KeyHolder generatedKeyHolder = new GeneratedKeyHolder();  
        int influenced = jdbcTemplate.update(connection -> {  
            PreparedStatement preparedStatement = connection.prepareStatement(sql, new String[]{"id"});  
            preparedStatement.setLong(1, crewId);  
            preparedStatement.setLong(2, memberId);  
            preparedStatement.setObject(3, now);  
            preparedStatement.setObject(4, now);  
            return preparedStatement;  
        }, generatedKeyHolder);  
  
        return new CrewParticipant(  
                generatedKeyHolder.getKey().longValue(),  
                Crew.builder().id(crewId).build(),  
                Member.builder().id(memberId).build(),  
                now  
        );  
    }  
}
```

### NamedParameterJdbcTemplate
물론 `NamedParameterJdbcTemplate` 로도 Upsert 쿼리를 날릴 수 있다. 조금 더 편하게 파라미터 바인딩을 도와주는 `MapSqlParameterSource` 와 PK 를 받아오는 `GeneratedKeyHolder` 를 사용하면 된다.

```java
@RequiredArgsConstructor  
@Repository  
public class CrewParticipantJdbcRepository {  
  
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;  
  
    public CrewParticipant upsertCrewParticipant(Long crewId, Long memberId, LocalDateTime now) {  
        String sql = "INSERT INTO crew_participant (crew_id, member_id, request_at)" +  
                " VALUES (:crew_id, :member_id, :request_at) ON DUPLICATE KEY UPDATE request_at = :request_at";  
  
        KeyHolder generatedKeyHolder = new GeneratedKeyHolder();  
        SqlParameterSource mapSqlParameterSource = new MapSqlParameterSource()  
                .addValue("crew_id", crewId)  
                .addValue("member_id", memberId)  
                .addValue("request_at", now);  
  
        int influenced = namedParameterJdbcTemplate.update(sql, mapSqlParameterSource, generatedKeyHolder);  
  
        return new CrewParticipant(  
                generatedKeyHolder.getKey().longValue(),  
                Crew.builder().id(crewId).build(),  
                Member.builder().id(memberId).build(),  
                now  
        );  
    }  
}
```

### DataJPA
물론 DataJPA 의 쿼리 메서드로도 Upsert 쿼리를 날릴 수 있다. 단, JPA 에서 지원해주는 쿼리가 아니기 때문에 `nativeQuery` 를 on 해주어야 한다. 그리고 `INSERT`, `UPDATE`, `DELETE` 를 직접 사용하기 때문에 `@Modifiying` 을 꼭 붙여 주어야 한다.

> @Modifying 의 flushAutomatically 와 clearAutomatically 는 상황에 맞춰서 사용해주면 된다.  해당 내용은 해당 포스팅과 전혀 관련 없는 내용이기 떄문에 자세한 내용은 생략한다.

```java
@Modifying  
@Query(  
        value = "INSERT INTO crew_participant (crew_id, member_id, request_at) VALUES" +  
                " (:crewId, :memberId, :now) ON DUPLICATE KEY UPDATE request_at = :now",  
        nativeQuery = true  
)  
void upsertCrewParticipant(Long crewId, Long memberId, LocalDateTime now);
```

