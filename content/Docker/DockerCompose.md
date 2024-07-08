---
title: docker-compose
---

### Docker 기본 명령어 (run)

`docker run` 을 통해 `Container` 실행.

```shell
# Syntax
$docker run [OPTIONS] IMAGE[:TAG|@DIGEST] [COMMAND] [ARG...]
```

| flag      | description                        |
| --------- | ---------------------------------- |
| -d        | --network 실행 (Detached Mode)       |
| -p        | 호스트와 컨테이너의 포트를 연결                  |
| -v        | 호스트와 컨테이너의 디렉터리를 연결                |
| -e        | 컨테이너 내에서 사용할 환경변수 설정               |
| --name    | 컨테이너 이름 설정                         |
| --rm      | 프로세시 종료시 컨테이너 자동 제거                |
| --network | -i, -t 를 동시에 사용한 것으로 터미널 입력을 위한 옵션 |

```shell
# ubuntu 20.04 컨테이너 생성하고 실행.
# run 명령어를 사용하면 사용할 이미지가 저장되어 있는지 확인하고 없다면 다운로드(pull) 한 후, 컨테이너를 생성(create) 하고 시작(Start)한다.
# Docker Image 마다 Container 가 만들어질때 실행할 명령어를 지정할 수 있다. ubuntu:20.04는 "/bin/bash"가 지정되어 쉘이 실행되야 하지만, 입력을 받을 수 있도록 "-it"옵션을 입력하지 않았기 때문에 바로 실행이 종료된다.
$docker run ubuntu:20.04

# /bin/sh 실행.
# 컨테이너 내부에 들어가기 위해 sh를 실행하고 키보드 입력을 위해 -it 옵션을 준다. 추가적으로 프로세스가 종료되면 컨테이너가 자동으로 삭제되도록 --rm 옵션도 추가했다.
# --rm 옵션이 없다면 컨테이너가 종료되더라도 삭제되지 않고 남아 있어 수동으로 삭제해야 한다. 
$docker run --rm -it ubuntu:20.04 /bin/sh
```

````shell
# redis 실행
# 컨테이너의 3679 포트와 호스트(로컬) 의 3456 포트와 연결
$docker run -p 3456:6379 redis
````

```shell
# MySQL 컨테이너 실행
# 컨테이너 3306 과 로컬의 3306 를 연결. -e 옵션으로 DB 에 pw 없어도 접근할수있게 허용.
# 또한 생성될 Container 의 이름을 mysql 로 설정  
$docker run -d -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=true --name mysql mysql:5.7
```

```shell
# exec: run 명령어와 달리 실행중인 도커 컨테이너에 접속할때 사용하며 컨테이너 안에 ssh server 등을 설치하지않고 exec 명령어로 접속한다.
# mysql 라는 이름의 컨테이너를 실행함과 동시에  mysql 바이너리를 실행 (키보드입력을 위해 -it 옵션추가) 
$docker exec -it mysql mysql

# mysql 에 접속하면 wordpress 를 위한 셋팅.
create database wp CHARACTER SET utf8;
grant all privileges on wp.* to wp@'%' identified by 'wp';
flush privileges;
quit'
```

```shell
# WordPress 블로그 실행 (mysql 을 띄워놓고)
$docker run -d -p 8080:80 -e WORDPRESS_DB_HOST=host.docker.internal -e WORDPRESS_DB_NAME=wp -e WORDPRESS_DB_USER=wp -e WORDPRESS_DB_PASSWORD=wp wordpress
```

### Docker 기본 명령어 (ps, stop, rm, logs, images, network)

실행중인 컨테이너 목록을 확인하는 명령어

```shell
$docker ps
```

중지된 컨테이너까지 모두 확인. -a 옵션 추가

```shell
$docker ps -a
``` 

실행중인 컨테이너를 중지. (띄어쓰기를 통해 여러개를 중지 가능)

```shell
# Syntax
$docker stop [OPTIONS] CONTAINER [CONTAINER...]

# Ex
$docker stop CONTAINER_ID
$docker stop CONTAINER_NAMES
```

종료된 컨테이너를 완전히 제거. (마찬가지로 띄어쓰기를 통해 여러개를 삭제 가능)

```shell
# Syntax
$docker rm [OPTIONS] CONTAINER [CONTAINER...]

# Ex
$docker rm CONTAINER_ID
$docker rm CONTAINER_NAMES
```

로그를 통해 컨테이너가 정상적으로 동작하는지 확인(기본 옵션 -f, --tail 옵션을 살펴보자.)

```shell
# Syntax
$docker logs [OPTIONS] CONTAINER

# Ex
$docker logs CONTAINER_ID
$docker logs CONTAINER_NAMES

# tail -f 와 같음.
$docker logs -f CONTAINER_ID          
$docker logs --tail CONTAINER_ID     
```

도커가 다운로드한 Image 확인 (Container 는 Image 라는 것을 다운을받아, 그 Image 를 가지고 Container 를 만드는 것.)

```shell
# Syntax
$docker images [OPTIONS] [REPOSITORY[:TAG]]

# Ex
$docker images
```

Image 다운 (Image 를 받아 Container 를 만듬 --> docker run 할때 Image 가 없으면 자동으로 다운하지만, 아래는 수동명령어)

```shell
# Syntax 
$docker pull [OPTIONS] NAME[:TAG|@DIGEST]

# Ex
$docker pull ubuntu:18.04
```

