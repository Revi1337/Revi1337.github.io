---
title: Backend S3와 CloudFront연결
tags: ['aws', 's3', 'cloudfront', 'https']
---

## 들어가며
안녕하세요. 이번 시간에는 Backend에서 사용하는 S3와 CloudFront를 연결하는 방법과 모든 사용자가 S3가 아닌 CloudFront와 통신하도록 강제하는 과정에 대해 알아보고자 합니다. 바로 본론으로 들어가보죠. Backend용 S3를 생성하고 설정하는 방법은 [Backend S3생성과 설정](AWS/4_S3BucketForBackend.md) 글에서 확인할 수 있습니다.


## CloudFront 배포
AWS Console 에서 CloudFront 로 들어온 후, `CloudFront 배포 생성`을 선택합니다.

![](AWS/images/Pasted%20image%2020250330164255.png)


### 원본 설정
- `Origin Domain(원본 도메인)`에는 CloudFront 를 적용하려는 서비스를 선택합니다.
- `Origin Path(원본 경로)` 는 생략합니다. 해당 설정은 S3의 특정한 폴더만 적용하고 싶을때 사용됩니다.
- `이름`은 원본 도메인을 선택하면 알아서 생성되있을 것입니다.

![](AWS/images/Pasted%20image%2020250330165047.png)


- 원본 액세스에는 `Legacy Access Identities` 를 선택합니다. `새 OAI 생성` 을 선택해 새로운 OAI 를 생성합니다. (OAI는 CloudFront에 존재하는 가상 유저를 의미하며 콘텐츠 접근 권한을 가지고 있습니다)
- 버킷 정책에는 `예 버킷 정책 업데이트` 를 선택합니다. 이는 버킷의 읽기 권한을 CloudFront에게 부여할지 말지에 대한 권한을 묻는 것입니다. (CloudFront가 S3에 존재하는 정적 리소스들에 접근할 수 있도록 S3 버킷 정책을 자동으로 업데이트합니다.)

> Legacy Access Identities는 OAI라는 원본 액세스 ID를 사용해서 버킷에 접근한다는 의미입니다. 

![](AWS/images/Pasted%20image%2020250330165109.png)


- `사용자 정의 헤더 추가` 는 생략합니다. 해당 설정은 `Origin` 으로 보내는 요청에 사용자 정의 Header 를 추가할 때 필요합니다.
- `Origin Shied` 은 아니오를 선택합니다. `Origin Shield`는 원본의 부하를 줄이고, 가용성을 보호하는데 도움이 되는 추가 캐싱 계층이라 설명되어있으며 캐시 적중률 향상을 통해서 더 효율적인 콘텐츠 로딩을 위해 사용되어 질 수 있습니다. (추가요금이 발생할 수 있습니다)

![](AWS/images/Pasted%20image%2020250330165136.png)


### 기본 캐시 동작 설정
기본 캐시 동작 설정에서 `CloudFront`의 기본 캐시 정책을 설정할 수 있습니다. 

- `경로 패턴` 은 우리가 직접 `변경할 수 없으며` 와일드카드 `*` 를 통해 모든것들을 가져온다는 의미입니다.
- `자동으로 객체 압축` 에는 Yes 를 선택합니다. 해당 설정은 콘텐츠를 `Origin` 으로 보낼 때, 압축해서 보낼지 아닐지에 대한 여부를 결정합니다.
- `뷰어 프로토콜 정책` 에는 `Redirect HTTP to HTTPS` 를 선택합니다. 해당 설정을 통해 접속하려는 프로토콜에 대한 정책을 설정할 수 있습니다.  (`HTTP` 로 접속하게되면 `HTTPS` 로 리다이렉트 시키게 됩니다)
- `허용된 HTTP 방법` 은 API 요청을 할 때, 허용할 HTTP 메서드를 지정해 줄 수 있는 설정입니다. 보통 CloudFront 는 ReadOnly 목적으로 사용하기 때문에 `GET, HEAD` 를 선택합니다.

