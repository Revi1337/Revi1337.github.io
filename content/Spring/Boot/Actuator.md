---
title: Actuator
tags: ['spring-boot', 'actuator']
---

Spring Boot 에서는 애플리케이션의 상태를 모니터링하고 관리할 수 있도록 도와주는 기능인 `Actuator (엑츄에이터)` 를 지원한다. 엑츄에이터는 주로 운영 환경에서 애플리케이션의 성능을 모니터링하거나 문제를 진단할 때 유용하며 수 많은 `Endpoint` 를 통해 애플리케이션의 상태 정보, 메트릭, 로그, 스레드 덤프 등을 확인할 수 있다. 더 나아가서 `마이크로미터, 프로메테우스, 그라파나` 같은 최근 유행하는 모니터링 시스템과 매우 쉽게 연동할 수 있는 기능도 제공한다.
 
## 의존성 추가
엑츄에이터는 gradle 에  `spring-boot-starter-actuator` 의존성을 추가해주면 바로 사용할 수 있다.

```groovy
dependencies {  
    implementation 'org.springframework.boot:spring-boot-starter-actuator'  
    ...
}
```

## Actuator 기본 주소
엑츄에이터의 주소에 접근하려면 Web 에서 `/actuator` 엔드포인트에 요청을 보내면 된다.

![](Spring/Boot/images/Pasted%20image%2020240910211926.png)

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator -s | jq 
{
  "_links": {
    "self": {
      "href": "http://localhost:8081/actuator",
      "templated": false
    },
    "health": {
      "href": "http://localhost:8081/actuator/health",
      "templated": false
    },
    "health-path": {
      "href": "http://localhost:8081/actuator/health/{*path}",
      "templated": true
    }
  }
}
```


엑츄에이터의 baseUrl 을 바꾸려면 Web 에서 보여질 주소를 `application.yml` 에서 변경해주면 된다.

```yml
management:  
  endpoints:  
    web:  
      base-path: /test
```

## Actuator 주요 기능
Actuator는 가 제공하는 관리 기능들 중, 가장 중요한 기능들은 아래와 같다.

1. **애플리케이션 상태 확인**: 애플리케이션의 헬스체크(Health Check)를 통해 현재 상태가 정상인지 여부를 확인할 수 있다.
2. **메트릭 수집**: JVM 메모리 사용량, CPU 사용량, 힙 메모리, 활성 스레드 수와 같은 시스템 메트릭을 제공하여, 성능을 모니터링할 수 있다.
3. **환경 정보 확인**: 애플리케이션의 설정된 `환경 변수`, `프로퍼티` 등을 볼 수 있다.
4. **애플리케이션 설정 정보 확인**: 현재 애플리케이션의 설정 및 Profile, Bean 정보 등을 확인할 수 있다.
5. **HTTP 트래픽 확인**: HTTP 요청 관련 메트릭과 요청/응답에 대한 정보를 확인할 수 있다.
6. **로그 레벨 조정**: 실행 중에 특정 패키지나 클래스의 로그 레벨을 동적으로 변경할 수 있다. 

## Actuator 엔드포인트
Spring Boot Actuator는 기본적으로 여러 엔드포인트를 제공한다. 각 엔드포인트는 특정 정보를 제공하거나 애플리케이션의 상태를 제어할 수 있다.

- `/actuator/health`: 애플리케이션의 상태를 나타냄 (정상/오류 등).
- `/actuator/info`: 애플리케이션에 대한 간단한 정보 제공
- `/actuator/metrics`: 애플리케이션 메트릭 정보 제공
- `/actuator/env`: 애플리케이션의 환경 변수와 프로퍼티 정보 제공
- `/actuator/loggers`: 로그 레벨 관리 및 변경 가능
- `/actuator/beans`: 스프링 컨텍스트 내의 Bean 정보 제공
- `/actuator/mappings`: 컨트롤러와 매핑된 URL 정보 
- `/actuator/configprops`: @ConfigurationProperties 정보 제공
- `/actuator/httpexchanges` : HTTP 호출 응답 정보를 보여준다.

## 설정
### 엔드포인트 활성화
하지만 Actuator 의 엔드포인트는 보안상 기본적으로 일부만 활성화되어 있다. 아래 예시를 보면 기본적으로 애플리케이션이 살아있는 지 볼 수 있는 `/actuator/health` 경로는 기본적으로 활성화 되어있지만, 메트릭 정보를 볼 수 있는 `/actuator/metrics`  경로는 비활성화 되어있는 것을 알 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/health -s | jq
{
  "status": "UP"
}
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/metrics -s | jq
{
  "timestamp": "2024-09-10T12:56:52.633+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/actuator/metrics"
}
```


따라서 `application.properties` 또는 `application.yml`에서 허용하고자 하는 엔드포인트를 활성화해야 한다. web 에서 노출시키고 싶은 기능이름을 yml 에 명시해주면 된다. 아래 예시는 metrics 와 env 정보를 web 에 노출시키겠다는 설정이 된다. 모든 기능을 web 에 노출시키고 싶다면 `아스타리스(*)` 를 명시해주면 된다.

