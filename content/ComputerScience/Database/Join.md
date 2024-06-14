---
title: Join
---

## Join
- Join 은 `서로 다른 데이터 테이블을 연결하는 것`
- `공통적으로 존재하는 Key(Column) 이 있다면, Join 할 수 있다.`
- 보통 ID 값을 Key 로 많이 사용하고, 특정 범위(예 : Date) 로 Join 도 가능하다.

## Join 을 해야하는 이유
- 관계형 데이터베이스 (RDBMS) 설계시 정규화 과정을 거치기 때문이다.

> [!note] 정규화
> 정규화는 중복을 최소화하게 데이터를 구조화하는 작업. User 테이블에는 유저 데이터만, Order 테이블에는 주문 데이터만, 따라서 데이터를 다양한 Table 에 저장해서 필요할 때 Join 해서 사용

## Join 의 종류와 이해
Join 의 종류에는 5가지가 있다. Join 을 설명하기 위해 아래의 테이블이 있다고 가정한다.

![](ComputerScience/Database/images/Pasted%20image%2020240613171903.png)

### (INNER) JOIN
두 테이블의 공통 요소만 연결

1. LEFT 테이블과 RIGHT 테이블에 공통된 Key 가 있는 row 들을 이어붙인다.

![](ComputerScience/Database/images/Pasted%20image%2020240613180040.png)

### LEFT/RIGHT (OUTER) JOIN
왼쪽/오른쪽 테이블 기준으로 연결한다.

**LEFT (OUTER) JOIN**

1. 왼쪽(LEFT) 에 있는 테이블을 그대로 둔다.
2. 오른쪽(RIGHT) 테이블에서 LEFT 테이블과 동일한 Key 를 갖는 row 를 뽑아 `LEFT 테이블에 이어붙인다.`

![](ComputerScience/Database/images/Pasted%20image%2020240613172119.png)

**RIGHT (OUTER) JOIN**

1. 오른쪽(RIGHT) 에 있는 테이블을 그대로 둔다.
2. 왼쪽(LEFT) 테이블에서 RIGHT 테이블과 동일한 Key 를 갖는 row 를 뽑아 `RIGHT 테이블에 이어붙인다.`

![](ComputerScience/Database/images/Pasted%20image%2020240613173156.png)

### FULL (OUTER) JOIN
양쪽 기준으로 연결한다. (모두 NULL 인 row 가 있을 수 있다.)

1. LEFT 테이블과 RIGHT 테이블의 모든 Key 들을 적는다.
2. LEFT 테이블과 RIGHT 테이블의 모든 row 를 붙인다.

![](ComputerScience/Database/images/Pasted%20image%2020240613173737.png)

### CROSS JOIN
두 테이블의 각각의 요소를 곱하는 개념이다 (카르테시안 곱). LEFT 테이블의 row 수가 3이고 RIGHT 테이블의 row 수가 3이면 CROSS JOIN 한 후의 row 의 수는 (3 * 3 = 9) 이다. CROSS 조인은 모든 조합이 필요할 때 사용된다.

![](ComputerScience/Database/images/Pasted%20image%2020240613175532.png)

## Join 문법
JOIN 의 기본적인 Syntax 는 아래와 같다. `JOIN`  절에는 자신이 원하는 JOIN 의 종류를 써주면 된다. 또한 `ON` 은 `두 테이블을 합칠때 기준이 되는 Key` 를 설정하는 역할을 한다. (Join Key 라고 보면 된다.)

```sql
SELECT
	*
FROM
	left_table as l     # FROM 절의 Table 이 LEFT 테이블이 된다.
LEFT JOIN 
	right_table as r    # JOIN 절의 Table 이 RIGTH 테이블이 된다.
ON
	l.key = r.key
```

> [!note] CROSS JOIN 을 제외하고 ON 절이 필요하다.
> CROSS 조인을 제외한 나머지 조인들은 모두 ON 절이 필요하다.


또한 중요한것은 JOIN 은 한번 뿐이 아닌, 여러번 이어붙일 수 있다는 것이다. 이 때, 이어붙이는 테이블의 기준은 `ON` 절로 결정난다.

```sql
SELECT
	*
FROM
	left_table as l     
LEFT JOIN 
	right_table as r
ON
	l.key = r.key       # 해당 부분까지의 결과가 LEFT Table 이 되고 dummy 의 col 들이 붙게 된다.
LEFT JOIN
	dummy_table as dummy
ON
	dummy.key = l.key  
```

## Queries
트레이너가 보유한 포켓몬들은 얼마나 있는지 알 수 있는 쿼리를 작성해주세요.

```sql
SELECT
	p.kor_name,
	COUNT(p.id) as pokemon_cnt
FROM
	(
		SELECT
			*
		FROM
			basic.trainer_pokemon
		WHERE
			trainer_pokemon.status in ('Active', 'Training')
	) as tp
LEFT JOIN
	basic.pokemon as p
ON
	tp.pokemon_id = p.id
GROUP BY
	p.kor_name
ORDER BY
	pokemon_cnt DESC
```


각 트레이너가 가진 포켓몬 중에서 'Grass' 타입의 포켓몬 수를 계산해주세요. (단, 편의를 위해 type1 기준으로 계산해주세요)

```sql
SELECT
	p.type1,
	COUNT(tp.id) AS pokemon_cnt
FROM
	(
		SELECT
			id,
			trainer_id,
			pokemon_id,
			status
		FROM
			basic.trainer_pokemon
		WHERE
			status IN ("Active", "Training")
	) AS tp
LEFT JOIN
	basic.pokemon AS p
ON
	tp.pokemon_id = p.id
WHERE
	type1 = "Grass"
GROUP BY
	type1
ORDER BY
	2 DESC
```


트레이너의 고향(hometown) 과 포켓몬을 포획한 위치(location) 을 비교하여, 자신의 고향에서 포켓몬을 포획한 트레이너의 수를 계산해주세요.

```sql
SELECT
	COUNT(DISTINCT tp.trainer_id) AS trainer_uniq
FROM
	basic.trainer_pokemon as tp
INNER JOIN
	basic.trainer as t
ON
	tp.trainer_id = t.id
WHERE
	t.hometown = tp.location
```

Master 등급의 트레이너들은 어떤 타입의 포켓몬을 제일 많이 보유하고 있을까요?

```sql
SELECT
	p.type1,
	COUNT(tp.id) AS pokemon_cnt
FROM
	(
		SELECT
			*
		FROM
			basic.trainer_pokemon
		WHERE
			status IN ('Active', 'Training')
	) as tp
INNER JOIN
	basic.trainer as t
ON
	tp.trainer_id = t.id
INNER JOIN
	basic.pokemon as p
ON
	tp.pokemon_id = p.id
WHERE
	t.achievement_level = 'Master'
GROUP BY
	type1
ORDER BY
	2 DESC
LIMIT
	1
```


인천 출신 트레이너들은 1세대, 2세대 포켓몬을 각각 얼마나 보유하고 있나요?

```sql
SELECT
	p.generation,
	COUNT(p.id) AS pokemon_cnt
FROM
	(
		SELECT
			*
		FROM
			basic.trainer_pokemon
		WHERE
			status IN ('Active', 'Training')
	) as tp
INNER JOIN
	basic.trainer as t
ON
	tp.trainer_id = t.id
INNER JOIN
	basic.pokemon as p
ON
	tp.pokemon_id = p.id
WHERE
	t.hometown = 'Incheon'
AND
	p.generation in (1, 2)
GROUP BY
	generation
```

