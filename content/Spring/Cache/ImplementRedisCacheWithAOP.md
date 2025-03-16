---
title: RedisTemplate 과 AOP 를 활용한 @Cacheable 구현과 성능 비교
tags: ['spring', 'cache', 'redis']
---

## 들어가며
안녕하세요. 어느날 갑자기 "왜 내가 이미 만들어놓은 RedisCacheManger 와 @Cacheable 을 사용해서 편하게 캐싱해야하지?" 라는 주제넘은 생각을 하게 되었습니다. 그래서.. 이번 포스팅에서는 Spring AOP 와 RedisTemplate 을 이용하여 `RedisCacheManager`와 `@Cacheable` 을 사용한 것과 동일한 방식으로 캐시 기능을 구현해보고, 캐싱하지 않았을 때와 성능을 비교해보겠습니다.


## Annotation
제일 먼저 `@RedisCache` 어노테이션을 만듭니다. 각 속성들은 `@Cacheable` 어노테이션과 최대한 비슷하게 작성해줄 수 있습니다.

- name : 캐시의 Base 이름을 의미합니다.
- key :  특정 캐시 항목을 구분하는 `Identifier` 역할을 합니다.
- ttl : 만료시간을 설정합니다.
- TimeUnit : ttl 에 적용할 시간 기준을 선택합니다. (시, 분, 초)
- cacheEmptyCollection : 메서드의 결과가 Collection 일때, empty 해도 캐싱할 것인인지 여부를 결정합니다.

```java
@Retention(RetentionPolicy.RUNTIME)  
@Target({ElementType.METHOD})  
public @interface RedisCache {  
  
    String name() default "";  
  
    String key();  
  
    long ttl() default 1;  
  
    TimeUnit unit() default TimeUnit.MINUTES;  
  
    boolean cacheEmptyCollection() default true;  
  
}
```


## Aspect Class
캐싱을 적용할 메서드를 지정하는 `Pointcut` 과 캐싱하고자하는 메서드 전후로 실행되는 `Adivce` 를 합친 `Aspect` 클래스를 생성합니다. 실행되는 모든 메서드에 `@RedisCache` 어노테이션이 명시되어있으면 해당 메서드는 캐싱의 대상이 됩니다. Aspect 클래스의 흐름은 다음과 같습니다.

1. 앞서 생성한 `RedisCache` 어노테이션과, 캐싱하려는 메서드의 메타데이터가 담겨있는 `ProceedingJoinPoint` 를 이용하여 Redis `Key` 를 생성합니다.
2. 실제로 Redis 와 통신하여 캐싱된 데이터를 가져옵니다.
3. 만약 캐싱된 데이터가 있다면, 데이터를 객체로 역직렬화하고 반환합니다.
4. 만약 캐싱된 데이터가 없다면, 캐싱의 대상이 되는 `실제 메서드를 invoke` 하고 메서드의 결과를 전달받습니다.
5. 반환된 결과를 토대로 `실제로 캐싱을 해야하는 데이터인지` 판단합니다.
6. 판단 결과에 따라 Redis 에 Set 을 할지 말지 판단합니다.

```java
@Aspect  
@RequiredArgsConstructor  
@Component  
public class RedisCacheAspect {  
  
    private static final String DELIMITER = ":";  
    private static final String CACHE_NAME_PREFIX = "onsquad" + DELIMITER;  
    private final SpelExpressionParser spelExpressionParser = new SpelExpressionParser();  
    private final RedisTemplate<String, Object> redisTemplate;  
    private final ObjectMapper objectMapper;  
  
    @Around("@annotation(redisCache)")  
    public Object handleRedisCache(ProceedingJoinPoint joinPoint, RedisCache redisCache) { 
        String redisKey = generateRedisKey(joinPoint, redisCache);  
        Object cachedData = redisTemplate.opsForValue().get(redisKey);  
        if (cachedData != null) {  
            return deserializeCachedData(joinPoint, cachedData);  
        }  
        try {  
            Object result = joinPoint.proceed();  
            if (shouldCache(redisCache, result)) {  
                redisTemplate.opsForValue().set(redisKey, result, calculateTtl(redisCache));  
            }  
            return result;  
        } catch (Throwable e) {  
            throw new IllegalArgumentException("Error executing method " + joinPoint.getSignature().getName());  
        }  
    }  

	// 뒤에서 설명할 예정
}
```


