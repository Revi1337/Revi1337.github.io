---
title: Redis 가 진짜 필요할까?
tags: ['spring', 'redis', 'caffeine']
---

## 들어가며
안녕하세요. 이번 시간에는 진행중인 프로젝트에서 캐싱 플랫폼을 Global Cache 인 `Redis`에서 Local Cache인 `Caffiene`으로 바꾸게 된 이유에 대해 포스팅해보고자 합니다.

## Global Cache 사용한 이유
프로젝트에서 Global Cache인 Redis를 사용하게 되었던 이유는 아래와 같습니다.

1. 프론트1, 백엔드1 인원으로 진행하였기 때문에 새로운 기술을 도입해보고 싶었습니다.
2. 많은 채용공고에서 Redis 와 같은 NoSQL 사용경험을 우대하고 있었습니다.
3. 회원가입시 필요한 이메일 인증 여부를 저장하는 임시 저장소가 필요했습니다.
4. 자주 조회되는 결과를 캐싱하고 싶었습니다.

## Local Cache 로 변경한 이유
하지만 프로젝트를 진행하면서 `과연 진짜 Redis 가 필요한가?` 라는 의문점이 생겼습니다. 그 이유들을 차차 소개해보도록 하겠습니다.

### 단일  데이터 성능 개선 효과 미미
첫번째 이유는 `간단한 결과에 대한 캐싱에서는 성능 개선 효과가 미미했기 때문`입니디. 현재 프로젝트에서는 개별 공지사항과 공지사항 첫번쨰 페이지에 대해 Redis로 캐싱을 도입하고 있습니다.

> 아래 코드는 공지사항 개별 캐싱 코드입니다.

```java
public AnnounceInfoDto findAnnounce(Long memberId, Long crewId, Long announceId) {  
    crewMemberRepository.getByCrewIdAndMemberId(crewId, memberId);  
  
    return AnnounceInfoDto.from(announceRepository.getCachedByCrewIdAndIdAndMemberId(crewId, announceId, memberId));  
}
```

```java
@RequiredArgsConstructor  
@Repository  
public class AnnounceCacheRepository {  
  
    private final AnnounceQueryDslRepository announceQueryDslRepository;  
  
    @Cacheable(cacheNames = CREW_ANNOUNCE, key = "'crew:' + #crewId + ':announce:' + #announceId", unless = "#result == null")  
    public AnnounceInfoDomainDto getCachedByCrewIdAndIdAndMemberId(Long crewId, Long announceId, Long memberId) {  
        return announceQueryDslRepository.fetchByCrewIdAndIdAndMemberId(crewId, announceId, memberId)  
                .orElse(null);  
    }  

	// 기타 코드
}
```


캐싱을 적용하지 않은 상태를 가정하다면 해당 비지니스 로직에서는 총 `2개의 쿼리`. 총 2번의 Network IO 가 발생하게 됩니다.

1. 사용자가 Crew Group 에 속하는지 확인하는 쿼리 (RDB)
2. 단일 공지사항을 조회하는 쿼리 (RDB)


만약 캐싱을 적용하면 하나의 쿼리가 나가지만 동일하게 2번의 Network IO 가 발생하게 됩니다.

1. 사용자가 Crew Group 에 속하는지 확인하는 쿼리 (RDB)
2. 단일 공지사항을 조회하는 쿼리 (Redis)


#### 캐싱 전후 비교
캐싱을 진행하는 이유는 RDB 에 부하를 줄이거나 평균 응답속도를 높이기 위함입니다. `단일 공지사항 조회` API 에 대해 직접 성능 테스트를 해본 결과 TPS는 `15.5%` 만큼 소폭 증가하였지만

> 테스트는 직접 비교하였으며, 결과 요약은 GPT 에게 위임하였습니다.

| 항목                           | 캐싱 전    | 캐싱 후     | 변화       |
| ---------------------------- | ------- | -------- | -------- |
| TPS (`http.request_rate`)    | 868/sec | 1003/sec | 15.5% 증가 |
| 총 요청 수 (`http.requests`)     | 10,000  | 10,000   | 동일       |
| 응답 코드 200 (`http.codes.200`) | 10,000  | 10,000   | 동일       |
| 다운로드 바이트 수                   | 2.2MB   | 2.2MB    | 동일       |
| 에러 (`vusers.failed`)         | 0       | 0        | 없음       |


