---
title: Spring Cache 추상화와 기본 캐싱
tags: ['spring', 'cache']
---

## Spring Cache
스프링에서는 `org.springframework.cache.Cache` 그리고 `org.springframework.cache.CacheManager` 를 사용하여 캐시 구현 기술에 종속되지 않도록 추상화된 서비스를 제공하고 있습니다. 그렇기 때문에 환경이 바뀌거나 적용할 캐시 기술을 변경하여도 애플리케이션 코드에 영향을 주지 않습니다.

### Cache
`org.springframework.cache.Cache` 는 Spring 에서 `캐시 기능을 추상화` 한 인터페이스입니다. Spring 애플리케이션에서의 모든 캐시는 해당 인터페이스를 통해 접근할 수 있습니다.

![](Spring/Cache/images/Pasted%20image%2020250227202927.png)


Spring 에서 제공하는 Cache 의 구현체 여러가지가 존재합니다.

Cache 인터페이스의 구현체 중 하나인 ConcurrentMapCache 를 예로 들겠습니다. `Car` 이라는 캐시가 있으면

![](Spring/Cache/images/Pasted%20image%2020250227230548.png)

### CacheManager

## Spring Cache 설정
### @EnableCaching 추가
스프링에서 제공하는 Annotation 기반의 캐시 서비스를 이용하려면 Bean 스캔 범위 안에서 `@EnableCaching` 을 설정해주어야합니다. 

```java
@EnableCaching  
@SpringBootApplication  
public class StressTestBasicApplication {  
  
    public static void main(String[] args) {  
        SpringApplication.run(StressTestBasicApplication.class, args);  
    }  
}
```


조금 더 딥하게 들어가보면 @EnableCaching 내부 `CachingConfigurationSelector` 라는 ImportSelector 로 인해 `ProxyCachingConfiguration` 설정파일이 동작하게 됩니다. 결국 `BeanFactoryCacheOperationSourceAdvisor` 라는 Bean 이 최종적으로 등록되어 AOP 기반 캐시 서비스를 이용할 수 있게 됩니다. 

![](Spring/Cache/images/Pasted%20image%2020241231003742.png)

