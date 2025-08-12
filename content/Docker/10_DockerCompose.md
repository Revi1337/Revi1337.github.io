---
title: Docker Compose
tags: ['docker', 'docker-compose']
---

## Docker Compose

Docker Compose는 여러 컨테이너로 구성된 애플리케이션을 정의하고 실행하기 위한 도구입니다. 이를 통해 개발부터 배포까지 더 효율적인 환경을 구축할 수 있습니다. Compose를 사용하면 서비스, 네트워크, 볼륨 등을 하나의 이해하기 쉬운 YAML 설정 파일로 관리할 수 있습니다. 덕분에 애플리케이션이 사용하는 전체 기술 스택을 간편하게 정의하고, 단 한 번의 명령으로 설정 파일에 명시된 모든 서비스를 생성·실행할 수 있습니다.

> Docker Compose는 Production, Staging, Development, Test, CI Workflow 등 모든 환경에서 동작합니다. 또한 애플리케이션의 전체 라이프사이클을 관리할 수 있는 명령들도 제공합니다.


## docker-compose.yml
`docker-compose` 명령은 기본적으로 현재 경로를 기준으로 `docker-compose.yml` 파일을 찾아 실행합니다.  
따라서 이 파일에 관리할 서비스들의 정보를 정의하고, 각 서비스별로 필요한 설정을 하위에 작성해야 합니다.

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


이해가 다소 어려울 수 있는 설정으로는 `restarts`, `healthcheck`, `condition` 등이 있습니다. 각 설정의 의미를 정리하면 아래와 같습니다.

`restarts`
- **no**(기본값) : 컨테이너가 종료되면 재시작하지 않습니다.
- **always** : 컨테이너가 종료되면 항상 재시작합니다. 수동으로 중지한 경우에도 다시 시작됩니다.
- **on-failure** : 컨테이너가 비정상 종료(0이 아닌 종료 코드)될 때만 재시작합니다. 정상 종료(코드 0)일 경우에는 재시작하지 않습니다.
- **unless-stopped** : 컨테이너가 종료되면 항상 재시작하지만, 사용자가 명시적으로 중지한 경우에는 재시작하지 않습니다.

`healthcheck:test`
- **['argv1', 'argv2']** 와 같이 healthcheck를 수행하는 배열의 값에는 항상 NONE 혹은 CMD 혹은 CMD-SHELL이 와야 합니다.
- **[ "CMD", "mysqladmin", "ping", "-h", "localhost" ]** 와 **[ "CMD-SHELL", "mysqladmin ping -h localhost" ]**는 동일합니다.

`depends_on:name:condition`
- **service_started** : 서비스가 정상적으로 시작되었음을 나타내는 상태입니다. 모든 초기화 작업이나 healthcheck가 완료되지 않았더라도, 서비스 실행이 시작된 상태를 의미합니다.
- **service_healthy** : 서비스가 정상적으로 실행 중이며 healthcheck에도 성공한 상태입니다.
- **service_completed_successfully** : 서비스가 할당된 작업을 성공적으로 마쳤고, 더 이상 실행할 필요가 없는 상태입니다.
- 더 자세한 내용 [공식문서1](https://docs.docker.com/reference/compose-file/services/#healthcheck), [공식문서2](https://docs.docker.com/compose/how-tos/startup-order/)


## Execute Docker Compose
`docker-compose up` 으로 YML 에 작성한 서비스들을 한번에 실행할 수 있습니다. docker-compose 명령어는 기본적으로 현재 Pathd세ㅓ docker-compose.yml 파일을 찾아 실행합니다.

> docker-compose 는 예전 방식입니다. docker-compose 가 없다면, 하이폰 없는 docker compose 로 실행해보시기 바랍니다.

```bash
docker-compose up
```


하지만 상단의 명령은 터미널을 빠져나오지 못하고 계속 점유하고 있는 상태가 되기 때문에, `-d` (Detach Mode) 옵션을 주어 컨테이너가 백그라운드에서 실행되도록 할 수 있습니다.

```bash
docker-compose up -d
```


앞서 `healthcheck`로 설정으로 mysql-rdb 헬스체크 후, `depends-on` 설정으로 redis-cache 가 실행되도록 순서를 지정해주었기 때문에, mysql, redis 순으로 컨테이너가 올라가는것을 확인할 수 있습니다.

![](Docker/images/Pasted%20image%2020240925123614.png)


하지만 `docker-compose.yml` 이 꼭 프로젝트 루트에 있다는 보장이 없습니다. 그럴때는 `-f` 옵션을 통해 실행할 docker-compose.yml 파일을 명시해줄 수 있습니다. 

```bash
docker-compose -f Docker/docker-compose.yml up -d 
```


번외로 `docker-compose.yml` 에 명시한 서비스들 중 특정 서비스 혹은 특정한 여러개의 서비스를 실행시키고 싶다면 뒤에 서비스 이름을 명시해주면 됩니다.

```bash
docker-compose up mysql-rdb -d 
docker-compose up service1 service2 service3 -d
```

![](Docker/images/Pasted%20image%2020240925130757.png)


## Terminate Docker Compose 
`docker-compose down` 으로 실행되고 있는 컨테이너들을 모두 종료시키거나 특정 컨테이너만 종료시킬 수 있습니다.

```bash
docker-compose down
```


특정 컨테이너만 혹은 2개 이상의 컨테이너를 종료시키고 싶을때는 down 뒤에 서비스 이름들을 명시하면 됩니다.

```bash
docker-compose down mysql-rdb redis-cache
```


마찬가지로 다른 폴더에 있는 docker-compose 를 통해 컨테이너를 종료시키고 싶을때는 -f 옵션을 사용할 수 있습니다.

```bash
docker-compose -f Docker/docker-compose.yml down mysql-rdb redis-cache
```


## Restart Docker Compose
컨테이너의 재시작은 `docker-compose restart` 로 수행할 수 있습니다.

```bash
docker-compose -f Docker/docker-compose.yml restart
```


## Reference
[Docker Compose](https://docs.docker.com/compose/)
