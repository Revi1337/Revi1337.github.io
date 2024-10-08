---
title: 책임 연쇄 패턴을 통한 캐싱전략 간결화
tags: ['redis', 'expiring-map', 'design-pattern', 'concurrency']
---

## 들어가며
현재 진행하고 있는 프로젝트에서는 `중복 요청 방지를 위해 Redis` 를 사용하고 있습니다. 하지만 문득 `"만약 Redis 와 Connection 이 끊어지면 혹시 모를 중복 Insert 이 발생하고, 이로 인해 데이터 일관성이 깨질 수 있지 않을까?"` 라는 생각이 들었습니다. 

이 Redis 와 Connection 이 끊어지는 상황에 대비하기 위해서는, `요청을 캐싱할 수 있는 다른 캐싱 후보군이 필요`했습니다. 그렇게 생각해낸것이 `ExpiringMap` 입니다. ExpiringMap 을 선택하는 이유는 다음과 같습니다.

1. ExpiringMap 은 `ThreadSafe` 합니다. 따라서 동시 요청. 즉, `Concurrency` 문제 해결에 적합하다는 생각을 했습니다.
2. TreadSafe 하기만 하다면 `ConcurrentHashMap` 을 사용했을 수도 있습니다. 하지만 ExpringMap 은 각 Key 마다 `Expiring 시간을 설정`할 수 있어, 일정 시간이 지나면 자동으로 삭제됩니다. 그래서 더욱 중복 요청을 해결할 수 있는 해결책이 될 수 있을거라 생각했습니다.
3. ExpiringMap 의 데이터는 메모리에 저장됩니다. `Redis처럼 네트워크 I/O에 의존하지 않아 Connection 문제 자체를 회피`할 수 있습니다. 따라서 데이터베이스에 부하를 줄일 수 있을거라 생각했습니다.

사실 Table 에 이미 `Unique 인덱스`를 걸어놓은 상태라 중복 Insert 가 발생해도 데이터 일관성이 깨지는 상황이 발생하지 않지만, 문제 자체를 회피하고 싶었습니다. 또한, 최근에 배운 디자인 패턴을 적용해보고 싶었습니다.

따라서 해당 포스팅에서는 Redis, ExpiringMap 그리고 책임연쇄 패턴을 사용하여 캐싱 후보군들을 간결하게 작성하는 과정을 작성해보고자 합니다.

## Interface 정의
우선 중복된 요청인지 확인할 수 있는 메서드를 Interface 에 명세합니다.

```java
public interface RequestCacheHandler {  
  
    boolean isFirstRequest(String key, String value, long timeout, TimeUnit unit);  
  
}
```

## 구현체 생성
앞서 만든 interface 를 구현하여, 각 캐싱 전략에 대한 구현체를 만들 수 있습니다. 아래 코드는 `Redis 를 통해 캐싱할 수 있는 구현체` 를 만든것입니다. `valueOperations.setIfAbsent()` 를 통해 중복된 요청인지 아닌지 판단할 수 있습니다.

> valueOperations.setIfAbsent() 는 Redis 에서의 SETNX(Set if Not Exists) 오퍼레이션에 해당합니다. SETNX 는 캐싱된 값이 없어 새롭게 설정한 경우 1, 캐싱된 값이 이미 있어 새롭게 설정하지 못한 경우 0 을 반환하게 됩니다.

```java
@Slf4j  
@RequiredArgsConstructor  
public class RedisRequestCacheHandler implements RequestCacheHandler {  
  
    private final StringRedisTemplate stringRedisTemplate;  
  
    @Override  
    public boolean isFirstRequest(String key, String value, long timeout, TimeUnit unit) {  
        try {  
            var valueOperations = stringRedisTemplate.opsForValue();  
            return valueOperations.setIfAbsent(key, value, timeout, unit);  
        } catch (RedisConnectionFailureException exception) {  
            log.debug("[Redis 연결 실패] 다음 RequestCacheHandler 를 적용합니다.");  
            throw new IllegalArgumentException(exception);  
        }  
    }  
}
```