## Generate Redis Key
해당 메서드는 Redis 의 Key 를 생성하는 역할을 합니다. Spring 에서 제공하는 @Cacheable 의 key 속성에서도 SPEL 을 사용할 수 있기 때문에, 이를 구현한 것입니다.

> 실제로 Spring Cache 는 내부적으로 CacheOperationExpressionEvaluator, CachedExpressionEvaluator, TemplateAwareExpressionParser 를 이용하여 SPEL 을 평가합니다.

- `ProceedingJoinPoint` 과 `MethodSignature` 를 이용하여 Method 의 매개변수들과 이름을 추출합니다.
- `Spring Expression Language(SPEL)` 파싱을 위헤 `StandardEvaluationContext` 생성합니다. 그리고 Method 의 매개변수들과 이름을 `setVariable` 을 통해 SpEL에서 사용할 수 있도록 등록합니다.
- `SpelExpressionParser` 를 이용하여 `redisCache.key()` 에 지정한 SPEL 을 평가하고 값을 가져옵니다.
- 이를 기반으로 `CACHE_NAME_PREFIX + redisCache.name() + DELIMITER + expressionValue` 형태의 Redis Key 를 생성합니다.

```java
private String generateRedisKey(ProceedingJoinPoint joinPoint, RedisCache redisCache) {  
    MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();  
    StandardEvaluationContext standardEvaluationContext = new StandardEvaluationContext();  
    String[] paramNames = methodSignature.getParameterNames();  
    Object[] args = joinPoint.getArgs();  
    for (int i = 0; i < paramNames.length; i++) {  
        standardEvaluationContext.setVariable(paramNames[i], args[i]);  
    }  
    Expression expression = spelExpressionParser.parseExpression(redisCache.key());  
    String expressionValue = expression.getValue(standardEvaluationContext, String.class);  
    return CACHE_NAME_PREFIX + redisCache.name() + DELIMITER + expressionValue;  
}
```


## Deserialize Cached Data
해당 메서드는 캐시된 데이터를 역직렬화(deserialize) 하는 역할을 수행합니다. 매개변수로 들어온 `cachedData` 를 `메서드의 반환 타입에 맞게 변환`합니다.  (반환타입에 따라 변환하는 과정이 좀 번거롭습니다)

1. `MethodSignature` 에서 메서드의 반환 타입을 확인하고, Generic 타입이 있다면 이를 추출합니다.
2. 만약 반환 타입이 제네릭 타입을 포함하지 않는다면, 단순히 `objectMapper.convertValue`를 사용하여 캐시된 데이터를 반환 타입으로 변환합니다.
3. 제네릭 타입이 있을 경우, 제네릭 타입에 맞게 `원시 클래스(예: List, Map)` 와 `제네릭 내부 클래스(제네릭 파라미터 클래스)`를 추론하고, 이를 기반으로 `objectMapper`를 사용하여 역직렬화합니다.

```java
private Object deserializeCachedData(ProceedingJoinPoint joinPoint, Object cachedData) {  
    MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();  
    ParameterizedType genericReturnType = resolveGenericReturnType(methodSignature);  
    if (genericReturnType == null) {  
        return objectMapper.convertValue(cachedData, methodSignature.getReturnType());  
    }  
  
    Type genericOuterClass = genericReturnType.getRawType();  
    Class<?> genericInternalClass = guessGenericInternalClass(genericReturnType);  
    JavaType javaType = determineJavaTypeForGeneric(genericOuterClass, genericInternalClass);  
    return objectMapper.convertValue(cachedData, javaType);  
}  
```


`method.getGenericReturnType()` 을 통해 메서드의 반환 타입이 Generic 타입인지를 확인하고, Generic 타입이 있을 경우 이를 반환합니다.

```java
private ParameterizedType resolveGenericReturnType(MethodSignature methodSignature) {  
    Method method = methodSignature.getMethod();  
    if (method.getGenericReturnType() instanceof ParameterizedType parameterizedType) {  
        return parameterizedType;  
    }  
    return null;  
}
```


