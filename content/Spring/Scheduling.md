---
title: Scheduling 의 간단한 사용법
tags: ['scheduling']
---

## Scheduling
스케줄링(Scheduling)은 `특정 작업이나 프로세스를 정해진 시간에 실행하거나 일정한 주기로 반복해서 실행하는 것을 의미`한다.컴퓨터 시스템에서 스케줄링은 CPU와 같은 자원을 효율적으로 관리하고, 애플리케이션에서는 `주기적인 작업을 자동으로 처리`하는 데 사용된다. 물론 자바에서는 스프링 진영에서는 `@Scheduled` 애노테이션을 통해 스케줄링을 쉽게 구현할 수 있다.

## @Scheduling 설정
@Scheduling 을 사용해주기 위해서는 Bean Scan 범위 안에서 `@EnableScheduling` 를 설정해주어야 한다.

```java
@EnableScheduling  
@Configuration  
public class ScheduleConfig {  
}
```


## @Scheduling 속성
### fixedRate
@Scheduling 메서드를 `고정된 기간 동안 반복해서 실행`한다. 기본 시간 단위는 밀리초이지만, `timeUnit` 속성으로 다른 시간 단위를 설정할 수 있다. 정확한 프록세스는 아래와 같다.

1. `Started ~~Application in 2.588 seconds (process running for 4.066)` 
2. 작업 실행
3. 3초 대기
4. 작업 실행
5. ...반복...

```java
@Slf4j  
@Configuration  
public class TestScheduler {  
  
    @Scheduled(fixedRate = 3, timeUnit = TimeUnit.SECONDS)  
    public void fixedRate() {  
        Thread currentThread = Thread.currentThread();  
        String methodName = currentThread.getStackTrace()[1].getMethodName();  
        log.info("Method {} Invoked, Date : {}", methodName, LocalDateTime.now());  
    }  
}
```

![](Spring/images/Pasted%20image%2020240929225540.png)

### fixedDelay
@Scheduling 메서드의 `마지막 호출이 끝난 시점`과 `다음에 호출될 시점` 사이에 지정한 시간만큼 간격을 두어 작업을 반복한다. 마찬가지로 기본 시간 단위는 밀리초이지만 `timeUnit` 속성으로 다른 시간 단위를 설정할 수 있다.

앞서 살펴본 fixedRate 와 역할은 동일하지만, fixedDelay 방식은 `SimpleAsyncTaskScheduler` 와 함께 단일 스케줄러 스레드에서 동작하는것에서 차이점이 있다. 정확한 프록세스는 아래와 같다.

1. `Started ~~Application in 2.593 seconds (process running for 3.99)`
2. 작업 실행 (마지막 호출)
3. 3초 대기
4. 작업 실행 (다음 호출)
5. ...반복...

```java
@Slf4j  
@Configuration  
public class TestScheduler {  
  
    @Scheduled(fixedDelay = 3, timeUnit = TimeUnit.SECONDS)  
    public void fixedDelay() {
        Thread currentThread = Thread.currentThread();  
        String methodName = currentThread.getStackTrace()[1].getMethodName();  
        log.info("Method {} Invoked, Date : {}", methodName, LocalDateTime.now());  
    }  
}
```

![](Spring/images/Pasted%20image%2020240929232620.png)
### initialDelay
@Scheduling 메서드의 첫 작업을 실행하기까지 지연시간을 의미한다. 마찬가지로 기본 시간 단위는 밀리초이지만 `timeUnit` 속성으로 다른 시간 단위를 설정할 수 있다. 정확한 프로세스는 아래와 같다.

1. `Started ~~Application in 2.593 seconds (process running for 3.99)`
2. 10 초 (initialDelay) 만큼 대기
3. 작업 실행 (마지막 호출)
4. 3초 대기 (fixedRate)
5. 작업 실행 (다음 호출)
6. ...반복...

```java
@Slf4j  
@Configuration  
public class TestScheduler {  
  
    private final AtomicInteger atomicInteger = new AtomicInteger(0);  
  
    @Scheduled(initialDelay = 10, fixedRate = 3, timeUnit = TimeUnit.SECONDS)  
    public void initialDelay() {  
        Thread currentThread = Thread.currentThread();  
        String methodName = currentThread.getStackTrace()[1].getMethodName();  
        log.info("Method {} Invoked {}th, Date : {}", methodName, atomicInteger.incrementAndGet(), LocalDateTime.now());  
    }  
}
```

![](Spring/images/Pasted%20image%2020240929232937.png)
### cron
작업 반복을 위한 `Cron Expression` 을 적어주면 된다. 리눅스 crontab 에서 사용되는 Cron Expression 은 5개의 필드로 이루어져 있지만, @Scheduled 에서 사용되는 Cron Expression 은 `6개의 필드`로 이루어져 있다.

**리눅스 Crontab**
```text
*    *    *    *    *
┬    ┬    ┬    ┬    ┬
│    │    │    │    └─ 요일 (0 - 7) (0: 일요일, 1: 월요일, ..., 6: 토요일, 7: 일요일)
│    │    │    └───── 월 (1 - 12)
│    │    └───────── 일 (1 - 31)
│    └───────────── 시간 (0 - 23)
└───────────────── 분 (0 - 59)
```

**@Scheduled cron**
```text
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    └─ 요일 (0 - 7) (0: 일요일, 1: 월요일, ..., 7: 일요일)
│    │    │    │    └───── 월 (1 - 12)
│    │    │    └───────── 일 (1 - 31)
│    │    └───────────── 시간 (0 - 23)
│    └─────────────── 분 (0 - 59)
└─────────────────── 초 (0 - 59)  ← 리눅스와의 차이점
```


더 자세한 내용은 `@Scheduled` 어노테이션 Docs 를 보면 된다.

![](Spring/images/Pasted%20image%2020240929234609.png)

### scheduler
@Scheduled 메서드가 사용할 스케줄러를 지정할 수 있다. scheduler 의 이름은 `TaskScheduler` 타입의 Bean 이름을 적어주면 된다.

`TaskScheduler` Bean 이 없거나, `SchedulingConfigurer` 로 직접 스케줄러를 설정해주지 않으면, Main Thread 는 별도의 Thread 를 만들어 `Single Thread` 환경에서 모든 스케줄링을 관리하게 된다. 아래 사진의 `scheduling-1` 가 Main Thread 가 스케줄링을 위해 만든 별도의 Thread 이다. 관련 내용은 [다음 포스팅](Spring/SchedulingThread )에서 언급할 예정이다.

![](Spring/images/Pasted%20image%2020240929232937.png)



```plantuml-ascii 
Bob -> Alice : hello 
Alice -> Wonderland: hello 
Wonderland -> next: hello
next -> Last: hello 
Last -> next: hello 
next -> Wonderland : hello 
Wonderland -> Alice : hello 
Alice -> Bob: hello 
```