이제 두번째 캐싱 전략에 대한 구현체를 작성해줄 수 있습니다. `ExpiringMap` 은 각 Key 마다 Expire 시간을 설정해줄 수 있습니다. 오버라이딩한 메서드에서는 Redis 와 동일하게 캐시된 값이 없으면 새롭게 설정하고 1 리턴, 캐시된 값이 있으면 0 을 리턴할 수 있게 구현해줍니다.

```java
public class ExpiredMapRequestCacheHandler implements RequestCacheHandler {  
  
    private static final ExpiringMap<String, String> REQUEST_CACHE = ExpiringMap.builder()  
            .maxSize(10000)  
            .variableExpiration()  
            .build();  
  
    @Override  
    public boolean isFirstRequest(String key, String value, long timeout, TimeUnit unit) {  
        String cacheValue = REQUEST_CACHE.get(key);  
        if (cacheValue == null) {  
            REQUEST_CACHE.put(key, value, ExpirationPolicy.CREATED, timeout, unit);  
            return true;  
        }  
  
        return false;  
    }  
}
```


> 해당 클래스도 RequestCacheHandler 도 구현하게 된다면, 후에 확장하거나 유지보수에 편한 이점을 갖게 됩니다. 가만보니 Composite 패턴과 매우 비슷해보네요

## 관리 가능한 클래스 생성
이제 앞서 정의한 두가지 캐싱 전략 구현체를 보관하는 `RequestCacheHandlerExecutionChain` 메서드를 작성할 수 있습니다. RequestCacheHandler 구현 여부는 본인 선택에 달렸습니다. 일단 저는 구현하겠습니다.

```java
public class RequestCacheHandlerExecutionChain implements RequestCacheHandler {  
  
    private final List<RequestCacheHandler> requestCacheHandlers = new ArrayList<>();  
  
    public void addRequestCacheHandler(RequestCacheHandler... requestCacheHandler) {  
        CollectionUtils.mergeArrayIntoCollection(requestCacheHandler, requestCacheHandlers);  
    }  
  
    @Override  
    public boolean isFirstRequest(String key, String value, long timeout, TimeUnit unit) {  
        if (requestCacheHandlers.isEmpty()) {  
            return true;  
        }  
        int throwCount = requestCacheHandlers.size();  
        for (RequestCacheHandler requestCacheHandler : requestCacheHandlers) {  
            try {  
                if (requestCacheHandler.isFirstRequest(key, value, timeout, unit)) {  
                    return true;  
                }  
            } catch (Throwable ignored) {  
                throwCount -= 1;  
            }  
        }  
        if (throwCount == 0) {  
            throw new IllegalStateException("모든 캐싱 전략에 실패하였습니다.");  
        }  
  
        return false;  
    }  
}
```


구현체들을 담을 수 있는 관리 클래스인 `RequestCacheHandlerExecutionChain` 를 생성한 이유는 다음과 같습니다.

- 구현체를 List 에 보관하게 된다면 캐싱전략에 대한 우선순위를 부여할 수 있기 때문입니다. RedisRequestCacheHandler 에서 오류가 발생하게 된다면, 바로 다음 캐싱전략인 ExpiredMapRequestCacheHandler 을 사용하여 데이터베이스까지 요청을 가지 않게 만들어줄 수 있습니다. 

또한, `RequestCacheHandlerExecutionChain` 가 RequestCacheHandler 를 구현하도록 만든 이유는 다음과 같습니다.

-  RequestCacheHandlerExecutionChain 자체가 하나의 캐싱전략이 될 수 있습니다. 따라서 확장과 유지보수에 큰 이점을 갖게됩니다.

## 설정 
현재 진행하고 있는 프로젝트에서는 기존의 캐싱전략을 ThrottlingAspect 라는 이름으로 사용하고 있습니다. 해당 Aspect 에서는 앞서 만든 `RequestCacheHandlerExecutionChain` 를 주입받아 사용할 것입니다. 따라서 아래와 같이 설정파일을 만들어 줄 수 있습니다.

