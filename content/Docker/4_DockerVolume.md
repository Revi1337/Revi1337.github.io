---
title: Docker Volume
tags: ['docker']
---

## Docker Volume
컨테이너를 삭제하면 안에서 사용하던 데이터는 모두 사라집니다. 이러한 데이터 휘발을 방지하기 위해, 도커는 컨테이너의 데이터를 호스트와 동기화할 수 있는 볼륨(Volume) 기능을 제공합니다.

> 쉽게말해 볼륨은 데이터 동기화를 위한 전용 공간을 생성하는 개념이라고 이해하면 되며, NFS(Network File System)와 동일한 기능이라고 생각하면 됩니다.


## Create Volume
볼륨은 아래 명령으로 생성할 수 있습니다.

```bash
docker volume create test-volume
```


생성된 볼륨은 아래 명령으로 확인할 수 있습니다.

```bash {1}
docker volume ls
DRIVER    VOLUME NAME
local     test-volume
```


생성한 볼륨에 대한 상세정보는 아래 명령으로 확인할 수 있습니다. Mountpoint 볼륨 디렉터리를 의미합니다.

```bash {1}
docker volume inspect test-volume
[
    {
        "CreatedAt": "2025-08-12T14:54:01Z",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/test-volume/_data",
        "Name": "test-volume",
        "Options": null,
        "Scope": "local"
    }
]
```


## Testing Volume
도커 볼륨 기능을 테스트하기 위해 Redis 컨테이너를 사용하겠습니다. Redis에서 장애 복구를 위해 사용하는 `dump.rdb` 파일을 도커 볼륨에 마운트해두면, 컨테이너를 삭제한 뒤 새로 띄워도 볼륨에 저장된 복구 파일을 다시 읽어 동일한 데이터를 유지할 수 있습니다. 이번 실습에서는 이 과정을 통해 볼륨이 데이터 복구에 어떻게 활용되는지 확인해보겠습니다.

> appendonly.aof 파일과 dump.rdb 파일은 레디스에서 장애 발생 후, 복구를 위한 백업파일입니다.


### Run Container
컨테이너를 생성할 때, 호스트의 현재 디렉터리를 볼륨 디렉터리로 지정하고, 해당 볼륨 디렉터리와 Redis 컨테이너 내부의 `/data` 디렉터리를 마운트합니다. 필자는 아래 방법으로 진행하겠습니다.

> 컨테이너 시작 시점에 볼륨 디렉터리 위치를 명확히 지정하는 것이 관리에 편리하기 때문에 이 방법을 추천합니다.

```bash
docker run -d --name redis-volume -v $(pwd):/data -p 6379:6379 redis:latest
```


또는 아래 커맨드처럼, 앞서 생성한 도커 볼륨과 `/data` 디렉터리를 마운트할 수도 있습니다.

> 이 방법은 볼륨 디렉터리가 호스트 내부 /var 하위에 위치하게 되어, 유지보수가 다소 어려울 수 있습니다. 따라서 해당 방법은 별로 추천드리고 싶진 않습니다.

```bash
docker run -d --name redis-volume -v test-volume:/data -p 6379:6379 redis:latest
```


### Push Dummy Data
생성한 컨테이너에 더미 데이터를 넣습니다. 순서대로 아래와 같은 의미를 가집니다.

- command 1 : 레디스 컨테이너에 `test-key-N : test-value-N` 형태로 더미 값을 삽입합니다.
- command 2 : 레디스 컨테이너에 값이 잘 삽입되었는지 확인합니다.
- command 3 : 레디스 컨테이너에 명시적으로 save 명령(백업) 수행시켜, dump.rdb 파일을 생성합니다.
- command 4 : 레디스 컨테이너의 /data 위치에 dump.rdb 백업 파일이 생성되었는지 확인합니다.

> Redis 컨테이너는 기본적으로 /data 디렉터리에 모든 데이터 파일(RDB 스냅샷, AOF 파일 등)을 저장합니다.

