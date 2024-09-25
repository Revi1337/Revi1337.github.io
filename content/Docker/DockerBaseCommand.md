---
title: Docker 기본 명령어
tags: ['docker']
---

## ps
실행중인 컨테이너 목록을 확인하는 명령어

```bash
docker ps
```


중지된 컨테이너까지 모두 확인. -a 옵션 추가

```bash
docker ps -a
``` 

## stop
실행중인 컨테이너를 중지한다. (띄어쓰기를 통해 여러개를 중지 가능하다)

```bash
docker stop [OPTIONS] CONTAINER [CONTAINER...]
docker stop CONTAINER_ID
docker stop CONTAINER_NAMES
```

## rm
종료된 컨테이너를 완전히 삭제한다. (마찬가지로 띄어쓰기를 통해 여러개 삭제 가능하다)

```bash
docker rm [OPTIONS] CONTAINER [CONTAINER...]
docker rm CONTAINER_ID
docker rm CONTAINER_NAMES
```

## rmi
로컬에 pull 되어있는 Image 를 삭제한다. (마찬가지로 띄어쓰기를 통해 여러개 삭제 가능하다)

```bash
docker rmi CONTAINER_ID
docker rmi CONTAINER_NAMES
```

## logs
로그를 통해 컨테이너가 정상적으로 동작하는지 확인 (-f 와 --tail 은 동일)

```bash
docker logs [OPTIONS] CONTAINER

docker logs CONTAINER_ID
docker logs CONTAINER_NAMES

docker logs -f CONTAINER_ID          
docker logs --tail CONTAINER_NAMES
```

## pull
Image 를 pull 하는 명령어. Image 통해 Container 를 만든다. `docker run` 할때 Image 가 없으면 자동으로 Pull 하게 된다.

```bash
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
docker pull ubuntu:18.04
```

## images
pull 한 Image 들 확인.

```bash
docker images [OPTIONS] [REPOSITORY[:TAG]]
docker images
```


Image 를 삭제. (images 명령어를 통해 얻은 이미지 목록에서 ImageID 혹은 Repository 를 입력하면 삭제된다. 단, Container 가 실행중인 Image 는 삭제되지 않음. 또한, 띄어쓰기를 통해 여러개를 삭제 가능

```bash
docker rmi [OPTIONS] IMAGE [IMAGE...]
docker rmi IMAGE_ID|REPOSITORY
```

## run
Image 로 Container 실행할 수 있는 명령어이다. `Image 가 존재하지 않으면 자동으로 latest 한 버전의 image 를 pull 하고, 랜덤한 이름의 Container 를 실행`하게 된다.

```bash
docker run [OPTIONS] IMAGE[:TAG|@DIGEST] [COMMAND] [ARG...]
```


사용되는 옵션들은 아래와 같다.

|  flag  |                        description                         |
| :----: | :--------------------------------------------------------: |
|   -d   |                   백그라운드 수행 (Detach Mode)                   |
|   -p   |                 호스트와 컨테이너의 포트를 연결 (포트 포워딩)                 |
|   -v   |                호스트와 컨테이너의 디렉터리를 연결 (볼륨 마운트)                |
|   -e   |        컨테이너 내에서 사용할 환경변수 설정 (Environment Variables)        |
| --name |                         컨테이너 이름 설정                         |
|  --rm  |          프로세스 종료 시 컨테이너 자동 제거 (Automatic Removal)          |
|  --it  | -i (interactive) 및 -t (pseudo-TTY)를 동시에 사용하여 터미널 입력을 위한 옵션 |


ubuntu:20.04 이미지를 사용하여 랜덤한 이름의 Container 를 실행한다. 하지만 `-it` 옵션을 입력하지 않았기 때문에 바로 실행이 종료된다.

```bash
docker run ubuntu:20.04 
```


Container 내부에 들어가기 위해 sh를 실행하고 키보드 입력을 위해 `-it` 옵션을 주고 `/bin/sh` 명령을 매개변수로 전달한다. 따라서 생성된 Container 내부 쉘에 들어가게 된다. 추가적으로 프로세스가 종료되면 컨테이너가 자동으로 삭제되도록 `--rm` 옵션도 추가했다.

```bash 
docker run --rm -it ubuntu:20.04 /bin/sh
```


redis Image를 사용하여 랜덤한 이름의 Container 를 실행하고 -p 옵션으로 Local 의 3456 포트와 Container 의 6379 포트와 연결한다.

````bash
docker run -p 3456:6379 redis
````


mysql 이미지와 `--name` 옵션으로 mysql 이라는 이름의 Container 를 실행한다. 또한, Local 의 3306 와 Container 내부의 3306 포트를 연결한다. 그리고 `-e` 옵션으로 Container 에서 사용되는 환경변수를 설정하였다. 사용되는 환경변수의 종류는 DockerHub 에서 사용한 Image 의 정보를 확인하면 된다.

> [!note]
> 여러개의 환경변수를 사용하려면 -e 옵션을 여러번 사용하면 된다.

```bash  
docker run -d -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=true --name mysql mysql:5.7
```

## exec
exec 는 `이미 실행 중인 컨테이너 내에서 새로운 명령을 실행하는 데 사용`된다. 아래 명령어는 이미 실행중인 mysql Container 에 mysql 이라는 Binary 를 실행하라는 의미이다. 여기서 -it 옵션을 사용했기 때문에 mysql Binary 를 실행헀을때 출력되는 Command Line Prompt 받아올 수 있다.

```bash 
docker exec -it mysql mysql
```