```java
@Configuration  
public class OnSquadCustomizeConfiguration {  
  
    @Bean  
    public RequestCacheHandlerExecutionChain requestCacheHandlerExecutionChain(StringRedisTemplate stringRedisTemplate) {  
        RequestCacheHandlerExecutionChain handlerExecutionChain = new RequestCacheHandlerExecutionChain();  
        handlerExecutionChain.addRequestCacheHandler(  
                new RedisRequestCacheHandler(stringRedisTemplate),  
                new ExpiredMapRequestCacheHandler()  
        );  
  
        return handlerExecutionChain;  
    }  
}
```

## 사용
이제 Spring 영역 안에서는 어디서든 `RequestCacheHandlerExecutionChain` 를 주입받아 사용할 수 있습니다. 

```java
@RequiredArgsConstructor  
@Aspect  
@Component  
public class ThrottlingAspect {  
  
    private final RequestCacheHandlerExecutionChain handlerExecutionChain;  
  
    @Before("@annotation(throttling)")  
    public void checkInitialRequest(JoinPoint joinPoint, Throttling throttling) {  
        String redisKey = buildRedisKey(joinPoint, throttling);  
        boolean firstRequest = handlerExecutionChain.isFirstRequest(redisKey, LocalDateTime.now().toString(), throttling.perCycle(), throttling.unit());  
        if (!firstRequest) {  
            throw new CommonBusinessException.RequestConflict(  
                    CommonErrorCode.REQUEST_CONFLICT, getCycleAsDuration(throttling)  
            );  
        }  
    }  
  
    private String buildRedisKey(JoinPoint joinPoint, Throttling throttling) {  
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();  
        Map<String, Object> parameterMap = mapParametersToValues(methodSignature, joinPoint.getArgs());  
        String redisKeyFormat = throttling.type().getFormat();  
  
        if (throttling.name().isEmpty()) {  
            String methodName = methodSignature.getMethod().getName();  
            String kebabMethodName = convertCamelToKebab(methodName);  
            return String.format(redisKeyFormat, parameterMap.get(throttling.id()), kebabMethodName);  
        }  
  
        return String.format(redisKeyFormat, parameterMap.get(throttling.id()), throttling.name());  
    }  
  
    private Map<String, Object> mapParametersToValues(MethodSignature methodSignature, Object[] argumentValues) {  
        String[] parameterNames = methodSignature.getParameterNames();  
  
        return IntStream.range(0, parameterNames.length)  
                .boxed()  
                .collect(Collectors.toUnmodifiableMap(i -> parameterNames[i], i -> argumentValues[i]));  
    }  
  
    private String convertCamelToKebab(String methodName) {  
        return methodName.chars()  
                .mapToObj(c -> (char) c)  
                .map(c -> Character.isUpperCase(c) ? "-" + Character.toLowerCase(c) : c.toString())  
                .collect(Collectors.joining());  
    }  
  
    private String getCycleAsDuration(Throttling throttling) {  
        return throttling.perCycle() + convertAsTimeUnitString(throttling.unit());  
    }  
  
    private String convertAsTimeUnitString(TimeUnit unit) {  
        return switch (unit) {  
            case NANOSECONDS -> " nano sec";  
            case MICROSECONDS -> " micro sec";  
            case MILLISECONDS -> " milli sec";  
            case SECONDS -> " sec";  
            case MINUTES -> " min";  
            case HOURS -> " hour";  
            case DAYS -> " day";  
        };  
    }  
}
```

## Diagram
작성한 클래스들의 Diagram 은 아래와 같습니다.

![](Spring/images/Pasted%20image%2020241008220315.png)
## 마치며
디자인패턴을 공부하고 거의 9 달동안 Spring Project 들의 중요 구현체들을 까보며 분석하고 로컬 저장소에 기술하는 습관을 들였더니, Spring Project 들에 녹아들어있는 수많은 디자인 패턴들과 추상화가 엄청 놀랍다고 느껴졌습니다. 저또한 그 과정을 통해 코드를 보는 시야야 조금은 넓어진 것 같아서 좋습니다.

해당 해턴은 `DispatcherServlet` 의 `doDispatch` 안에 있는 `HandlerExecutionChain` 을 보며 감명을 받아 적게 되었습니다.