Generic 타입의 실제 타입 파라미터를 추출하여 반환합니다.

```java
private Class<?> guessGenericInternalClass(ParameterizedType genericReturnType) {  
    for (Type typeArgument : genericReturnType.getActualTypeArguments()) {  
        if (typeArgument instanceof Class<?> actualType) {  
            return actualType;  
        }  
    }  
    return null;  
}
```


해당 메서드는 `Generic 타입을 처리하기 위한 역할` 을 수행합니다. 보다 정확히는, `Type` 객체와 `Class<?>` 객체를 이용해 복잡한 Generic 타입을 적절히 역직렬화할 수 있도록 `JavaType`을 생성하는 역할을 합니다. 한마디로 해당 메서드는 주어진 Generic 타입에 맞는 `JavaType` 을 결정하여, `objectMapper` 에서 해당 타입으로 데이터를 변환할 수 있게 합니다.

- 메개변수 `genericOuterClass` 는 Generic 타입의 `외부 클래스`를 나타냅니다. 예를 들어, `List` 나 `Map` 과 같은 클래스를 의미합니다.
- 메개변수 `genericInternalClass` 는 Generic 타입의 `내부 클래스`를 나타냅니다 예를 들어, `List<String>`의 경우 `String`이 이 클래스에 해당합니다.
- 제네릭 타입이 `Collection`인 경우 `constructCollectionType` 를 이용하여 `JavaType` 을 생성합니다.
- 제네릭 타입이 `Map` 인 경우 `constructMapType` 을 이용하여 `JavaType`을 생성합니다.
- 기타 제네릭 타입일 경우 `constructParametricType` 을 사용하여 `genericPrimitiveType` 과 `genericInternalClass` 를 결합하여 `JavaType`을 만듭니다.

```java
private JavaType determineJavaTypeForGeneric(Type genericOuterClass, Class<?> genericInternalClass) {  
    if (genericOuterClass instanceof Class<?> genericPrimitiveType) {  
        if (Collection.class.isAssignableFrom(genericPrimitiveType)) {  
            return objectMapper.getTypeFactory().constructCollectionType(  
                    (Class<? extends Collection>) genericPrimitiveType, genericInternalClass  
            );  
        }  
        if (Map.class.isAssignableFrom(genericPrimitiveType)) {  
            return objectMapper.getTypeFactory().constructMapType(  
                    (Class<? extends Map>) genericPrimitiveType, String.class, genericInternalClass  
            );  
        }  
        return objectMapper.getTypeFactory().constructParametricType(  
                genericPrimitiveType, genericInternalClass  
        );  
    }  
    return null;  
}
```

## Determine Cache
해당 메서드는 메서드로부터 반환된 데이터를 `캐시할 필요가 있는지 판단` 하는 역할을 합니다.

- 매개변수로 들어온 result 가 `null` 이면 캐싱하지 않습니다.
- 매개변수로 들어온 result 가 빈 `Collection` 일 경우, `cacheEmptyCollection` 설정에 따라 캐시 여부 결정합니다.
- 그 외의 경우에는 캐시할 수 있는 데이터로 판단하여 `true` 반환합니다.

```java
private boolean shouldCache(RedisCache redisCache, Object result) {  
    if (result == null) {  
        return false;  
    }  
    if (result instanceof Collection<?> collection) {  
        return !collection.isEmpty() || redisCache.cacheEmptyCollection();  
    }  
    return true;  
}
```


## Calculate TTL
이 메서드는 `RedisCache` 어노테이션으로부터 TTL 값과 TimeUnit 값을 받아와 `Duration` 반환하는 역할을 수행합니다.

```java
private Duration calculateTtl(RedisCache redisCache) {  
    return Duration.of(redisCache.ttl(), redisCache.unit().toChronoUnit());  
}
```


## Final Code
전체적인 코드는 다음과 같습니다.

