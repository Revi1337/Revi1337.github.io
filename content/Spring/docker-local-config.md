---
title: docker-compose 를 통한 로컬 개발환경 설정
---

`docker-compose` 를 통해 로컬 개발 환경을 설정해보자.  기본적으로 `SpringBoot` 을 사용할 것이고 `MySQL`, `Redis` 를 컨테이너로 올려 SpringBoot 에서 사용할 예정이다. 이걸 인프라라고 말하기도 그렇지만 구성도를 그려보자면 아래와 같이 나타낼 수 있다.


![](/Spring/images/Pasted%20image%2020240110145012.png)


## 프로젝트 구조
개발환경을 설정하기 전에 해당 포스팅을 그대로 따라하면 최종적으로 아래와 같은 프로젝트 구조가 된다.

![](/Spring/images/Pasted%20image%2020240110191225.png)

## docker-compose.yml 작성
Spring 에서 `MySQL`, `Redis`  Container 를 사용할것이기 때문에 우선적으로 MySQL, Redis 를 Container 로 띄워야 한다. 이를 위해 Container 를 한번에 관리할 수 있는 `docker-compose` 를 사용할 것이다. docker-compose 는 내부적으로  `docker-compose.yml` 이라는 파일을 참조하기 때문에 해당 파일을 작성해주어야 한다. 해당 파일의 내용은 아래와 같이 작성해준다.

> Windows 기준 Docker 를 설치하면 docker-compose 커맨드라인 도구는 설치되어 있다.

```yml
version: "3.8"  
  
services:  
  database:  
    image: mysql:8-oracle  
    container_name: spring_database  
    restart: always  
    expose:  
      - 3306  
    ports:  
      - "9908:3306"  
    command:  
      - --character-set-server=utf8mb4  
      - --collation-server=utf8mb4_unicode_ci  
    environment:  
      MYSQL_USER: revi1337  
      MYSQL_PASSWORD: 1337  
      MYSQL_ROOT_PASSWORD: 1234  
      MYSQL_DATABASE: docker_build  
    volumes:  
      - ../db/mysql/data:/var/lib/mysql  
      - ../db/mysql/init:/docker-entrypoint-initdb.d
  
  cache-database:  
    image: redis  
    container_name: spring_cache  
    expose:  
      - 6379  
    ports:  
      - "6380:6379"
```


각 Field 들의 의미는 아래와 같다.

| Field          | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| services       | 실행하려는 Container 들을 명시. docker-comopse 에서는 container 대신 services 라는 개념을 사용한다. |
| image          | 사용하고 싶은 image 를 명시. 로컬에 해당 image 가 없으면  Docker Hub 에서 Pull 하여 사용한다.          |
| container_name | image 를 통해 생성되는 Container 이름을 명시.                                            |
| restart        | 컨테이너를 수동으로 끄기 전까지 항상 재시작 되도록 명시.                                             |
| expose         | Container 가 노출되기 원하는 Port 정보를 명시. (ports 를 명시해주면 굳이 사용할 필요 X)                |
| ports          | Container 가 노출한 Port 정보와 외부로 노출되기 원하는 Port 정보를 매핑.                           |
| command        | Container 가 실행될때 추가적으로 실행되는 옵션을 명시.                                          |
| environment    | Image 에서 사용되는 환경변수를 명시. DockerHub 에서 환경변수를 볼 수 있다.                           |
| volumes        | Container 외부에 파일 시스템을 마운트할 때 사용.                                             |

> [!note]
> volumes 에서 : 를 기준으로 오른쪽(Container 내부 파일시스템)이 왼쪽(로컬 파일시스템)에 마운트된다. 따라서 컨테이너가 죽어도 로컬에 있는 파일시스템으로 값을 동기화할 수 있다. 

### Volumes 파일 정보
앞서 언급했듯, volumes 를 통해 Container 내부의 특정한 파일시스템을 로컬로 Mount 시켜 데이터베이스를 동기화할 수 있다.

**../db/mysql/data:/var/lib/mysql**

- Container 내부 `/var/lib/mysql` 파일시스템을 로컬의 `docker-compose.yml` 파일이 존재하는 경로를 기준으로 `../db/mysql/data` 경로에 마운트한다.  첨언하자면 /var/lib/mysql 디렉터리는 MySQL이 데이터베이스 파일을 저장하는 곳으로 기본적으로 데이터 파일들이 위치하는 디렉터리이다. 해당 디렉터리 하위에는 `데이터베이스 파일, 테이블 데이터, 인덱스, 로그 파일` 등이 저장된다.

**../db/mysql/init:/docker-entrypoint-initdb.d**

