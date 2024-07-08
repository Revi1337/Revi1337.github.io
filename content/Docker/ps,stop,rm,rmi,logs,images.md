---
title: ps,stop,rm,rmi,logs,pull,images
---

## ps
실행중인 컨테이너 목록을 확인하는 명령어

```bash
$docker ps
```


중지된 컨테이너까지 모두 확인. -a 옵션 추가

```bash
$docker ps -a
``` 

## stop
실행중인 컨테이너를 중지 (띄어쓰기를 통해 여러개를 중지 가능)

```bash
$docker stop [OPTIONS] CONTAINER [CONTAINER...]

$docker stop CONTAINER_ID
$docker stop CONTAINER_NAMES
```

## rm
종료된 컨테이너를 완전히 제거 (마찬가지로 띄어쓰기를 통해 여러개 삭제 가능)

```bash
$docker rm [OPTIONS] CONTAINER [CONTAINER...]

$docker rm CONTAINER_ID
$docker rm CONTAINER_NAMES
```

## rmi
존재하는 Image 를 제거

```bash
$docker rmi CONTAINER_ID
$docker rmi CONTAINER_NAMES
```

## logs
로그를 통해 컨테이너가 정상적으로 동작하는지 확인 (-f 와 --tail 은 동일)

```bash
$docker logs [OPTIONS] CONTAINER

$docker logs CONTAINER_ID
$docker logs CONTAINER_NAMES

$docker logs -f CONTAINER_ID          
$docker logs --tail CONTAINER_NAMES
```

## pull
Image 다운 (Image 를 받아 Container 를 만듬. docker run 할때 Image 가 없으면 자동으로 다운하지만, 아래는 수동명령어)

```bash
$docker pull [OPTIONS] NAME[:TAG|@DIGEST]
$docker pull ubuntu:18.04
```

## images
다운로드한 Image 확인 (Container 는 다운받은 Image 를 통해 만드는 것.)

```bash
$docker images [OPTIONS] [REPOSITORY[:TAG]]
$docker images
```


Image 를 삭제. (images 명령어를 통해 얻은 이미지 목록에서 ImageID 혹은 Repository 를 입력하면 삭제된다. 단, Container 가 실행중인 Image 는 삭제되지 않음. 또한, 띄어쓰기를 통해 여러개를 삭제 가능

```bash
$docker rmi [OPTIONS] IMAGE [IMAGE...]
$docker rmi IMAGE_ID|REPOSITORY
```
