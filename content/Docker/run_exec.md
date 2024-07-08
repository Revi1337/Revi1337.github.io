---
title: run, exec
---

## run
 Image 를 통해 Container 실행할 수 있는 명령어이다. Image 가 존재하지 않으면 자동으로 latest 한 버전의 image 를 pull 하고, 랜던한 이름의 컨테이너를 실행하게 된다.

|  flag  |            description             |
| :----: | :--------------------------------: |
|   -d   |    --network 실행 (Detached Mode)    |
|   -p   |         호스트와 컨테이너의 포트를 연결          |
|   -v   |        호스트와 컨테이너의 디렉터리를 연결         |
|   -e   |        컨테이너 내에서 사용할 환경변수 설정        |
| --name |             컨테이너 이름 설정             |
|  --rm  |        프로세시 종료시 컨테이너 자동 제거         |
|  --it  | -i, -t 를 동시에 사용한 것으로 터미널 입력을 위한 옵션 |

```bash
$docker run [OPTIONS] IMAGE[:TAG|@DIGEST] [COMMAND] [ARG...]
```

### Example

ubuntu:20.04 이미지를 사용하여 랜덤한 이름의 컨테이를 실행한다. 하지만 -it 옵션을 입력하지 않았기 때문에 바로 실행이 종료된다.

```bash
$docker run ubuntu:20.04 
```


컨테이너 내부에 들어가기 위해 sh를 실행하고 키보드 입력을 위해 -it 옵션을 준다. 결과적으로 -it /bin/sh 생성된 컨테이너 내부 쉘에 들어가게 된다. 추가적으로 프로세스가 종료되면 컨테이너가 자동으로 삭제되도록 --rm 옵션도 추가했다.

```bash 
$docker run --rm -it ubuntu:20.04 /bin/sh
```


redis Image를 사용하여 컨테이너를 실행하고 -p 옵션으로 3679 포트와 로컬 3456 포트와 연결한다.

````bash
$docker run -p 3456:6379 redis
````


mysql 이미지를 통해 mysql 이라는 이름의 컨테이너를 실행한다. 또한 -p 옵션으로 컨테이너 내부의 3306 과 로컬의 3306 를 연결했다. 그리고 -e 옵션으로 mysql 이미지에서 사용되는 환경변수를 -e 옵션으로 설정하였다. (pw 없어도 접근할수있하는 환경변수)

> [!note]
> 여러개의 환경변수를 사용하려면 -e 옵션을 여러번 사용하면 된다.

```bash  
$docker run -d -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=true --name mysql mysql:5.7
```

## exec
exec 는 이미 실행 중인 컨테이너 내에서 새로운 명령을 실행하는 데 사용된다. 아래 명령어는 이미 실행중인 mysql 컨테이너에 mysql 이라하는 실행파일을 실행하라는 의미이다. 또한 -it 옵션을 통해 interactive 한 쉘을 얻을 수 있게 된다.

```bash 
$docker exec -it mysql mysql
```
