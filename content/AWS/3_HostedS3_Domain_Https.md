---
title: S3로 호스팅한 정적 사이트에 도메인과 HTTPS 적용
tags: ['aws', 's3', 'acm', 'cloudfront', 'route_53', 'https']
---


## 들어가며
안녕하세요. 이번 시간에는 `S3로 호스팅한 정적 웹 사이트`를 `CloudFront`로 배포해보고, 사설 도메인 연결과 함께 HTTPS 적용까지 직접 해보는 과정을 다뤄보겠습니다.

> AWS에서 도메인을 구입했다고 가정합니다. [AWS 도메인 구매와 호스팅 영역 기본 설정](AWS/20_AwsDomainBuy.md)


## ACM 인증서 요청
먼저, CloudFront에 연결할 사설 도메인에 HTTPS를 적용하려면 해당 도메인에 대한 SSL 인증서를 먼저 발급받아야 합니다. `Certificate Manager` 에 들어가서 인증서를 요청합니다.

>[!warn] 현재 Region이 미국 버지니아 북부여야 합니다.
> CloudFront에 사설 도메인을 연결하고 HTTPS를 적용하려면 인증서를 미국 동부(버지니아 북부, us-east-1) 리전에 발급해야 합니다. 왜냐하면 CloudFront는 글로벌 서비스라서, 배포에 사용할 인증서도 글로벌하게 접근 가능한 리전, 즉 us-east-1 에 있어야만 도메인 연결 시 사용할 수 있습니다. 다른 리전에 있는 인증서는 CloudFront에서 인식조차 못합니다.

![img.png](AWS/images/s3_domain_https.png)


`퍼블릿 인증서 요청` 선택 후, 다음으로 넘어갑니다.

![img_1.png](AWS/images/s3_domain_https_1.png)


인증서에 HTTPS를 적용하려는 하나 이상의 도메인 이름을 기입합니다. 필자는 `www.revi1337.com` 를 입력하였습니다. 여러 도메인 주소에 HTTPS를 적용하고 싶다면, 그 주소를 모두 적어주시면 됩니다.

![img_2.png](AWS/images/s3_domain_https_2.png)


`검증 방법` 과 `키 알고리즘` 은 그대로 두고 인증서 요청을 완료합니다.

![img_3.png](AWS/images/s3_domain_https_3.png)


인증서 요청을 완료하고나면 `검증 대기중` 이라는 상태가 뜨게 됩니다. 여기서 `Route 53 에서 레코드 생성`를 눌러 레코드를 생성해주면 상태가 성공으로 바뀌게 됩니다.

![img_4.png](AWS/images/s3_domain_https_4.png)

![img_5.png](AWS/images/s3_domain_https_5.png)


여기까지 오면 인증서 요청이 완료된겁니다.


## CloudFront 배포
콘솔에서 `CloudFront` 로 이동하여 배포 생성을 누릅니다. `원본 도메인`에 CloudFront에 연결하려는 S3를 선택하고 `HTTP 만 해당`을  선택합니다. 이 때 `웹사이트 엔드포인트`를 사용해주어야 합니다. 여기서 웹사이트 엔드포인트는 URL에 `s3-website` 가 들어가있는 주소를 의미합니다.

> ClountFront를 사용하게 되면 외부망을 통해 들어오는 요청만 HTTPS로 통신하고 그 뒷단의 EC2나 S3에서는 HTTP를 이용함으로서 EC2나 S3는 HTTPS를 위한 별도의 작업이 필요하지 않다고 합니다. 따라서 HTTP를 선택합니다.

![img_6.png](AWS/images/s3_domain_https_6.png)


- 원본 액세스는 `공개` 로 선택합니다. `원본 액세스 제어(권장)` 를 선택하게 되면 `IAM` 과 버킷정책을 업데이트 함으로서 S3 버킷 안에 있는 콘텐츠들을 `CloudFront` 를 통해서만 접근 가능하도록 설정할 수 있습니다.
- `사용자 정의 헤더 추가` 는 생략합니다. 해당 설정은 `Origin` 으로 보내는 요청에 사용자 정의 Header 를 추가할 때 필요합니다.
- `Origin Shied` 은 아니오를 선택합니다. `Origin Shield`는 원본의 부하를 줄이고, 가용성을 보호하는데 도움이 되는 추가 캐싱 계층이라 설명되어있으며 캐시 적중률 향상을 통해서 더 효율적인 콘텐츠 로딩을 위해 사용되어 질 수 있습니다. (추가요금이 발생할 수 있습니다)

![img_7.png](AWS/images/s3_domain_https_7.png)


기본 캐시 동작 설정에서 `CloudFront`의 기본 캐시 정책을 설정할 수 있습니다. 

