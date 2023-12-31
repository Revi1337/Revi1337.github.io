`Docker` 는 기존에 `pull` 받은 `Image` 를 변경해서 `새로운 상태의 Image` 를 만들어 저장하고 배포할 수 있다.
이 때, 기존의 `Image` 를 `Base Image` 라고 한다.

이렇게 새로운 상태의 `Image` 를 만드는 방법에는 `docker commit` 을 이용한 방법과 `Dockerfile` 를 이용하여 `docker build` 를 실행하여 생성하는 방법이 있는데,
이 두가지 방법의 차이점이 무엇이고 어떠한 방법으로 새로운 `Image` 를 만드는지 알아보도록 하자.

### I. docker commit 을 이용한 방법

> * 해당 예에서는 아무것도 없는 상태의 ubuntu 에서 Java 를 설치하여 새로운상태의 ubuntu 이미지를 만들 것이다.

##### 1. Ubuntu Image Pull

우선 `ubuntu` 의 제일 `latest` 한 버전의 `Image` 를 `pull` 받아, 컨테이너를 생성해주고 `Shell` 을 통해 접속해주자.
여기서 설치된 `ubuntu:latest` 가 `Base Image` 가 된다.

```bash
$docker run -it ubuntu:latest bash
```

![img.png](https://revi1337.github.io/posts/docker-image/img.png)

##### 2. Install Java (새로운 상태 적용)

두번쨰로 java 가 설치되어있나 확인하고, 없으면 자바를 설치해준다. 
아래커맨드는 최신상태의 패키지들을 불러오고 && java 17  을 설치해주는 커맨드이다.
이것이 기존 `Base Image` 에 변화를 주는 것이다.

```bash
$apt-get update && apt-get install -y openjdk-17-jdk
```

![img_1.png](https://revi1337.github.io/posts/docker-image/img_1.png)

##### 3. docker commit (새로운 Image 생성)

이제 컨테이너에서 나와준 후, `docker commit` 커맨드를 통해 새로운 상태의 `Image` 를 만들어준다.
아래의 커맨드는 `magical_robinson` 이라는 이름의 Container 를 `ubuntu 의 java-17 이라는 태그로 커밋`하여 `새로운 Image` 를
만들어주겠다는 의미이다.

여기서 왜 갑자기 `magical_robinson` 이라는 이름이 나왔냐에 대해 의문을 갖을 수 있다. 사실 제일 첫단계에서
Image 를 통해 컨테이너를 생성해줄때 `--name` 으로 컨테이너의 이름을 지정해줄 수 있는데 내가 까먹은것이다! ㅎㅎ.
여튼 컨테이너를 생성해줄떄 `--name` 을 명시해주지않으면 랜덤으로 `Container` 의 이름이 지정되게 된다.
따라서 그 Container 의 이름이 magical_robinson 로 지정되었던 것이다. 

```bash
$docker commit magical_robinson ubuntu:java-17
```

![img_3.png](https://revi1337.github.io/posts/docker-image/img_3.png)

##### 4. New Image 확인

자 이제 `docker images` 를 통해 존재하는 images 들을 확인해보면 `ubuntu` 에 `java-17` 태그가 있는 새로운 `Image` 가 있는것을 확인할 수 있다.

![img_4.png](https://revi1337.github.io/posts/docker-image/img_4.png)

##### 5. Container 생성 후, 변화 확인

또한 새로운 이미지인 `ubuntu:java-17` 를 통해 컨테이너를 생성해보면 `java17` 를 설치하지 않아도
기본으로 설치되어있는것을 확인할 수 있다.

```bash
$docker run -it --name=NEW_CONTAINER ubuntu:java-17 bash
```

![img_5.png](https://revi1337.github.io/posts/docker-image/img_5.png)

### II. docker build 을 이용한 방법

앞서 설명하였던 `docker commit` 를 통해 새로운 Image 를 만드는 방법은
직접 `Image` 를 pull 받고, 컨테이너 내부에서 직접 `java` 를 설치해주는 과정을 거쳤다.

하니 `docker build` 를 통해 새로운 `Image` 를 만들면 이와같은 과정을 자동화 시킬 수 있다.
이때 사용되는 자동화 스크립트가 바로 `Dockerfile` 이라는 스크립트이다.
따라서 `docker build` 를 사용하려면 꼭 `Dockerfile` 스크립트가 필요하다.

제일 먼저 `Dockerfile` 에서 사용하는 기본적인 명령어들은 아래와 같다.

#### Dockerfile 명령어 종류

| Command      | description                                                      |
|--------------|------------------------------------------------------------------|
| `FROM`       | 기본 이미지 (Base Image)                                              |
| `RUN`        | Image 가 생성되기 전에 수행 할 쉘 명령어                                       |
| `CMD`        | 컨테이너가 시작되었을때 실행할 명령어 및 Shell Script 를 명시(Entrypoint 의 인자로 사용된다.) |
| `ENTRYPOINT` | 컨테이너가 시작될었을떄 실행할 명령어 및 Shell Script 를 명시                         |
| `EXPOSE`     | 오픈되는 포트 정보. 컨테이너가 실행중에 외부에 노출되는 포트를 의미한다.                        |
| `ENV`        | Dockerfile 안에서 사용할 환경변수를 지정한다.                                   |
| `ADD`        | 파일 또는 디렉터리 추가. URL/ZIP 사용 가능                                     |
| `COPY`       | 파일 또는 디렉토리 추가 (로컬의 파일을 image 로 복사해주는 역할)                         |
| `VOLUME`     | 외부 마운트 포인트 생성. 디렉터리의 내용을 컨테이너에 저장하지 않고 호스트에 저장하도록 설정한다.          |
| `USER`       | RUN, CMD, ENTRYPOINT 를 실행하는 사용자                                  |  
| `WORKDIR`    | 작업 디렉터리를 설정. 여러번 사용되면 직전에 사용됐던 WORKDIR 을 기준으로 상대경로로 이동한다.        |
| `ARGS`       | 빌드타임 환경변수 설정                                                     |
| `LABEL`      | key - value 데이터. Image 에 Metadata를 추가 할 경우에 사용한다.                |
| `ONBUILD`    | 다른 빌드의 베이스로 사용될때 사용하는 명령어                                        |
| `MAINTAINER` | image 를 만든 사람에 대한 정보를 기입.                                        |
| `FROM`       | 기본 이미지 (Base Image)                                              |

거두절미하고 미리 작성된 스크립트로 `Dockerfile` 에 대해 알아보도록하자.

##### 1. Dockerfile 작성

아래 코드블럭은 앞서 `docker commit` 을 통해 새로운 이미지를 만드는 과정을
`Dockerfile` 에 명시한것이다.

* From : `Base Image` 를 의미한다. 아래에서는 `ubuntu image` 의 `latest` 태그를 의미한다.
* RUN : `ubuntu image` 로 인해 생성된 컨테이너에서 실행한 `쉘 명령어` 를 의미한다.
이전과 동일하게 최신 패키지를 업데이트받고,  java 17 을 설치하는 커맨드를 의미한다.

```txt
FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y openjdk-17-jdk
```

> * 참고로 `ubuntu:latest` Image 가 깔려있지 않아도, `FROM ubuntu:latest` 을 통해 `pull` 받아와서 사용되게 된다.

##### 2. docker build (새로운 Image 생성)

이제 `docker build` 를 통해 새로운 이미지를 생성해주어야하는데 우선, `Syntax` 와 `Option` 을 먼저 보도록하자.
 `docker build` 에 대한 `Syntax` 와 `Option` 은 아래와 같다.

| Option           | description                                 |
|------------------|---------------------------------------------|
| -f <Dockerfile 위치> | 기본 이미지 (Base Image)                         |
| -t               | 도커 Image 이름을 지정. `{네임스페이스}/{이미지이름}:{태그}` 형식 |

```bash
$docker build -t {이미지명:이미지태그} {빌드 컨텍스트}

$docker build -t sample:1 .
```

* `빌드 컨텍스트`는 이미지를 생성하는 데 필요한 각종 파일, 소스코드, 메타데이터 등을 담고 있는 디렉터리를 의미한다. 보통 현재 디렉터리 `.` 를 이용한다.
  (쉽게 말하면 빌드가 진행될 기준 디렉터리를 의미한다.) 

<br>

이제 상단의 예제 이용해 `docker build` 를 실행주어 새로운 Image 를 생성해준다.
아래의 커맨드는 `docker build` 를 실행해주는데, `build context` 는 현재 디렉터리로 지정해주고, 새롭게 생성될 이미지의 이름을 `ubuntu:java-17-2` 로 지정한 것이다.

```bash
$docker build -t ubuntu:java-17-2 .
```

이제 콘솔들이 쭉 뜨게되는데 이것들이 끝날때까지 기다려주면 된다.

![img_6.png](https://revi1337.github.io/posts/docker-image/img_6.png)

##### 3. New Image 확인

이제 `docker images` 를 통해 새롭게 생성된 `Image` 를 확인해보면 정상적으로 `ubuntu:java-17-2` 이름의 이미지가
생긴것을 볼 수 있다.

![img_7.png](https://revi1337.github.io/posts/docker-image/img_7.png)

##### 4. Container 생성 후, 변화 확인

이제 새로운 이미지인 `ubuntu:java-17-2` 를 통해 컨테이너를 생성해보면 `java17` 를 설치하지 않아도
기본으로 설치되어있는것을 확인할 수 있다.

![img_8.png](https://revi1337.github.io/posts/docker-image/img_8.png)

#### 예제

앞서 사용했던 `Dockerfile` 은 너무 간단했다. 이번에는 아래의 조건을 만족하는 `Image` 를 만들어보자.

##### 1. 요구사항 

1. Node.js 기반의 웹서비스를 빌드하여 Image 를 실행한다.
2. 이 때 Image 이름과 태그는 hellonode:latest 이어야 한다.
3. 또한, Image 를 실행할때 로컬 60000 포트로 오픈한다.
4. Container 가 실행되면 아래와 같은 글자가 떠야한다.

![img_10.png](https://revi1337.github.io/posts/docker-image/img_10.png)

5. 상단의 글자가 출력되기 위한 `server.js` 는 아래와 같다.

```javascript
const http = require('http');
const os = require('os');

const port = process.env.PORT || 8080;

process.on('SIGINT', function() {
  console.log('shutting down...');
  process.exit(1);
});

var handleRequest = function(request, response) {
  console.log(`Received request for URL: ${request.url}`);
  response.writeHead(200);
  response.end(`Hello, World!\nHostname: ${os.hostname()}\n`);
};

var www = http.createServer(handleRequest);
www.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
```

##### 2. Dockerfile 작성

자 이제 아래와 같이 `Dockerfile` 를 작성한다.

![img_11.png](https://revi1337.github.io/posts/docker-image/img_11.png)

상단의 코드의 의미는 아래와 같다.

`FROM node:12-alpine` : Base Image 를 node:12-alpine 을 사용한다. (node:12-alpine 는 기본적으로 npm 과 node 가 설치되어있다.)

`RUN mkdir -p /tmp/simple/dummy` : node:12-alpine 에는 /tmp/simple/dummy 경로가 없기때문에 해당 경로를 만들어준다.

`WORKDIR /tmp/simple/dummy` : 작업디렉터리를 이전에 만든 경로인 /tmp/simple/dummy 로 설정해준다.

`RUN npm i` : npm 으로 프로젝트를 초기화한다.

`COPY server.js /tmp/simple/dummy/` : 로컬에서 현재 위치에있는 server.js 파일을 /tmp/simple/dummy/ 로 복사한다.

`EXPOSE 8080` : 컨테이너가 외부로 노출될 포트를 8080 으로 지정한다.

`CMD ["node", "server.js"]` : 컨테이너가 실행될떄 사용할 명령어를 지정했다. 여기서 node 가 실행된다.

##### 3. build 후 실행

* 아래의 명령어로 build 하여 생성되는 Image 의 이름과 태그를 hellonode:latest 로 설정한다.  

```bash
$ docker build -t hellonode .
```

* 생성된 이미지를 확인해보면 hellonode:latest 인것을 확인할 수 있다.

![img_13.png](https://revi1337.github.io/posts/docker-image/img_13.png)

* 이제 해당 이미지를 로컬의 60000 포트로 연결하여 실행해준다.

![img_14.png](https://revi1337.github.io/posts/docker-image/img_14.png)

* Hello, World! 라는 글자가 잘 뜨는 것을 확인할 수 있다.

![img_15.png](https://revi1337.github.io/posts/docker-image/img_15.png)


### 정리

* `docker commit` 에서 수행하는 일련의 작업들을 스크립트 하나로 관리하고 자동화시키는 방법이
`Dockerfile` 을 이용한 `docker build` 방법이다.

* `Dockerfile` 을 이용하면 `Container` 내부에서 어떠한 과정들을 통해,
프로그램들이 설치되었는지 추적 관리가 용이해진다는 장점이 있다.