![](AWS/images/Pasted%20image%2020250330181144.png)


- `뷰어 액세스 제한` 에는 `No` 를 선택합니다. `Yes` 를 선택하면 CloudFront에 서명된 URL 또는 서명된 쿠키를 사용해야 합니다. 이는 EC2 인스턴스에 접속할 때 썼던 PEM 파일과 비슷한 개념으로 액세스 권한을 부여받은 사용자만 콘텐츠에 접근할 수 있게 제한하는 설정입니다.
- `캐시 정책` 에는 CloudFront 기본 캐시 전략인 `CachingOptimized`를 선택합니다. 

> CachingOptimized 를 선택하게 되면, 한번 캐싱된 정적 리소스들은 24시간동안 유지됩니다. 만약 원본 파일을 삭제하거나 변경해도 동일한 URL 이면 캐싱된 데이터가 반환되게 됩니다. 따라서 변경한 정적 리소스를 적용시키려면 기존 캐시가 제거될 수 있도록 **캐시 무효화** 를 사용해야 합니다.

![](AWS/images/Pasted%20image%2020250330181500.png)


함수 연결은 생략합니다. 해당 설정을 통해 CloudFront를 사용할 때 일어날 수 있는 다양한 상황에서 `Lambda` 또는 `ClountFront 함수` 중 하나를 사용할 수 있습니다. 또한, WAF 는 비활성화를 선택합니다.

![](AWS/images/Pasted%20image%2020250330170711.png)


### 설정
- `가격 분류` 에 따라 `Edge Location` 이 전세계에 얼마나 생성될지 결정할 수 있습니다. `Edge Location` 가 많을수록 속도는 향상됩니다. 필자는 글로벌한 서비스가 목표가 아니기 때문에, `북미, 유럽, 아시아, 중동 및 아프리카에서 사용` 을 선택했습니다. 이부분은 본인 선택입니다.
- `대체 도메인 이름` 은 생략합니다. 해당 설정에서 도메인을 연결할 수 있는데, 도메인주소가 없으면 CloudFront가 임의의 도메인 주소를 생성합니다.
- `사용자 정의 SSL 인증서` 는 생략합니다. 해당 설정에서 AWS로부터 `Public SSL 인증서` 를 생성할 수 있습니다. 설명에 나와있는 것처럼 SSL 인증서를 발급하려면 CloudFront 를 생성할 당시의 Region 이 `미국 동부(니아 북부) us-east-1` 여야 합니다.
- `지원되는 HTTP 버전` 을 통해 HTTP 버전을 선택할 수 있다. 더 빠른 네트워크 처리를 위해서 최신버전인 HTTP/3를 선택할 수 있지만 `굳이?` 이므로 HTTP/2 를 선택합니다.

> [!note] 대체 도메인에 HTTPS(SSL 인증서) 를 달려면 CloudFront 를 생성할 당시의 Region 이 us-east-1 여야 합니다.

![](AWS/images/Pasted%20image%2020250330170749.png)


* `IPv6` 에는 `켜기`를 선택합니다. IPv4 에 비해 더욱 다양한 IP 주소를 포함하기 때문입니다.
- `표준 로깅` 은 `끄기`를 선택합니다. (추가요금이 발생할 수 있습니다.)

![](AWS/images/Pasted%20image%2020250330170807.png)

설정을 마친 후, `배포 생성` 을 클릭하면 CloudFront 배포가 완료됩니다.


## IAM 사용자 권한 추가
[Backend용 S3생성과 설정](AWS/4_S3BucketForBackend.md) 포스팅에서 특정 IAM 사용자에게 모든 S3에 접근이 가능하도록 `AmazonS3FullAccess` 권한을 추가했었습니다. 비슷하게 IAM 사용자에게 모든 CloudFront 에 접근이 가능하도록 권한을 추가해주어야 합니다.

