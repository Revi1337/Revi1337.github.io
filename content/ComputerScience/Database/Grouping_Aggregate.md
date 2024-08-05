---
title: Grouping, Aggregate
---

## GroupBy & Aggregate
**GROUP BY**

- 같은 값끼리 모아서 그룹화하는 역할을 한다.
- `특정 컬럼을 기준`으로 모으면서 다른 컬럼에서 집계가 가능하다. (sum, avg, max, min , count 등)

**HAVING**

- 그룹 집계 후 작동하는 Operation
- WHERE 과 HAVING 이 헷갈릴 수 있다.

> [!note] HAVING vs WHERE
> WHERE : 원본 데이터 FROM 절에 있는 데이터에 조건을 설정하고 싶은 경우 (집계 전 사용됨)
> HAVING : GROUP BY 와 함께 집계 결과에 조건에 설정하고 싶은 경우 (집계 후 사용됨)

**COUNT, COUNTIF, SUM, MAX, MIN, AVG**

- 이러한 Operation 을 집계함수라고 한다.
- 집계함수는 `GROUP BY` 와 같이 사용된다. 집계하는 기준(Column) 이 없으면 `COUNT` 만 쓸 수 있으나, `집계하는 기준이 있다면 그 기준 컬럼을 GROUP BY 에 써주어야 한다.`
- `COUNTIF` 는 `COUNT + WHERE` 을 의미하며, 집계된 Row 들에서 하나의 Column 에 대해 WHERE 을 사용하는 것과 같다.
- 참고로 COUNTIF 는 MYSQL 에서는 존재하지 않는다.

## Queries
포켓몬 중에 type2 가 없는 포켓몬의 수를 작성하는 쿼리를 작성해주세요.

```sql

SELECT
	count(id) as pokemon_count
FROM
	basic.pokemon
WHERE
	type2 is NULL;
```


type2 가 없는 포켓몬의 type1 과 type1 의 포켓몬 수를 알려주는 쿼리를 작성해주세요. 단 type1 의 포켓몬 수가 큰 순으로 정렬해주세요.

```sql 
SELECT
	type1,
	COUNT(id) as counter
FROM
	basic.pokemon
WHERE
	type2 is NULL
GROUP BY
	type1
ORDER BY
	counter DESC;
```


type2 상관없이 type1 의 포켓몬 수를 알 수 있는 쿼리를 작성해주세요.

```sql
SELECT
	type1,
	COUNT(id) as counter
FROM
	basic.pokemon
GROUP BY
	type1;
```


전설 여부에 따른 포켓몬 수를 알 수 있는 쿼리를 작성해주세요.

```sql
SELECT
	is_legendary,
	COUNT(id) as counter
FROM
	basic.pokemon
GROUP BY
	is_legendary;
```


동명이인이 있는 이름은 무엇일까요?

```sql
SELECT
	name,
	COUNT(NAME) as trainer_cnt
FROM
	basic.trainer
GROUP BY
	name
HAVING
	COUNT(name) >= 2


-- 혹은 SubQuery

SELECT
	*
FROM
	(
		SELECT
			name,
			COUNT(name) as trainer_cnt
		FROM
			basic.trainer
		GROUP BY
			name
	)
WHERE
	trainer_cnt >= 2
```


trainer 테이블에서 Iris, Whitney, Cynthia 트레이너의 정보를 알 수 있는 쿼리르 작성해주세요

```sql
SELECT
	*
FROM
	basic.trainer
WHERE
	name in ('Iris', 'Whitney', 'Cynthia');
```


전체 포켓몬 수는 얼마나 되나요?

```sql
SELECT
	COUNT(id) as pokemon_cnt
FROM
	basic.pokemon;
```


generation 별로 포켓몬 수가 얼마나 되는지 알 수 있는 쿼리를 작성하세요.

```sql
SELECT
	generation,
	COUNT(id) as pokemon_cnt
FROM
	basic.pokemon
GROUP BY
	generation;
```


type2 가 존재하는 포켓몬의 수는 얼마나 되나요?

```sql
SELECT
	COUNT(id) as pokemon_cnt
FROM
	basic.pokemon
WHERE
	type2 IS NOT NULL
```


type2 가 있는 포켓몬 중에 제일 많은 type1 은 무엇일까요?

```sql
SELECT
	type1,
	COUNT(type1) AS counter
FROM
	basic.pokemon
WHERE
	type2 IS NOT NULL
GROUP BY
	type1
ORDER BY
	counter DESC
LIMIT
	1;
```


단일 (하나의 타입만 있는) 타입 포켓몬 중 많은 type1 은 무엇일까요?

```sql
SELECT
	type1,
	COUNT(id) as counter
FROM
	basic.pokemon
WHERE
	type2 IS NULL
GROUP BY
	type1
ORDER BY
	counter DESC
LIMIT
	1;
```


포켓몬의 이름에 "파" 가 들어가는 포켓몬을 어떤 포켓몬이 있을까요?

```sql
SELECT
	kor_name
FROM
	basic.pokemon
WHERE
	kor_name LIKE "%파%";
```


뱃지가 6개 이상인 트페이너는 몇명이 있나요?

```sql
SELECT
	COUNT(id) as trainer_cnt
FROM
	basic.trainer
WHERE
	badge_count >= 6;
```


트레이너가 보유한 포켓몬(trainer_pokemon) 이 제일 많은 트레이너는 누구일까요?

```sql
SELECT
	trainer_id,
	COUNT(pokemon_id) AS pokemon_count
FROM
	basic.trainer_pokemon
GROUP BY
	trainer_id
ORDER BY
	pokemon_count DESC;
```


포켓몬을 많이 풀어준 트레이너는 누구일까요?

```sql
SELECT
	trainer_id,
	COUNT(pokemon_id) as counter
FROM
	basic.trainer_pokemon
WHERE
	status = 'Released'
GROUP BY
	trainer_id
ORDER BY
	counter DESC
LIMIT
	1;
```


트레이너 별로 풀어준 포켓몬의 비율이 20% 가 넘는 포켓몬 트레이너는 누구일까요?

```sql
SELECT
	trainer_id,
	COUNTIF(status = 'Released') AS released_cnt, # 풀어준 포켓몬의 수
	COUNT(pokemon_id) AS pokemon_cnt,
	COUNTIF(status = 'Released') / COUNT(pokemon_id) AS released_ratio
FROM
	basic.trainer_pokemon
GROUP BY
	trainer_id
HAVING
	released_ratio >= 0.2
```
