---
title: Docker Basic Command
tags: ['docker']
---

## ps
실행중인 컨테이너 목록을 확인합니다.

```bash
docker ps
```


중지된 컨테이너까지 모두 확인합니다.

```bash
docker ps -a
``` 

## stop
실행중인 컨테이너를 중지합니다. (띄어쓰기를 통해 여러개를 중지 가능)

```bash
docker stop [OPTIONS] CONTAINER [CONTAINER...]
docker stop CONTAINER_ID
docker stop CONTAINER_NAMES
```

## rm
종료된 컨테이너를 완전히 삭제합니다. (마찬가지로 띄어쓰기를 통해 여러개 삭제 가능)

```bash
docker rm [OPTIONS] CONTAINER [CONTAINER...]
docker rm CONTAINER_ID
docker rm CONTAINER_NAMES
```

## logs
로그를 통해 컨테이너가 정상적으로 동작하는지 확인합니다.

- -f 는 실시간 스트리밍
- --tail 은 마지막 몇줄만 출력

```bash
docker logs [OPTIONS] CONTAINER

docker logs CONTAINER_ID
docker logs CONTAINER_NAMES

docker logs -f CONTAINER_ID          
docker logs --tail CONTAINER_NAMES
```

## pull
Docker Hub에서 Image를 Pull 합니다. `docker run` 할때 Image가 없으면 자동으로 Pull 합니다.

```bash
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
docker pull ubuntu:18.04
```

## images
로컬에 pull 되어있는 Image들 확인합니다.

```bash
docker images [OPTIONS] [REPOSITORY[:TAG]]
docker images
```

## rmi
로컬에 pull 되어있는 Image를 삭제합니다. (마찬가지로 띄어쓰기를 통해 여러개 삭제 가능)

```bash
docker rmi CONTAINER_ID
docker rmi CONTAINER_NAMES
```

## run
Image로 컨테이너 실행합니다. Image가 존재하지 않으면 자동으로 latest 버전의 image를 pull하고, 랜덤한 이름으로 컨테이너를 실행합니다.

```bash
docker run [OPTIONS] IMAGE[:TAG|@DIGEST] [COMMAND] [ARG...]
```


사용되는 옵션들은 아래와 같습니다.

|  flag  | description                                                |
| :----: | :--------------------------------------------------------- |
|   -d   | 백그라운드 수행 (Detach Mode)                                     |
|   -p   | 호스트와 컨테이너의 포트를 연결 (포트 포워딩)                                 |
|   -v   | 호스트와 컨테이너의 디렉터리를 연결 (볼륨 마운트)                               |
|   -e   | 컨테이너 내에서 사용할 환경변수 설정 (Environment Variables)               |
| --name | 컨테이너 이름 설정                                                 |
|  --rm  | 프로세스 종료 시 컨테이너 자동 제거 (Automatic Removal)                   |
|  --it  | -i (interactive) 및 -t (pseudo-TTY)를 동시에 사용하여 터미널 입력을 위한 옵션 |

## exec
이미 실행 중인 컨테이너 내에서 새로운 명령을 실행하는데 사용됩니다. 아래 커맨드는 이미 실행중인 mysql 이름의 컨테이너에 mysql이라는 실행파일을 실행하라는 의미입니다. -it 옵션을 사용했기 때문에 mysql 실행파일을 실행헀을때 출력되는 프롬프트를 받아올 수 있습니다.

```bash 
docker exec -it mysql mysql
```

