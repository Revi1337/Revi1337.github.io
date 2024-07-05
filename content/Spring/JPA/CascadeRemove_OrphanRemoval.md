---
title: Cascade.REMOVE, orphanRemoval 비교
---

## Cascade.ALL 사용
우선 부모와 자식의 코드는 아래와 같다. Parent 와 Child 에 양방향 매핑을 걸어주었고, Parent 가 Child 의 모든 생명주기를 관리하기 위해 영속성 전이 옵션을 `CascadeType.ALL` 로 설정하였다. 다 알겠지만 CascadeType.ALL 은 {CascadeType.PERSIST, CascadeType.REMOVE} 와 같다.

```java
@Getter  
@NoArgsConstructor(access = AccessLevel.PROTECTED)  
@Entity  
public class Parent {  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.IDENTITY)  
    private Long id;  
  
    private String name;  
  
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)  
	private final Set<Child> children = new HashSet<>();
  
    public Parent(String name) {  
        this.name = name;  
    }  
  
    public void addChild(Child... childs) {  
        for (Child c : childs) {  
            children.add(c);  
            c.addParent(this);  
        }  
    }  
}


@Getter  
@NoArgsConstructor(access = AccessLevel.PROTECTED)  
@Entity  
public class Child {  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.IDENTITY)  
    private Long id;  
  
    private String name;  
  
    @ManyToOne(fetch = FetchType.LAZY)  
    @JoinColumn(name = "parent_id", nullable = false)  
    private Parent parent;  
  
    public Child(String name) {  
        this.name = name;  
    }  
  
    public void addParent(Parent parent) {  
        this.parent = parent;  
    }  
}
```

### 부모 자체를 delete
우선 `부모 영속성 객체` 자체를 delete 하는 경우를 알아보자.

```java {24}
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)  
@DataJpaTest(showSql = false)  
class ParentRepositoryTest {  
  
    @Autowired ParentRepository parentRepository;  
    @Autowired ChildRepository childRepository;  
  
    @Rollback(false)  
    @Test  
    @DisplayName("부모 delete 를 테스트한다.")
    public void deleteTest() {  
        Parent parent1 = new Parent("부모 1");  
        Parent parent2 = new Parent("부모 2");  
        Child child1 = new Child("자식 1");  
        Child child2 = new Child("자식 2");  
        Child child3 = new Child("자식 3");  
        Child child4 = new Child("자식 4");  
        Child child5 = new Child("자식 5");  
        Child child6 = new Child("자식 6");  
  
        parent1.addChild(child1, child2, child3);  
        parent2.addChild(child4, child5, child6);  
        parentRepository.saveAll(List.of(parent1, parent2));  
  
        parentRepository.delete(parent1);  
    }  
}
```


부모 객체 자체를 delete 했을 때 발생하는 쿼리를 보면, 영속성 전이로 인해 parent1 에 속한 3 개의 `Child 들이 먼저 지워지고 맨 마지막에 parent1 가 지워지는` 총 4개의 delete 쿼리가 나가는 것을 볼 수 있다. 이는 parent1 에 속한 Child 의 개수만큼 delete 쿼리가 나간다는 의미이므로 네트워크 IO 가 많이 발생하여 성능에 영향이 있을 수 있다.

```text
    delete     # 자식
    from
        child 
    where
        id=?
        
        
    delete     # 자식
    from
        child 
    where
        id=?
        
        
    delete     # 자식 
    from
        child 
    where
        id=?
        
        
    delete     # 마지막에 부모 
    from
        parent 
    where
        id=?
```

### 부모를 통한 자식 제거
그렇다면 이제 부모 영속성객체를 통해 자식을 삭제하는 경우를 알아보자.

```java {25}
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)  
@DataJpaTest(showSql = false)  
class ParentRepositoryTest {  
  
    @Autowired ParentRepository parentRepository;  
    @Autowired ChildRepository childRepository;  
  
    @Rollback(false)  
	@Test  
	@DisplayName("부모를 통해 자식 삭제를 테스트한다.")  
	public void deleteTest2() {  
	    Parent parent1 = new Parent("부모 1");  
	    Parent parent2 = new Parent("부모 2");  
	    Child child1 = new Child("자식 1");  
	    Child child2 = new Child("자식 2");  
	    Child child3 = new Child("자식 3");  
	    Child child4 = new Child("자식 4");  
	    Child child5 = new Child("자식 5");  
	    Child child6 = new Child("자식 6");  
	  
	    parent1.addChild(child1, child2, child3);  
	    parent2.addChild(child4, child5, child6);  
	    parentRepository.saveAll(List.of(parent1, parent2));  
	  
	    parent1.getChildren().remove(child2);  
	}
}
```


