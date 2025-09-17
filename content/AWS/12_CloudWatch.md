---
title: EC2에 CloudWatch 적용
tags: ['aws', 'cloudwatch']
---

## CloudWatch
AWS 에는 많은 서비스들이 있습니다. 서비스들을 사용하면서 각 서비스가 얼마나 많은 공간을 차지하는지, 서비스의 상태는 어떠한지, 어떤 이벤트들이 발생하는지, 얼마나 많은 에러가 발생하는지에 대한 고민을 하게 됩니다. `AWS CloudWatch` 를 사용하게 되면 우리가 사용하는 AWS 서비스 및 리소스 정보들을 실시간으로 모니터링할 수 있습니다.

- AWS 리소스 사용의 실시간 모니터링 기능을 지원합니다.
- S3 파일을 업로드하거나 RDS접속 시도와 같이 다양한 이벤트들을 수집하여 로그파일로 저장할 수 있습니다.
- 이벤트 & 알람 설정을 통해 SNS, AWS Lambda로 전송 가능합니다.
- 대표적으로 EC2, RDS, S3, ELB 등과 같이 저명한 컴퓨팅 리소스들에 대해 CloudWatch를 적용할 수 있습니다.

### Types of Monitoring
1. Basic Monitoring
	- 무료입니다.
	- 기본 모니터링으로 설정되어 있으며 5분 간격으로 `CPU 사용량, 디스크 사용량, 네트워크 I/O` 등 최소한의 Metrics를 제공합니다. 

2. Detailed Monitoring
	- 유료입니다.
	- 1분 간격으로 자세한 Metrics를 제공합니다.


### CloudWatch Usecase
`Use Case` : 매일 얼마나 많은 사용자들이 모바일 앱을 사용하는지 알고 싶을 때
`Potential Issue` : 특정날에 수많은 Traffic이 몰릴 수 있어 병목현상이 생길 수 있습니다.
`Solution` : 매일 Traffic Rate와 특정 버튼의 유저 클릭 횟수를 분석하여 더 효율적인 앱개발을 할 수 있는 통찰력을 얻을 수 있습니다.

<br>

`Use Case` : 특정 시간대에 웹서버 상태를 점검하여 비용 절감 목표
`Potential Issue` : 똑같은 비용을 내며 AWS 리소스들을 사용하지만 낮시간대와 밤시간대에 필요한 서버의 성능은 달라질 수 있기 때문에 금전적 손실이 생길 수 있습니다.
`Solution` : Alarm 설정을 통하여 특정 Threshold 에 도달했을때 개발자에게 상황을 보고해줌으로서 서버 Management를 할 수 있습니다.


## Alarm
- 임의로 정해놓은 값에 도달할 시 Alram을 울립니다.
- Alram이 울릴 시 특정 이벤트들을 작동시킬 수 있습니다.

> [!note] Billing Alarm
> 사용한 AWS 리소스들의 지출 임계값을 초과할 경우 SNS를 통해 경고를 줄 수 있는 Alarm 입니다. 현재 버지니아(N.Vriginia(us-east-1))지역에서만 해당 기능을 사용할 수 있습니다.


### Alarm State 
1. `OK`
    - 알람 조건이 충족되지 않은 상태입니다.
    - 모니터링하는 지표(metric)가 정상 범위 안에 있다는 것을 의미합니다.
    - 예: `CPUUtilization < 80%`
        
2. `ALARM`
    - 알람 조건이 충족된 상태입니다.
    - 즉, 설정한 임계치(threshold)를 초과하거나 미달했을 때를 말합니다.
    - 예: `CPUUtilization > 80%`

3. `INSUFFICIENT_DATA`
    - 알람이 판단할 수 있는 데이터가 부족한 상태입니다.


## Experiment
CloudWatch를 테스트해보기 앞서 로컬에서 300M 정도의 더미파일을 생성합니다.

![](AWS/images/img.png)


해당 파일을 `scp` 를 사용해서 `EC2` 인스턴스에 전송합니다.

```bash
$scp -i ec2-keypair.pem D:dummy_file ec2-user@ec2-15-164-251-0.ap-northeast-2.compute.amazonaws.com:/home/ec2-user
```


`EC2` 인스턴스로 돌아와 파일을 잘 받았는지 확인합니다. (287M) 인것을 확인할 수 있습니다.

![](AWS/images/img_2.png)


`AWS Console > CloudWatch >  애플리케이션 모니터링 > 리소스 상태`에서 본인의 인스턴스를 선택합니다.

![](AWS/images/img_3.png)


여러 Metric 이 나오게 되는데, 이는 `EC2` 인스턴스에서 직접 더 자세히 확인해볼 수 있습니다. 해당 사진이 `CloudWatch` 에서 확인한 Metric입니다. 

![](AWS/images/img_4.png)


해당 사진이 EC2 에서 직접 확인한 Metric입니다. `EC2 > 인스턴스 > 자신의 인스턴스 > 모니터링` 탭에서 확인할 수 있습니다.

![](AWS/images/img_5.png)


### Alarm 생성
CloudWatch로 돌아와 `경보 > 경보상태`에서 알람을 생성할 수 있습니다. 현재 어떠한 `Alarm` 을 만들어주지 않았기 때문에 `경보 생성`을 선택합니다.

![](AWS/images/img_6.png)


지표선택에서 `EBS`를 선택합니다. `지표`는 AWS 리소스를 뜻하며 정확히 어떤 Metric 정보를 바탕으로 알람을 설정할지를 묻는 것입니다.

![](AWS/images/img_7.png)


`VolumeWriteBytes` 를 선택해주고 지표선택을 누릅니다. `VolumeWriteBytes`가 임계점을 넘기면 알람이 울리도록 설정하는 것입니다.

