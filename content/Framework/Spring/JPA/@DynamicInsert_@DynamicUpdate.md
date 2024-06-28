---
title: "@DynamicInsert, @DynamicUpdate"
---

JPA 는 기본적으로 Insert 나 Update 쿼리를 날릴 때, 해당 Table 의 모든 Column 을 포함시킨다. 하지만 Table 이 커져 Column 이 많아지면 이는 성능에 문제가 있을 수 있다. 하지만 JPA 의 구현체인 Hibernate 에서는 이를 해결하기 위해 `@DynamicInsert` 와 `@DynamicUpdate` 라는 것을 제공한다.

## @DynamicInsert
@DynamicInsert 를 사용하기 전에는 영속성객체의 일부 필드만 채워도 모든 Insert 시 모든 Column 이 명시되어 들어간다.

```java
@Test  
public void dynamicInsertTest() {  
    // given  
    Member member = Member.builder()  
            .email(new Email("revi1337@naver.com"))  
            .nickname(new Nickname("닉네임1"))  
            .userType(UserType.KAKAO)  
            .build();  
  
    // when & then  
    memberRepository.save(member);  
}
```

```sql
insert 
into
	member
	(address, email, nickname, password, user_type, id) 
values
	(?, ?, ?, ?, ?, default)
```


하지만 영속성객체의 클래스단에 `@DynamicInsert` 를 명시해주게 되면 영속성 객체에 명시한 필드(Column) 값만 Insert 되게 된다.

```java {1}
@DynamicInsert  
@Getter  
@NoArgsConstructor(access = AccessLevel.PROTECTED)  
@Entity  
public class Member {
	...
}
```

```sql
insert 
into
	member
	(email, nickname, user_type, id) 
values
	(?, ?, ?, default)
```

## @DynamicUpdate
@DynamicUpdate 를 사용하기 전에는 영속성객체의 특정 필드만 변경해도 Update 쿼리에 모든 Column 이 명시되어 들어간다.

```java
@Rollback(false)  
@Test  
public void dynamicUpdateTest() {  
    // given  
    Member member = Member.builder()  
            .email(new Email("revi1337@naver.com"))  
            .nickname(new Nickname("닉네임1"))  
            .password(new Password("123asdf@1"))  
            .userType(UserType.KAKAO)  
            .build();  
    memberRepository.save(member);  
  
    // when & then  
    member.updatePassword("asdaasasd");  
}
```

```sql
update
	member 
set
	address=?,
	email=?,
	nickname=?,
	password=?,
	user_type=? 
where
	id=?
```


하지만 @DynamicUpdate 를 영속성 객체의 Class 단에 명시하고 특정 필드만 변경하면, 변경한 필드(Column) 만 Update 되는 것을 확인할 수 있다.

```java {2}
@DynamicInsert  
@DynamicUpdate  
@Getter  
@NoArgsConstructor(access = AccessLevel.PROTECTED)  
@Entity  
public class Member {
	...
}
```

```sql
update
	member 
set
	password=? 
where
	id=?
```
