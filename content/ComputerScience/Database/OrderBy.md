---
title: Order
---

## Order By
- Order By 는 출력될 Row 들에서 특정한 Column 을 기준으로 오름차순 정렬 혹은 내림차순 정렬을 정의하는 역할을 한다.
- 내림차순을 의미하는 `DESC` 와 오름차순을 의미하는 `ASC` 가 있다.

### DESC
DESC 는 특정 Column 을 기준으로 내림차순 정렬을 하는 역할을 한다.

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
	counter DESC;
```

### ASC
ASC 는 특정 Column 을 기준으로 오름차순 정렬을 하는 역할을 한다.

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
	counter ASC;
```

### Tip
Order By 는 Order By 절에 `명시한 특정 Column 을 기준`으로 오름차순 혹은 내림차순 정렬을 진행한다. 하지만 이 말고도 `Select 절에 명시한 Column 의 순서 기준`으로도 정렬을 수행할 수 있다.

```sql
SELECT
	trainer_id,                   # 1
	COUNT(pokemon_id) as counter  # 2
FROM
	basic.trainer_pokemon
WHERE
	status = 'Released'
GROUP BY
	trainer_id
ORDER BY
	2 DESC;      # counter 를 기준으로 내림차순하겠다는 의미
```