오히려 일부 요청에서는 `응답 지연이 발생`이 발생하여 평균 응답속도(mean)가 `2.5배` 느려졌습니다.

| 항목     | 캐싱 전  | 캐싱 후    | 변화 및 해석          |
| ------ | ----- | ------- | ---------------- |
| min    | 1ms   | 1ms     | 동일               |
| max    | 436ms | 786ms   | 일부 요청 지연         |
| mean   | 5.7ms | 14.7ms  | 평균 2.5배 느려짐      |
| median | 3ms   | 3ms     | 대부분은 빠름 (50% 이하) |
| p95    | 6ms   | 63.4ms  | 급등 — 상위 5% 응답 지연 |
| p99    | 73ms  | 301.9ms | 엄청난 지연 존재        |


결과적으로 단순한 단건 조회 API의 경우, Redis 캐시를 적용함으로써 RDB 쿼리 수는 줄였지만, `응답 속도 측면에서는 기대만큼의 큰 성능 개선 효과는 확인하지 못했습니다`.  개인적으로는 `Redis가 싱글 스레드로 동작한다는 점에서, 요청이 몰릴 경우 병목이 발생해 지연이 생겼을 가능성`이 있다고 판단했습니다. 

또한 현재 저희 서비스에서는 공지사항 외에도 다양한 데이터를 Redis로 캐싱하고 있기 때문에, `다른 API에서 Redis 접근 빈도가 더욱 높아질 경우, 오히려 성능이 저하될 위험` 이 존재할 수 있다고 판단하였습니다.


### 단일 애플리케이션
두 번째 이유는 저희 어플리케이션이 `단일 프로세스`, 즉 단일 애플리케이션이기 때문입니다. Redis는 주로 분산 서버 환경에서 여러 인스턴스 간에 데이터를 공유하고, 서버 간의 성능 개선을 위해 활용됩니다. 여러 서버에서 데이터를 중앙에서 관리할 수 있기 때문에, 각 서버가 독립적으로 데이터를 저장하지 않고 공유할 수 있어 데이터 정합성에 문제가 없고, 시스템 확장성이나 장애 발생 시에도 효율적인 성능을 제공합니다.

처음에는 `단일 애플리케이션`임에도 불구하고 혼자 진행하는 프로젝트였던 만큼, 새로운 기술을 도입해보고 싶어서 Global Cache인 Redis를 도입하였습니다. 하지만, 바로 앞에서 `단일 데이터에 대한 성능 개선 효과가` 없다는 것을 직접 체감하여, "그렇다면 그냥 Local Cache를 사용하는 것이 더 이득 아닐까?" 라는 생각이 들었습니다. 

그래서 결국 로컬 캐시를 사용하게 되었습니다.


## Caffeine 선택 이유
그렇다면 이제 Local Cache 중 Caffeine 을 선택한 이유가 필요하겠죠. 

1. 현재 저희 서비스에서는 `Redis` 는 물론이고 Redis 가 죽었을 때, Redis 를 대체할 수 있는 후보군으로 `ExpiringMap` 을 사용하고 있습니다. ExpiringMap 은 Expired 시간을 지정할 수 있어, 각 Cache Name 에 대한 Expiring 시간을 지정할 수 있습니다. 그렇기 때문에 `Caffeine Cache`  를 선택하지 않을 이유가 없었습니다.
2. 사실 아직 Caffeine Cache 를 도입하기 전이지만, Caffeine Cache 가 타 Local Cache 보다 더 우수한 성능을 낸다고 나와있습니다.

## 마치며
지금까지 Global Cache 인 Redis 에서 Local Cache 인 Caffeine Cache 로 변경하게 된 이유에 대해 알아보았습니다. 다음 포스팅에서는 Redis 를 이용한 RedisCacheManager 를 통한 캐싱과 Caffeine 을 이용한 CaffeineCacheManager 를 통한 캐싱 성능 비교를 해보겠습니다.

