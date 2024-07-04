---
title: window function
---

프로젝트를 하면서 Window Function 의 `row_number()` 을 사용하게 될 일이 생겼다. 해당 포스팅에서는 QueryDSL 에서 Window Function 의 row_number() 을 사용하는 법에 대해 소개하려 한다.

## row_number 함수란
`ROW_NUMBER()` 는 특정한 Column 을 기준으로 같은 값을 갖고있는 row 에 `번호를 명시하는 함수`이다. 아래 쿼리는 comment 의 `parent_id` 가 같은 row 에 순서대로 번호를 명시하라는 것이다.

```sql
select
	c1_0.parent_id,
	c1_0.id,
	c1_0.content,
	c1_0.member_id,
	c1_0.crew_id,
	row_number() over(partition by c1_0.parent_id) as row_number
from
	comment c1_0 
join
	member m1_0 
		on m1_0.id=c1_0.member_id 
join
	crew c2_0 
		on c2_0.id=c1_0.crew_id 
where
	c1_0.parent_id in (1, 2, 3)
```


![](Spring/QueryDSL/images/Pasted%20image%2020240704165706.png)

## QueryDSL 이 사용하는 객체 소개
QueryDSL 은 JPQL 기반으로 동작하기 때문에 JPQL 에서 Window Function 을 지원해야 한다. 운이 좋게도 Hibernate 6 버전이상부터는 Window Function 을 제공한다 하기 때문에 사용할 수 있다. 하지만 QueryDSL 의 설정만으로는 부족하여 별도의 설정을 더 해주어야 한다. 설정을 하기 전, QueryDSL 에서 사용되는 내부 객체들을 조금 알아보자.

### Ops
Ops는 보다 유연한 Query 를 위해 제공되는 연산자이며, Enum 클래스로 정의되어 있다. 또한 해당 Ops 가 어떤 타입을 리턴하는지에 대한 값도 명시되어있다.

![](Spring/QueryDSL/images/Pasted%20image%2020240704181010.png)

### Template
Template 은 Ops 를 통해 어떠한 Query 로 변경시킬 것인가에 대한 쿼리 템플릿을 제공해주는 역할을 한다. 이러한 Template 에는 기본으로 사용될 템플릿들이 저장된 DEFAULT 인스턴스가 만들어져 있다.

![](Spring/QueryDSL/images/Pasted%20image%2020240704180231.png)


또한, 이 Template 이 초기화 될 때, add 연사를 통해 `IdentityHashMap<Operator, Template>` 에 저장되게 된다.

![](Spring/QueryDSL/images/Pasted%20image%2020240704180254.png)

### JPQLTemplate
JPQLTemplate 은 앞서 앞서 소개한 Template 을 확장한 클래스이다. 마찬가지로 해당 JPQLTemplate 이 초기화될때 add 메서드를 통해 `IdentityHashMap<Operator, Template>` 에 저장되게 된다. 이 JPQLTemplate 은 우리가 QueryDSL 을 사용할 때 만들게 되는 `JPAQueryFactory` 에서 내부적으로 사용된다.

![](Spring/QueryDSL/images/Pasted%20image%2020240704183542.png)


하지만 일반적으로 JPAQueryFactory 에는 EntityManger 하나만 넣어주게 되는데, 이렇게 되면JPAQueryFactory 가 사용할 template 에 null 이 들어가게 된다. 그렇기 때문에 이 상태로 `transform` 과 같은 것을 사용하게 되면 `Exception` 이 터지게 된다.

```java
@Configuration  
public class JpaQueryFactoryConfig {  
  
    @PersistenceContext  
    private EntityManager entityManager;  
  
    @Bean  
    public JPAQueryFactory jpaQueryFactory() {  
        return new JPAQueryFactory(entityManager);  
    }  
}
```

![](Spring/QueryDSL/images/Pasted%20image%2020240704173231.png)


이를 해결하려면 JPAQueryFactory 를 만들때, JPQLTemplate 을 추가적으로 넣어주어야 tranform 과 같은 다른 연산자들을 사용할 수 있다.

```java
@Configuration  
public class JpaQueryFactoryConfig {  
  
    @PersistenceContext  
    private EntityManager entityManager;  
  
    @Bean  
    public JPAQueryFactory jpaQueryFactory() {  
        return new JPAQueryFactory(JPQLTemplates.DEFAULT, entityManager);  
    }  
}
```

![](Spring/QueryDSL/images/Pasted%20image%2020240704182950.png)

## QueryDSL 설정 (방법 1) 
### 의존성 설치
우선 QueryDSL 에서 Window Function 을 사용하려면 Gradle 에 아래의 의존성을 설치해주어야 한다.

