---
title: Select
---

```sql
-- 1. trainer 테이블에 있는 모든 데이터를 보여주는 SQL 쿼리를 작성하세요.

SELECT
	*
FROM basic.trainer;
```

```sql
-- 2. trainer 테이블에 있는 트레이너의 name 을 출력하는 쿼리를 작성해주세요

SELECT
	name
FROM basic.trainer;
```

```sql
-- 3. trainer 테이블에 있는 name, age 를 출력하는 쿼리를 작성해주세요.

SELECT
	name,
	age
FROM basic.trainer;
```

```sql
-- 4. trainer 테이블에서 id가 3인 트레이너의 name, age, hometown 을 출력하는 쿼리를 작성해주세요.

SELECT
	name,
	age,
	hometown
FROM 
	basic.trainer
WHERE
	id = 3;
```

```sql
-- 5. trainer 테이블에서 피카츄의 공격력와 체력을 확인할 수 있는 쿼리를 작성해주세요.

SELECT
	attack,
	hp
FROM
	basic.pokemon
WHERE
	kor_name = '피카츄'
```