```yml
management:  
  endpoints:  
    web:  
      exposure:  
        include: metrics,env # 혹은 *
```


변경한 설정을 curl 로 확인해보면 metrics 정보와 env 정보들이 잘 출력되는 것을 볼 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/metrics -s | jq | head -14
{
  "names": [
    "application.ready.time",
    "application.started.time",
    "disk.free",
    "disk.total",
    "executor.active",
    "executor.completed",
    "executor.pool.core",
    "executor.pool.max",
    "executor.pool.size",
    "executor.queue.remaining",
    "executor.queued",
    "hikaricp.connections",
revi1337@B3-B35T SpringBoot % 
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/env -s | jq | head -14    
{
  "activeProfiles": [],
  "defaultProfiles": [
    "default"
  ],
  "propertySources": [
    {
      "name": "server.ports",
      "properties": {
        "local.server.port": {
          "value": "******"
        }
      }
    },

```


조금 더 응용해보면, web 상에 모든 endpoint 들을 활성화시키지만 beans 와 env 정보는 노출되지 않도록 설정할 수도 있다.

```yml
management:  
  endpoints:  
    web:  
      exposure:  
        include: "*"  
        exclude: 'beans, env'
```


## 세부 기능
### 헬스 정보
`/actuator/health` 엔드포인트는 애플리케이션이 요청에 응답할 수 있는지 판단하는 것을 넘어서 애플리케이션이 사용하는 데이터베이스가 응답하는지, 디스크 사용량에는 문제가 없는지와 같은 다양한 정보들을 포함하여 상태를 체크하게 된다. 참고로 엑츄에이터의 Health 정보는 db, mongo, redis, diskspace ping 과 같은 수많은 헬스 기능을 기본으로 제공한다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/health -s | jq
{
  "status": "UP"
}
```


자세한 헬스 기본 지원 기능은 [공식문서](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.health.auto-configured-health-indicators)에서 확인할 수 있다. 또한, 헬스 기능을 직접 구현하는 것도 [공식문서](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.health.writing-custom-health-indicators) 에서 확인할 수 있다.

#### 상세 정보 출력
전체적인 상태정보 말고, 데이터베이스가 정상적인  디스크 사용량에는 문제가 없는지와 같은 상세정보를 보려면 application.yml 에서 설정을 해주면 된다. 

> [!note] yml prefix 를 주의
> yml 의 prefix 가 management.endpoint 인 것을 주의하자. web 상에 엔드포인트를 활성화할때는 prefix 가 management.endpoints 이었지만, 엔드포인트별(기능별) 세부 설정은 특별한 경우가 아니면 management.endpoint 하위에서 이루어진다.

```yml
management:  
  endpoint:  
    health:  
      show-details: always
```


설정을 마치고 애플리케이션을 다시 실행해보면, 아래와 같이 전체적인 애플리케이션 상태를 체크하기 위한 각각의 컴포넌트(db, diskSpace)들에 대한 세부상태정보가 나오는 것을 볼 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/health -s | jq
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "H2",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 994662584320,
        "free": 900847333376,
        "threshold": 10485760,
        "path": "/Users/revi1337/Desktop/workspace/SpringBoot/.",
        "exists": true
      }
    },
    "ping": {
      "status": "UP"
    }
  }
}

```


이러한 세부적인 정보까지는 필요없다면, 컴포넌트트들의 상태만 간략히 출력해줄 수 있다. 이 또한 application.yml 에서 설정해줄 수 있다. show-details 를 지우고 show-components 로 변경해주면 된다.

```yml
management:  
  endpoint:  
    health:  
      show-components: always
```


애플리케이션을 다시 실행해보면 애플리케이션을 이루는 컴포넌트들에 대한 상태정보만 간략히 출력해줄 수 있도록 변경된 것을 볼 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/health -s | jq
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "diskSpace": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

> [!note]
> 애플리케이션을 이루는 컴포넌트들의 상태중 하나라도 DOWN 이 있으면, 전체 status 는 DOWN 으로 판단한다.

### 애플리케이션 정보
`/actuator/info` 엔드포인트는 애플리케이션의 기본 정보를 노출한다. 기본으로 제공하는 기능들은 아래와 같다.

1. 자바 런타임 정보
2. OS 정보
3. env 정보 (Environment 에서 info. 로 시작하는 정보)
4. build 정보 (META-INF/build-info.properties) 파일이 필요하다.
5. git 정보 (git.properties) 파일이 필요하다.

하지만 env, java, os 는 기본적으로 비활성화 되어있다. 그리고 build 와 git 정보는 별도의 파일이 필요하다. 따라서 아무런 설정을 하지 않으면 `/actuator/info` 에는 아무 정보도 노출되지 않는다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/info -s | jq  
{}
```

