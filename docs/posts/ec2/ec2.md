### I. EC2 란

EC2 는 `Elastic Compute Cloud` 의 약어이며 클라우드 라는 공간에서
데이터를 저장할 수 있는 `크기를 유연하게 변경` 할 수 있는 있는 기능을 제공해주는 서비스이다.
요즘 같이 데이터가 많은 시대에 이러한 유연함은 큰 이점을 준다.

사실 AWS 시험을 볼 것이 아니라면, `EC2` 는 `EBS` 와 `ELB` 로 이루어져있다는 것만 알아도 충분하다.  

* `EBS` 는 `Elastic Block Storage` 의 약자로 EC2 안에 부착된 일종의 `가상 하드디스크`라고 보면 된다.

* `ELB` 는 `Elastic Load Balancers` 의 약자로 수많은 서버의 흐름을 균형있게 흘려보내는데 중추적인 역할을 한다.
이는 즉, 하나의 서버로 `traffic` 이 몰리는 `병목현상(Bottleneck) 을 방지` 하여 서버의 원활한 흐름 및 속도에 도움이 된다.
또한, EC2 는 `시간초과` 혹은 `셧다운` 으로 인해 `Unhealthy Instance` 가 될 때가 있는데, ELB 는 Unhealthy Instance 한 상태의
Traffic 을 `Healthy Instance`  로 보내주는 역할을 한다.

EC2 에 대한 간단한 정의와 구성은 여기까지 살펴보고 EC2 인스턴스를 생성해보자.

### II. EC2 인스턴스 생성 과정

#### 1. 지역 설정

EC2 인스턴스를 만들기 전, 우선 오른쪽 상단 Header 에서 지역을 꼭 `서울` 로 바꿔준다. 그래야 서버가 한국에 생성된다.