```java
@Aspect  
@RequiredArgsConstructor  
@Component  
public class RedisCacheAspect {  
  
    private static final String DELIMITER = ":";  
    private static final String CACHE_NAME_PREFIX = "onsquad" + DELIMITER;  
    private final SpelExpressionParser spelExpressionParser = new SpelExpressionParser();  
    private final RedisTemplate<String, Object> redisTemplate;  
    private final ObjectMapper objectMapper;  
  
    @Around("@annotation(redisCache)")  
    public Object handleRedisCache(ProceedingJoinPoint joinPoint, RedisCache redisCache) {  
        String redisKey = generateRedisKey(joinPoint, redisCache);  
        Object cachedData = redisTemplate.opsForValue().get(redisKey);  
        if (cachedData != null) {  
            return deserializeCachedData(joinPoint, cachedData);  
        }  
        try {  
            Object result = joinPoint.proceed();  
            if (shouldCache(redisCache, result)) {  
                redisTemplate.opsForValue().set(redisKey, result, calculateTtl(redisCache));  
            }  
            return result;  
        } catch (Throwable e) {  
            throw new IllegalArgumentException("Error executing method " + joinPoint.getSignature().getName());  
        }  
    }  
  
    private String generateRedisKey(ProceedingJoinPoint joinPoint, RedisCache redisCache) {  
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();  
        StandardEvaluationContext standardEvaluationContext = new StandardEvaluationContext();  
        String[] paramNames = methodSignature.getParameterNames();  
        Object[] args = joinPoint.getArgs();  
        for (int i = 0; i < paramNames.length; i++) {  
            standardEvaluationContext.setVariable(paramNames[i], args[i]);  
        }  
        Expression expression = spelExpressionParser.parseExpression(redisCache.key());  
        String expressionValue = expression.getValue(standardEvaluationContext, String.class);  
        return CACHE_NAME_PREFIX + redisCache.name() + DELIMITER + expressionValue;  
    }  
  
    private Object deserializeCachedData(ProceedingJoinPoint joinPoint, Object cachedData) {  
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();  
        ParameterizedType genericReturnType = resolveGenericReturnType(methodSignature);  
        if (genericReturnType == null) {  
            return objectMapper.convertValue(cachedData, methodSignature.getReturnType());  
        }  
  
        Type genericOuterClass = genericReturnType.getRawType();  
        Class<?> genericInternalClass = guessGenericInternalClass(genericReturnType);  
        JavaType javaType = determineJavaTypeForGeneric(genericOuterClass, genericInternalClass);  
        return objectMapper.convertValue(cachedData, javaType);  
    }  
  
    private ParameterizedType resolveGenericReturnType(MethodSignature methodSignature) {  
        Method method = methodSignature.getMethod();  
        if (method.getGenericReturnType() instanceof ParameterizedType parameterizedType) {  
            return parameterizedType;  
        }  
        return null;  
    }  
  
    private Class<?> guessGenericInternalClass(ParameterizedType genericReturnType) {  
        for (Type typeArgument : genericReturnType.getActualTypeArguments()) {  
            if (typeArgument instanceof Class<?> actualType) {  
                return actualType;  
            }  
        }  
        return null;  
    }  
  
    private JavaType determineJavaTypeForGeneric(Type genericOuterClass, Class<?> genericInternalClass) {  
        if (genericOuterClass instanceof Class<?> genericPrimitiveType) {  
            if (Collection.class.isAssignableFrom(genericPrimitiveType)) {  
                return objectMapper.getTypeFactory().constructCollectionType(  
                        (Class<? extends Collection>) genericPrimitiveType, genericInternalClass  
                );  
            }  
            if (Map.class.isAssignableFrom(genericPrimitiveType)) {  
                return objectMapper.getTypeFactory().constructMapType(  
                        (Class<? extends Map>) genericPrimitiveType, String.class, genericInternalClass  
                );  
            }  
            return objectMapper.getTypeFactory().constructParametricType(  
                    genericPrimitiveType, genericInternalClass  
            );  
        }  
        return null;  
    }  
  
    private boolean shouldCache(RedisCache redisCache, Object result) {  
        if (result == null) {  
            return false;  
        }  
        if (result instanceof Collection<?> collection) {  
            return !collection.isEmpty() || redisCache.cacheEmptyCollection();  
        }  
        return true;  
    }  
  
    private Duration calculateTtl(RedisCache redisCache) {  
        return Duration.of(redisCache.ttl(), redisCache.unit().toChronoUnit());  
    }  
}
```