#### Env, Java, OS 정보 노출
env, java, os 를 노출시키기 위해서는 아래와 같이 yml 을 수정하면 된다. `/actuator/info` 엔드포인트는 조금 특별한데, management.endpoint 하위가 아니라 `management 바로 하위`에 info 를 설정해주어야 한다. 또한, env 는 활성화시켜주는 것 뿐만아니라, indent 없이 `info` 하위에 엔드포인트에 노출되기 원하는 Key Value 값을 설정해주면 된다.

```yml
management:  
  info:  
    java:  
      enabled: true  
    env:  
      enabled: true  
    os:  
      enabled: true
      
info:  
  metadata:                       # 자식 이름은 마음대로 설정 가능
    name: spring-boot-application # Key Value 형태
    developer: revi1337  
  etc:                            # 자식 이름은 마음대로 설정 가능
    nickname: revi1337            # Key Value 형태
    
```


애플리케이션을 다시 실행하고 curl 로 요청을 보내보면 정상적으로 env, java, os 정보들이 잘 노출되는 것을 확인할 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/info -s | jq
{
  "metadata": {
    "name": "spring-boot-application",
    "developer": "revi1337"
  },
  "etc": {
    "nickname": "revi1337"
  },
  "java": {
    "version": "17.0.10",
    "vendor": {
      "name": "Homebrew",
      "version": "Homebrew"
    },
    "runtime": {
      "name": "OpenJDK Runtime Environment",
      "version": "17.0.10+0"
    },
    "jvm": {
      "name": "OpenJDK 64-Bit Server VM",
      "vendor": "Homebrew",
      "version": "17.0.10+0"
    }
  },
  "os": {
    "name": "Mac OS X",
    "version": "14.3",
    "arch": "aarch64"
  }
}
```


#### Build 정보 노출
build 정보를 노출하려면 빌드 시점에 `META-INF/build-info.properties` 파일을 만들어야 한다. `build.gradle` 에 아래 코드를 넣어주기만 하면 된다.

```groovy
springBoot {  
    buildInfo()  
}
```


그래들을 Refresh 해주고, 애플리케이션을 재실행해보면, `build/resources/main/META-INF/build-info.properties` 파일이 자동으로 생기게 된다.

```bash
revi1337@B3-B35T SpringBoot % cat build/resources/main/META-INF/build-info.properties
build.artifact=SpringBoot
build.group=revi1337
build.name=SpringBoot
build.time=2024-09-10T14\:39\:03.309678Z
build.version=0.0.1-SNAPSHOT
```


이제 curl 로 확인해보면, build 정보가 잘 노출되는 것을 확인할 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/info -s | jq '.build'
{
  "artifact": "SpringBoot",
  "name": "SpringBoot",
  "time": "2024-09-10T14:39:03.309Z",
  "version": "0.0.1-SNAPSHOT",
  "group": "revi1337"
}
```

#### Git 정보 노출
Git 정보를 노출하려면 `git.properties` 파일이 필요하다. Git 정보 노출은 앞서 살펴본 Build 정보 노출하는 것과 비슷하다. 우선 프로젝트에 Git 을 init 해주고 Commit 까지 해준다.

```bash
revi1337@B3-B35T SpringBoot % git init   
Initialized empty Git repository in /Users/revi1337/Desktop/workspace/SpringBoot/.git/
revi1337@B3-B35T SpringBoot % git add .
revi1337@B3-B35T SpringBoot % git commit -m 'initial commit' 
[main (root-commit) 3455473] initial commit
 10 files changed, 508 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 build.gradle
 ... 생략
revi1337@B3-B35T SpringBoot % git log 
commit 34554739f205a31013d33706d48134ea8c8d4c70 (HEAD -> main)
Author: Revi1337 <david122123@gmail.com>
Date:   Tue Sep 10 23:55:03 2024 +0900

    initial commit
revi1337@B3-B35T SpringBoot % 
```


그리고 build.gradle 의 plugin 파트에 아래의 플러그인 하나를 추가해준다. 

> [!note] 꼭 Git 으로 관리되고 있어야 한다.
> 플러그인을 추가하고 Gradle 을 Refresh 할 때 프로젝트가 Git 으로 관리되고 있지 않으면 Build 오류가 나게 된다. 필자는 Spring Boot 3.3.3 사용중인데 Git 으로 관리되고 있지 않아도 오류가 발생하지 않았다. 

```groovy
plugins {  
    ...
    id "com.gorylenko.gradle-git-properties" version "2.4.1"  
}
```


여하튼 이플리케이션을 다시 시작하면, `build/resources/main/git.properties` 가 생기게 된다.

```bash
revi1337@B3-B35T SpringBoot % cat build/resources/main/git.properties | head -5
git.branch=main
git.build.host=B3-B35T.local
git.build.user.email=david122123@gmail.com
git.build.user.name=Revi1337
git.build.version=0.0.1-SNAPSHOT
```


