---
title: Docker Build
tags: ['docker']
---

## Docker Image
도커는 기존에 pull 받은 Base 이미지를 변경하여 새로운 상태의 이미지를 만들고 배포할 수 있습니다. 새로운 상태의 이미지를 만드는 방법에는 `docker commit`을 이용한 방법과 `Dockerfile & docker build` 를 이용한 방법이 있습니다. 

> 두 가지 방법으로 자바가 기본으로 설치되어있는 새로운 우분투 이미지를 만드는 과정을 알아봅니다.


## docker commit
### Image Pull
가장 latest 한 버전의 Ubuntu 이미지를 `pull` 받고 컨테이너를 생성 및 실행합니다. 설치한 이미지가 `Base Image`가 됩니다.

```bash
docker run --name test_new_image -it ubuntu:20.04 bash
```

![](Docker/images/Pasted%20image%2020240108004409.png)


다른 터미널에서 `docker ps`를 실행하면 방금 시작한 컨테이너를 확인할 수 있습니다.

![](Docker/images/Pasted%20image%2020240108004216.png)

### Install Java
일반적인 `ubuntu`  이미지는 어떠한 바이너리도 설치되어있지 않기 때문에 `Java` 를 설치해야 합니다. 아래 코드를 통해 최신상태의 패키지들을 불러오고 `Java 17`  를 설치할 수 있습니다.

```bash
apt-get update && apt-get install -y openjdk-17-jdk
```

![](Docker/images/Pasted%20image%2020240108004732.png)


`Java` 를 설치를 확인합니다.

![](Docker/images/Pasted%20image%2020240108005915.png)

### docker commit
`docker commit` 으로 새로운 이미지를 만들어줄 수 있습니다. `docker commit` 명령으로 새로운 상태의 이미지를 만듭니다. 아래 코드는 `test_new_image` 이름의 컨테이너를 `ubuntu:java-17` 이라는 `Tag` 로 커밋하여 새로운 이미지를 만드는 명령입니다.

```bash
docker commit test_new_image ubuntu:java-17
```

![](Docker/images/Pasted%20image%2020240108010403.png)

### Confirm New Image
 `docker images` 를 통해 로컬에 존재하는 images 들을 확인해보면 `ubuntu` 에 `java-17` Tag 가 달려있는 `Image` 가 생성된것을 확인할 수 있다.

![](Docker/images/Pasted%20image%2020240108010606.png)

### Create New Container
생성한 새로운 이미지로 컨테이너를 생성하여 실행해보면, 별도의 설치없이 `Java` 가 설치되어 있는것을 확인할 수 있습니다.

```bash
docker run --name new_java_image -it ubuntu:java-17 bash
```

![](Docker/images/Pasted%20image%2020240108011225.png)

### Conclusion
`docker commit` 을 통한 새로운 이미지 생성은 수동적인 방법입니다.


## docker build
앞서 설명한 `docker commit`로 새로운 이미지를 만드는 방법은 직접 이미지를 pull 받고, 컨테이너 내부에서 직접 `java` 를 설치해주는 과정을 거치는 번거로운 과정을 거칩니다. 하지만 `Dockerfile`와 `docker build` 를 사용하면 위 과정을 자동화하여 보다 쉽게 새로운 이미지를 만들 수 있습니다.

> 보다 정확히는 Dockerfile 파일에 새로운 이미지를 만들기 위해 필요한 과정 및 흐름(Flow)을 명시하고 docker build 로 Dockerfile을 실행하여 새로운 이미지를 자동으로 생성하게 하는 원리입니다.


### Dockerfile
새로운 이미지를 만들기 위해서는 `Dockerfile`을 작성해야 합니다. 아래 코드는 `docker commit` 을 통한 새로운 이미지 생성 흐름을 Dockerfile에 명시한 것입니다.

```dockerfile
FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y openjdk-17-jdk
```

* `FROM` : Base Image. 즉 새로운 기능을 덧붙일 기반 이미지를 명시합니다. Dockerfile이 실행되면 기반이 되는 이미지가 설치되어있지 않아도 자동으로 해당 이미지를 pull 하고 컨테이너를 생성합니다.
* `RUN` : 생성된 컨테이너에서 실행할 명령어를 명시합니다.