- Container 내부 `/docker-entrypoint-initdb.d` 파일시스템을 로컬의 `docker-compose.yml` 파일이 존재하는 경로를 기준으로 `../db/mysql/init` 경로에 마운트한다. 첨언하자면 /docker-entrypoint-initdb.d 디렉터리는 도커 컨테이너 내에서 MySQL 이미지를 사용할 때 `초기화 스크립트나 SQL 파일을 자동으로 실행`하는 데 사용되기 때문에 해당 폴더에 초기화 스크립트를 넣어 초기데이터를 넣기에 매우 적합하다. 뿐만 아니라 디렉터리에 있는 `SQL` 파일들은 이름 순서대로 실행하기 때문에 `여러개의 초기화 스크립트` 를 설정할수도 있다. 

> [!warn]
> /docker-entrypoint-initdb.d 안의 초기화 스크립트들은 컨테이너가 제일 처음 실행될때 딱 한번만 실행된다.

### 초기 스크립트 작성
초기데이터를 넣기위해 로컬 `docker-compose.yml` 파일이 존재하는 경로를 기준으로 `../db/mysql/init`  경로에 초기화 스크립트를 적어주어야 한다 (여러개를 작성하려면 사전순으로). 필자는 두개의 초기화 스크립트를 사전순으로 작성해주었다.

```sql
# v1_init.sql

drop table if exists first_table;  
SET character_set_client = utf8mb4 ;  
  
create table first_table (  
    id bigint not null auto_increment,  
    name varchar(255),  
    primary key (id)  
) engine=InnoDB
```

```sql
# v2_init.sql

drop table if exists second_table;  
SET character_set_client = utf8mb4 ;  
  
create table second_table (  
    id bigint not null auto_increment,  
    name varchar(255),  
    primary key (id)  
) engine=InnoDB
```

## Container 생성
이제 아래의 명령어를 통해  `docker-compose.yml`  을 실행하여 Container 들을 생성 및 실행해주면 된다. 

- `-d` 옵션은 컨테이너를 실행시킨 후, `Terminal` 로 빠져나오게하는 옵션이다.
- `-f` 옵션은 `docker-compose.yml` 파일이 위치하는 경로를 명시해주면 된다. (compose 파일의 위치와 현재 경로가 일치한다면 명시해주지 않아도 된다)

```bash
$ docker-compose -f ./docker/docker-compose.yml up -d
```


추가적으로 특정한 `services` 만 실행하고 싶다면 yml 에 작성한 services 이름을 명시해주면 된다.

```bash
$ docker-compose -f ./docker/docker-compose.yml up cache-database -d
```


컨테이너가 실행되는 로그를 보면 제일 먼저 `docker-compose.yml` 에 작성한 MySQL 의 `MYSQL_DATABASE` 환경변수에 의해 `docker_build` 데이터베이스가 먼저 생성되고, 이후에 로컬 `../db/mysql/init` 위치에 작성했던 초기화 스크립트들이 사전순으로 실행되는 것을 확인할 수 있다.

![](/Spring/images/Pasted%20image%2020240110192012.png)


아래 사진을 보면 container 가 잘 뜬 것을 확인할 수 있고

![](/Spring/images/Pasted%20image%2020240110163330.png)


초기화 스크립트로 인해 `DDL` 문이 동작하여 DB 에 테이블이 생성된 것을 확인할 수 있다.

![](/Spring/images/Pasted%20image%2020240110192544.png)

### 초기 스크립트가 실행되지 않을때
`docker-compose -f ./docker/docker-compose.yml up -d` 로 컨테이너를 생성하더라도 초기 스크립트가 실행되지 않을때가 있다. 이에 대해 도커에서는 `/docker-entrypoint-initdb.d` 라는 스크립트 파일은 컨테이너가 실행되는 시점에 `데이터베이스가 이미 존재하면(데이터 디렉터리가 비어있지 않으면) 실행되지 않는다`고 한다.  

우리는 컨테이너 내부의 /var/lib/mysql 경로를 로컬의 ../db/mysql/data 경로로 마운트시켰고, 이미 한번 컨테이너를 실행했다. 그렇기 때문에 그 다음 컨테이너를 실행할 시점에는 ../db/mysql/data 가 비어있지 않아 초기화 스크립트가 실행되지 않는다.

```yml
volumes:  
  - ../db/mysql/data:/var/lib/mysql  
  - ../db/mysql/init:/docker-entrypoint-initdb.d
```

