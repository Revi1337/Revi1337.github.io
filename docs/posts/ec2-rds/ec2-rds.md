#### 1. 연동할 EC2 정보 파악

우선 이번 포스팅에서 될 EC2, RDS 를 연동하려면 모두 같은 네트워크 안에서 사용해야 하므로,
꼭 EC2 인스턴스와 동일한 `VPC`, `Subnet ID`, `보안그룹` 을 사용해야한다.

따라서 기존 EC2 에서 사용중인 `VPC` 정보와 `Subnet ID`, `보안그룹` 정보를 숙지해놓아야한다.
해당 정보는 기존의 `EC2 인스턴스 요약` 에서 확인할 수 있다.

빨간색 박스들이 `RDS` 와 `EC2` 를 연동하기 위해 필요한 정보이다. 

![img_24.png](https://revi1337.github.io/posts/ec2-rds/img_24.png)

#### 2. DB 보안그룹 생성

`RDS` 에서 사용할 DB 보안 그룹을 생성하기 위해 
`EC2 > 네트워크 및 보안 > 보안 그룹` 으로 온 후, 맨 오른쪽 `보안 그룹 생성` 선택

![img.png](https://revi1337.github.io/posts/ec2-rds/img.png)

`보안 그룹 이름` 과 `설명` 에 적당하게 이름을 기입해주고
`EC2` 인스턴스가 사용하고있는 VPC 와 동일한 것을 선택해준다.

> * 연동하게 될 EC2, RDS 를 연동하려면 모두 같은 네트워크 안에서 사용해야 하므로, 
꼭 EC2 인스턴스와 동일한 `VPC`, `Subnet ID`, `보안그룹` 을 사용해야한다.

![img_1.png](https://revi1337.github.io/posts/ec2-rds/img_1.png)

`인바운드 규칙` 에서 `규칙추가` 를 눌러 인바운드 규칙을 하나 추가해준다.
MYSQL 을 사용할 것이기 때문에, 유형에는 `MYSQL/Aurora` 를 선택해준다.
그리고 `소스` 옆 돋보기에서는 EC2 인스턴스가 속한 보안그룹과 동일한 그룹을 선택해주고
제일 하단 `보안 그룹 생성` 을 눌러 보안그룹을 생성해주자. 

![img_2.png](https://revi1337.github.io/posts/ec2-rds/img_2.png)

#### 3. DB 서브넷 그룹 생성

AWS 콘솔에서 RDS 로 이동해준 후, `Amazon RDS > 서브넷 그룹` 을 선택해주고
`DB 서브넷 그룹 생성` 을 눌러준다.

![img_3.png](https://revi1337.github.io/posts/ec2-rds/img_3.png)

서브넷 그룹 `이름` 을 생성해주고 `VPC` 에는 동일하게 `EC2` 에서 사용하고있는 `VPC` 를 선택해준다.

![img_4.png](https://revi1337.github.io/posts/ec2-rds/img_4.png)

`가용영역` 에 존재하는 모든 서브넷들을 모두 `서브넷` 에서 추가해고, `DB 서브넷 그룹` 을 생성해준다.

![img_5.png](https://revi1337.github.io/posts/ec2-rds/img_5.png)

#### 4. 파라미터 그룹 생성

파라미터 그룹을 생성하는 이유는 한글사용과 한국 Timezone 을 사용하기 위함이다.
우선 `Amazon RDS > 파라미터 그룹` 으로 들어가준 뒤 `파라미터 그룹 생성` 을 눌러준다.

![img_6.png](https://revi1337.github.io/posts/ec2-rds/img_6.png)

MYSQL 8 에 적용할 것이기 때문에 `파라미터 그룹 패밀리` 에는 `mysql 8.0` 을 선택해준다.
또한, 그룹 이름과 설명은 재량껏 설정해주고, 파라미터 그룹을 만들어준다.

![img_7.png](https://revi1337.github.io/posts/ec2-rds/img_7.png)

그렇게되면 파라미터 그룹에 방금 생성한 파라미터 그룹이 뜨게된다. 이제 이 `파라미터그룹` 을 수정해주어야 한다.
그렇기 때문에 직전에 만든 `파라미터 그룹` 을 눌러서 `편집` 을 눌러준다.

> 아래의 다른 파라미터 그룹은 이전에 만들어둔 것이라.. 상관없다.

![img_8.png](https://revi1337.github.io/posts/ec2-rds/img_8.png)
![img_9.png](https://revi1337.github.io/posts/ec2-rds/img_9.png)

이제 아래 코드블럭를 보며 동일한 `파라미터` 들을 검색해서 각 항목들을 편집해주면 모든 준비가 끝이며
DB 인스턴스 (RDS) 만 생성해주면 된다.

```text
// Asia/Seoul 로 변경 (DB 시간대를 의미)
time_zone

// utf8 로 변경  (한글 관련)
character_set_client
character_set_database
character_set_connection
character_set_server
character_set_results
character_set_filesystem

// utf8_general_ci 로 변경 (한글 관련)
collation_connection
collation_server
```

#### 5. RDS 생성

이제 `Amazon RDS > 데이터베이스` 로 이동 후, `데이터베이스 생성` 을 눌러준다.

![img_10.png](https://revi1337.github.io/posts/ec2-rds/img_10.png)

`MySQL` 을 선택해주고, 파라미터 그룹에서 설정한 `8 버전` 을 선택해준다.

![img_11.png](https://revi1337.github.io/posts/ec2-rds/img_11.png)
![img_12.png](https://revi1337.github.io/posts/ec2-rds/img_12.png)

당연히 템플릿에는 `프리티어` 를 선택해준다.

![img_13.png](https://revi1337.github.io/posts/ec2-rds/img_13.png)

`DB 인스턴스 식별자` 에는 RDS 인스턴스의 이름을 지정해준다. 또한,
`암호 자동 생성` 을 체크 해제하여 직접 `마스터 암호` 를 설정해준다.

![img_14.png](https://revi1337.github.io/posts/ec2-rds/img_14.png)

`스토리지` 는 아래와 같이 설정해준다.

![img_15.png](https://revi1337.github.io/posts/ec2-rds/img_15.png)

이제 해당 `연결` 창이 중요하다.

VPC 에는 `EC2` 에서 사용와 동일한 VPC 를 선택해준다.
그리고 `DB 서브넷 그룹` 에는 우리가 이전에 만든 서브넷 그룹을 선택해준다.
또한 다른 `Public IP` 에서 접근할 수 없게 `퍼블릭 액세스` 에는 `아니오` 를 선택해준다.

> * 협업을 할때는 `퍼블릭 애세스` 를 `예` 를 선택해주는것이 좋고 편하다.

![img_16.png](https://revi1337.github.io/posts/ec2-rds/img_16.png)

또한, `기존 VPC 보안 그룹에서` 이전에 생성한 `보안 그룹` 을 선택해준다.

![img_17.png](https://revi1337.github.io/posts/ec2-rds/img_17.png)

또한, 데이터베이스 인증은 디폴트로 냅둬준다.

![img_19.png](https://revi1337.github.io/posts/ec2-rds/img_19.png)

여기가 꿀팁인데 `추가 구성` 창에서 `초기 베이터베이스 이름` 을 설정해주면 
RDS 인스턴스가 생길때 자동으로 초기 데이터베이스를 만들어준다.
이제 `DB 파라미터그룹` 에는 전에 생성한 파라미터 그룹을 선택해주고`데이터베이스를 생성` 을 눌러주면 
RDS 인스턴스가 만들어진다.

![img_25.png](https://revi1337.github.io/posts/ec2-rds/img_25.png)

이제 RDS 가 `생성 중` 이 사라질때까지 기다려주면 된다.

![img_20.png](https://revi1337.github.io/posts/ec2-rds/img_20.png)

#### 6. EC2 에서 RDS 접속 테스트

우선 기존의 `EC2`에 접속해준다

![img_21.png](https://revi1337.github.io/posts/ec2-rds/img_21.png)

이제 `EC2 인스턴스` 에서 생성된 `RDS endpoint` 에 접속해본다.
아래 사진을 보면 EC2 인스턴스에서 RDS 에 잘 연결된 것을 확인할 수 있다. 

![img_22.png](https://revi1337.github.io/posts/ec2-rds/img_22.png)

EC2 에서 RDS 로 접근은 잘되는것으로 증명되었다. 그렇다면 외부에서 접근하는것은 어떨까?
아래와같이 EC2 인스턴스 내부가 아닌, 로컬에서 RDS 접근해보면 RDS 에 연결할 수 없는 것을 
확인할 수 있다.

> 아무리 로컬이어도 외부와 통신할떄는 Public IP 로 통신하게되는데, 이전에 RDS 에서 PublicIP 허용을 하지 않았기때문에
로컬에서 접근이 되지 않는 것이다.

![img_23.png](https://revi1337.github.io/posts/ec2-rds/img_23.png)

#### 7. 외부에서 RDS 에 접근하는 법

외부에서 `RDS` 인스턴스에 접근하기위해서는 RDS 인스턴스에서 `퍼블릭 액세스 허용` 을 해줘야하고,
`VPC 보안그룹` 에서 MySQL (3306 포트) 에 대해 접근을 허용시켜주어야 한다.   
그 방법을 알아보자.

##### 1. RDS 퍼블릭 액세스 허용

`Amazon RDS > 데이터베이스 > 자신의 RDS 선택` 순서로 오다보면 오른쪽상단에 수정을 눌러주자. 

![img_26.png](https://revi1337.github.io/posts/ec2-rds/img_26.png)

아래로 내리다가 `연결` 섹션에서 `추가구성` 을 눌러주고, `퍼블릭 액세스 허용` 을 눌러주자.

![img_27.png](https://revi1337.github.io/posts/ec2-rds/img_27.png)

##### 2. VPC 보안그룹 인바운드 설정

이제 `Amazon RDS > 데이터베이스` 탭으로 오고 하단의 `연결 및 보안` 을 선택해주고 `VPC 보안그룹` 을 
선택해주자. 그리고 `보안 그룹 ID` 를 눌러주자.

![img_28.png](https://revi1337.github.io/posts/ec2-rds/img_28.png)
![img_29.png](https://revi1337.github.io/posts/ec2-rds/img_29.png)

하단의 내려보면 `인바운드 규칙 편집` 버튼이있는데 이놈을 눌러서
모든 IPAddress 에 대해 3306(MySQL) 을 허용해주고 `규칙 저장` 을 한다.

![img_30.png](https://revi1337.github.io/posts/ec2-rds/img_30.png)
![img_31.png](https://revi1337.github.io/posts/ec2-rds/img_31.png)

##### 3. 외부에서 RDS 접근 확인

이제 외부에서 접근하면 정상적으로 접근이되는것을 확인할 수 있다.

> 중간에 rds 삭제했다 진행해서.. 유저와 rds 이름이 다른것은 이해좀..

![img_32.png](https://revi1337.github.io/posts/ec2-rds/img_32.png)

이렇게 해서 `EC2` 와 `RDS` 를 연동하는 법과 외부에서 `RDS` 에 접근하는 방법을 알아보았다.