Dockerfile 에서 사용되는 명령어는 아래와 같습니다.

| Command    | Description                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| FROM       | 베이스가 되는 기본 이미지(Base Image)를 지정합니다.                                                                                |
| RUN        | 이미지 빌드 시 실행할 명령어를 작성합니다. 여러 개 작성할 수 있습니다.                                                                         |
| CMD        | 컨테이너 시작 시 실행할 명령어 또는 스크립트를 지정합니다. 여러 번 작성 가능하지만, 마지막 CMD만 실행됩니다.  <br>컨테이너가 실행될 때마다 실행되며, ENTRYPOINT의 인자로도 사용됩니다. |
| ENTRYPOINT | 컨테이너 시작 시 한 번만 실행되는 명령어 또는 스크립트를 지정합니다.                                                                           |
| EXPOSE     | 컨테이너에서 외부로 노출할 포트를 지정합니다.                                                                                         |
| ENV        | Dockerfile 내에서 사용할 환경 변수를 설정합니다.                                                                                  |
| ADD        | 파일 또는 디렉터리를 이미지에 추가합니다. URL이나 압축 파일도 지원합니다.                                                                       |
| COPY       | 로컬 파일이나 디렉터리를 이미지 내 특정 경로로 복사합니다.                                                                                 |
| VOLUME     | 외부 저장소(호스트)와 연결되는 마운트 포인트를 생성하여, 컨테이너 내부 데이터가 호스트에 저장되도록 합니다.                                                     |
| USER       | RUN, CMD, ENTRYPOINT 명령을 실행할 사용자를 지정합니다.                                                                          |
| WORKDIR    | 작업 디렉터리를 설정합니다. 여러 번 쓰면 이전 WORKDIR를 기준으로 상대 경로로 이동합니다.                                                            |
| ARG        | 빌드 시 사용할 빌드 타임 변수(환경 변수)를 설정합니다.                                                                                  |
| LABEL      | 이미지에 메타데이터(key-value 형태)를 추가합니다.                                                                                  |
| ONBUILD    | 다른 이미지가 이 이미지를 베이스로 빌드할 때 실행될 명령어를 지정합니다.                                                                         |
| MAINTAINER | 이미지를 만든 사람의 정보를 기입합니다. (현재는 LABEL로 대체 권장)                                                                         |


`RUN`, `CMD`, `ENTRYPOINT`는 모두 Dockerfile에서 명령어를 지정할 때 사용하지만, 역할과 실행 시점이 다릅니다.

- `CMD`
    - Dockerfile 내에서 여러 번 선언할 수 있으나, 오직 마지막에 선언된 CMD만 컨테이너 실행 시 사용됩니다.
    - 컨테이너가 시작될 때 기본 실행 명령을 지정하며, 컨테이너 실행 시 다른 명령어로 덮어쓸 수 있습니다.
    - 즉, CMD는 컨테이너가 실행될 때 실행되는 기본값이며, 필요에 따라 변경 가능합니다.

- `RUN`
    - Docker 이미지 빌드 과정에서 실행되는 명령어를 지정합니다.
    - 여러 번 사용할 수 있으며, 각 RUN 명령어는 이미지에 새로운 레이어로 저장됩니다.
    - 컨테이너가 실행될 때가 아니라 이미지가 만들어질 때 실행되는 점이 CMD와 가장 큰 차이입니다.
    - RUN은 이미지를 빌드할 때 실행되며 CMD는 컨테이너가 시작될 때 실행됩니다.
        
- `ENTRYPOINT`
    - Dockerfile 내에서 한 번만 선언하며, 컨테이너가 실행될 때 항상 실행되는 명령어 또는 스크립트를 지정합니다.
    - CMD와 함께 사용할 경우, CMD는 ENTRYPOINT 명령어에 전달되는 기본 인자(arguments) 역할을 합니다.
    - ENTRYPOINT는 컨테이너가 어떤 실행 파일처럼 동작하게 만들고 싶을 때 주로 사용합니다.
    - 컨테이너 실행 시 명령어를 덮어쓰더라도 ENTRYPOINT는 유지되며, CMD 또는 명령줄 인자가 ENTRYPOINT에 전달됩니다.