### 해결방법
해결방법은 간단하다. 로컬의 ../db/mysql/data 안의 내용들을 삭제해주고 컨테이너를 다시 시작해주면 초기화 스크립트가 다시 작동하게 된다. 혹시 다른 이유로 초기화 스크립트가 동작하지 않을때는 해당 [링크](https://copyprogramming.com/howto/docker-compose-mysql-init-sql-is-not-executed) 를 참고하도록 하자.

## Spring 코드 작성
### dependencies 확인
여기부터는 스프링의 영역이다. 우선 해당 포스팅에서 사용하는 의존성은 아래와 같다.

```groovy
dependencies {  
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'  
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'  
    implementation 'org.springframework.boot:spring-boot-starter-web'  
    compileOnly 'org.projectlombok:lombok'  
    runtimeOnly 'com.h2database:h2'  
    runtimeOnly 'com.mysql:mysql-connector-j'  
    annotationProcessor 'org.projectlombok:lombok'  
    testImplementation 'org.springframework.boot:spring-boot-starter-test'  
}
```

### application.yml 설정
이제 `application.yml` 파일을 작성해준다.

```yml
spring:  
  datasource:  
    url: jdbc:mysql://localhost:9908/docker_build  
    username: root  
    password: 1234  
    driver-class-name: com.mysql.cj.jdbc.Driver  
  
  jpa:  
    hibernate:  
      ddl-auto: create  
    properties:  
      hibernate:  
        format_sql: true  
  
  data:  
    redis:  
      port: 6380  
  
logging:  
  level:  
    org:  
      hibernate:  
        SQL: DEBUG
```

### 애플리케이션 코드 작성
이제 환경설정이 끝났으니 애플리케이션 코드만 작성해주면 된다. 필자는 간단하게 `DataSource` 커넥션 정보, `Redis` 의 Key Value 셋팅 동작 여부, JPA 로 `MySQL` 에 select 가 잘 가는지만 테스트할 것이다.
 
우선 Persistence Layer 의 코드는 아래와 같다. Repository 는 생략한다.

```java
@Getter  
@NoArgsConstructor(access = AccessLevel.PROTECTED)  
@Entity  
public class Member {  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.IDENTITY)  
    private Long id;  
  
    private String name;  
  
    public Member(String name) {  
        this.name = name;  
    }  
}
```


또한, MYSQL 을 테스트하기 위해 초기데이터를 입력해준다.

```java
@RequiredArgsConstructor  
@Component  
public class InitData {  
  
    private final MemberRepository memberRepository;  
  
    @EventListener(ApplicationReadyEvent.class)  
    public void ready() {  
        Member member1 = new Member("testMember1");  
        Member member2 = new Member("testMember2");  
        memberRepository.saveAll(List.of(member1, member2));  
    }  
}
```


기본적인 Controller 코드는 아래와 같다. 아래와 같이 Repository 계층을 바로 Controller 계층에 주입하면 좋지 않다. 하지만 테스트 용도이기 때문에 이 부분은 넘어간다.

```java
@RequiredArgsConstructor  
@RestController  
public class DemoController {  
  
    private final DataSourceProperties dataSourceProperties;  
    private final MemberRepository memberRepository;  
    private final StringRedisTemplate stringRedisTemplate;  
  
    @GetMapping("/connect")  
    public DataSourceProperties demoResult() {  
        return dataSourceProperties;  
    }  
  
    @GetMapping("/all")  
    public List<Member> all() {  
        return memberRepository.findAll();  
    }  
  
    @GetMapping("/redis-test")  
    public void setNxTest() {  
        stringRedisTemplate.opsForValue().setIfAbsent("test:key", "test_value");  
    }  
  
    @GetMapping("/redis-result")  
	public String setNxResult() {  
	    return stringRedisTemplate.opsForValue().get("test:key");  
	}
}
```

## API 동작 확인
이제 앞서 작성한 코드와 설정을 바탕으로 `curl` 로 API 를 테스트해보자. 우선 `DataSource` 커넥션 정보는 아래와 같이 잘 뜨는것을 확인할 수 있다.

![](/Spring/images/Pasted%20image%2020240110164228.png)


또한, `MySQL` 에서도 모든 row 들을 잘 가져오는 것도 확인할 수 있다.

![](/Spring/images/Pasted%20image%2020240110164327.png)


마지막으로 `Redis` 에서도 Key Value 셋팅이 잘 동작하는 것을 확인할 수 있다.

![](/Spring/images/Pasted%20image%2020240110164532.png)

## 마치며
이렇게 Local 환경에서 MySQL 과 Redis Container 를 띄워 Spring 과 통신하는 개발환경을 설정해보았다. 추가적으로 알아두어야할 것은 MySQL, Redis,  Spring 을 통합한 통합환경을 `image` 로 빌드하려면, `application.yml` 에 Redis 와 DataSoure 정보를 localhost 가 아닌 `host.docker.internal` 로 설정해야한다. (윈도우 기준)
