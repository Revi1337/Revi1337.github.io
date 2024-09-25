---
title: Docker Build
tags: ['docker']
---

도커는 기존에 pull 받은 `Base Image` 를 변경해서 `새로운 상태의 Image` 를 만들어 저장하고 배포할 수 있다. 이렇게 새로운 상태의 `Image` 를 만드는 방법에는 `docker commit` 을 이용한 방법과 `Dockerfile` & `docker build` 를 이용하여 생성하는 방법이 있다. 해당 포스팅에서는 이 두가지 방법으로 새로운 `Image` 를 만드는 방법과 차이점을 알아보자.

> 정확히는 두가지 방법으로 자바가 디폴트 설치되어있는 새로운 Ubuntu Image 를 만드는 과정을 포스팅 할 것이다.

## docker commit 을 이용한 방법
### Image Pull
우선 가장 latest 한 버전의 Ubuntu 이미지를 `pull` 받고 컨테이너를 생성 및 실행해준다. 여기서 방금 설치한 이미지가 `Base Image` 가 된다. 이 때 실행될 컨테이너 이름을 지정해준다.

```bash
$ docker run --name test_new_image -it ubuntu:20.04 bash
```

![](Docker/images/Pasted%20image%2020240108004409.png)


다른 터미널에서 `docker ps` 를 실행해보면 방금 시작한 컨테이너를 확인할 수 있다.

![](Docker/images/Pasted%20image%2020240108004216.png)

### Install Java
일반적인 `ubuntu`  이미지는 어떠한 바이너리도 설치되어있지 않기 때문에 `Java` 를 설치해주어야 한다. 아래 코드블럭을 통해 최신상태의 패키지들을 불러오고 `Java 17`  를 설치할 수 있다.

```bash
$ apt-get update && apt-get install -y openjdk-17-jdk
```

![](Docker/images/Pasted%20image%2020240108004732.png)


`Java` 를 설치를 확인해준다.

![](Docker/images/Pasted%20image%2020240108005915.png)

### docker commit
이제 `docker commit` 으로 새로운 Image 를 만들어줄 수 있다. 컨테이너에서 나와준 후, `docker commit` 커맨드를 통해 새로운 상태의 `Image` 를 만들어준다. 아래 코드블럭은 `test_new_image`  이름의 컨테이너를 `ubuntu:java-17` 이라는 `Tag` 로 커밋하여 새로운 Image 를 만들어주겠다는 의미이다.

```bash
$ docker commit test_new_image ubuntu:java-17
```

![](Docker/images/Pasted%20image%2020240108010403.png)

### 새로운 Image 확인
 `docker images` 를 통해 로컬에 존재하는 images 들을 확인해보면 `ubuntu` 에 `java-17` Tag 가 달려있는 `Image` 가 생성된것을 확인할 수 있다.

![](Docker/images/Pasted%20image%2020240108010606.png)

### 새로운 Container 생성
앞서 생성한 새로운 Image 로 Container 를 생성하여 실행해보면 별도의 설치없이 `Java` 가 설치되어 있는것을 확인할 수 있다.

```bash
$ docker run --name new_java_image -it ubuntu:java-17 bash
```

![](Docker/images/Pasted%20image%2020240108011225.png)

### 결론
`docker commit` 으로 새로운 Image 를 만드는 방법은 수동적인 방법이다.

## docker build 를 이용한 방법
앞서 설명한 `docker commit` 을 통해 새로운 Image 를 만드는 방법은 직접 `Image` 를 pull 받고, 컨테이너 내부에서 직접 `java` 를 설치해주는 과정을 거쳤다. 사실 이는 매우 귀찮고 번거롭다. 하지만 `Dockerfile` 과  `docker build` 를 사용하면 새로운 `Image` 를 만들때 이러한 과정을 자동화시킬 수 있다.

> 정확히는 Dockerfile 이라는 파일에 새로운 이미지를 만들기 위해 필요한 과정 및 흐름(Flow) 을 명시하고 docker build 로 Dockerfile 을 실행하여 새로운 이미지를 자동으로 생성하게 하는 원리이다.

### Dockerfile 작성
새로운 Image 를 만들기 위해서는 당연히 `Dockerfile` 을 먼저 작성해주어야 한다. 아래 코드블럭은 앞서 소개한  `docker commit` 을 통해 새로운 이미지를 만드는 과정 및 흐름을 `Dockerfile` 에 명시한것이다.

```dockerfile
FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y openjdk-17-jdk
```