이번에는 insert 쿼리만 나갔을 뿐, delete 쿼리는 한개도 나가지 않는 것을 볼 수 있다. 이 이유는 부모와 자식의 연결 관계가 끊어진다해도 자식을 삭제하지 않기 떄문이다. 여기서 Parent 를 통해 remove 된 Child 를 `고아객체` 라고 한다.

>[!note]
>부모와 자식의 연결관계가 끊어진다라는 것은 Parent 가 갖고있는 `private final Set<Child> children = new Hashset()` 에서 Child 한개를 remove() 하는 것을 의미한다.

```text
	... 생략


	insert 
    into
        child
        (name, parent_id, id) 
    values
        (?, ?, default)
        
        
    insert 
    into
        child
        (name, parent_id, id) 
    values
        (?, ?, default)
```

이러한 고아객체까지 함께 지우고 싶을 때 사용하는 것이 `orphanRemoval` 옵션이다.

## Cascade.PERSIST, orphanRemoval 사용
orphanRemoval 옵션은 Parent 와 Child 의 연결관계가 끊어진 `고아객체` 까지 함께 지우고 싶을 때 사용하는 옵션이라고 앞서 언급했다. 이번엔 Parent 는 내비두고 Child 에 걸린 @OneToMany 에서 cascade 옵션을 PERSIST 만 남겨두고 orphanRemoval 옵션을 true 로 설정해주자.

```java {12}
@Getter  
@NoArgsConstructor(access = AccessLevel.PROTECTED)  
@Entity  
public class Parent {  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.IDENTITY)  
    private Long id;  
  
    private String name;  
  
    @OneToMany(mappedBy = "parent", cascade = CascadeType.PERSIST, orphanRemoval = true)  
    private final Set<Child> children = new HashSet<>();  
  
    public Parent(String name) {  
        this.name = name;  
    }  
  
    public void addChild(Child... childs) {  
        for (Child c : childs) {  
            children.add(c);  
            c.addParent(this);  
        }  
    }  
}
```

### 부모 자체를 delete
이제 orphanRemoval 을 설정하고 `부모 영속성 객체` 자체를 delete 하는 경우를 다시 봐보자.

```java {24}
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)  
@DataJpaTest(showSql = false)  
class ParentRepositoryTest {  
  
    @Autowired ParentRepository parentRepository;  
    @Autowired ChildRepository childRepository;  
  
    @Rollback(false)  
    @Test  
    @DisplayName("부모 delete 를 테스트한다.")
    public void deleteTest() {  
        Parent parent1 = new Parent("부모 1");  
        Parent parent2 = new Parent("부모 2");  
        Child child1 = new Child("자식 1");  
        Child child2 = new Child("자식 2");  
        Child child3 = new Child("자식 3");  
        Child child4 = new Child("자식 4");  
        Child child5 = new Child("자식 5");  
        Child child6 = new Child("자식 6");  
  
        parent1.addChild(child1, child2, child3);  
        parent2.addChild(child4, child5, child6);  
        parentRepository.saveAll(List.of(parent1, parent2));  
  
        parentRepository.delete(parent1);  
    }  
}
```


생성된 쿼리를 보면, 앞서 CascadeType.ALL 를 달아주고 부모 자체를 delete 한 경우와 동일한 것을 볼 수 있다. 이 뜻은 고아객체 제거옵션을 의미하는 `orphanRemoval 가 Cascade.REMOVE 의 역할도 하는 것`을 알 수 있다.

```text
    delete     # 자식
    from
        child 
    where
        id=?
        
        
    delete     # 자식
    from
        child 
    where
        id=?
        
        
    delete     # 자식 
    from
        child 
    where
        id=?
        
        
    delete     # 마지막에 부모 
    from
        parent 
    where
        id=?
```

### 부모를 통한 자식 제거
그렇다면 orphanRemoval 을 설정하였을 때, 부모 영속성객체를 통해 자식을 삭제하는 경우를 알아보자.