이제 Curl 로 `actuator/info` 엔드포인트에 접근하면 Git 정보도 잘 노출되는 것을 알 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/info -s | jq '.git'  
{
  "branch": "main",
  "commit": {
    "id": "3455473",
    "time": "2024-09-10T14:55:03Z"
  }
}
```


조금 더 자세한 Git 정보를 보고 싶으면 `application.yml` 를 수정해주면 된다.

```yml
management:  
  info:  
    java:  
      enabled: true  
    env:  
      enabled: true  
    os:  
      enabled: true
	git:  
	  mode: full
```


애플리케이션을 다시 실행해보면 Git 정보가 굉장히 세세히 나오는것을 볼 수 있다.

```yml
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/info -s | jq '.git' | head -20 
{
  "branch": "main",
  "commit": {
    "time": "2024-09-10T14:55:03Z",
    "message": {
      "full": "initial commit\n",
      "short": "initial commit"
    },
    "id": {
      "describe": "",
      "abbrev": "3455473",
      "full": "34554739f205a31013d33706d48134ea8c8d4c70"
    },
    "user": {
      "email": "david122123@gmail.com",
      "name": "Revi1337"
    }
  },
  "build": {
    "version": "0.0.1-SNAPSHOT",
```

### 로거 정보
`/actuator/logger` 엔드포인트는 애플리케이션 실행 중에 특정 패키지나 클래스의 로그 레벨을 동적으로 변경할 수 있다. 우선 아래와 같이 Log 를 적는 Handler 를 하나 만들어 주자.

```java
@Slf4j  
@RestController  
public class LogHandler {  
  
    @GetMapping("/log")  
    public void log() {  
        log.trace("trace log");  
        log.debug("debug log");  
        log.info("info log");  
        log.warn("warn log");  
        log.error("error log");  
    }  
}
```


그리고 애플리케이션에 요청을 날려보면 info, warn, error 3개의 로그가 뜨게 된다.

```text
2024-09-11T00:45:37.292+09:00  INFO 28870 --- [SpringBoot] [nio-8081-exec-3] revi1337.springboot.LogHandler           : info log
2024-09-11T00:45:37.293+09:00  WARN 28870 --- [SpringBoot] [nio-8081-exec-3] revi1337.springboot.LogHandler           : warn log
2024-09-11T00:45:37.293+09:00 ERROR 28870 --- [SpringBoot] [nio-8081-exec-3] revi1337.springboot.LogHandler           : error log
```


5개의 로그를 적었는데, 3개의 로그만 남는 이유는 스프링 부트 기본 로그 레벨이 `info` 여서 그렇다. 이 로그레벨은 `application.yml` 에서 변경해줄 수 있다. 아래와 같이 `revi1337.springboot` 패키지 하위의 기본 로그 레벨을 가장 낮은 trace 로 설정하게 되면

```yml
logging:  
  level:  
    revi1337.springboot: trace
```

> [!note]
> 해당 설정은 엑츄에이터에서 제공하는 설정이 아니라 스프링 부트에서 제공하는 설정이다.


trace 부터 그 이상 로그 레벨들이 모두 출력되게 된다.

```text
2024-09-11T00:49:57.984+09:00 TRACE 29229 --- [SpringBoot] [nio-8081-exec-1] revi1337.springboot.LogHandler           : trace log
2024-09-11T00:49:57.984+09:00 DEBUG 29229 --- [SpringBoot] [nio-8081-exec-1] revi1337.springboot.LogHandler           : debug log
2024-09-11T00:49:57.984+09:00  INFO 29229 --- [SpringBoot] [nio-8081-exec-1] revi1337.springboot.LogHandler           : info log
2024-09-11T00:49:57.984+09:00  WARN 29229 --- [SpringBoot] [nio-8081-exec-1] revi1337.springboot.LogHandler           : warn log
2024-09-11T00:49:57.984+09:00 ERROR 29229 --- [SpringBoot] [nio-8081-exec-1] revi1337.springboot.LogHandler           : error log
```

#### 로깅 레벨 확인
자 이제 엑츄에이터의 `/actuator/loggers` 에 요청을 보내면 무수히 긴 json 들이 뜨는데, 앞서 yml 에 설정한 `패키지 이름을` 검색해보면 앞에서 설정한 로그레벨이 나오는 것을 볼 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/loggers -s | jq '.loggers."revi1337.springboot"'
{
  "configuredLevel": "TRACE",
  "effectiveLevel": "TRACE"
}
```


물론 패키지 하위에 속한 클래스 이름으로까지 검색할 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/loggers -s | jq '.loggers."revi1337.springboot.LogHandler"'
{
  "effectiveLevel": "TRACE"
}
```


위의 예시들처럼 CLI 도구인 JQ 의 옵션으로 상세하게 검색해도 되지만, 엑츄에이터에서는 특정 로거 이름으로 조회할 수 있는 기능을 제공한다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/loggers/revi1337.springboot -s | jq                        
{
  "configuredLevel": "TRACE",
  "effectiveLevel": "TRACE"
}
```


마찬가지로 패키지에 속한 클래스 명으로도 조회할 수 있다.

```yml
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/loggers/revi1337.springboot.LogHandler -s | jq
{
  "effectiveLevel": "TRACE"
}
```

#### 로깅 레벨 동적 변경
엑츄에이터는 실시간으로 로그 레벨을 변경할 수 있게 하는 기능을 제공한다. 원래라면 갑작스러운 문제가 발생하게 되어 로그를 확인해보고 싶으면 애플리케이션을 내리고 로그레벨을 바꾸고 난 후 다시 시작했어야하는데, 해당 기능을 사용하면 애플리케이션을 재시작하지 않고 로그 레벨을 동적으로 바꿔 실시간으로 로그를 확인할 수 있다.

로그 레벨을 바꾸려면, 바꾸고자 하는 패키지(`/actuator/loggers/{로거명 혹은 패키지 이름}`) 에 POST 요청을 날리면 된다. 이 때, Http Body 에는 `{"configuredLevel": "DEBUG"}` JSON 을 보내주어야 한다. 요청이 성공하면 Response 로 `204` 가 떨어지게 된다.

```bash {12}
revi1337@B3-B35T SpringBoot % curl -X POST -H "Content-Type: application/json" -d '{"configuredLevel": "DEBUG"}' localhost:8081/actuator/loggers/revi1337.springboot -v      
Note: Unnecessary use of -X or --request, POST is already inferred.
*   Trying [::1]:8081...
* Connected to localhost (::1) port 8081
> POST /actuator/loggers/revi1337.springboot HTTP/1.1
> Host: localhost:8081
> User-Agent: curl/8.4.0
> Accept: */*
> Content-Type: application/json
> Content-Length: 28
> 
< HTTP/1.1 204 
< Date: Tue, 10 Sep 2024 16:14:12 GMT
< 
* Connection #0 to host localhost left intact
```


이제 패키지 이름을 다시 검색해보면 로그이름이 TRACE 에서 DEBUG 로 바뀐것을 확인할 수 있다.

```bash 
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/loggers/revi1337.springboot -s | jq                                                                 
{
  "configuredLevel": "DEBUG",
  "effectiveLevel": "DEBUG"
}
```


당연히 앞서 만든 LogHandler 에 요청을 보내보면 5개의 로그중 TRACE 로그를 제외한 나머지 4개의 로그가 남게되는 것을 확인할 수 있다.

```text
2024-09-11T01:20:11.019+09:00 DEBUG 29831 --- [SpringBoot] [nio-8081-exec-2] revi1337.springboot.LogHandler           : debug log
2024-09-11T01:20:11.020+09:00  INFO 29831 --- [SpringBoot] [nio-8081-exec-2] revi1337.springboot.LogHandler           : info log
2024-09-11T01:20:11.020+09:00  WARN 29831 --- [SpringBoot] [nio-8081-exec-2] revi1337.springboot.LogHandler           : warn log
2024-09-11T01:20:11.020+09:00 ERROR 29831 --- [SpringBoot] [nio-8081-exec-2] revi1337.springboot.LogHandler           : error log
```

> [!note]
> 애플리케이션을 재시작하게 되면, yml 에 설정되어있는 로그 레벨로 다시 초기화되게 된다.

### HTTP 요청 응답 정보
과거 Http 요청 응답을 보고싶다면 `/actuator/httpexchanges` 엔드포인트에서 확인하면 된다. 하지만 엔드포인트를 찾을 수 없다는 오류가 발생하게 된다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/httpexchanges -s | jq
{
  "timestamp": "2024-09-10T16:25:38.103+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/actuator/httpexchanges"
}
```


이 이유는 `HttpExchangeRepository` 를 구현한 빈을 별도 로 등록하지 않아서 그렇다. 해당 빈을 직접 등록해주지 않으면 엔드포인트가 활성화되지 않는다.
 
#### HttpExchangeRepository 등록
HttpExchangeRepository 를 Bean 으로 등록하는 방법은 매우 간단하다. HttpExchangeRepository 의 구현체인 `InMemoryHttpExchangeRepository` 가 이미 만들어져있기 때문에 @ComponentScan 이 스캔할 수 있는 Scope 아무데나 Bean 을 등록해주면 된다.

> [!note]
> InMemoryHttpExchangeRepository 이름에 나와있듯, InMemory 기반이기 때문에 애플리케이션이 종료되면 기존 Http 요청 응답 기록들은 사라지게 된다.

```java
@SpringBootApplication  
public class Application {  
  
    public static void main(String[] args) {  
        SpringApplication.run(Application.class, args);  
    }  
  
    @Bean  
    public InMemoryHttpExchangeRepository httpExchangeRepository() {  
        return new InMemoryHttpExchangeRepository();  
    }  
}
```


이제 애플리케이션을 재시작하고 엔드포인트에 들어가면 아래와 같이 애플리케이션이 시작되고 나서 들어온 Http 요청과 응답을 확인할 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/httpexchanges -s | jq
{
  "exchanges": [
    {
      "timestamp": "2024-09-10T16:32:07.528030Z",
      "request": {
        "uri": "http://localhost:8081/log",
        "method": "GET",
        "headers": {
          "host": [
            "localhost:8081"
          ],
          "user-agent": [
            "curl/8.4.0"
          ],
          "accept": [
            "*/*"
          ]
        }
      },
      "response": {
        "status": 200,
        "headers": {}
      },
      "timeTaken": "PT0.002781S"
    },
... 생략
```

### Metrics 정보
`/actuator/metrics` 엔드포인트를 통해 CPU, JVM, DB 커넥션, Http 요청 통계를 포함한 여러가지 지표를 확인할 수 있다. 기본으로 확인할 수 있는 정보들은 아래와 같다. 

> [!info]
> 제외하고도 Http 클라이언트 메트릭 (RestTemplate, WebClient), 캐시 메트릭, 스케줄 메트릭, 몽고 DB 메트릭, Redis 메트릭이 기본적으로 제공된다.

```bash
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics' -s | jq
{
  "names": [
    "application.ready.time",
    "application.started.time",
    "disk.free",
    "disk.total",
    "executor.active",
    "executor.completed",
    "executor.pool.core",
    "executor.pool.max",
    "executor.pool.size",
    "executor.queue.remaining",
    "executor.queued",
    "hikaricp.connections",
    "hikaricp.connections.acquire",
    "hikaricp.connections.active",
    "hikaricp.connections.creation",
    "hikaricp.connections.idle",
    "hikaricp.connections.max",
    "hikaricp.connections.min",
    "hikaricp.connections.pending",
    "hikaricp.connections.timeout",
    "hikaricp.connections.usage",
    "http.server.requests",
    "http.server.requests.active",
    "jdbc.connections.active",
    "jdbc.connections.idle",
    "jdbc.connections.max",
    "jdbc.connections.min",
    "jvm.buffer.count",
    "jvm.buffer.memory.used",
    "jvm.buffer.total.capacity",
    "jvm.classes.loaded",
    "jvm.classes.unloaded",
    "jvm.compilation.time",
    "jvm.gc.live.data.size",
    "jvm.gc.max.data.size",
    "jvm.gc.memory.allocated",
    "jvm.gc.memory.promoted",
    "jvm.gc.overhead",
    "jvm.info",
    "jvm.memory.committed",
    "jvm.memory.max",
    "jvm.memory.usage.after.gc",
    "jvm.memory.used",
    "jvm.threads.daemon",
    "jvm.threads.live",
    "jvm.threads.peak",
    "jvm.threads.started",
    "jvm.threads.states",
    "logback.events",
    "process.cpu.time",
    "process.cpu.usage",
    "process.files.max",
    "process.files.open",
    "process.start.time",
    "process.uptime",
    "system.cpu.count",
    "system.cpu.usage",
    "system.load.average.1m",
    "tomcat.sessions.active.current",
    "tomcat.sessions.active.max",
    "tomcat.sessions.alive.max",
    "tomcat.sessions.created",
    "tomcat.sessions.expired",
    "tomcat.sessions.rejected"
  ]
}
```


`/actuator/metrics/{name}` 으로 확인해보고 싶은 리소스들의 상태를 상세하게 확인할 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/metrics/application.ready.time -s | jq
{
  "name": "application.ready.time",
  "description": "Time taken for the application to be ready to service requests",
  "baseUnit": "seconds",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 1.468
    }
  ],
  "availableTags": [
    {
      "tag": "main.application.class",
      "values": [
        "revi1337.springboot.Application"
      ]
    }
  ]
}
```

#### 상세 확인
`/actuator/metrics/{name}` 으로 검색을 하면, 출력되는 JSON 필드 중 `availableTags` 가 있는 것을 볼 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator/metrics/jvm.memory.used -s | jq
{
  "name": "jvm.memory.used",
  "description": "The amount of used memory",
  "baseUnit": "bytes",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 198500664
    }
  ],
  "availableTags": [
    {
      "tag": "area",
      "values": [
        "heap",
        "nonheap"
      ]
    },
    {
      "tag": "id",
      "values": [
        "G1 Survivor Space",
        "Compressed Class Space",
        "Metaspace",
        "CodeCache",
        "G1 Old Gen",
        "G1 Eden Space"
      ]
    }
  ]
}
```