### 더 최적화된 코드
#### 기존 코드의 문제
그런데 말입니다.. 저 코드가 최선일까요? 현재 작성한 코드는 `RedisTemplate<String, Object>`  를 사용하고 있습니다. 즉, 반환값이 Object 라는 것이죠. 코드에서는 반환된 Object 타입의 결과가 Generic 타입인지, 아니면 그냥 단일 Wrapper 타입인지 검사를 수행하고, Generic 타입이라면 Generic 이 포함한 Inner Type 을 검사하고, 그 타입에 맞게 직접 역직렬화를 수행하고  `objectMapper.covertValue()` 로 변환하여 반환하고 있습니다. 

이 과정에서 문제는 불필요한 타입 검사가 많다는 것입니다. 이는 성능에 부담을 줄 수 있고 코드의 복잡성을 증가시킵니다. 특히, 제네릭 타입에 대한 검사를 거쳐 `objectMapper.convertValue()` 로 변환하는 과정은 런타임시 타입 변환으로 인해 오류가 발생할 수 있습니다.

#### 그래서 어떻게
이는 `RedisTemplate<String, String>` 을 사용함으로서 코드를 조금더 최적화 시킬 수 있습니다. `RedisTemplate<String, String>` 을 사용하면, 캐시에서 가져온 데이터가 기본적으로 `String` 타입으로 반환됩니다. 이 경우, 불필요한 `Object` 타입 검사나 복잡한 제네릭 타입 검사를 진행할 필요가 없습니다. 단순히 `String`을 `Object`로 변환하는 작업만 필요합니다.

즉, 캐시에서 `String` 데이터를 가져오면, 데이터의 타입을 검사할 필요 없이 직접 `String`에서 `Object`로 변환할 수 있기 때문에 훨씬 더 간결하고 효율적인 코드가 됩니다.

그리고 `RedisTemplate<String, String>` 을 사용하면, 캐시에서 가져온 데이터가 항상 `String`  타입이기 때문에, `MethodSignature` 를 통해 메서드의 반환 타입을 가져와서 바로 역직렬화할 수 있습니다.

```java
@Aspect  
@RequiredArgsConstructor  
@Component  
public class RedisCacheAspect {  
  
    private static final String DELIMITER = ":";  
    private static final String CACHE_NAME_PREFIX = "onsquad" + DELIMITER;  
    private final RedisTemplate<String, String> redisTemplate;  
    private final ObjectMapper objectMapper;  
    private final SpelExpressionParser spelExpressionParser = new SpelExpressionParser();  
  
    @Around("@annotation(redisCache)")  
    public Object handleRedisCache(ProceedingJoinPoint joinPoint, RedisCache redisCache) {  
        String redisKey = generateRedisKey(joinPoint, redisCache);  
        String cachedData = redisTemplate.opsForValue().get(redisKey);  
        if (cachedData != null) {  
            return deserializeCachedData(cachedData, joinPoint);  
        }  
        try {  
            Object result = joinPoint.proceed();  
            if (shouldCache(redisCache, result)) {  
                redisTemplate.opsForValue().set(redisKey, serializeData(result), calculateTtl(redisCache));  
            }  
            return result;  
        } catch (Throwable e) {  
            throw new RuntimeException("Error executing method " + joinPoint.getSignature().getName(), e);  
        }  
    }  
  
    private String generateRedisKey(ProceedingJoinPoint joinPoint, RedisCache redisCache) {  
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();  
        StandardEvaluationContext context = new StandardEvaluationContext();  
        String[] paramNames = methodSignature.getParameterNames();  
        Object[] args = joinPoint.getArgs();  
        for (int i = 0; i < paramNames.length; i++) {  
            context.setVariable(paramNames[i], args[i]);  
        }  
  
        String expressionValue = spelExpressionParser.parseExpression(redisCache.key()).getValue(context, String.class);  
        return CACHE_NAME_PREFIX + redisCache.name() + DELIMITER + expressionValue;  
    }  
  
    private String serializeData(Object data) {  
        try {  
            return objectMapper.writeValueAsString(data);  
        } catch (JsonProcessingException e) {  
            throw new RuntimeException("Serialization error", e);  
        }  
    }  
  
    private Object deserializeCachedData(String cachedData, ProceedingJoinPoint joinPoint) {  
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();  
        JavaType javaType = objectMapper.getTypeFactory()  
                .constructType(methodSignature.getMethod().getGenericReturnType());  
        try {  
            return objectMapper.readValue(cachedData, javaType);  
        } catch (JsonProcessingException e) {  
            throw new RuntimeException("Deserialization error", e);  
        }  
    }  
  
    private boolean shouldCache(RedisCache redisCache, Object result) {  
        if (result == null) {  
            return false;  
        }  
        if (result instanceof Collection<?> collection) {  
            return !collection.isEmpty() || redisCache.cacheEmptyCollection();  
        }  
        return true;  
    }  
  
    private Duration calculateTtl(RedisCache redisCache) {  
        return Duration.of(redisCache.ttl(), redisCache.unit().toChronoUnit());  
    }  
}
```