```java {25}
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)  
@DataJpaTest(showSql = false)  
class ParentRepositoryTest {  
  
    @Autowired ParentRepository parentRepository;  
    @Autowired ChildRepository childRepository;  
  
    @Rollback(false)  
	@Test  
	@DisplayName("부모를 통해 자식 삭제를 테스트한다.")  
	public void deleteTest2() {  
	    Parent parent1 = new Parent("부모 1");  
	    Parent parent2 = new Parent("부모 2");  
	    Child child1 = new Child("자식 1");  
	    Child child2 = new Child("자식 2");  
	    Child child3 = new Child("자식 3");  
	    Child child4 = new Child("자식 4");  
	    Child child5 = new Child("자식 5");  
	    Child child6 = new Child("자식 6");  
	  
	    parent1.addChild(child1, child2, child3);  
	    parent2.addChild(child4, child5, child6);  
	    parentRepository.saveAll(List.of(parent1, parent2));  
	  
	    parent1.getChildren().remove(child2);  
	}
}
```


이번에는 약간 다른 것을 볼 수 있다. 앞서 CascadeType.ALL 만 설정했을때는 Parent 에서 끊어진 Child (고아객체) 가 지워지지 않았지만, CascadeType.PERSIST, orphanRemoval = true 를 설정했을 때는 고아객체까지 지워주는 것을 확인할 수 있다.

```text
	... 생략


	insert 
    into
        child
        (name, parent_id, id) 
    values
        (?, ?, default)
        
        
    delete     # 컬렉션에서 제거된 고아객체가 제거됨.
    from
        child 
    where
        id=?
```

## 비교 결과
CascadeType.ALL 과 CascadeType.PERSIST, orphanRemoval = true 를 비교해본 결과를 테이블로 나타내자면 아래와 같이 나타낼 수 있다.

|                                           | 부모 삭제 시 | 부모를 통한 자식을 제거 (고아 객체 제거) |
| ----------------------------------------- | :-----: | :----------------------: |
| CascadeType.ALL                           |    O    |            X             |
| CascadeType.PERSIST, orphanRemoval = true |    O    |            O             |

## 주의점
CascadeType.PERSIST 는 몰라도, 영속성 전이 옵션중 하나인 CascadeType.REMOVE 와 CascadeType.REMOVE, 고아객체 제거 기능을 담당하는 orphanRemoval 옵션을 사용할 때는 주의해야할 것이 있다. 

- Parent 와 Child 가 있다고 했을 때, Child 에 단 하나의 Parent 가 연관되어 있어야 한다는 것이다. (Parent 가 Child 를 단일 소유)

예를 들어 Parent, AnotherParent, Child 가 있다고 치면 Child 는 Parent 혹은 AnotherParent 에만 연관되어있어야 한다는 것이다. 만약 Child 가 Parent 와 AnotherParent 모두에게 연관되어있다면 Child 를 삭제할 상황이 아닌데도, Parent 로 인해 삭제된 Child 로 인해  AnontherParent 에 영향이 갈 수 있다.

## 정리
- 고아객체란 Parent 가 갖고있는 Child 컬렉션에서 지워진 객체를 의미한다.
- orphanRemoval 은 Cascade.REMOVE 기능 + 고아객체의 제거까지 수행한다.

## 내 생각
CascadeType.ALL 을 사용하든 CascadeType.PERSIST, orphanRemoval = true 을 사용하든, Parent 에 속하거나 연관된 Child 들의 개수만큼 delete 쿼리가 나가는 것은 똑같다고 생각한다. Parent 에 속한 Chld 의 개수가 많으면 많을 수록 delete 쿼리는 많아질것이고, 이로 인해 네트워크 IO 비용이 매우 커져 언젠가 성능에 이슈가 있을거라고 생각한다.


뭐 상황에 따라 다르긴 하겠지만, 나였으면 영속성 전이 옵션인 Cascade 를 사용한다면 PERSIST 까지만 사용하고, REMOVE 와 같은 경우에는 DB 내부에서 delete cascade 를 걸어주는 `@OnDelete` 를 사용할 것 같다. 또한, orphanRemoval 기능은 따로 구현할 것 같다.

## Reference
[우테코 기술 블로그](https://tecoble.techcourse.co.kr/post/2021-08-15-jpa-cascadetype-remove-vs-orphanremoval-true/)

책 : 자바 ORM 표준 JPA 프로그래밍
