---
title: Batch Insert
tags: ['jpa', 'jdbc']
---

## Batch Insert
Batch Insert 는 `하나의 Insert 문으로 대량의 데이터를 저장`시키는 것을 말한다. 당연하게도 이 Batch Insert 는 하나의 트랜잭션을 묶이게 된다.


```sql
--개별 Insert 3개--
insert into category (id, name) values (1, 'name1');
insert into category (id, name) values (2, 'name2');
insert into category (id, name) values (3, 'name3');

--Batch Insert--
insert into category (id, name) 
	values (1, 'name1'), (2, 'name2'), (3, 'name3');
```

## JPA Batch Insert
JPA 에서도 이런 Batch Insert 를 지원한다.


## JPA Batch Insert 한계

## Identity 에서 불가능한 이유
cvzxvcvasdf

## JDBC 를 사용하면 된다