* `FROM` : Base Image. 즉 새로운 기능을 덧붙일 기반 Image 를 명시해주면 된다. 아래에서는 ubuntu image 의 latest 태그를 의미한다.  Dockerfile 이 실행되면 이미지가 설치되어있지 않아도 자동으로 해당 이미지를 pull 하고 컨테이너를 생성하게 된다.
* `RUN` : 앞서 생성한 컨테이너에서 실행할 Shell 명령어를 의미한다. 최신 패키지를 업데이트받고  Java 17 을 설치하는 커맨드를 의미한다.

#### Dockerfile 명령어
Dockerfile 에서 사용되는 명령어는 아래와 같다. 

| Command    | Description                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| FROM       | 기본 이미지 (Base Image)                                                                                                               |
| RUN        | 이미지를 빌드할 때 실행되는 명령어를 명시. (여러번 실행 가능.)                                                                                             |
| CMD        | 컨테이너가 시작될때 실행될 명령어 및 Shell Script 를 명시. (여러번 선언할 수 있지만 호출되는 것은 맨 마지막 CMD 값이다. 해당 명령어는 컨테이너가 실행될 때마다 실행되며 Entrypoint 의 인자로도 사용된다.) |
| ENTRYPOINT | 컨테이너가 시작되었을때 실행할 명령어 및 Shell Script 를 명시 (Dockerfile 에서 단 한번만 사용된다.)                                                              |
| EXPOSE     | 오픈되는 포트 정보. 컨테이너가 실행중에 외부에 노출되는 포트를 의미한다.                                                                                         |
| ENV        | Dockerfile 안에서 사용할 환경변수를 지정한다.                                                                                                    |
| ADD        | 파일 또는 디렉터리 추가. URL/ZIP 사용 가능                                                                                                      |
| COPY       | 파일 또는 디렉토리 추가. (Local 의 파일을 Base Image 의 특정 경로로 복사해주는 역할)                                                                         |
| VOLUME     | 외부 마운트 포인트 생성. 디렉터리의 내용을 컨테이너에 저장하지 않고 호스트에 저장하도록 설정한다.                                                                           |
| USER       | RUN, CMD, ENTRYPOINT 를 실행하는 사용자.                                                                                                  |
| WORKDIR    | 작업 디렉터리를 설정. 여러번 사용되면 직전에 사용됐던 WORKDIR 를 기준으로 상대경로로 이동한다.                                                                         |
| ARGS       | 빌드타임 환경변수 설정.                                                                                                                     |
| LABEL      | key - value 데이터. Image 에 Metadata를 추가 할 경우에 사용한다.                                                                                 |
| ONBUILD    | 다른 빌드의 베이스로 사용될때 사용하는 명령어.                                                                                                        |
| MAINTAINER | image 를 만든 사람에 대한 정보를 기입.                                                                                                         |

 `RUN`, `ENTRYPOINT` , `CMD` 는 매우 비슷하고 헷갈리는데 이건 따로 찾아보는것을 추천한다. 간략히 설명하자면 아래와 같이 설명할 수 있다.

#### RUN, CMD, ENTRYPOINT 차이
`RUN`, `ENTRYPOINT`,  `CMD` 모두 Dockerfile 에서 실행될 명령을 지정하는 데 사용되지만, 적용 방식과 동작하는 방식에 차이가 있다.

- `CMD`: Dockerfile에서 `한 번만 사용`되며, 컨테이너가 시작될 때 실행될 기본 명령을 지정하는 명령이다. 또한 CMD 는 컨테이너 실행 시에 명령을 덮어쓸 수 있다. 이 말은 `Dockerfile 내부에서 여러번 선언할 수 있지만 값이 Override 되며 최종 CMD  가 호출되는것은 한번` 뿐이라는 것이다. 

- `RUN` : 여러번 사용할 수 있으며 컨테이너가 이미지가 빌드될때 실행할 명령어를 명시하면 된다. CMD 명령어와의 결정적인 차이는 명령어가 실행되는 시점이 다르다는 것이다. `RUN 은 이미지를 빌드할때 실행`되며 `CMD 는 컨테이너가 시작될때 실행`되는 명령이다.

- `ENTRYPOINT`: CMD 와 마찬가지로 Dockerfile에서 `한 번만 사용`되며, 컨테이너가 실행될 때마다 항상 실행되어야 하는 명령이나 스크립트를 지정하면 된다. ENTRYPOINT 와 CMD 와 함께 사용될 경우, CMD 에 있는 값들은 ENTRYPOINT 에 정의된 명령의 인자로 전달되게 된다. ENTRYPOINT는 일종의 컨테이너의 핵심 실행 명령어를 정의할 때 사용된다.