> VolumeWriteBytes는 EBS 볼륨에 기록된(Write) 총 바이트 수를 말합니다. 

![](AWS/images/img_8.png)


### 지표 및 조건 지정
각 Input 태그는 다음과 같은 의미를 가집니다.

- `지표이름`
	- 이전에 선택한 지표 이름을 말합니다. `VolumeWriteBytes` 
- `VolumeId`
	- EC2 인스턴스를 만들 때 할당된 `디스크 ID` 를 말합니다. 해당 정보는 EC2 인스턴스의 `Elastic Block Store > 볼륨` 에서 확인할 수 있습니다.
- `기간`
	- 몇분 주기로 통계를 낼지 정하는 인터벌 값이며 5분이 디폴트입니다. 더욱 세밀하게 조절할 수 있습니다.

![](AWS/images/img_9.png)


알람을 울리는데 필요한 조건을 `100000(100K)` 로 설정합니다. `추가구성` 에서는 누락된 데이터가 있을 시 어떻게 행동할 것인지 정해줄 수 있는데 디폴트(누락으로 처리)로 설정합니다.

> 즉 VolumneWriteBytes 이 100K가 넘어가면 알람이 울리도록 설정한 것입니다.

![](AWS/images/img_10.png)

![](AWS/images/img_11.png)


### 작업 구성
`알림 추가` 버튼을 누르면 경보가 울릴 때 `SNS`를 통해 알람을 울릴지, `Email`을 통해 알람을 울릴지에 대한 행동을 정의할 수 있습니다. Email을 통해 알람을 받을 것이기 때문에 `새 주제 생성` 을 선택합니다. `새 주제 생성...` 에는 원하는 이름을 입력하고, 알람을 받을 이메일을 기입합니다.

![](AWS/images/img_12.png)


`Auto Scaling` 작업은 Alarm이 발생했을 때 AWS에서 자동으로 처리해주고 싶은 행동을 정의할 때 사용됩니다. 예를 들어, 메모리 부족으로인해 알람이 발생했을때 `Auto Scaling` 을 통해 메모리를 자동으로 늘려주는 행동을 정의할 수 있습니다. 하지만 유료로 전환될 수 있기 때문에 패스하고 `다음`을 선택합니다.

![](AWS/images/img_13.png)

### 이름 및 설명 추가
경보 이름 및 설명을 재량껏 작성합니다. 해당 설정으로 작성한 내용이 포함된 알람이 메일을 통해 전송됩니다. 

![](AWS/images/img_14.png)


### 요약 정보
앞서 설정한 `지표 및 조건 지정`, `작업구성`, `이름 및 설명 추가` 에 대한 요약정보가 출력됩니다. 이제 `경보 생성`을 선택하여 경보를 생성합니다.

![](AWS/images/img_15.png)

### 생성된 경보 확인
초기 상태는 `데이터 부족` 일 수 있습니다. 이는 경보를 울리기에 충분한 데이터 전송이 이루지지 않았기 때문이라고 추정할 수 있습니다. `EC2` 인스턴스에 적당한 데이터를 보내주면 해당 `데이터 부족` 은 사라지게 될 것입니다.

![](AWS/images/img_16.png)


### 이메일 구독 활성화
알람이 발생했을 때 그 정보를 이메일로 보내지도록 하려면 `이메일 구독을 활성화` 해야합니다. `Amazon SNS > 구독` 으로 와서 생성된 이메일 구독을 체크해준 후, `확인 요청` 을 누릅니다.

![](AWS/images/img_18.png)


메일함에서 AWS 에서 활성화 링크를 보내준 것을 확인할 수 있습니다. 해당 링크에 들어가면

> confirm 이메일이 오지않는다면 스팸메일을 확인해보자. 필자는 여기서 애먹은 기억이 있습니다.ㄴ

![](AWS/images/img_19.png)


아래와 같이 이메일 구독이 성공적으로 수행된것을 확인할 수 있습니다. 이제 알람이 발생하게되면 해당 메일로 알람이 갈 것입니다.

![](AWS/images/img_20.png)


### 알람 발생 확인
포스팅 초반에 작성했던 것처럼 로컬에서 `SCP`로 `300M` 정도의 파일을 `EC2`로 전송합니다.

![](AWS/images/img_17.png)


`5분`정도 기다리면 CloudWatch에서 이전에 생성한 Alarm이 `경보상태`로 바뀐것을 확인할 수 있습니다.

![](AWS/images/img_21.png)


해당 경보를 선택해서 Metrics 를 확인하면 SCP로 인해 EC2 EBS에 100K 가 넘은 데이터가 전송되어 알람이 트리거된 것을 알 수 있습니다.

![](AWS/images/img_22.png)


메일함에서도 알람이 이메일로 잘 전송된것을 확인할 수 있습니다.

![](AWS/images/img_23.png)


## Conclusion
`지표 및 조건 지정`에서 설정하는 VolumeWriteBytes 같은 지표들을 잘 이해하고 숙지해두면, CloudWatch를 더 효과적으로 활용할 수 있습니다.


## Reference
[Inflearn : AWS(Amazon Web Service) 입문자를 위한 강의](https://www.inflearn.com/course/aws-%EC%9E%85%EB%AC%B8/dashboard)

[AWS IAM과 접근 권한 & Amazon CloudWatch](https://velog.io/@hama13/AWS-AWS-IAM%EA%B3%BC-%EC%A0%91%EA%B7%BC-%EA%B6%8C%ED%95%9C-Amazon-CloudWatch)

[CloudWatch란?](https://bigco-growth-diary.tistory.com/38)

[CloudWatch + 프리티어 범위](https://cwpack0730.tistory.com/64)