## Performance
Stress Test 및 성능 테스트 도구는 `Artillery` 를 사용하였습니다. 또한, `Announce` Table 에 `500만` 건을 삽입하여 진행하였습니다. 테스트 API 정보는 다음과 같습니다.

- Crew Main 페이지를 조회하는 API 를 테스트합니다.
- 사용자가 Crew 에 속해있는지 확인하는 쿼리
- Crew 정보를 가져오는 쿼리
- Crew 의 공지사항 4개를 조회해오는 쿼리 (캐싱을 진행합니다.)
- Crew 의 주간 사용자 랭킹 Top5 를 조회해오는 쿼리 (캐싱을 진행합니다.)

```java
@RequiredArgsConstructor  
@Service  
public class CrewMainService {  
  
    private final CrewMemberRepository crewMemberRepository;  
    private final AnnounceRepository announceRepository;  
    private final CrewRepository crewRepository;  
    private final SquadRepository squadRepository;  
  
    public CrewMainDto fetchMain(Long memberId, Long crewId, CategoryType categoryType, Pageable pageable) {  
        crewMemberRepository.getByCrewIdAndMemberId(crewId, memberId);  
        CrewInfoDomainDto crewInfo = crewRepository.getCrewById(crewId);  
        List<AnnounceInfoDomainDto> announces = announceRepository.fetchCachedLimitedAnnouncesByCrewId(crewId); // 캐싱  
        List<Top5CrewMemberDomainDto> topMembers = crewMemberRepository.findTop5CrewMembers(crewId); // 캐싱  
        Page<SquadInfoDomainDto> squads = squadRepository.findSquadsByCrewId(crewId, categoryType, pageable);  
  
        return CrewMainDto.from(crewInfo, announces, topMembers, squads.getContent());  
    }  
}
```


Crew 의 공지사항 4개를 조회해오는 쿼리에는 앞서 만든 `@RedisCache` 를 적용합니다.

```java
@RequiredArgsConstructor  
@Repository  
public class AnnounceCacheRepository {  
  
    private final AnnounceQueryDslRepository announceQueryDslRepository;  
  
    @RedisCache(name = "crew-announces", key = "'crew:' + #crewId", unit = HOURS, cacheEmptyCollection = true)  
    public List<AnnounceInfoDomainDto> fetchCachedLimitedByCrewId(Long crewId, Long size) {  
        return announceQueryDslRepository.fetchLimitedByCrewId(crewId, size);  
    }  
}
```


마찬가지로 Crew 에 속한 사용자들의 주간 랭킹 Top5 사용자들을 조회하는 쿼리에 `@RedisCache` 를 적용합니다.

```java
@RequiredArgsConstructor  
@Repository  
public class CrewMemberRepositoryImpl implements CrewMemberRepository {  

    private final CrewTopCacheJpaRepository crewTopCacheJpaRepository;  

	// 기타 메서드
  
    @RedisCache(name = "topN", key = "'crew:' + #crewId", unit = HOURS)  
	@Override  
	public List<Top5CrewMemberDomainDto> findTop5CrewMembers(Long crewId) {  
	    return crewTopCacheJpaRepository.findAllByCrewId(crewId).stream()  
	            .map(Top5CrewMemberDomainDto::from)  
	            .toList();  
	}
	
	// 기타 메서드
}
```