`IAM > 액세스 관리 > 사용자` 에서 `권한` 탭에서 `권한 추가` 를 선택합니다.

![](AWS/images/Pasted%20image%2020250403035335.png)


`직접 정책 연결` 을 선택하고 `CloudFrontFullAccess` 권한을 직접 추가합니다.

![](AWS/images/Pasted%20image%2020250403035413.png)


## S3 정책 변경
[Backend용 S3생성과 설정](AWS/4_S3BucketForBackend.md) 에서 `모든 퍼블릭 액세스 차단`을 비활성화하고, `S3 정책 설정` 에서 `GetObject` 를 통해 모든 사용자가 S3 내부 정적 리소스들을 읽을 수 있도록 권한(Public Access 상태)을 줬었습니다. 하지만, CloudFront 를 배포했기 때문에, `사용자 <--> S3` 통신 구조가 아닌, `사용자 <--> CloudFront <--> S3` 통신 구조로 변하게 됩니다. 

CloudFront 는 콘텐츠를 캐싱합니다. 그래서 사용자가 동일한 URL에 요청을 보내게 되면 S3 와 통신하지 않고 캐싱된 콘텐츠를 반환합니다. 만약 사용자가 S3 콘텐츠를 읽을 수 있는 권한을 그대로 냅두게 된다면, CloudFront 를 사용하는 이유가 사라지게 됩니다. 따라서 `모든 사용자가 S3에 대한 읽기 권한을 제거하여`, CloudFront를 통해서만 정적 리소스에 접근 가능하도록 제한해야 합니다.

가장 먼저 비활성화 시켰던 `모든 퍼블릭 액세스 차단` 옵션을 다시 `활성화`시켜 자신을 제외한 모든 사용자들이 버킷에 접근할 수 없도록 차단합니다.

![](AWS/images/Pasted%20image%2020250330194143.png)


`S3 > 자신의 버킷 > 권한 > 버킷 정책 > 편집` 에서 현재 정책을 확인하면 아래와 같은 정책이 추가되어있는 것을 확인할 수 있습니다. 이는 앞서 `CloudFront` 배포를 진행할 때, 새로운 OAI 를 만들고 `예 버킷 정책 업데이트` 를 선택해서 그렇습니다. 일단 이는 그대로 냅둡니다.

```json
{
	"Sid": "3",
	"Effect": "Allow",
	"Principal": {
		"AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity <Distribution ID>"
	},
	"Action": "s3:GetObject",
	"Resource": "arn:aws:s3:::onsquad-bucket/*"
}
```


모든 사람이 S3의 리소스를 읽을 수 있도록하는 아래의 권한을 제거합니다.

> 사실 이미 **모든 퍼블릭 액세스 차단** 라는 옵션을 활성화시켰기 때문에, 제거하지 않아도 됩니다. 하지만 보다 완벽한 접근제어를 위해 삭제하는 것입니다.

```json
{
	"Sid": "PublicReadGetObject",
	"Effect": "Allow",
	"Principal": "*",
	"Action": "s3:GetObject",
	"Resource": "arn:aws:s3:::onsquad-bucket/*"
}
```


## 테스트
모든 사용자가 S3에 접근할 수 없도록 제한시켰기 때문에, CloudFront가 아닌 S3 주소로 다이렉트로 접근하면 AccessDenied가 발생하는 것을 확인할 수 있습니다.

![](AWS/images/Pasted%20image%2020250404223043.png)


그와 달리, CloudFront를 통해 S3의 리소스에 접근하게 되면 CloudFront로부터 캐싱된 리소스 반환받는 것을 확인할 수 있습니다.

![](AWS/images/Pasted%20image%2020250404223601.png)


## 마치며
지금까지 CloudFront를 배포하고, S3의 퍼블릭 액세스를 모두 차단함으로써  모든 사용자가 S3가 아닌 CloudFront를 통해서만 캐싱된 정적 리소스에 접근하도록 강제하는 과정을 살펴보았습니다. 감사합니다.

