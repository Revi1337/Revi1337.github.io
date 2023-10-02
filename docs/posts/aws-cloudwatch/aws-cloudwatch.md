### AWS CloudWatch 가 정의과 기능

AWS 에는 많은 서비스들이 있다. 우리는 이러한 많은 서비스들을 사용하면서 해당 서비스들이 
얼마나 많은 공간을 차지하는지, 서비스의 상태는 어떠한지, 어떤 이벤트들이 발생하는지, 얼마나 많은 에러가 발생하는지
에 대한 고민을 하게 된다. `AWS CloudWatch` 를 사용하게되면 우리가 사용하는 AWS 서비스 및 리소스 정보들을
실시간으로 모니터링할 수 있으며 이 모니터링 결과를 토대로 로그파일로 저장하는 기능도 지원한다.

> * 여기서 말하는 이벤트란 S3 버켓에 파일업로드 및 삭제한다는지 혹은 S3 버킷 접근시 접근거부 발생한다는지, 아니면 RDS 에 접속 시도 등을
한다는지 한마디로 AWS 일어날 수 있는 모든 행동을 의미한다.

AWS CloudWatch 의 기능을 `요약` 해보면 아래와 같다.

- AWS 리소스 사용의 실시간 모니터링 기능 지원

- 다양한 이벤트들을 수집하여 로그파일로 저장

- 이벤트 & 알람 설정을 통해 SNS, AWS Lambda 로 전송 가능

> * CloudWatch 를 사용할 수 있는 서비스들은 많지만 대표적으로 `EC2`, `RDS`, `S3`, `ELB` 가 있다.

### CloudWatch 모니터링 종류

CloudWatch 두가지의 다른 모니터링 종류가 있다.

1. Basic Monitoring
: 무료이며 5분 간격으로 최소의 Metrics 를 제공한다.
: 디폴트로 사용되는 모니터링이며 주로 `CPU 사용량`, `디스크 사용량`, `네트워크 I/O` 관련 Metrics 를 제공한다.

2. Detailed Monitoring
: 유료이며 1분마다 아무 자세하게 Metrics 를 제공한다.

> * Cloud Watch 를 사용하면 특정 애플리케이션을 배포하고 운영중에 있을때  
트래픽이 몰리는시간를 분석하고 얼마나 많은 사람들이 우리의 서비스를 이용하는지 분석하여
보다 효율적으로 개발할 수 있게 된다.
    
### CloudWatch - Alarm

CloudWatch 의 `Alarm` 기능은 매우 단순하지만 CloudWatch 를 이해하는데 아주 큰 비중을 차지한다.
그렇다면 Alarm 은 무엇이며 어디에 사용될까?

우리가 애플리케이션을 배포하여 서비스를 운영중에 있다고 가정하자. 애플리케이션은 웹서버에서 돌아갈 것이고,
모든 시간대마다 똑같은 트래픽이 발생하진 않을것이다. 여기서 만약 트래픽이 많은 낮과 트래픽이 비교적 적은 밤에
동일한 자원을 할당한다면 `금전적 손실`로 이어질 수 있다. 이러한 문제를 해결하는 방법으로 `Alarm` 이 사용할 수 있다.
특정 자원의 `한계점` 을 정해놓고, 서버가 그 한계점에 도달했을 때 `Alarm 을 통해 상황을 보고` 해줌으로서 서버를 관리할 수 있게 된다.

### Alarm State

Alarm 에는 3가지 다른 상태가 존재한다.

1. Alarm : 임의로 정해놓은 한계점을 넘어설때 발생하는 상태이다. 
2. Insufficient : 알람을 울리기에 무엇인가 불충하다라는 의미한다. 
3. OK : 말 그대로 OK 이며, 알람이 울리지 않고, 원하는 범위 내에서 리소스들이 잘 돌아간다는 의미이다.

> * Alarm 에는 우리가 정해놓은 지출 임계값을 초과할 경우 SNS 을 통해 경고를해주는 Billing Alarm 이라는 기능도 제공해주지만
안타깝게도 해당 기능은 N.Virginia(us-east-1) Region 에서만 제공된다.

### CloudWatch - 실습

CloudWatch 를 테스트해보기 앞서, 로컬에서 300M 정도의 더미파일을 만들어준다.