성능 테스트 도구가 실행하는 `YML` 은 다음과 같습니다.

- 10 초 동안 1000 번의 요청을 반복합니다. 즉, 10000 번의 요청을 날립니다.

```yml
config:  
  target: 'http://localhost:8087'  
  phases:  
    - name: 'Test Crew Main'  
      duration: 10  
      arrivalRate: 1000  
  
scenarios:  
  - name: 'Fetch Crew Main'  
    flow:  
      - get:  
          url: '/api/v1/crews/1/main?category=전체'  
          headers:  
            Authorization: 'Bearer {token}'
```


### Cache
4개의 쿼리 중 2개에 캐싱을 적용시킨 결과는 다음과 같습니다.

- 총 요청 수: 10_000
- 성공한 응답: 10_000 (HTTP 200)
- 요청 속도: 1,014 요청/초 `(TPS 1014)`
- 다운로드된 바이트: 20_340_000 Byte
- `응답 시간`:
    - 평균 (Mean): 165.6ms
    - 중앙값 (Median): 12.1ms
    - P95: 772.9ms
    - P99: 1002.4ms
- `세션 길이`:
    - 평균 (Mean): 171.2초
    - P95: 772.9초
    - P99: 1022.7초
- `에러`: 0 

```text
--------------------------------
Summary report @ 18:15:00(+0900)
--------------------------------

http.codes.200: ................................................................ 10000
http.downloaded_bytes: ......................................................... 20340000
http.request_rate: ............................................................. 1014/sec
http.requests: ................................................................. 10000
http.response_time:
  min: ......................................................................... 2
  max: ......................................................................... 1367
  mean: ........................................................................ 165.6
  median: ...................................................................... 12.1
  p95: ......................................................................... 772.9
  p99: ......................................................................... 1002.4
http.response_time.2xx:
  min: ......................................................................... 2
  max: ......................................................................... 1367
  mean: ........................................................................ 165.6
  median: ...................................................................... 12.1
  p95: ......................................................................... 772.9
  p99: ......................................................................... 1002.4
http.responses: ................................................................ 10000
vusers.completed: .............................................................. 10000
vusers.created: ................................................................ 10000
vusers.created_by_name.Fetch Crew Main: ........................................ 10000
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 3.7
  max: ......................................................................... 1369.5
  mean: ........................................................................ 171.2
  median: ...................................................................... 14.7
  p95: ......................................................................... 772.9
  p99: ......................................................................... 1022.7
```


### None Cache
캐싱을 적용하지 않은 결과는 다음과 같습니다.

- 총 요청 수: 10_000
- 성공한 응답: 9_999 (HTTP 200)
- 요청 속도: 1,019 요청/초 `(TPS 1019)`
- 다운로드된 바이트: 20_337_966 Byte
- `응답 시간`:
    - 평균 (Mean): 661.5ms
    - 중앙값 (Median): 658.6ms
    - P95: 963.1ms
    - P99: 1,085.9ms
- `세션 길이`:
    - 평균 (Mean): 693.8초
    - P95: 963.1초
    - P99: 1,085.9초
- `에러`: 1 (ECONNRESET)

```text
--------------------------------
Summary report @ 18:13:21(+0900)
--------------------------------

errors.ECONNRESET: ............................................................. 1
http.codes.200: ................................................................ 9999
http.downloaded_bytes: ......................................................... 20337966
http.request_rate: ............................................................. 1019/sec
http.requests: ................................................................. 10000
http.response_time:
  min: ......................................................................... 128
  max: ......................................................................... 1426
  mean: ........................................................................ 661.5
  median: ...................................................................... 658.6
  p95: ......................................................................... 963.1
  p99: ......................................................................... 1085.9
http.response_time.2xx:
  min: ......................................................................... 128
  max: ......................................................................... 1426
  mean: ........................................................................ 661.5
  median: ...................................................................... 658.6
  p95: ......................................................................... 963.1
  p99: ......................................................................... 1085.9
http.responses: ................................................................ 9999
vusers.completed: .............................................................. 9999
vusers.created: ................................................................ 10000
vusers.created_by_name.Fetch Crew Main: ........................................ 10000
vusers.failed: ................................................................. 1
vusers.session_length:
  min: ......................................................................... 153.8
  max: ......................................................................... 1427.9
  mean: ........................................................................ 693.8
  median: ...................................................................... 685.5
  p95: ......................................................................... 963.1
  p99: ......................................................................... 1085.9
```

