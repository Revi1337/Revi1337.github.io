---
title: Like
---

## Like
- 말 뜻 그대로 ~와 같은 포맷을 찾을 수 있는 Operation 이다.
- 한 글자는 나타내는 `_`  와  ~ 로 시작 혹은 끝을 의미하는 `%` 가 있다.

### _ 의 사용
Like 절에서  `_` 는 `한 글자` 를 의미한다. 따라서 kor_name 이 한글자인 Row 만 찾을 수 있다.

```sql
SELECT
	*
FROM
	basic.pokemon
WHERE
	kor_name LIKE '_';
```


당연하게 아래의 쿼리는 kor_name 이 2글자인 Row 만 찾는 것이 된다.

```sql
SELECT
	*
FROM
	basic.pokemon
WHERE
	kor_name LIKE '__';
```

### % 의 사용
Like 절에서  `%` 는 `~ 로 끝나거나 시작하는` 의미로 사용될 수 있다. 이를 응용하면 특정 Character 를 포함하는 형태도 구현 가능하다.

<br>

kor_name 이 '포' 로 시작하는 Row 를 찾는 쿼리를 짤 수 있다.

```sql
SELECT
	*
FROM
	basic.pokemon
WHERE
	kor_name LIKE '포%';
```


마찬가지로 '타' 로 끝나는 Row 를 찾는 쿼리를 짤 수 있다.

```sql
SELECT
	*
FROM
	basic.pokemon
WHERE
	kor_name LIKE '%타';
```


이를 응용하여 특정 Character 를 포함하는 Row 를 찾는 쿼리도 짤 수 있다.

```sql
SELECT
	*
FROM
	basic.pokemon
WHERE
	kor_name LIKE '%카%';
```
