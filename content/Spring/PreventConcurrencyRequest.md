---
title: User 의 중복 요청 방지하기
tags: ['redis', 'concurrency']
---

현재 진행하고 있는 Community 안에 또 다른 Nested Communtiy 가 존재할 수 있는 프로젝트에는 Community 에 참가하기 위해 요청을 보내야하는 로직이 있습니다.  

```java
public void joinCrew(Long memberId, CrewJoinDto dto) {  
    Crew crew = crewRepository.getById(dto.crewId());  
    crewMemberRepository.findByCrewIdAndMemberId(dto.crewId(), memberId).ifPresentOrElse(  
            crewMember -> { throw new CrewBusinessException.AlreadyJoin(ALREADY_JOIN, dto.crewId()); },  
            () -> {  
                checkDifferenceCrewCreator(crew, memberId);  
                Member referenceMember = memberRepository.getReferenceById(memberId);  
                crewParticipantRepository.upsertCrewParticipant(crew, referenceMember, LocalDateTime.now());  
            }  
    );  
}
```


```java
@Slf4j  
@RequiredArgsConstructor  
@Repository  
public class CrewParticipantRepositoryImpl implements CrewParticipantRepository {  
  
    private final CrewParticipantJpaRepository crewParticipantJpaRepository;  
    private final CrewParticipantJdbcRepository crewParticipantJdbcRepository;  
    private final CrewParticipantQueryDslRepository crewParticipantQueryDslRepository;  
  
    @Transactional  
    @Override    
    public CrewParticipant upsertCrewParticipant(Crew crew, Member member, LocalDateTime now) {  
        return crewParticipantJpaRepository.findByCrewIdAndMemberId(crew.getId(), member.getId())  
                .map(crewParticipant -> {  
                    crewParticipant.updateRequestAt(now);  
                    return crewParticipantJpaRepository.saveAndFlush(crewParticipant);  
                })  
                .orElseGet(() -> crewParticipantJpaRepository.save(new CrewParticipant(crew, member, now)));  
    }  
}
```


```java
@Retention(RetentionPolicy.RUNTIME)  
@Target({ElementType.METHOD})  
public @interface Throttling {  
  
    OnSquadType type() default OnSquadType.CREW;  
  
    String id();  
  
    String name() default "";  
  
    int perCycle() default 10;  
  
    TimeUnit unit() default TimeUnit.SECONDS;  
  
}
```


```java
@Slf4j  
@Aspect  
@RequiredArgsConstructor  
@Component  
public class ThrottlingAspect {  
  
    private final StringRedisTemplate stringRedisTemplate;  
  
    @Before("@annotation(throttling)")  
    public void checkInitialRequest(JoinPoint joinPoint, Throttling throttling) {  
        String redisKey = buildRedisKey(joinPoint, throttling);  
        var valueOperations = stringRedisTemplate.opsForValue();  
        Boolean firstRequest = valueOperations.setIfAbsent(redisKey, LocalDateTime.now().toString(), throttling.perCycle(), throttling.unit());  
        if (!firstRequest) {  
            log.info("Duplicate Request");  
            throw new IllegalArgumentException("Duplicate Request");  
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
}
```

