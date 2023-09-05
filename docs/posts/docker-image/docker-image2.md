Docker Image 만들기

// 도커는 기존의 Base Image 에서 새로운 상태를 또다른 Image 로 저장할 수 있다.
그 방법에는 두가지가있음. 바로 docker commit, docker build

// 도커 이미지명 규칙
이름공간  이미지이름:태그
docker bulid -t subicura/ubuntu:git01 .
컨텍스트

1. docker commit
   // git 이라는 컨테이너를 ubuntu 의 git 이라는 태그로 커밋하겠다는 의미.
   docker commit git(컨테이너 이름) ubuntu:git

2. docker build
   Docker Image 를 만들기 위해 DockerFile 이라는걸 쓴다. 아래는 Dockerfile 에서 사용하는 핵심 명령어이다.

`FROM`: 기본 이미지 (Base Image)
`RUN`: 쉘 명령어 실행
`CMD`: 컨테이너가 생성시 실행되는 기본 명령어(Entrypoint 의 인자로 사용)
`EXPOSE`: 오픈되는 포트 정보
`ENV`: 환경변수 설정
`ADD`: 파일 또는 디렉터리 추가. URL/ZIP 사용 가능
`COPY`: 파일 또는 디렉토리 추가 (로컬의 파일을 image 로 복사해주는 역할)
`ENTRYPOINT`: 컨테이너 기본 실행 명령어
`VOLUME`: 외부 마운트 포인트 생성
`USER`: RUN, CMD, ENTRYPOINT 를 실행하는 사용자  
`WORKDIR`: 작업 디렉터리 설정
`ARGS`: 빌드타임 환경변수 설정
`LABEL`: key - value 데이터
`ONBUILD`: 다른 빌드의 베이스로 사용될때 사용하는 명령어

// 이미지 빌드
docker build -t {이미지명:이미지태그} {빌드 컨텍스트}
docker build -t sample:1 .

현재 디렉터리의 Dockerfile 를 이용해서 빌드수행
-f <Dockerfile 위치> 옵션을 통해서 다른 위치의 Dockerfile 파일을 사용 가능
-t 명령어로 도커 이미지 이름을 지정 {네임스페이스}/{이미지이름}:{태그} 형식
마지막에는 빌드 컨텍스트 위치를 지정
- 현재 디렉터리를 의미하는 점(.) 을 주로 사용
- 필요한 경우 다른 디렉터리를 지정할 수도 있음.

.dockerignore
- .gitignore 과 비슷한 역할을 수행
- 도커 빌드 컨텍스트에서 지정된 패턴의 파일을 무시함
- .git 이나 민감한 정보를 제외하는 용도로 사용. .git 이나 에셋 디렉터리만 제외시켜도 빌드 속도 개선
- 이미지 빌드 시에 사용하는 파일은 제외시키면 안됨.

// docker build 가 성공하게 되면 ubuntu 라는 이름과 git-dockerfile 태그를 갖고있는 이미지를 생성하게 됨.
// 즉, 기존의 ubuntu:latest 에 직접 들어가서 apt.. 등등을 수행하고 docker commit 을 통해 직접 새로운상태의 Image 를 만드는 과정을 Dockerfile 이 자동화해주는 것이다
// 따라서 실제로 서버에 들어가서 하려는 작업들을 Dockerfile 로 관리하는것이다. (추적 관리에 용이)
docker build -t ubuntu:git-dockerfile .

////////////////////////////////////////////////////////

도커 이미지 만들기 (웹 애플리케이션)

```Dockerfile
# 1. node 설치
FROM ubuntu:20.04
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs

# 2. 소스 복사
COPY . /usr/src/app

# 3. Nodejs 패키지 설치
WORKDIR /usr/src/app
RUN npm install

# 4. WEB 서버 실행 (Listen 포트 정의)
EXPOSE 3000
CMD node app.js
```

///////////////

로컬에만 저장되어있는 Image 를 다른 사람들도 쓰게할 수 있는 방법 (도커 허브)
hub.docker.com

// 이미지 저장 명령어
docker login                // 이미지 저장소 로그인
docker push {ID}/example    // 내가만든 이미지를 저장소에 올림

////////////

배포하기

// 컨테이너 실행 = 이미지 pull + 컨테이너 start
docker run -d -p 3000:3000 subicura/app