### docker build 
이제 `docker build` 를 통해 `Dockerfile` 을 실행해줌으로서 새로운 Image 생성할 수 있게 된다. 이 때 `docker build` 의 옵션은 아래와 같다.

| Option           | Description                                 |
|------------------|---------------------------------------------|
| -f | 다른 파일명을 가진 Dockerfile을 사용해야 할 때 사용.                         |
| -t               | 도커 Image 이름을 지정. {네임스페이스}/{이미지이름}:{태그} 포맷 |

#### Build Context 란?
docker build 의 기본적인 Syntax 는 아래와 같다. `-t` 옵션으로 생성할 이미지명과 태그를 명시해주고 `빌드 컨텍스트`를 명시해주면 된다. 빌드 컨텍스트는 이미지를 생성하는 데 필요한 각종 파일, 소스코드, 메타데이터 등을 담고 있는 디렉터리를 의미한다. 한마디로 `Image 를 Build 할 기준 디렉터리를 명시` 하는 것이다.

```bash
$ docker build -t {생성할_이미지명:이미지태그} {빌드 컨텍스트}
```

> [!note]
> 절대 헷갈리면 안되는것은 Build Context 가 Dockerfile 이 위치한 경로를 의미하는것이 아니다.


또한, Docker 는 기본적으로 Image 를 빌드할 때 빌드 컨텍스트 경로에서 `Dockerfile` 이라는 이름을 갖는 파일을 찾아 실행하게 된다. 그렇기 때문에 빌드 컨텍스트 경로에 Dockerfile 이 존재한다면 따로 Dockerfile 의 경로를 명시할 필요가 없다.

```bash
$ docker build -t test:v1 .
```

#### Dockerfile, Build Context 의 위치를 다르게
하지만 가끔은 `빌드 컨텍스트` 경로와 `Dockerfile` 이 위치하는 경로를 다르게 주고싶을 때가 있다. 이럴때는 `-f` 옵션으로 `Dockerfile` 이 있는 위치를 지정해주어야 한다. 따라서 아래의 커맨드를 해석하면 Docker Build 를 수행할때 현재경로의 `./docker/Dockerfile` 을 수행하되 Image 가 빌드되는 폴더는 `현재 위치` 로 지정해주겠다는 의미가 된다.

```bash
$ docker build -f ./docker/Dockerfile -t test:v1 .
```


본론으로 돌아와 `docker build` 를 실행주어 새로운 Image 를 생성해준다. 아래의 코드블럭은  `docker build` 를 실행할때 새롭게 생성될 이미지의 이름을 `ubuntu:java-17-2` 로 지정하고 빌드 컨텍스트는 현재 위치로 지정하겠다는 의미가 된다. 따로 `-f`  옵션을 통해 Dockerfile 의 경로를 설정해주지 않았기 때문에 docker build 를 수행하면 docker 는 자동으로 빌드 컨텍스트의 경로인 `현재 위치 (.)` 에서 Dockerfile 을 찾아 Image 빌드를 시작하게 된다.

```bash
$ docker build -t ubuntu:java-17-2 .
```


이제 Image 빌드가 시작되고 콘솔들이 쭉 뜨게되는데 이것들이 끝날때까지 기다려주면 된다.

![](Docker/images/Pasted%20image%2020240108025731.png)

### 새로운 Image 확인
`docker images` 를 통해 새롭게 생성된 `Image` 를 확인해보면 정상적으로 `ubuntu:java-17-2` 이름의 이미지가 생긴것을 볼 수 있다.

![](Docker/images/Pasted%20image%2020240108030511.png)

### 새로운 Container 생성
이제 새로운 이미지인 `ubuntu:java-17-2` 로 컨테이너를 생성 및 실행해보면 `java17` 를 설치하지 않아도 기본으로 설치되있는 것을 확인할 수 있다.

![](Docker/images/Pasted%20image%2020240108030710.png)

## 정리
1. `docker commit` 을 통한 이미지 생성은 매우 수동적이고 번거롭다.
2. `Dockerfile` 과 `docker build` 를 통한 이미지 생성은 자동화가 되어있어 매우 편리하다. 
3. 빌드 컨텍스트 는 Dockerfile 이 위치하는 경로를 나타내는 것이 아니라 `빌드가 수행될 기준 디렉터리를` 지정하는 것이다.

docker build 에는 캐시, 크기를 줄일  수 있는 기능들이 있지만 생략하겠다.
