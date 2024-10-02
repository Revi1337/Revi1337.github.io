---
title: Query & Transaction 로그 설정
tags: ['jpa', 'jdbc', 'log']
---
## Query 및 Transaction 로그
해당 포스팅에서는 JDBC와 JPA에서 쿼리 및 트랜잭션 로그를 확인하기 위한 설정 방법을 다룹니다.
### Query
**logging.level.org.springframework.jdbc**
- Jdbc 만의 SQL 로그 레벨을 지정한다. `DEBUG`

**logging.level.org.hibernate.SQL**
- Hibernate 만의 SQL 로그 레벨을 지정한다. `DEBUG`

**logging.level.org.hibernate.orm.jdbc.bind**
- Hibernate SQL 에 바인딩되는 파라미터를 확인할 수 있다. `TRACE`

>  참고로 logging.level.org.springframework.jdbc 와 logging.level.org.hibernate.SQL 를 합친것이 logging.level.sql 이다. 즉, Hibernate, Jdbc 를 모두 포함한 SQL 로그 레벨을 지정할 수 있다. 

### Transaction
**logging.level.org.springframework.transaction.interceptor**
- Transaction 의 시작(Getting Transaction) 과, 끝(Completing Transaction) 로그를 확인할 수 있다. `TRACE`
- 하지만, `Transaction 이 Commit 되는지 Rollback 되는지 확인할 수 없다`. 해당 로그는 각 데이터접근 기술이 사용하는 `TransactionManager` 의 로그 레벨을 지정해주어야 한다.

**logging.level.org.springframework.jdbc.datasource.DataSourceTransactionManager**
- Jdbc 가 사용하는 TransactionManager 로그 레벨을 지정한다. `DEBUG`
- JDBC 기반의 Transaction 이 `Commit 되는지 Rollback 되는지 확인 가능`하다.

**logging.level.org.springframework.orm.jpa.JpaTransactionManager**
- Jpa 가 사용하는 TransactionManager 로그 레벨을 지정한다. `DEBUG`
- JPA 기반의 Transaction 이 `Commit 되는지 Rollback 되는지 확인 가능`하다.

```yml
logging:  
  level:  
    org:  
      springframework.transaction.interceptor: TRACE                         
      springframework.jdbc.datasource.DataSourceTransactionManager: DEBUG    
      springframework.orm.jpa.JpaTransactionManager: DEBUG                   
  
      springframework.jdbc: DEBUG                                            
      hibernate.SQL: DEBUG                                                   
      hibernate.orm.jdbc.bind: TRACE                                         
```