### Diff
캐싱을 진행했을 때와 진행하지 않았을 떄를 비교해보겠습니다. 우선 눈에 띠게 개선된 점은 다음과 같습니다.

1. `응답 시간` : 캐싱을 적용한 후 `평균`, `중앙값`, `P95`, `P99` 응답 시간이 크게 개선되었습니다. 특히 `평균 응답 시간이 495.9ms`, `중앙값이 646.5ms` 감소하여 성능이 크게 향상되었습니다.
2. `세션 길이` : 캐싱을 적용한 후 `세션 길이`가 전체적으로 감소하였으며, `평균 세션 길이가 522.6초`, `P95 와 P99도 각각 190.2초와 63.2초` 감소했습니다.
3. `에러 감소` : 캐싱을 적용한 후 `ECONNRESET` 에러가 발생하지 않았습니다.

|             | 캐싱 적용 (결과)              | 캐싱 미적용 (결과)             | 개선된 점                                     |
| ----------- | ----------------------- | ----------------------- | ----------------------------------------- |
| 총 요청 수      | 10,000                  | 10,000                  | 동일                                        |
| 성공한 응답      | 10,000 (HTTP 200)       | 9,999 (HTTP 200)        | 캐싱 적용 후 에러가 1건 줄어듦 (ECONNRESET 없음)        |
| 요청 속도 (TPS) | 1,014 요청/초 `(TPS 1014)` | 1,019 요청/초 `(TPS 1019)` | 요청 속도 거의 동일, 미세한 차이                       |
| 다운로드된 바이트   | 20,340,000 Byte         | 20,337,966 Byte         | 동일                                        |
| 응답 시간 (평균)  | 165.6ms                 | 661.5ms                 | 평균 응답 시간이 대폭 감소 (495.9ms 감소) == 74.9% 개선  |
| 응답 시간 (중앙값) | 12.1ms                  | 658.6ms                 | 중앙값 응답 시간이 대폭 개선 (646.5ms 감소) == 98.2% 개선 |
| 응답 시간 (P95) | 772.9ms                 | 963.1ms                 | P95 응답 시간 감소 (190.2ms 감소) == 19.7% 개선     |
| 응답 시간 (P99) | 1,002.4ms               | 1,085.9ms               | P99 응답 시간 감소 (83.5ms 감소) == 7.7% 개선       |
| 세션 길이 (평균)  | 171.2초                  | 693.8초                  | 평균 세션 길이 감소 (522.6초 감소) == 75.3% 개선       |
| 세션 길이 (P95) | 772.9초                  | 963.1초                  | P95 세션 길이 감소 (190.2초 감소) == 19.7%         |
| 세션 길이 (P99) | 1,022.7초                | 1,085.9초                | P99 세션 길이 감소 (63.2초 감소) == 5.8%           |
| 에러          | 0                       | 1 (ECONNRESET)          | 에러가 1건 감소                                 |


## 마치며
이번 포스팅을 통해 `RedisCacheManager`와 `@Cacheable`을 직접 구현하고 성능 테스트를 진행하는 과정을 살펴보았습니다. 캐싱을 적용했을 때와 적용하지 않았을 때의 `TPS`는 큰 차이가 없었지만, `평균 응답 시간`과 `평균 세션 길이`에서 확연한 성능 개선을 확인할 수 있었습니다. 특히, `평균 응답 시간이 98.2% 개선` 된 것을 확인할 수 있었습니다.

하지만 이번 테스트를 통해 느낀 점은 캐싱을 적용해도 여전히 속도가 만족스럽지 않다는 점입니다. 현재 진행 중인 프로젝트에서는 `Redis` 를 최대한 활용하려고 Index 와 쿼리 튜닝을 먼저 진행하지 않고 캐싱을 우선적으로 적용했었는데, 이젠 Index 를 적용하고 Query Tunning 을 통해 더 근본적인 성능 개선을 해야겠다고 느꼈습니다.