![img_1.png](https://revi1337.github.io/posts/ec2/img_1.png)

#### 2. EC2 인스턴스 시작

그다음 `AWS 콘솔` 에서 `EC2` 를 검색후, `인스턴스 시작` 을 눌러준다.

![img.png](https://revi1337.github.io/posts/ec2/img.png)

#### 3. OS 선택

이제 OS 를 선택해야하는데 가장 범용적으로 사용되는 `Ubuntu` 이미지를 선택해준다.

![img_2.png](https://revi1337.github.io/posts/ec2/img_2.png)

#### 4. 인스턴스 유형 선택

인스턴스 유형에는 `프리티어` 요금제를 선택해준다. 시간당 `20 원` 정도..? 하는것 같다.
한달이면 `15000원` 정도?

![img_3.png](https://revi1337.github.io/posts/ec2/img_3.png)

#### 5. SSH 키페어 생성

이게 좀 중요하다. 이 키페어는 생성할 `인스턴스에 접근할 수 있는 개인키` 파일을 의미한다. (PEM 형식이다.)
아래와 같이 암호화형식은 `RSA` 를 선택해 주고 형식에 `PEM` 를 선택해준다. **여기서 받는 개인키는 절대 공개하면 안된다.**

![img_4.png](https://revi1337.github.io/posts/ec2/img_4.png)

![img_5.png](https://revi1337.github.io/posts/ec2/img_5.png)

#### 6. 네트워크 및 보안그룹 설정

이제 `VPC` 와 `Subnet` 설정을 해준다. VPC 는 기본값으로 두고 `Subnet` 은 국가마다 다르겠지만, 
`Region` 이 서울로 되어있으면, 아래와 같이 4개의 `Subnet` 선택지가 뜬다. 이 중에 아무거나 선택해주면 된다.

![img_6.png](https://revi1337.github.io/posts/ec2/img_6.png)

`퍼블릭 IP 자동 할당` 은 당연히 선택해준다.

![img_8.png](https://revi1337.github.io/posts/ec2/img_8.png)

이제 `보안그룹` 을 설정해주어야한다. 보안 그룹이름과 설명을 기입해준 뒤,`보안그룹 규칙` 을 설정해준다.
설정해둔 규칙은 아래와 같은 의미를 갖는다.

> 서버의 TCP 22 번 포트. 즉 SSH 로 들어오는 인바운드 패킷에 대해 `내 IP` 만 허용해주겠다는 의미를 갖는다.
`소스 유형` 에 내 IP 말고 위치 무관을 선택해주어도 된다. 단지.. 키관리를 더 잘해주어야 할뿐..

![img_9.png](https://revi1337.github.io/posts/ec2/img_9.png)

#### 7. 스토리지 구성

스토리를 설정해주어야한다. `8 기가` 면 충분하다. 티어별로 선택해주면 된다.

![img_10.png](https://revi1337.github.io/posts/ec2/img_10.png)

#### 8. 인스턴스 시작

이제 `인스턴스 시작` 버튼을 눌러 EC2 인스턴스를 실행해주면 된다.

![img_11.png](https://revi1337.github.io/posts/ec2/img_11.png)

이제 다시 `인스턴스` 에 가보면 생성된 EC2 인스턴스를 확인해볼 수 있다.

![img_14.png](https://revi1337.github.io/posts/ec2/img_14.png)

### III. EC2 Private Key 권한 변경 (Window)

이제 생성한 이전에발급받은 `SSH Key 페어` 로 `EC2` 인스턴스에 접속하면된다.
하지만 권한접속으로 인해 접속이되지 않을 것이다.

> * OS 로 Ubuntu 를 설정해주었다면, 기본 계정은 ubuntu 이다.

사실 이는 권한 문제때문인데, 리눅스 혹은 맥에서는 `chmod 600 NAME.PEM` 로 `PEM 파일` 의 소유자만 
읽고 쓰게만 해주면 들어갈 수 있다. 하지만 윈도우는 `chmod` 가 없으므로.. 오픈소스 터미널인 `Putty` 혹은
별도의 설정을 해 `PEM` 키의 권한을 바꿔주어야한다. 이번방법은 `Putty` 말고 윈도우 별도의 설정을 통해
`PEM` 키의 권한을 바꿔 EC2 에 접근할 수 있게 하는 방법을 소개하고자 한다.

1. 첫번째로 `PEM` 의 속성에 들어가서 `보안` 탭을 선택후 `고급` 을 선택해준다.
 
![img_13.png](https://revi1337.github.io/posts/ec2/img_13.png)

2. `상속 사용 안함` 을 눌러준다.

![img_15.png](https://revi1337.github.io/posts/ec2/img_15.png)

3. `사용권한 항목` 에서 모든 사용자를 지워준다. 또한, 상단의 `소유자`를 잘 기억해준다. 

![img_16.png](https://revi1337.github.io/posts/ec2/img_16.png)

4. `추가` 를 눌러주고, `보안 주체 선택` 을 눌러 `사용자 또는 그룹 선택` 창이 뜨게 한다.

![img_17.png](https://revi1337.github.io/posts/ec2/img_17.png)

5. 위에 사진에서 `고급` 을 눌러준 뒤, 아래 사진의 `지금 찾기` 버튼을 눌러주고 
아까 기억해두었던, `소유자` 와 동일한 것을 선택해준다.

![img_18.png](https://revi1337.github.io/posts/ec2/img_18.png)

아래와 같이 확인을 눌주고

![img_19.png](https://revi1337.github.io/posts/ec2/img_19.png)

`기본 권한` 을 설정할 수 있게된다. 여기서 `읽기`, `쓰기` 를 선택해준다.

![img_20.png](https://revi1337.github.io/posts/ec2/img_20.png)

6. 이제 SSH 키로 EC2 인스턴스에 접근할수 있게 된다.

![img_12.png](https://revi1337.github.io/posts/ec2/img_12.png)

![img_21.png](https://revi1337.github.io/posts/ec2/img_21.png)

### IV. Putty 로 EC2 에 접속하는 방법

> * 현재 파트는 해당 글을 올리고 시간이 지나서 작성하는 부분이다. 따라서 앞서 발급한 `pem` 키의 이름을 포함 여러 부분이
다를 수 있다. (전혀 지장 없음.)

우선 https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html 에서
`Putty Package` 를 다운받아 설치해준다.

![putty-package.png](https://revi1337.github.io/posts/ec2/putty-package.png)

어떠한 설정도 건드리지않고 디폴트설정으로 다운받았으면 `C:\Program Files\PuTTY\puttygen.exe` 를
실행해준다. `puttygen` 은 `pem` 파일은 `ppk` 형식으로 변환해주는 기능을 제공한다.

이제 `RSA` 를 체크해주고 `Load` 버튼을 눌러 기존의 ssh `pem` 키를 선택해준다.

![putty-keygen.png](https://revi1337.github.io/posts/ec2/putty-keygen.png)
![pem.png](https://revi1337.github.io/posts/ec2/pem.png)

성공적으로 import 했다는 알림창을 넘겨주고 

![notice.png](https://revi1337.github.io/posts/ec2/notice.png)

변환된 키를 저장하겠냐는 경고창도 넘겨준다.

![img_23.png](https://revi1337.github.io/posts/ec2/img_23.png)

이제 `Putty` 를 실행해준 후, 오른쪽 `Session` 탭에서 `HostName(Ip address)` 를 입력해주고
`Saved Sessions` 에 저장할 세션의 이름을 설정해준다.

> * 여기서 `Open` 을 누르는 것이 아니다. 

![img_24.png](https://revi1337.github.io/posts/ec2/img_24.png)

곧바로 `Connection > SSH > Auth > Crendentials` 탭으로 넘어가서 `Browse` 를 선택하여 
변환한 `ppk` 파일을 선택해준다.

![img_25.png](https://revi1337.github.io/posts/ec2/img_25.png)

이제 다시 `Session` 탭으로 돌아와 `Save` 를 눌러주고, 방금 생성한 `Session` 을 `Open` 하면 
`EC2` 에 접근할 수 있다.

![img_26.png](https://revi1337.github.io/posts/ec2/img_26.png)

나는 `EC2` 운영체제가 `ubuntu` 이기때문에 `ubuntu` 라는 이름의 사용자로 EC2 에 접속했다.

![img_27.png](https://revi1337.github.io/posts/ec2/img_27.png)