tag 쿼리파라미터 로 특정 tag 에 대한 상세정보를 따로 확인할 수 있다. 검색 포맷은 `?tag=tag:value` 이다.

```bash
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics/jvm.memory.used?tag=area:heap' -s | jq
{
  "name": "jvm.memory.used",
  "description": "The amount of used memory",
  "baseUnit": "bytes",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 118345536
    }
  ],
  "availableTags": [
    {
      "tag": "id",
      "values": [
        "G1 Survivor Space",
        "G1 Old Gen",
        "G1 Eden Space"
      ]
    }
  ]
}
```

#### 애플리케이션 시작 정보
`application.started.time` 은 애플리케이션을 시작하는데 걸리는 시간을 의미한다. 해당 정보는 `ApplicationStartedEvent` 로 인해 측정된다.

```bash
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics/application.started.time' -s | jq
{
  "name": "application.started.time",
  "description": "Time taken to start the application",
  "baseUnit": "seconds",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 1.417
    }
  ],
  "availableTags": [
    {
      "tag": "main.application.class",
      "values": [
        "revi1337.springboot.Application"
      ]
    }
  ]
}
```


`application.ready.time` 은 애플리케이션이 요청을 처리할 준비가 되는데 걸리는 시간을 의미한다. 해당 정보는`ApplicationReadyEvent` 로 측정된다.