```groovy
implementation 'com.querydsl:querydsl-sql:5.1.0'
```

![](Spring/QueryDSL/images/Pasted%20image%2020240704170819.png)


해당 의존성을 설치해주면 `SQLOps` 와 `SQLExpressions` 가 생기게 되고, row_number() 를 사용하기 위한 Operation 이 정의되어 있다. 참고로 SQLOps 는 앞서 소개한 Ops 가 구현하고 있던 Operator 인터페이스를 구현한 클래스이다.

![](Spring/QueryDSL/images/Pasted%20image%2020240704185936.png)

### 커스텀 JPQLTemplate
하지만 QueryDSL 에서 바로 row_num() 을 사용하려하면 해당 메서드를 지원하지 않는다는 오류가 발생하게 된다.

![](Spring/QueryDSL/images/Pasted%20image%2020240704190514.png)

```java
List<Tuple> rn = jpaQueryFactory  
	.select(comment,  
			SQLExpressions.rowNumber()  
					.over()  
					.partitionBy(comment.parent.id)  
					.as("rn")  
	)  
	.from(comment)  
	.innerJoin(comment.member, member).fetchJoin()  
	.innerJoin(comment.crew, crew).fetchJoin()  
	.where(  
			comment.parent.id.in(1, 2, 3)  
	)  
	.fetch();
```

#### JPAQueryFactory 설정
이를 해결하기 위해 JPQLTemplate 을 상속하여 `SQLOps.ROWNUMBER` 와 Template 패턴을 `IdentityHashMap<Operator, Template>` 에 add 시켜주고, 해당 Template 을 JPAQueryFactory 에 추가해주어야 한다.

```java
@Configuration  
public class JpaQueryFactoryConfig {  
  
    @PersistenceContext  
    private EntityManager entityManager;  
  
    @Bean  
    public JPAQueryFactory jpaQueryFactory() {  
        return new JPAQueryFactory(new CustomJPQLTemplates(), entityManager);  
    }  
  
    static class CustomJPQLTemplates extends JPQLTemplates {  
  
        public CustomJPQLTemplates() {  
            add(SQLOps.ROWNUMBER, "row_number()");  
        }  
    }  
}
```

### 결과 확인
이제 아래와 같이 querydsl 코드를 작성하고 결과를 보게 되면

```java
List<Tuple> rn = jpaQueryFactory  
        .select(comment,  
                SQLExpressions.rowNumber()  
                        .over()  
                        .partitionBy(comment.parent.id)  
                        .as("rn")  
        )  
        .from(comment)  
        .innerJoin(comment.member, member).fetchJoin()  
        .innerJoin(comment.crew, crew).fetchJoin()  
        .where(  
                comment.parent.id.in(1, 2, 3)  
        )  
        .fetch();  
  
for (Tuple tuple : rn) {  
    Comment findComment = tuple.get(0, Comment.class);  
    System.out.println("parent comment id : " + findComment.getParent().getId());  
    System.out.println(String.format("---> comment id : %d, row_number : %d \n", findComment.getId(), tuple.get(1, Long.class)));  
}
```


row_number() 가 잘 나가는 것을 확인할 수 있고, rn 의 결과가 잘 나오는 것을 볼 수 있다.

```text
select
	좀 많아 생략,
	row_number() over(partition by c1_0.parent_id) 
from
	comment c1_0 
join
	member m1_0 
		on m1_0.id=c1_0.member_id 
join
	crew c2_0 
		on c2_0.id=c1_0.crew_id 
where
	c1_0.parent_id in (?, ?, ?)
```

```	
parent comment id : 1
---> comment id : 6, row_number : 1 

parent comment id : 1
---> comment id : 7, row_number : 2 

parent comment id : 1
---> comment id : 8, row_number : 3 

parent comment id : 1
---> comment id : 9, row_number : 4 

parent comment id : 2
---> comment id : 10, row_number : 1 

parent comment id : 2
---> comment id : 11, row_number : 2 

parent comment id : 2
---> comment id : 12, row_number : 3 

parent comment id : 2
---> comment id : 13, row_number : 4 

parent comment id : 3
---> comment id : 14, row_number : 1 

parent comment id : 3
---> comment id : 15, row_number : 2 

parent comment id : 3
---> comment id : 16, row_number : 3 

parent comment id : 3
---> comment id : 17, row_number : 4 
```


## Blaze  Expressions 설정 (방법 2)
### 의존성 설치
`querydsl-sql` 을 사용한 방법은 커스텀 `JQPLTemplate` 을 만들어서  직접 SQLOps 와 Template 패턴을 `IdentityHashMap<Operator, Template>` 에 넣어주어야 했다. 하지만, `blaze-persistence-integration` 를 사용하면 이러한 별도의 설정 없이 row_number() 를 사용할 수 있다.

