---
title: Docker Volume
tags: ['docker']
---

## Volume
-v 옵션을 통한 Volume 설정

**(1)**

로컬의 /my/own/datadir 와 도커의 /var/dir/mysql 를 mount 하겠다.

```bash
docker run -d -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=true --network=app-network --name mysql -v /my/own/datadir:/var/dir/mysql mysql:5.7
```

* 가상의 MySQL 컨테이너를 지우게 되면, 데이터가 다 날라게됨. 따라서 `-v` 옵션을 통해 `로컬`과 `컨테이너 내부의 경로`를 `연결`시켜주겠다는 의미이다. 
즉. `볼륨 (Volume)` 은 `컨테이너`와 `호스트 간`에 `데이터를 공유`하고 `데이터를 영속적으로 저장`하는 데 사용되는 메커니즘이다.

* Host(로컬)의 디렉토리와 컨테이너의 디렉토리를 연결하면 `컨테이너에서 해당 디렉토리에 생긴 파일`이 `그대로 Host(로컬) 의 연결된 디렉토리에 생성`된다.

* MySQL 컨테이너의 데이터베이스 파일이 저장되는 경로를 지정했기 때문에 Host 에 해당 파일이 그대로 저장이 된다.
  
* 컨테이너의 특정 경로에 저장되는 파일이 Host 의 특정경로에 동일하게 저장된다고 보면 된다.

* `-v` 옵션은 컨테이너의 디렉토리를 호스트의 특정 디렉토리에 연결하기 위해서 사용하고 컨테이너를 제거하면 컨테이너와 그 안에 생성된 파일은 삭제 되지만 `호스트 디렉토리는 그대로 남기 때문에 삭제 되지 않는다.`


**(2)**

```bash
docker run --rm -p 50000:80  -v "D:\docker-prac\dummy\index.html:/usr/share/nginx/html/index.html" nginx:latest

OR

docker run -p 50000:80  -v "D:\docker-prac\dummy:/usr/share/nginx/html" nginx:latest
```

* 80 포트에서 실행되는 nginx 컨테이너를 로컬 50000 포트로 연결하여 실행
* 임의의 index.html 파일을 만들고 이 파일 내용을 제공하는 nginx 컨테이너 실행
* 로컬의 `D:\docker-prac\dummy\index.html` 와 컨테이너의 `/usr/share/nginx/html/index.html` 를 연결하여 Volume 설정
* 따라서 nginx 컨테이너가 실행될때 로컬의 `D:\docker-prac\dummy\index.html` 이 실행된다.

**(3)**

* php:7 컨테이너를 실행할때 `php /app/hello.php` 라는 커맨드를 도커 데몬에 전달. (키보드 입력이 필요없으므로 -it 옵션이 필요 없음.)  
* 로컬의 `D:\docker-prac\dummy\hello.php` 와 컨테이너의 `/app/hello.php` 를 연결하여 Volume 설정
* 따라서 php:7 컨테이너가 실행될때 로컬의 `D:\docker-prac\dummy\hello.php` 이 실행된다.

```bash
docker run --rm -v D:\docker-prac\dummy\hello.php:/app/hello.php php:7 php /app/hello.php
```

Escape 시켜서 ㅇㅁ