```bash
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics/application.ready.time' -s | jq 
{
  "name": "application.ready.time",
  "description": "Time taken for the application to be ready to service requests",
  "baseUnit": "seconds",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 1.421
    }
  ],
  "availableTags": [
    {
      "tag": "main.application.class",
      "values": [
        "revi1337.springboot.Application"
      ]
    }
  ]
}
```

> [!note] 실행되는 Event 들
> 스프링은 내부에 여러 초기화 단계가 있고 각 단계별로 내부에서 애플리케이션 이벤트를 발행한다. 
> - ApplicationStartedEvent : 스프링 컨테이너가 완전히 실행된 상태이다. 이후에 CommentLineRunner 가 호출된다.  
> - ApplicationReadyEvent : CommandLineRunner 가 실행된 이후에 호출된다.

#### Http 요청/응답 정보
매우 신기한 것은 metrics 의 `http.server.requests` 에는 애플리케이션이 시작되고 몇번의 요청이 왔고, 어떤 URI 에 들어왔고, 어떤 예외가 발생했고 등의 여러가지 정보를 확인할 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics/http.server.requests' -s | jq
{
  "name": "http.server.requests",
  "baseUnit": "seconds",
  "measurements": [
    {
      "statistic": "COUNT",              # 요청 개수
      "value": 1.0
    },
    {
      "statistic": "TOTAL_TIME",         # 모든 요청에 대한 응답에 걸린 총 시간
      "value": 0.006029583
    },
    {
      "statistic": "MAX",                # 특정 요청에 대한 응답까지 가장 오래 걸린 시간
      "value": 0.006029583
    }
  ],
  "availableTags": [
    {
      "tag": "exception",                # 발생한 예외
      "values": [
        "none"
      ]
    },
    {
      "tag": "method",                   # 요청에 들어왔던 Http Method 정보
      "values": [
        "GET"
      ]
    },
    {
      "tag": "error",                    
      "values": [
        "none"
      ]
    },
    {
      "tag": "uri",                      # 현재까지 들어온 URI 주소들
      "values": [
        "/log"
      ]
    },
    {
      "tag": "outcome",                  # 2xx = SUCCESS, 3xx = REDIRECTION, 4xx = CLIENT_ERROR
      "values": [
        "SUCCESS"
      ]
    },
    {
      "tag": "status",                   # 응답으로 간 Status Code 종류
      "values": [
        "200"
      ]
    }
  ]
}
```


테스트로 존재하지 않는 URL 에 접속해서 404 를 의도한 후, 다시 `http.server.requests` 를 검색해보면 status 에 404 가 추가된 것을 확인할 수 있다.

```bash 
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/notfound_test' -s | jq
{
  "timestamp": "2024-09-11T09:02:17.913+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/notfound_test"
}
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics/http.server.requests' -s | jq               
... 생략
    {
      "tag": "status",
      "values": [
        "404",
        "200"
      ]
    }
  ]
}
```


또한, `http.server.requests` 에서도 여러 tag 들로 조합하여 세밀하게 검색할 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics/http.server.requests?tag=uri:/log&tag=status:200' -s | jq
{
  "name": "http.server.requests",
  "baseUnit": "seconds",
  "measurements": [
    {
      "statistic": "COUNT",
      "value": 1.0
    },
    {
      "statistic": "TOTAL_TIME",
      "value": 0.02799875
    },
    {
      "statistic": "MAX",
      "value": 0.02799875
    }
  ],
  "availableTags": [
    {
      "tag": "exception",
      "values": [
        "none"
      ]
    },
    {
      "tag": "method",
      "values": [
        "GET"
      ]
    },
    {
      "tag": "error",
      "values": [
        "none"
      ]
    },
    {
      "tag": "outcome",
      "values": [
        "SUCCESS"
      ]
    }
  ]
}
```

