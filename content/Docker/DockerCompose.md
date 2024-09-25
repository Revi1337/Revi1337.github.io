---
title: Docker Compose
tags: ['docker', 'docker-compose']
---

## Docker Compose
Docker Compose는 멀티 컨테이너 애플리케이션을 정의하고 실행하기 위한 도구이며, 효율적인 개발 및 배포 경험을 할 수 있게하는 기능이다. Compose는 Service, Network, Volume 등을 하나의 이해하기 쉬운 YAML 설정 파일로 관리할 수 있기 때문에 애플리케이션에서 사용하는 스택(기술) 전체를 간편하게 관리할 수 있다. 그런 다음, `단 한 번의 명령으로 해당 설정 파일에 정의된 모든 서비스를 생성하고 시작할 수 있다.`

> Compose는 Production, Staging, Development, Test, CI Workflow 등 모든 환경에서 작동한다. 또한, 애플리케이션의 전체 Life Cycle 을 관리하기 위한 명령도 있다.

## YML 작성
docker-compose 명령어는 기본적으로 명령어를 실행하는 위치에서 docker-compose.yml 파일을 찾아 실행하게 된다. 때문에 `docker-compose.yml` 관리할 Service 들에 대한 정보들을 적어주고, 하위에 Service 마다의 설정을 적어주어야 한다. 

```yml
version: '3.7'  
  
services:  
  mysql-rdb:                                                  # Service Name 명시 (자유롭게)  
    image: mysql:8-oracle                                     # Container 를 생성하기 위한 Base Image 를 명시 (Value 를 자유롭게)  
    container_name: mysql-rdb                                 # 실핼될 Container 의 이름을 명시 (Value 를 자유롭게)  
    restart: always                                           # docker compose restart 와 같은 명시적인 작업으로으로 인해 재시작될 경우, redis-cache 라는 서비스도 항상 재실행하겠다는 의미.  
    ports:                                                    # Host 와 Container 의 Port 를 연결  
      - '9905:3306'  
    command:                                                  # Container 가 시작 시점에 수행할 명령을 지정 (여기서는 옵션)  
      - --character-set-server=utf8mb4  
      - --collation-server=utf8mb4_unicode_ci  
    environment:                                              # mysql:8-oracle 에서 사용할 수 있는 Environment 값들을 하위에 명시  
      MYSQL_DATABASE: testdb  
      MYSQL_USER: testuser  
      MYSQL_PASSWORD: 1234  
      MYSQL_ROOT_PASSWORD: 1234  
    healthcheck:                                              # 서비스 Container 가 정상인지 확인할 수 있는 설정들을 하위에 명시  
      test: [ "CMD", "mysqladmin", "ping", "-h", "localhost" ] # 서비스 Container 가 정상인지 확인할 수 있는 명령을 명시
      timeout: 20s                                            # healthcheck 시간 제한을 설정하는 데 사용. 20초를 초과하면 해당 검사는 실패로 간주  
      retries: 10                                             # healthcheck 가 연속으로 10번 실패할 때만 컨테이너를 비정상 상태로 간주하거나, 재시작 정책을 실행.  
  
  redis-cache:  
    image: redis:latest  
    container_name: redis-cache  
    restart: always  
    ports:  
      - '9906:6379'  
    depends_on:                                               # 서비스 실행순서를 정의할 수 있는 설정.  
      mysql-rdb:                                              # mysql-rdb 이라는 서비스가  
        condition: service_healthy                            # service_healthy(healthcheck 의 결과) 이면 redis-cache 서비스를 실행. 
```


이해가 가지 않을 수 있는 설정들은 `restarts`, `healthcheck`, `condition` 정도가 있을 수 있다. 해당 설정을 정리하면 아래와 같다.

**restarts**
- `no`(default) : 컨테이너가 종료되면 재시작하지 않는다.
- `always` : 컨테이너가 종료되면 항상 재시작한다. 수동으로 중지한 경우에도 다시 시작된다.
- `on-failure` : 컨테이너가 비정상 종료(0 이 아닌 종료 코드) 될 때만 재시작한다. 정상 종료(코드 0) 일 경우에는 재시작하지 않는다.
- `unless-stopped` : 컨테이너가 종료되면 항상 재시작하지만, 사용자가 명시적으로 중지한 경우에는 재시작하지 않는다.
- xcxsafxzvcdasf