### CacheManager Bean 설정
@EnableCaching 으로 설정을 추가한 후, 캐시를 관리해줄 `CacheManager` 타입의 Bean 을 등록해주어야 합니다. 스프링에서 기본적으로 제공하는 CacheManager 들은 아래와 같습니다. 더 자세한 내용은 [공식문서](https://docs.spring.io/spring-framework/reference/integration/cache/store-configuration.html) 를 참고하면 좋을 것 같습니다.

- ConcurrentMapCacheManager: Java 의 ConcurrentHashMap 을 사용하는 캐시 매니저
- SimpleCacheManager: 기본적으로 제공하는 캐시가 없어 사용할 캐시를 직접 등록하여 사용하기 위한 캐시 매니저
- CompositeCacheManager: 1개 이상의 캐시 매니저를 사용하도록 지원해주는 혼합 캐시 매니저
- EhCacheCacheManager: ~~Java 의 유명한 캐시 프레임워크 중 하나인 EhCache를 지원하는 캐시 매니저~~ **EhCache 3.x 부터는 JSR-107 을 완벽준수하기 때문에 JCacheCacheManager 를 참조**
- CaffeineCacheManager: Java 8로 Guava 캐시를 재작성한 캐시 매니저
- JCacheCacheManager: JSR-107 기반의 캐시를 사용하는 캐시 매니저

> [!note] JSR- 107
> JSR 은 Java Specification Request 을 의미합니다.  즉, JSR-107 은 자바 기반 애플리케이션에서 캐싱을 표준화하기 위한 인터페이스와 규칙을 정의한 명세서를 의미합니다. JSR-107 을 따르는 대표적인 Java Caching API 가 JCache 입니다.


외부 의존성이 필요한 EhCacheCacheManager, CaffeineCacheManager, JCacheCacheManager 를 제외한 나머지 CacheManager 들이 JDK 에 있는것을 확인하실 수 있습니다.

![](Spring/Cache/images/Pasted%20image%2020241231011846.png)


어떠한 설정도 하지 않았을 때의 기본으로 등록되는 CacheManager 는 `ConcurrentMapCacheManager` 입니다. CacheManager 가 등록되는 순서를 보려면 `CacheAutoConfiguration`, `CacheConfigurationImportSelector`, `CacheConfigurations`, `SimpleCacheConfiguration` 에서 BreakPoint 를 찍고 분석해보시면 됩니다.

![](Spring/Cache/images/Pasted%20image%2020241231013000.png)

## Spring Cache 사용
Spring 에서 사용할 수 있는 Annotation 기반 캐시는 [공식문서](https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html) 에서 더 자세하게 살펴볼 수 있습니다.

### @Cacheable
`@Cacheable` 어노테이션으로 메서드의 결과를 캐싱할 수 있습니다. 메서드의 두번째 호출부터는 실제로 메서드를 호출하지 않고도 값을 반환할 수 있습니다. 아래 코드에서 `sayHello` 가 캐시이름, `testString 의 값` 이 Key 가 되게 됩니다. 당연히 Value 는 `메서드의 리턴값`이 됩니다. 

```java
@Cacheable("sayHello")  
public String sayHello(String testString) {  
    
}
```


또한, @Cacheable 값으로 여러 캐시이름을 명시하여, 메서드의 결과를 여러개의 캐시에 캐싱할 수도 있습니다.

```java
@Cacheable({"sayHello", "sayHello2"})  
public String sayHello() {  
    
}
```


만약 메서드의 매개변수가 없다면 0 이라는 디폴트 값을 Key 로 사용하게 됩니다. 아래의 코드는 sayHello 라는 캐시이름에 Key 가 0 인 캐시를 저장 및 조회하는 코드가 됩니다.

```java
@Cacheable("sayHello")  
public String sayHello() {  
    
}
```


기본적으로 메서드의 매개변수가 하나면, 해당 매개변수를 캐시의 Key 사용합니다. 그리고 메서드의 매개변수가 두개 이상이면 모든 매개변수들의 hashCode 를 조합하여 Key 를 만들어 Key 로 사용하게 됩니다. 해당 내용은 [여기](https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html#cache-annotations-cacheable-default-key)서 확인할 수 있습니다.

```java
@Cacheable("book")  
public String findBook(String isbn, Long bookNo) {  
    
}
```


매개변수가 여러개인 상황에서, 하나의 매개변수만을 Key 로 사용하고 싶거나, 원하는 매개변수들만을 조합하여 Key 로 사용하고 싶을땐 SpEL(Spring Expression Language) 을 사용할 수 있습니다. 또한, SpEL 로 Wrapper 타입의 매개변수의 특정 프로퍼티값에도 접근하여 key 로 사용할 수 있습니다.

```java
@Cacheable(cacheNames = "book", key = "#isbn")  
public String findBook(String isbn, Long bookNo, int count) {  

}

@Cacheable(cacheNames = "book", key = "{#isbn,#bookNo}")  
public String findBook(String isbn, Long bookNo, int count) {  
    
}

@Cacheable(cacheNames = "book", key = "#isbn.value")  
public String findBook(ISBN isbn, Long bookNo, int count) {  
    
}
```


마지막으로 @Cacheable 은 조건부 캐싱을 지원합니다. 아래와 같이 Key 가 특정 Condition 을 만족할 경우에만 캐싱할 수 있도록 작성할 수 있습니다.

```java
@Cacheable(cacheNames = "book", key = "#isbn.value", condition = "#isbn.value.equals(#bookNo.toString())")  
public void condionalBook(ISBN isbn, Long bookNo) {  

}
```
### @CachePut
새로운 캐시로 갱신만 하고 싶다면 `@CachePut` 어노테이션을 사용할 수 있습니다. `@Cacheable` 은 캐싱 여부에 따라 메서드 호출여부가 결정되는 반면, `@CachePut` 은 메서드가 항상 호출되고, 그 결과만 새로운 캐시로 갱신한다는 점에서 차이가 있습니다. 

### @CacheEvict
캐시의 삭제는 `@CacheEvict` 를 사용할 수 있습니다. 특정 이름의 캐시를 지우고 싶다면 아래와 같이 작성해줄 수 있습니다.

```java
@CacheEvict(cacheNames = "book")  
public void deleteBook() {  
}
```


또한, SpEL 로 Reference 인스턴스의 프로퍼티에 접근하여 특정 캐시의 Key 에 해당하는 캐시만 지워줄 수 있습니다.

```java
@CacheEvict(cacheNames = "book", key = "#isbn.value")  
public void deleteBook(ISBN isbn) {  
}
```


특정 캐시에 저장된 모든 값들을 지우고 싶으면 아래와 같이 작성해줄 수 있습니다.

```java
@CacheEvict(cacheNames = "book", allEntries = true)  
public void deleteBook() {  
}
```


만약, 일정한 주기로 특정 캐시를 지우고 싶다몀 @Scheduled 와 병행하여 사용할 수 있습니다. 물론 `@EnableScheduling` 로 [Scheduling](Spring/Scheduling.md) 을 활성화시키는 것을 잊지 말아야합니다. 

```java
@Scheduled(initialDelay = 10, fixedRate = 3, timeUnit = TimeUnit.SECONDS)  
@CacheEvict(cacheNames = "book", allEntries = true)  
public void scheduledDeleteCache() {  
}
```