```groovy
implementation 'com.blazebit:blaze-persistence-integration-querydsl-expressions-jakarta:1.6.11'
```

### JPAQueryFactory 설정
해당 의존성을 설치하였으면 JPAQueryFactory 를 만들 때 `JPQLNextTemplates.DEFAULT` 를 넣어주면 된다.

```java
@Configuration  
public class JpaQueryFactoryConfig {  
  
    @PersistenceContext  
    private EntityManager entityManager;  
  
    @Bean  
    public JPAQueryFactory jpaQueryFactory() {  
        return new JPAQueryFactory(JPQLNextTemplates.DEFAULT, entityManager);
    }  
}
```


이제  SQLExpressions 가 아니라 `JPQLNextExpressions` 를 사용하여 쿼리를 작성해주면 된다. 이것이 좋은점은 Order By 를 사용할 수 있다는 것이다.

```java {3,5}
List<Tuple> rn = jpaQueryFactory  
		.select(comment,  
				JPQLNextExpressions.rowNumber()  
						.over()  
						.partitionBy(comment.parent.id)  
						.orderBy(comment.createdAt.desc())  
						.as("rn")  
		)  
		.from(comment)  
		.innerJoin(comment.member, member).fetchJoin()  
		.innerJoin(comment.crew, crew).fetchJoin()  
		.where(  
				comment.parent.id.in(1, 2, 3)  
		)  
		.fetch();  
  
for (Tuple tuple : rn) {  
	Comment findComment = tuple.get(0, Comment.class);  
	System.out.println("parent comment id : " + findComment.getParent().getId());  
	System.out.println(String.format("---> comment id : %d, row_number : %d \n", findComment.getId(), tuple.get(1, Long.class)));  
}
```


이것이 가능한 이유는 `blaze-persistence-integration` 를 설치하고나서 생기는 `JPQLNextTemplates` 때문이다. JPQLNextTemplates 는 JPQLTemplates 를 확장한 클래스이기 때문에, JPQLTemplates 이 갖고있는 Template 도 갖고있고, JPQLNextTemplates 만이 갖고 있는 Template 들이 생성자에서 초기화 되기 때문이다. 


ROW_NUMBER 에 대한 템플릿이 추가되어있는 것을 볼 수 있으며

![](Spring/QueryDSL/images/Pasted%20image%2020240704203437.png)


또한, 물론 Order By 에 대한 템플릿도 추가되어있다.

![](Spring/QueryDSL/images/Pasted%20image%2020240704203508.png)

## 둘다 사용 (방법 3)
`querydsl-sql` 과 `Blaze Expressions` 를 둘다 사용하려면 JPQLNextTemplates 를 확장해주고, querydsl-sql 의 템플릿을 추가시켜주면 된다.

```java
@Configuration  
public class JpaQueryFactoryConfig {  
  
    @PersistenceContext  
    private EntityManager entityManager;  
  
    @Bean  
    public JPAQueryFactory jpaQueryFactory() {  
        return new JPAQueryFactory(new CustomJPQLTemplates(), entityManager);
    }

	static class CustomJPQLTemplates extends JPQLNextTemplates {  
	  
	    public CustomJPQLTemplates() {  
	        add(SQLOps.ROWNUMBER, "row_number()"); // querydsl-sql 꺼
	    }  
	}
}
```
## Reference
https://velog.io/@eora21/QueryDSL%EC%97%90%EC%84%9C-Window-Function%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B2%95#window-function

https://programmingnote.tistory.com/85

https://stackoverflow.com/questions/40744385/querydsl-4-with-rownumber-window-function

https://stackoverflow.com/questions/30797892/querydsl-window-functions

https://www.tabnine.com/code/java/methods/com.querydsl.sql.WindowFunction/partitionBy

https://m.blog.naver.com/leejongcheol2018/222042407888

https://javadoc.io/doc/com.blazebit/blaze-persistence-integration-querydsl-expressions/latest/com/blazebit/persistence/querydsl/package-summary.html

https://www.baeldung.com/blaze-persistence-tutorial

https://www.inflearn.com/chats/912845/%EB%A7%8C%EB%A3%8C%EB%90%9C-%EB%A9%94%EC%84%9C%EB%93%9C-fetchresult-blaze-persistence-%EC%84%B8%ED%8C%85-%EA%B4%80%EB%A0%A8-%EA%B8%80-%EA%B3%B5%EC%9C%A0%EB%93%9C%EB%A6%BD%EB%8B%88%EB%8B%A4

https://persistence.blazebit.com/documentation/1.6/core/manual/en_US/#subquery-in-from-clause

