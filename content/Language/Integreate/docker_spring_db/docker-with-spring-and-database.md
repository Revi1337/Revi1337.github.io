##  docker build 로 이미지 생성

```bash
# Image 를 실행하여 Container 를 생성하고 실행
$ docker run --name spring -p 8080:8080 spring:basic
```

```bash
# Container 가 꺼져있을때 restart
$ docker restart spring
```

```bash
$ docker build -t image1 --target img1 .
```

## docker-compose 에서 docker build 실행

`docker-comopse` 에서 디폴트 Dockerfile 이름을 사용할때는  `build .`  로 Dockerfile 이 존재하는 경로를 명시해주면된다.

```Dockerfile
# Dockerfile 이름을 디폴트로 사용할때

services:
  webserver:
    build: .
```


`docker-comopse` 에서 임의의 Dockerfile 을 사용할때는 `build .` 대신 `context 경로` 로 임의의 
dockerfile 경로를 지정하고 `dockerfile 파일이름` 으로 임의의 dockerfile 파일이름을 명시해주면 된다.

```Dockerfile
# Dockerfile 의 이름을 임의로 정했을때

services:
  webserver:
    build:
      context: /data
      dockerfile: myDockerfile
```

 
docker compose 에서 이미지 빌드 및 실행.

```bash
// 도커 이미지 빌드 
$ sudo docker-compose build 

// compose up
$ sudo docker-compose up

// 이미지 빌드 및 up 같이

$ docker-compose up --build
$ docker-compose -p COMPOSE_PROJECT_NAME up --build
$ docker-compose -p spring-application up --build
```




```
```