```bash {2, 5, 18, 21}
# command 1
for i in $(seq 1 10); do docker exec -it redis-volume redis-cli set test-key-$i test-value-$i; done

# command 2
docker exec -it redis-volume redis-cli keys '*'
1) "test-key-6"
2) "test-key-3"
3) "test-key-8"
4) "test-key-10"
5) "test-key-9"
6) "test-key-1"
7) "test-key-4"
8) "test-key-7"
9) "test-key-2"
10) "test-key-5"

# command 3
docker exec -it redis-volume redis-cli save

# command 4
docker exec -it redis-volume bash -c 'ls -al /data'
total 12
drwxr-xr-x 2 redis redis 4096 Aug 12 15:27 .
drwxr-xr-x 1 root  root  4096 Aug 12 15:17 ..
-rw------- 1 redis redis  345 Aug 12 15:27 dump.rdb
```


### Check Volume Dir
호스트 볼륨 디렉터리와 Redis 컨테이너 내부의 `/data` 경로에 저장된 데이터가 정상적으로 동기화되었는지 확인합니다.

[Run Container](Docker/4_DockerVolume.md#Run%20Container) 에서 상단 커맨드를 입력하였다면 아래 커맨드를 입력합니다.

```bash {1}
file dump.rdb         
dump.rdb: Redis RDB file, version 0012
```


혹은 [Run Container](Docker/4_DockerVolume.md#Run%20Container) 에서 하단 커맨드를 입력하였다면 아래 커맨드를 입력합니다.

```bash
ls -al $(docker volume inspect test-volume | jq '.[0].Mountpoint')
```


### Create Container
기존의 레디스 컨테이너를 제거합니다. 레디스 자체가 지워졌으니 모든 데이터가 사라졌을 것입니다.

```bash
docker stop redis-volume && docker rm redis-volume
```


그리고 다시 [Run Container](Docker/4_DockerVolume.md#Run%20Container) 에서 진행했던 과정 그대로 수행하여 레디스 컨테이너를 다시 생성합니다.

```bash {1,5}
docker run -d --name redis-volume -v $(pwd):/data -p 6379:6379 redis:latest

or 

docker run -d --name redis-volume -v test-volume:/data -p 6379:6379 redis:latest
```


이전 컨테이너 내부의 `/data` 위치에 생성되었던 백업 파일이 호스트의 볼륨 디렉터리와 정상적으로 동기화되었기 때문에, 새로 띄운 Redis 컨테이너가 볼륨 디렉터리에 저장된 `dump.rdb` 파일을 읽어 데이터를 복원한 것을 확인할 수 있습니다.

> 레디스는 실행될 때, 자동으로 dump.rdb 파일을 읽어들입니다.

```bash {2, 9}
# Command 1
docker exec -it redis-volume ls -al /data      
total 8
drwxr-xr-x 3 root root   96 Aug 12 15:53 .
drwxr-xr-x 1 root root 4096 Aug 12 15:53 ..
-rw------- 1 root root  345 Aug 12 15:53 dump.rdb

# Command 2
docker exec -it redis-volume redis-cli keys '*'
1) "test-key-2"
2) "test-key-6"
3) "test-key-7"
4) "test-key-8"
5) "test-key-10"
6) "test-key-5"
7) "test-key-1"
8) "test-key-4"
9) "test-key-9"
10) "test-key-3"
```


> [!warning] 새롭게 시작하려면 볼륨 디렉터리를 삭제해야합니다.
> 기존에 마운트된 볼륨이나 호스트 폴더 안에 데이터가 남아있으면, 컨테이너를 새로 만들어도 그 데이터가 계속 유지됩니다. 만약 완전히 새로 시작하고 싶다면, 마운트한 호스트 폴더(또는 볼륨 내부 데이터)를 삭제해야 합니다.


## Reference
[Docker Volume Documentation](https://docs.docker.com/engine/storage/volumes/)