![img.png](https://revi1337.github.io/posts/aws-cloudwatch/img.png)

그리고 해당 파일을 `scp` 를 사용해서 `EC2` 인스턴스에 보내준다.

```bash
$scp -i ec2-keypair.pem D:dummy_file ec2-user@ec2-15-164-251-0.ap-northeast-2.compute.amazonaws.com:/home/ec2-user
```

이제 `EC2` 인스턴스로 돌아와 파일이 잘 전송되었는지 확인한다. (287M) 인것을 확인할 수 있다.

![img_2.png](https://revi1337.github.io/posts/aws-cloudwatch/img_2.png)

이제 AWS 홈페이지에서 AWS 콘솔 에서 `CloudWatch` 를 검색해 들어오고 `애플리케이션 모니터링 > 리소스 상태` 를 
선택해준다. 여기서 CPU 사용률을 클릭해주면 인스턴스에 대한 링크가 나타나는데, 이 링크를 클릭해준다.

![img_3.png](https://revi1337.github.io/posts/aws-cloudwatch/img_3.png)

그러면 아래와 같이 EC2 인스턴스에서 CPU 를 사용했다는점과 Network 를 사용했다는것을 알 수 있다.
또한 이러한 창은 `EC2` 인스턴스에서 직접 확인해볼 수 있다.

아래 두개의 사진에서 상단의 사진이 `CloudWatch` 에서 확인한 Metrics 정보이며
아래의 사진이 EC2 에서 직접 확인한 Metrics 정보이다. 해당 Metrics 는 `EC2 > 인스턴스 > 자신의 인스턴스 > 모니터링` 탭에서 확인할 수 있다.

![img_4.png](https://revi1337.github.io/posts/aws-cloudwatch/img_4.png)
![img_5.png](https://revi1337.github.io/posts/aws-cloudwatch/img_5.png)

#### Alarm 생성

자 이제 `Alarm` 을 만들어보자. 다시 `CloudWatch` 로 돌아와서 `경보 > 경보상태` 를 선택해주면
아래와 같은 창이 나타나게된다. 현재 어떠한 `Alarm` 을 만들어주지 않았기 때문에 `경보 생성` 을 눌러준다.

![img_6.png](https://revi1337.github.io/posts/aws-cloudwatch/img_6.png)

지표를 선택하라는 창이 나오는데, 여기서 `지표` 는 AWS 리소스를 뜻하며 어떤 Metrics 를 타겟으로 삼을지에 대한 것을 묻는 것이다.

![img_7.png](https://revi1337.github.io/posts/aws-cloudwatch/img_7.png)

이어서 나오는 창에서 `EBS > 볼륨별 지표` 를 선택해주면 아래와 같은 창이나온다.
여기에서 `VolumeWriteBytes` 를 선택해주고 `지표선택`을 눌러준다. 우리는 `VolumeWriteBytes` 가 임계점을 넘기면
알람이 울리도록 설정할 것이다.

> * 파일을 전송하거나 하면 `VolumeWriteBytes` 가 올라가게된다. 상단 사진의 그래프에서 나와있는 것처럼
파일을 전송하면 저렇게 그래프가 올라갈 것이다.

![img_8.png](https://revi1337.github.io/posts/aws-cloudwatch/img_8.png)

#### 지표 및 조건 지정

이제 아래와같이 `지표 및 조건 지정` 을 기입할 수 있는 창이 나온다. 
여기서 지표이름, VolumneId, 통계, 기간을 기입할 수 있는 Input 태그가 있는데 각 인풋란은 아래와 같은 의미를 갖는다.

![img_9.png](https://revi1337.github.io/posts/aws-cloudwatch/img_9.png)

지표이름
: 이전에 선택한 지표 이름을 의미한다. 여기서는 `VolumeWriteBytes` 이다

VolumeId
: EC2 인스턴스를 만들때 `자동으로 생성되는 디스크 ID` 를 의미한다.
해당 정보는 EC2 인스턴스의 `Elastic Block Store > 볼륨` 에서 확인할 수 있다.

기간
: 몇분 주기로 통계를 낼지 정하는 인터벌 값이며 디폴트로 5분이다. 더욱 세밀하게 조절할 수 있다.

이제 알람을 울리는데 필요한 조건을 설정해야한다. 아래와 같이 `...보다` 란에 100000 을 적어준다.
100000 은 100K 를 의미하며 해당 값을 설정해주면  이전에 설정해준 `지표 및 조건 지정` 그래프에 빨간색 임계값 그래프가 나오게 된다.
또한, `추가구성` 에서는 누락된 데이터가 있을 시 어떻게 행동할 것인지 정해줄 수 있는데, 이것은 디폴트로 준다.

![img_10.png](https://revi1337.github.io/posts/aws-cloudwatch/img_10.png)

![img_11.png](https://revi1337.github.io/posts/aws-cloudwatch/img_11.png)

> * 즉 우리는 VolumneWriteBytes 이 100K 가 넘어가면 알람이 울리도록 지정한 것이다.

#### 작업 구성

이제 작업 구성이다. `알림 추가` 버튼을 눌러주면 아래와 같은 창이 나오게된다. 해당 창은 경보가 울릴때 SNS 를 통해 알람을 울릴지, Email 을 통해 알람을 울릴지
에 대한 행동을 정의할 수 있다. 우리는 Email 을 통해 알람을 받을 것이기때문에 `새 주제 생성` 을 눌러준다.

`새 주제 생성...` 에는 원하는 이름을 입력해준다. 또한 알람을 수신할 이메일 엔드포인트에는 자신의 이메일 주소를 입력해주고
`다음` 을 선택해주자.

![img_12.png](https://revi1337.github.io/posts/aws-cloudwatch/img_12.png)

이제 `Auto Scaling` 을 설정할 수 있는 탭이 나온다. 해당 탭에서는 Alarm 이 발생했을 때
AWS 에서 자동으로 처리해주고 싶은 행동을 정의할 때 사용된다.

예를 들어, 메모리 부족으로인해 알람이 발생했을때 `Auto Scaling` 을 통해 메모리를 자동으로 늘려주는 행동을 정의할 수 있다.
하지만 여기서에서는 패스해준다.

![img_13.png](https://revi1337.github.io/posts/aws-cloudwatch/img_13.png)

#### 이름 및 설명 추가

이제 이름 및 설명을 추가해준다. 해당 설정을 하면 이메일에 해당 내용을 포함하여 알람이 오게된다.
이제 `다음` 을 선택해주자.

![img_14.png](https://revi1337.github.io/posts/aws-cloudwatch/img_14.png)

#### 요약 정보

이전에 설정한 `지표 및 조건 지정`, `작업구성`, `이름 및 설명 추가` 에 대한 요약정보가
나오게되며 `경보 생성` 을 눌러준다. 이제 경보생성은 여기서 끝이다.

![img_15.png](https://revi1337.github.io/posts/aws-cloudwatch/img_15.png)

#### 생성된 경보 확인

아래 사진을 보면 경보가 잘 생성된 것을 확인해 볼 수 있다. 하지만, 상태에 `데이터 부족` 이 설정되어있다.
이것에 대한 한가지 이유를 생각해 볼 수 있는데 경보를 울리기에 충분한 데이터 전송이 이루지지 않았기 때문이다.
이제 `EC2` 인스턴스에 적당한 데이터를 보내주면 해당 `데이터 부족` 은 사라질 것이다.

![img_16.png](https://revi1337.github.io/posts/aws-cloudwatch/img_16.png)

#### 이메일 구독 활성화

여기가 많이 중요하다. 알람이 발생했을 때 그 정보를 이메일로 보내지도록 하려면, `이메일 구독을 활성화` 해야한다.
`Amazon SNS > 구독` 으로 와서 생성된 이메일 구독을 체크해준 후, `확인 요청` 을 눌러준다.

![img_18.png](https://revi1337.github.io/posts/aws-cloudwatch/img_18.png)

이제 메일함에 가보면, AWS 에서 활성화 링크를 보내준 것을 확인할 수 있다. 이 링크를 클릭하면

![img_19.png](https://revi1337.github.io/posts/aws-cloudwatch/img_19.png)

아래와 같이 이메일 구독이 성공적으로 수행된것을 확인할 수 있다. 이제 알람이 발생하게되면 
해당 메일로 잘 알람이 갈 것이다.

![img_20.png](https://revi1337.github.io/posts/aws-cloudwatch/img_20.png)

> * 참고적으로 confirm 이메일이 오지않는다면 `스팸메일`을 확인해보자. 나는 여기서 애먹었다.

#### 알람 발생 확인

이제 포스팅 초반에 작성했던 것처럼 `SCP` 로 `300M` 정도의 파일을 `EC2` 로 전송해준다.

![img_17.png](https://revi1337.github.io/posts/aws-cloudwatch/img_17.png)

자 이제 `5분` 혹은 그 이하의 시간을 기다려주고 AWS CloudWatch 에 들어가주면
이전에 생성한 `Alarm` 이 `경보상태` 로 바뀐것을 확인할 수 있다.

![img_21.png](https://revi1337.github.io/posts/aws-cloudwatch/img_21.png)

이 경보를 선택해서 Metrics 를 확인해보자.
우리는 `VolumeWriteBytes` 가 `100000` 이상이면 알람이 울리게 설정해놓았었다.
하지만 `SCP` 를 통해 데이터 전송이 있게되면서 그로 인해 VolumeWriteBytes 가 임계점인 100000 를
넘어서게 되어 알림이 발생했다는 것을 알 수 있다.

![img_22.png](https://revi1337.github.io/posts/aws-cloudwatch/img_22.png)

자 이제 메일함에 가보자. 우리는 알림이 발생하면 이메일로 발송하도록 시켰기때문에, 
알람이 이메일로 잘 전송된것을 확인할 수 있다.

![img_23.png](https://revi1337.github.io/posts/aws-cloudwatch/img_23.png)

> * `지표 및 조건 지정` 에서 설정한 VolumeWriteBytes 과 같은 지표들이 무엇이 있나 잘 숙지해놓는다면 
CloudWatch 를 잘 응용해볼 수 있을 것 같다.