- `경로 패턴` 은 우리가 직접 `변경할 수 없으며` 와일드카드 `*` 를 통해 모든것들을 가져온다는 의미입니다.
- `자동으로 객체 압축` 에는 Yes 를 선택합니다. 해당 설정은 콘텐츠를 `Origin` 으로 보낼 때, 압축해서 보낼지 아닐지에 대한 여부를 결정합니다.
- `뷰어 프로토콜 정책` 에는 `Redirect HTTP to HTTPS` 를 선택합니다. 해당 설정을 통해 접속하려는 프로토콜에 대한 정책을 설정할 수 있습니다.  (`HTTP` 로 접속하게되면 `HTTPS` 로 리다이렉트 시키게 됩니다)
- `허용된 HTTP 방법` 은 API 요청을 할 때, 허용할 HTTP 메서드를 지정해 줄 수 있는 설정입니다. 보통 CloudFront 는 ReadOnly 목적으로 사용하기 때문에 `GET, HEAD` 를 사용합니다. (물론 아래 사진처럼 모두 허용해도 됩니다)
- `뷰어 액세스 제한` 에는 `No` 를 선택합니다. `Yes` 를 선택하면 CloudFront에 서명된 URL 또는 서명된 쿠키를 사용해야 합니다. 이는 EC2 인스턴스에 접속할 때 썼던 PEM 파일과 비슷한 개념으로 액세스 권한을 부여받은 사용자만 콘텐츠에 접근할 수 있게 제한하는 설정입니다.

![img_8.png](AWS/images/s3_domain_https_8.png)


`캐시 정책` 에는 CloudFront 기본 캐시 전략인 `CachingOptimized`를 선택합니다.

> CachingOptimized 를 선택하게 되면, 한번 캐싱된 정적 리소스들은 24시간동안 유지됩니다. 만약 원본 파일을 삭제하거나 변경해도 동일한 URL 이면 캐싱된 데이터가 반환되게 됩니다. 따라서 변경한 정적 리소스를 적용시키려면 기존 캐시가 제거될 수 있도록 **캐시 무효화** 를 사용해야 합니다.

![img_9.png](AWS/images/s3_domain_https_9.png)


함수 연결은 생략합니다. 해당 설정을 통해 CloudFront를 사용할 때 일어날 수 있는 다양한 상황에서 `Lambda` 또는 `ClountFront 함수` 중 하나를 사용할 수 있습니다.

![img_10.png](AWS/images/s3_domain_https_10.png)


WAF도 비활성화를 선택합니다.

![img_11.png](AWS/images/s3_domain_https_11.png)


- `가격 분류` 에 따라 `Edge Location` 이 전세계에 얼마나 생성될지 결정할 수 있습니다. `Edge Location` 가 많을수록 속도는 향상됩니다. 필자는 글로벌한 서비스가 목표가 아니기 때문에, `북미, 유럽, 아시아, 중동 및 아프리카에서 사용`을 선택했습니다. 이 부분은 본인 선택입니다.
- `대체 도메인 이름`에는 앞에서 `인증서를 발급받을 때 사용했던 도메인 주소를 기입`합니다.

![img_12.png](AWS/images/s3_domain_https_12.png)


- `사용자 정의 SSL 인증서` 에는 초반에 발급받은 SSL 인증서를 선택합니다. `인증서를 버지니아에서 발급받지 않았다면, 선택조차 되지 않습니다`
- `지원되는 HTTP 버전` 을 통해 HTTP 버전을 선택할 수 있습니다. 더 빠른 네트워크 처리를 위해 HTTP/3 를 선택합니다.

![img_13.png](AWS/images/s3_domain_https_13.png)


마지막으로 `표준로깅`은 해제, `IPv6` 는 활성화하고 배포 생성을 눌러주면 CloudFront까지 배포가 완료됩니다.

![img_14.png](AWS/images/s3_domain_https_14.png)


이제 배포된 CloudFront에 들어가서 `배포 도메인 이름` 을 확인 후, 해당 주소로 접근하면 배포된 CloudFront에 접근할 수 있습니다.

![img_16.png](AWS/images/s3_domain_https_16.png)


하지만 이게 끝이 아닙니다. 일반 사용자는 어려운 CloudFront주소를 입력하여 들어오지 않습니다. 도메인주소를 입력하고 들어오지요. 따라서 앞서 CloudFront의 대체도메인에 입력했던 도메인주소를 `Route 53` 에 등록해주어야 합니다.


## Route 53 에서 레코드 생성
AWS 콘솔에서 `Route 53 > 호스트 영역` 로 넘어가 본인이 생성했던 `호스팅 영역` 을 선택 후, `레코드 생성` 버튼을 누릅니다.

> [!note] AWS 에서 도메인을 구입하고 사용한 적 없다면, 호스팅 영역에 아무것도 없습니다.
> - 호스팅 영역이 없다면, 호스팅 영역 생성 버튼을 누릅니다. 
> - 도메인 이름에는 구입한 도메인 이름을 기입합니다.
> - 유형은 퍼블릭 호스팅 영역을 선택하고 

![](AWS/images/s3_domain_https_19.png)


 - `레코드 이름`은 CloudFront 대체도메인을 입력하고, `별칭`을 활성화시킵니다. 
 - `트래픽 라우팅 대상` 에서 `CloudFront 배포에 대한 별칭`을 선택해주고, 이전에 만든 `CloudFront 배포 주소` 를 선택합니다.
 
![img_17.png](AWS/images/s3_domain_https_17.png)


## HTTPS 동작 확인
브라우저에서 CloudFront 대체 도메인 주소로 접속해보면 HTTPS 가 잘 입혀 동작하는것을 볼 수 있습니다.

![img_18.png](AWS/images/s3_domain_https_18.png)