### docker build 
`docker build`로 `Dockerfile` 을 실행하여 새로운 이미지를 생성합니다. 사용되는 옵션은 아래와 같습니다.

| Option | Description                                      |
| ------ | ------------------------------------------------ |
| -f     | 다른 파일명을 가진 Dockerfile을 사용해야 할 때 사용합니다.           |
| -t     | 도커 Image 이름을 지정합니다. {네임스페이스}/{이미지이름}:{태그} 포맷입니다. |


#### Build Context
`docker build`의 기본 Syntax 는 아래와 같습니다. `-t` 옵션으로 생성할 이미지명과 태그를 명시해주고 `빌드 컨텍스트`를 명시해주면 됩니다. 빌드 컨텍스트는 이미지를 생성하는 데 필요한 각종 파일, 소스코드, 메타데이터 등을 담고 있는 디렉터리를 의미합니다. 한마디로 `이미지를 빌드할 기준 디렉터리를 명시`하면 됩니다.

```bash
docker build -t {생성할_이미지명:이미지태그} {빌드 컨텍스트}
```

> [!note]
> Build Context가 Dockerfile의 위치를 말하는것이 절대 아닙니다.


도커는 기본적으로 이미지를 빌드할 때 빌드 컨텍스트 경로에서 `Dockerfile` 이라는 이름을 갖는 파일을 찾아 실행합니다. 덕분에 빌드 컨텍스트 경로에 Dockerfile 이 존재한다면 따로 Dockerfile의 경로를 명시할 필요가 없습니다.

```bash
docker build -t test:v1 .
```


`빌드 컨텍스트` 경로와 `Dockerfile`이 위치하는 달라야할 경우가 있습니다. 이 경우 `-f` 옵션으로 `Dockerfile` 이 있는 위치를 지정해야 합니다. 아래의 명령을 해석하면 Docker Build를 수행할 때 현재경로의 `./docker/Dockerfile` 을 실행하되, 이미지가 빌드되는 폴더는 `현재 위치` 로 하겠다는 의미입니다.

```bash
docker build -f ./docker/Dockerfile -t test:v1 .
```


본론으로 돌아와 `docker build`로 새로운 이미지를 생성합니다. 아래의 코드는 새롭게 생성될 이미지와 태그를`ubuntu:java-17-2`로 지정하고 빌드 컨텍스트는 현재 위치 지정하겠다는 의미입니다. Dockerfile의 경로를 지정하는 -f 옵션을 사용하지 않았기 때문에, docker build 시 자동으로 빌드 컨텍스트의 경로인 `현재 위치 (.)` 에서 Dockerfile을 찾아 이미지 빌드를 시작합니다.

```bash
docker build -t ubuntu:java-17-2 .
```


이미지 빌드가 시작되어 나타나는 콘솔들이 끝날 때까지 기다리면 됩니다.

![](Docker/images/Pasted%20image%2020240108025731.png)


### Confirm New Image
`docker images` 를 통해 새롭게 생성된 이미지를 확인해보면 정상적으로 `ubuntu:java-17-2` 이름의 이미지가 생긴 것을 확인할 수 있습니다.

![](Docker/images/Pasted%20image%2020240108030511.png)


### Create New Container
새로운 이미지로 컨테이너를 생성 및 실행하면 기본으로 `java17`가 설치되어있는 것을 확인할 수 있습니다.

![](Docker/images/Pasted%20image%2020240108030710.png)


## Conclusion
1. `docker commit`을 사용한 이미지 생성은 수동적이고 번거로운 과정입니다.
2. 반면, `Dockerfile`과 `docker build`를 활용하면 이 과정을 자동화할 수 있어 훨씬 쉽고 편리하게 이미지를 만들 수 있습니다.
3. 또한, Build Context는 단순히 Dockerfile이 위치한 경로가 아니라, 빌드가 실행되는 기준이 되는 디렉터리를 의미합니다.

> docker build 시 캐시 활용이나 이미지 크기 최적화 기능도 있지만, 여기서는 생략합니다.