Image 를 삭제하는 방법 (images 명령어를 통해 얻은 이미지 목록에서 ImageID 혹은 Repository 를 입력하면 삭제가 됨. 단, Container 가 실행중인 Image 는 삭제되지 않음. 띄어쓰기를 통해 여러개를 삭제 가능)

```shell
# Syntax 
$docker rmi [OPTIONS] IMAGE [IMAGE...]

# Ex
$docker rmi IMAGE_ID|REPOSITORY
```

Docker Container 끼리 이름으로 통신할 수 있는 Virtual Network 생성.

```shell
# Syntax 
$docker network create [OPTIONS] NETWORK

# app-network 라는 이름으로 네트워크를 생성. (예. wordpress 와 mysql 이 통신할 네트워크를 생성)
$docker network create app-network           
```

기존의 Container 에 Network 를 추가

```shell
# Syntax 
$docker network connect [OPTIONS] NETWORK CONTAINER

# mysql 이름의 Container 에 Network 를 추가
$docker network connect app-network mysql   
```

--network 옵션을 사용하여 네트워크에 속하게 만드는 법

```shell
# 워드프레스를 app-network 에 속하게 하고 mysql 을 이름으로 접근한다.
$docker run -d -p 8080:80 --network=app-network -e WORDPRESS_DB_HOST=mysql -e WORDPRESS_DB_NAME=wp -e WORDPRESS_DB_USER=wp -e WORDPRESS_DB_PASSWORD=wp wordpress
```

### Docker 기본 명령어 (Volume)

-v 옵션을 통한 Volume 설정

```shell
# 로컬의 /my/own/datadir 와 도커의 /var/dir/mysql 를 mount 하겠다.
$docker run -d -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=true --network=app-network --name mysql -v /my/own/datadir:/var/dir/mysql mysql:5.7
```

* 가상의 MySQL 컨테이너를 지우게 되면, 데이터가 다 날라게됨. 따라서 `-v` 옵션을 통해 `로컬`과` 컨테이너 내부의 경로`를 `연결`시켜주겠다는 의미. 이것을 `mount` 라고 함.

* Host(로컬)의 디렉토리와 컨테이너의 디렉토리를 연결하면 `컨테이너에서 해당 디렉토리에 생긴 파일`이 `그대로 Host(로컬) 의 연결된 디렉토리에 생성`된다.

* MySQL 컨테이너의 데이터베이스 파일이 저장되는 경로를 지정했기 때문에 Host 에 해당 파일이 그대로 저장이 된다.

* 컨테이너의 특정 경로에 저장되는 파일이 Host의 특정경로에 동일하게 저장된다고 보면 된다.

* `-v` 옵션은 컨테이너의 디렉토리를 호스트의 특정 디렉토리에 연결하기 위해서 사용하고 컨테이너를 제거하면 컨테이너와 그 안에 생성된 파일은 삭제 되지만 `호스트 디렉토리는 그대로 남기 때문에 삭제 되지 않는다.`

### Docker Compose

Docker Compose 란?

* 앞서 Container 들은 실행, 조회, 삭제, 네트워크 연결 등의 작업들은 `CLI` 에서 이루어졌으며 이러한 작업들은 띄어쓰기와 옵션등을 신경써서 기입해주어야한다.
  하지만 Docker Compose 를 사용하게 되면 `다수개의 Container` 들을 일일히 실행하는 과정들을 하나의 `yml` 파일에서 관리할 수 있게 된다.

> 기본적으로 Docker Compose (docker-compose) 는 Docker Desktop 을 설치하면 자동으로 설치가 되어있다.

```yaml
version: '2'
services:
  db:
    image: mariadb:10.9
    volumes:
      - ./mysql:/var/lib/mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: wordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress

  wordpress:
    image: wordpress:latest
    volumes:
      - ./wp:/var/www/html
    restart: always
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_PASSWORD: wordpress
```

// Docker-Compose 실행
docker-compose up

// Docker-Compose 종료
docker-compose down

### Docker 컨테이너 실습

(1)

image: nginx:latest
port: 80
html path: /usr/share/nginx/html

문제 > 다음조건을 만족하는 컨테이너를 실행해주세요.

nginx 컨테이너를 50000 포트로 연결하여 실행
임의의 index.html 파일을 만들고 이 파일 내용을 제공하는 nginx 컨테이너 실행 (docker run -v 옵션 활용)

A: docker run --rm -p 50000:80  -v "D:\docker-prac\dummy\index.html:/usr/share/nginx/html/index.html" nginx:latest 혹은
docker run -p 50000:80  -v "D:\docker-prac\dummy:/usr/share/nginx/html" nginx:latest

(2)

image: php:7

문제 > 다음조건을 만족하는 컨테이너를 실행해주세요.

다음 소스를 hello.php로 저장합니다.
hello.php를 php container로 실행 (-v 옵션으로 hello.php를 연결)
실행결과(php 설정 정보)를 확인.

A: docker run --rm -v D:\docker-prac\dummy\hello.php:/app/hello.php php:7 php /app/hello.php

docker pullasdf

docker pull mysql:8-oracle
docker run --name DockerMySqlDemo -e MYSQL_ROOT_PASSWORD=1337 -d -p 1234:3306 mysql:8-oracle

docker-compose up

docker pullasdf





docker pull mysql:8-oracle
docker run --name DockerMySqlDemo -e MYSQL_ROOT_PASSWORD=1337 -d -p 1234:3306 mysql:8-oracle

docker-compose up