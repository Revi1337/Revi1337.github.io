---
title: 2차 캐시를 이용한 카테고리 캐싱
tags: ['jpa', 'second-cache', '1nf']
---

프로젝트를 하다가 프론트엔드 한명이 `카테고리`를 DB 에 관리해달라는 요구사항이 들어왔다. 어짜피 `카테고리별 조회 기능도 없고, 카테고리를 추가할 수 없는 기능도 없는데.. 굳이?` 라는 생각이 들었지만, 요구사항이니 그냥 하기로 했고 그 과정을 적고자 한다.

## 1차 정규화
기존 Category 는 따로 영속성 객체로 관리하지 않고, `카테고리1,카테고리2,카테고리3` 처럼 하나의 컬럼에 도메인값을 저장할 수 있게 했다. 하지만, 카테고리를 별도의 Table 에서 관리하기로 하였기 때문에 1차 정규화를 하기로 했다.

### CategoryType
카테고리가 동적으로 추가될 수 있다는 요구사항은 없었기 때문에, Enum 을 이용하여 허용 가능한 카테고리를 선언해주는것은 변함이 없다. 하지만 기존과 달라진 점은 pk 라는 필드를 정의해주었다는 것이다. 이는 해당 필드를 이용하여 CategoryType 을 사용하는 Entity 의 PK 를 정의하기 위해서이다.

```java
@Getter  
@RequiredArgsConstructor  
public enum CategoryType {  
  
	... 생략
	
    ESCAPEROOM("방탈출", 25L),  
    MANGACAFE("만화카페", 26L),  
    VR("VR", 27L),  
    
    ... 생략
  
    private final String text;  
    private final Long pk;  
  
    private static final Map<String, CategoryType> categoryHashMap = Collections.unmodifiableMap(new HashMap<>() {  
        { unmodifiableLists().forEach(category -> put(category.getText(), category)); }  
    });  
  
    public static List<CategoryType> unmodifiableLists() {  
        return List.of(CategoryType.values());  
    }  
  
    public static List<CategoryType> fromTexts(List<String> categoryTexts) {  
        return new LinkedHashSet<>(categoryTexts).stream()  
                .map(CategoryType::mapFromText)  
                .peek(CategoryType::validateCategory)  
                .collect(Collectors.toList());  
    }  
  
    public static CategoryType mapFromText(String categoryText) {  
        return categoryHashMap.get(categoryText);  
    }  
  
    private static void validateCategory(CategoryType categoryType) {  
        if (categoryType == null) {  
            throw new IllegalArgumentException("일치하지 않는 카테고리가 존재합니다.");  
        }  
    }  
}
```

### Category
CategoryType 을 이용하는 Category 엔티티를 새로 만들어준다. 그리고 Category 의 PK 는 CategoryType 의 pk 필드를 이용하여 직접 명시적으로 선언해준다.

```java
@Getter  
@NoArgsConstructor(access = AccessLevel.PROTECTED)  
@Entity  
public class Category {  
  
    @Id  // @GeneratedValue 쓰지 않음.
    private Long id;  
  
    @Enumerated(EnumType.STRING)  
    @Column(nullable = false)  
    private CategoryType categoryType;  
  
    private Category(CategoryType categoryType) {  
        this.id = categoryType.getPk();  
        this.categoryType = categoryType;  
    }  
  
    public static List<Category> fromCategoryTypes(List<CategoryType> categoryTypes) {  
        return categoryTypes.stream()  
                .map(Category::fromCategoryType)  
                .collect(Collectors.toList());  
    }  
  
    public static Category fromCategoryType(CategoryType categoryType) {  
        return new Category(categoryType);  
    }  
  
    @Override  
    public boolean equals(Object o) {  
        if (this == o) return true;  
        if (!(o instanceof Category category)) return false;  
        return id != null && Objects.equals(getId(), category.getId());  
    }  
  
    @Override  
    public int hashCode() {  
        return Objects.hashCode(getId());  
    }  
}
```

## JPA 2차 캐시 설정

```groovy
implementation 'org.springframework.boot:spring-boot-starter-cache'  
implementation 'org.ehcache:ehcache:3.10.0'  
implementation 'org.hibernate:hibernate-jcache:6.5.2.Final'  
implementation 'javax.cache:cache-api:1.1.1'
```


```yml
jpa:  
  properties:  
    hibernate:  
      generate_statistics: true  
      cache:  
        use_query_cache: false  
        use_second_level_cache: true  
        factory_class: org.hibernate.cache.jcache.internal.JCacheRegionFactory  
    javax:  
      persistence:  
        sharedCache:  
          mode: ENABLE_SELECTIVE
```
