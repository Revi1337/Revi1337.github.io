---
title: Docker Network
---

각각의 `Docker Container`  독립적인 공간을 갖기 때문에 `Container 끼리의 통신`은 불가능하다. 하지만, `Docker Nework` 를 사용하여 통신하고자 하는 Container 들을 동일한 Network 에 연결해주면 Container 끼리 통신이 가능하게 된다.  해당 포스팅에서는 Docker Nework 명령어의 사용법과 Container 들을 연결하여 서로 통신하는 방법에 대해 다룬다.

## Network 조회 
```bash
$ docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
ae07710dabe6   bridge    bridge    local
232402bf2ad3   host      host      local
3de7e3b06e4f   none      null      local
```

## Network 생성 및 확인
```bash
$ docker network create test-network
```

## Container 에 Network 연결

### Network 연결 확인
## Container 에 Network 해제
### Network 해제 확인
## 불필요한 Docker Network 제거

Docker Container 끼리 이름으로 통신할 수 있는 Virtual Network 생성. 아래 예는
app-network 라는 이름으로 네트워크를 생성. (예. wordpress 와 mysql 이 통신할 네트워크를 생성)

```bash
$docker network create [OPTIONS] NETWORK

$docker network create app-network           
```

기존의 Container 에 Network 를 추가. 아래 예는 mysql 이름의 Container 에 Network 를 추가

```bash
$docker network connect [OPTIONS] NETWORK CONTAINER

$docker network connect app-network mysql   
```

--network 옵션을 사용하여 네트워크에 속하게 만드는 법.
아래 예는 워드프레스를 app-network 에 속하게 하고 mysql 을 이름으로 접근한다.

```bash
$docker run -d -p 8080:80 --network=app-network -e WORDPRESS_DB_HOST=mysql -e WORDPRESS_DB_NAME=wp -e WORDPRESS_DB_USER=wp -e WORDPRESS_DB_PASSWORD=wp wordpress
```

넘 ㅜ절어ㅑㅇㅁ