#### 톰캣 Metric
Metrics 에서 톰캣과 관련된 매트릭을 확인할 수 있다. 제일 기본적으로는 톰캣 session 과 관련된 6가지 항목을 볼 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics' -s | jq | grep tomcat
    "tomcat.sessions.active.current",
    "tomcat.sessions.active.max",
    "tomcat.sessions.alive.max",
    "tomcat.sessions.created",
    "tomcat.sessions.expired",
    "tomcat.sessions.rejected"
```


application.yml 에서 `server.tomcat.mbeanregistry.enabled` 를 true 로 변경해주면

```yml
server:  
  tomcat:  
    mbeanregistry:  
      enabled: true
```


톰캣과 관련해 볼 수 있는 정보들이 많이 늘어나게 된다.

```bash
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics' -s | jq | grep tomcat
    "tomcat.cache.access",
    "tomcat.cache.hit",
    "tomcat.connections.config.max",
    "tomcat.connections.current",
    "tomcat.connections.keepalive.current",
    "tomcat.global.error",
    "tomcat.global.received",
    "tomcat.global.request",
    "tomcat.global.request.max",
    "tomcat.global.sent",
    "tomcat.servlet.error",
    "tomcat.servlet.request",
    "tomcat.servlet.request.max",
    "tomcat.sessions.active.current",
    "tomcat.sessions.active.max",
    "tomcat.sessions.alive.max",
    "tomcat.sessions.created",
    "tomcat.sessions.expired",
    "tomcat.sessions.rejected",
    "tomcat.threads.busy",
    "tomcat.threads.config.max",
    "tomcat.threads.current"
