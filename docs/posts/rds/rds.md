AWS 콘솔에서 RDS 를 검색하여 들어온 다음, `데이터베이스 생성` 을 눌러준다.

![img.png](https://revi1337.github.io/posts/rds/img.png)

#### 1. 데이터베이스 생성방식 선택

다양한 데이터베이스 설정을 위해 `표준생성` 을 선택해준다.

![img_1.png](https://revi1337.github.io/posts/rds/img_1.png)

`MySql` 을 선택해준다.

![img_2.png](https://revi1337.github.io/posts/rds/img_2.png)

제일 최신인 `MySql 8.0.33` 을 선택해준다.

![img_3.png](https://revi1337.github.io/posts/rds/img_3.png)

#### 2. 템플릿 설정

템플릿에는 프리티어를 선택. 프리티어 이기떄문에 `가용성 및 내구성` 을 수정할 권한이 없다.

![img_4.png](https://revi1337.github.io/posts/rds/img_4.png)
![img_5.png](https://revi1337.github.io/posts/rds/img_5.png)

#### 3. 인스턴스 설정

이제 생성할 DB 인스턴스의 이름, 암호를 설정해준다.
AWS 에서 생성해주는 암호를 사용할 수 있지만, 직접 설정해준다.

![img_6.png](https://revi1337.github.io/posts/rds/img_6.png)

#### 4. 인스턴스 구성 설정

인스턴스 구성설정이다. 필자는 프리티어이기때문에, `버스터블 클래스` 만 사용가능하다. 
**t3 가 버스터블 클래스들 중 하나이며, 상황에 따라 CPU 의 성능을 Bust 시킬수 있다는 의미이다.**

![img_7.png](https://revi1337.github.io/posts/rds/img_7.png)

#### 5. 스토리지 설정

스토리지 설정이다. 스토리지 유형이 `범용 SSD(gp2)` 가 아니면, 이놈으로 바꿔주어야 한다.
신규 스토리지 유형인 범용 SSD(gp3) 는 추가비용을 냄으로서 `IOPS` 처리량을 늘릴 수 있다.

또한, `할당된 스토리지 크기`는 최소값인 `20` 으로 맞추어 준다.
그리고 스토리지 자동 조정은 `auto scaling` 을 의미하며 디폴트로 `자동 조정 활성화` 가 되어있다.

> 임계값을 초과하면 요금이 발생할 수 있다.

![img_8.png](https://revi1337.github.io/posts/rds/img_8.png)

#### 5. 연결 설정

연결 섹션에서는 생성할 RDS 와 연결할 `EC2` 인스턴스를 지정할수있게 도와준다.

해당 섹션에서 EC2 인스턴스를 만들어줄수도 있다. 하지만 필자는 연결할 `EC2` 인스턴스를 수동으로 설정할 
것이기 때문에 `EC2 컴퓨팅 리소스에 연결 안함` 을 선택해준다.

또한 `VPC` 와 서브넷은 기본값으로 설정해주고, `퍼블릭 액세스` 는 허용해준다.

> 퍼블릿 액세스를 허용하지 않으면, 다른 Public IP 들은 RDS 에 접근할 수 없다.
하지만, VPC 내부 인스턴스들은 접근 가능하다.
퍼블릭 액세스를 허용해준 이유는, `팀원도 접근가능하게 하기위함`이다.

![img_9.png](https://revi1337.github.io/posts/rds/img_9.png)

이어서 VPC 보안 그룹을 생성해준다. 보안그룹 이름을 설정해주고 `가용영역` 은 4개 중 한개 아무거나 선택해주어도 된다.

![img_10.png](https://revi1337.github.io/posts/rds/img_10.png)

#### 6. 데이터베이스 설정 및 생성

데이터베이스 인증은 `암호 인증` 으로 선택해주고

![img_11.png](https://revi1337.github.io/posts/rds/img_11.png)

`초기 데이터베이스 이름`을 설정해주고 나머지 설정은 디폴트로 냅둔다. 이제 최종적으로 데이터베이스를 생성해주고
인스턴스가 생성될때까지 기다려준다.

![img_13.png](https://revi1337.github.io/posts/rds/img_13.png)

#### 7. 보안그룹 설정

`Amazon RDS > 데이터베이스 > 본인인스턴스` 로 를 클릭하고 아래사진에서의 `VPC 보안그룹` 을 눌러준다.

![img_14.png](https://revi1337.github.io/posts/rds/img_14.png)

아래사진과 같이 `보안그룹ID` 를 선택해준 뒤

![img_15.png](https://revi1337.github.io/posts/rds/img_15.png)

`인바운드 규칙 편집` 를 클릭해준다.

![img_16.png](https://revi1337.github.io/posts/rds/img_16.png)

이제 `3306` 포트에 대해 `IPV4` `IPV6` 주소를 모두 허용해주고 저장해준다.   

![img_17.png](https://revi1337.github.io/posts/rds/img_17.png)

이제 Intellij 에서 DB 를 연결하기 위해 `Amazon RDS > 데이터베이스` 로 이동하여 엔드포인트 확인해준다.

![img_18.png](https://revi1337.github.io/posts/rds/img_18.png)

#### 8. Charset, Timezone 변경

`MySQL 8` 디폴트 Charset 이 `utf8mb4` 이다. 따라서 이것을 `utf-8` 으로 바꿔주어야 한다.

`Amazon RDS` 로 돌아와 `파라미터 그룹 탭` 을 선택하고 `파라미터 그룹 생성` 을 클릭한다.

![img_21.png](https://revi1337.github.io/posts/rds/img_21.png)

`그룹이름` 과 `설명` 을 기입하고 파라미터 그룹 생성한다.

![img_22.png](https://revi1337.github.io/posts/rds/img_22.png)

이제 생성한 `파라미터 그룹` 에 들어간 다음

![img_23.png](https://revi1337.github.io/posts/rds/img_23.png)

편집 버튼을 눌러서

![img_25.png](https://revi1337.github.io/posts/rds/img_25.png)

아래 코드블럭 안의 `파라미터`들을 검색해서 각 항목들을 `편집`해주어야한다.
우선 아래를 파라미터를 `Asia/Seoul` 로 변경하여 `시간대를 서울`로 변경한다.

```text
time_zone
```

또한, 아래의 파라미터들을 `utf8` 과 `utf8_general_ci` 로 변경해준다.

```text
// utf8 로 변경
character_set_client
character_set_database
character_set_connection
character_set_server
character_set_results
character_set_filesystem

// utf8_general_ci 로 변경
collation_connection
collation_server
```

각 항목들을 편집해주었으면, 다시 `Amazon RDS` 로 돌아가 생성한 인스턴스를 체크하여
`수정` 버튼을 눌러준다.

![img_24.png](https://revi1337.github.io/posts/rds/img_24.png)

아래로 내리다보면 추가 구성탭이 나오는데, 여기서 `DB 파라미터 그룹` 을 이전에 생성한
파라미터 그룹이름으로 변경 후, 저장해준다.

![img_26.png](https://revi1337.github.io/posts/rds/img_26.png)

#### 9. Intellij DB 및 Spring 연결 확인

이제 인텔리제이로 가서 `Database` 설정을 해준다.

* `Host`: rds endpoint 설정
* `User`: 마스터 사용자 기입
* `Password`: 마스터 사용자 암호 기입
* `Database`: 추가 구성에 사용했던 초기 DB 이름 기입
 
![img_19.png](https://revi1337.github.io/posts/rds/img_19.png)

* 이제 yml 혹은 properties 에 아래와같이 Datasoure 설정을 해준다. 

```yml
spring:
  datasource:
    url: jdbc:mysql://{본인 RDS ENDPOINT}:3306/{DB 이름}
    username: {User}
    password: {Password}
    driver-class-name: com.mysql.cj.jdbc.Drive
```

이제 RDS 인스턴스를 `재부팅`하고 `SQL Console` 에서
`select now();` 를 날려주면 Timezone 이 현재 Desktop 과 동일한것을 볼 수 있다.

![img_27.png](https://revi1337.github.io/posts/rds/img_27.png)

또한, 스프링과 잘 연동되는 것을 확인할 수 있다.

![img_20.png](https://revi1337.github.io/posts/rds/img_20.png)