**healthcheck:test**
- `test: ['argv1', 'argv2']` 와 같이 healthcheck 를 수행하는 배열의 `argv1` 에는 항상 `NONE`, `CMD` 혹은 `CMD-SHELL` 이 와야 한다.
- `test: [ "CMD", "mysqladmin", "ping", "-h", "localhost" ]` 와 test: `[ "CMD-SHELL", "mysqladmin ping -h localhost" ]` 는 동일하다.
 
**depends_on:name:condition**
- `service_started` : 서비스가 `정상적으로 시작되었음` 을 나타내는 상태. 아직 모든 초기화 작업이 완료되지 않았거나 healthcheck 가 끝나지 않았더라도, 서비스가 실행되기 시작한 상태.
- `service_healthy` : 서비스가 `정상적으로 실행 중이고, healthcheck에 성공한 상태`.
- `service_completed_successfully` : 서비스가 할당된 작업을 성공적으로 끝마쳤고, 더 이상 실행할 필요가 없는 상태.
- 더 자세한 내용은 [공식문서1](https://docs.docker.com/reference/compose-file/services/#healthcheck), [공식문서2](https://docs.docker.com/compose/how-tos/startup-order/)를 참고하자

## Docker Compose 실행
`docker-compose up` 으로 YML 에 작성한 Service 들을 한번에 실행할 수 있다. docker-compose 명령어는 기본적으로 명령어를 실행하는 위치에서 docker-compose.yml 파일을 찾아 실행하게 된다.

```bash
docker-compose up
```


하지만 상단의 커맨드는 터미널을 빠져나오지 못하고 계속 점유하고 있는 상태가 되기 떄문에, `-d` (Detach Mode) 옵션을 주어 컨테이너가 백그라운드에서 실행되도록 할 수 있다.

```bash
docker-compose up -d
```


앞서 `healthcheck` 와 `depends-on` 설정으로 mysql-rdb 헬스체크 후, redis-cache 가 수행되도록 순서를 지정해주었기 떄문에, mysql, redis 순으로 컨테이너가 올라가는것을 확인할 수 있다.

![](Docker/images/Pasted%20image%2020240925123614.png)


하지만 `docker-compose.yml` 이 꼭 프로젝트 Root 폴더에 있다는 보장이 없다. 그럴때는 `-f` 옵션을 통해 실행할 docker-compose.yml 파일을 명시해줄 수 있다.

```bash
docker-compose -f Docker/docker-compose.yml up -d 
```


번외로 `docker-compose.yml` 에 명시한 서비스들 중에서 특정 서비스 혹은 여러개의 서비스를 실행시키고 싶다면 뒤에 서비스 이름을 명시해주면 된다.

```bash
docker-compose up mysql-rdb -d 

# 혹은

docker-compose up service1 service2 service3 -d
```

![](Docker/images/Pasted%20image%2020240925130757.png)

## Docker Compose 종료
`docker-compose down` 으로 실행되고 있는 컨테이너들을 모두 종료시키거나 특정 컨테이너만 종료시킬 수 있다.

```bash
docker-compose down
```


특정 컨테이너만 혹은 2개 이상의 컨테이너를 종료시키고 싶을때는 down 뒤에 서비스 이름들을 명시해주면 된다.

```bash
docker-compose down mysql-rdb redis-cache
```


마찬가지로 다른 폴더에 있는 docker-compose 를 통해 컨테이너를 종료시키고 싶을때는 -f 옵션을 사용해주면 된다.

```bash
docker-compose -f Docker/docker-compose.yml down mysql-rdb redis-cache
```


## Docker Compose 재시작
컨테이너의 재시작은 `docker-compose restart`  로 수행할 수 있다.

```bash
docker-compose -f Docker/docker-compose.yml restart
```