```


이들 중 가장 유용한 것은 `tomcat.threads.busy` 와 `tomcat.threads.config.max` 정보이다. `tomcat.threads.config.max` 는 톰캣이 최대 200 개의 스레드로 사용자의 요청을 처리할 수 있다는 것이고,

```bash
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics/tomcat.threads.config.max' -s | jq
{
  "name": "tomcat.threads.config.max",
  "baseUnit": "threads",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 200.0
    }
  ],
  "availableTags": [
    {
      "tag": "name",
      "values": [
        "http-nio-8081"
      ]
    }
  ]
}
```


`tomcat.threads.busy` 는 현재 바쁘게 동작하고 있는 스레드의 수를 의미한다. 이 수가 tomcat.threads.config.max 에서 확인한 스레드 개수를 초과하면 장애로 이어지게 된다.

```bash
revi1337@B3-B35T SpringBoot % curl 'localhost:8081/actuator/metrics/tomcat.threads.busy' -s | jq               
{
  "name": "tomcat.threads.busy",
  "baseUnit": "threads",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 1.0
    }
  ],
  "availableTags": [
    {
      "tag": "name",
      "values": [
        "http-nio-8081"
      ]
    }
  ]
}
```

> [!info]
> 사용자는 직접 메트릭을 정의할 수 있다. 사용자 정의 메트릭을 만들기 위해서는 [공식문서](https://docs.spring.io/spring-boot/reference/actuator/metrics.html#actuator.metrics.supported) 를 참고하면 된다.
> 

## Actuator 보안
엑츄에이터는 애플리케이션의 내부 정보를 너무 많이 보여준다. 그렇기 때문에 외부망에 엑츄에이터 엔드포인트를 공개하는것은 바람직하지 않다. 해결방법으로는 엑츄에이터의 포트를 다르게 설정하거나, 엑츄에이터의 엔드포인트에 필터, 인터셉터 혹은 스프링 시큐리티로 인증 인가 로직을 덧붙일 수 있다.

### Actuator 포트 변경
아래와 같이 엑츄에이터의 포트를 변경해주면 

```yml
management:  
  server:  
    port: 8083
```


8081, 8083 두개의 포트가 활성화되는것을 볼 수 있다.

```text {1,8}
 Tomcat started on port 8081 (http) with context path '/'
2024-09-11T02:13:28.392+09:00  INFO 35759 --- [SpringBoot] [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 8083 (http)
2024-09-11T02:13:28.392+09:00  INFO 35759 --- [SpringBoot] [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2024-09-11T02:13:28.392+09:00  INFO 35759 --- [SpringBoot] [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.28]
2024-09-11T02:13:28.397+09:00  INFO 35759 --- [SpringBoot] [           main] o.a.c.c.C.[Tomcat-1].[localhost].[/]     : Initializing Spring embedded WebApplicationContext
2024-09-11T02:13:28.397+09:00  INFO 35759 --- [SpringBoot] [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 25 ms
2024-09-11T02:13:28.401+09:00  INFO 35759 --- [SpringBoot] [           main] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 15 endpoints beneath base path '/actuator'
2024-09-11T02:13:28.415+09:00  INFO 35759 --- [SpringBoot] [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8083 (http) with context path '/'
```


비지니스 로직이 돌아가는 8081 포트에서 /actuator 엔드포인트에 접근하면 404가 뜨는 것을 볼 수 있고

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8081/actuator -s | jq
{
  "timestamp": "2024-09-10T17:17:42.757+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/actuator"
}
```


비지니스 로직이 아닌, 모니터링을 위한 8083 포트에서는 200 과 json 이 잘 오는것을 볼 수 있다.

```bash
revi1337@B3-B35T SpringBoot % curl localhost:8083/actuator -s | jq
{
  "_links": {
    "self": {
      "href": "http://localhost:8083/actuator",
      "templated": false
    },
...
```


