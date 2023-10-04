해당 글은 인프런 `Simon Kim` 님의 `AWS(Amazon Web Service) 입문자를 위한 강의` 를 보며 작성한 글입니다.
아래 나온 자료 사진들은 모두 해당 강의에서 가져온 것입니다. https://www.inflearn.com/course/aws-%EC%9E%85%EB%AC%B8

### I. AWS CloudFront 정의와 역할

`CloudFront` 란 `Edge Location` 이라는 개념을 사용하여 정적인, 동적인 그리고 실시간 웹사이트 컨텐츠들을 유저들에게
효율적으로 전달하는데 사용되어지는 AWS 서비스 중 하나이다.

`CloudFront` 를 사용하면 특정 유저가 요청을 하였을 때 `Edge Location` 을 통해 웹사이트에 컨텐츠가 `Delivery` 됨으로써 퍼포먼스를 극대화 시킬 수 있다.

우선 CloudFront 와 `Edge Location` 을 이해하기 전에 `CDN(Content Delivery Network)` 이라는 개념을 이해하는것이 가장 중요하다.

> * 기본적으로 `CDN` 은 컨텐츠 전송 네트워크를 의미하며 웹사이트의 성능을 향상시키고 사용자에게 빠른 콘텐츠를 제공해주는 기술을 의미한다.
> * CDN 은 서버가 전세계적으로 여러대의 서버로 분산되어 있는 `분산된 서버 네트워크` 를 가지고 있기 때문에 웹사이트의 `정적인 콘텐츠들을 캐싱`하고 사용자의 위치 정보로 하여금 `가장 가까운 분산 서버중 한개`에서
캐싱된 컨텐츠를 제공한다. 그렇기 때문에 결과적으로 사용자에게 빠른 콘텐츠를 제공해줄 수 있는 것이다.

#### 기존의 웹 호스팅

우선 우리는 한국에서 `웹 호스팅` 을 통해 웹서비스를 하나 운영하고 있다고 가정하자. 아래 사진의 빨간원통이 한국이며 이곳을 `Origin` 이라고 부른다.
전국 각지의 모든 사람들이 우리의 웹사이트를 접속하면, `Origin` 에서 접속한 사용자에게 직접 컨텐츠를 `Delivery` 해야한다.
하지만 문제가 발생한다. 바로 접속하려는 사용자와 `Origin` 과의 거리만큼 홈페이지의 로딩속도 `지연(Latency)` 이 발생한다.

![img.png](https://revi1337.github.io/posts/aws-cloudfront/img.png)

#### CDN 을 사용한 웹 호스팅

하지만 `CDN` 을 사용하여 웹호스팅을 하면 조금 다르다. `Origin` 에서 직접 접속자에게 컨텐츠를 `Delivery` 하는 기존의 방식과는 다르게
`CDN` 을 사용하게 되면 아래사진의 초록색 직육면체와 같이 `Edge Location` 이라는 곳을 통해 접속자들에게 콘텐츠를 `Delivery` 하게 된다.
여기서 `Edge Location` 는 전세계에 지역마다 분산되어있는 서버의 집합이라고 생각하면 된다.

또한, Edge Location 은 컨테츠들의 정보를 `Cache` 에 보관한다. 처음 웹사이트에 접속 시 Cache 에 들어있지 않다면,
Edge Location 과 웹사이트를 호스팅한 장소인 Origin 과 통신 후, 그 정보들을 `Cache` 에 저장하고 사용자들에게 콘텐츠를 Devlivery 하게 된다.

> * Cache 가 소멸되기 전, 한번이라도 우리의 웹사이트를 접속했었던 사용자들이 다시 접속할 때, Origin 에서 컨텐츠를 Delivery 해주는 것이 아닌,
Edge Location 의 Cache 된 데이터가 Delivery 되게 된다. 따라서 Latency(지연) 을 줄일 수 있게 된다.

![img_1.png](https://revi1337.github.io/posts/aws-cloudfront/img_1.png)

#### CloudFront 용어 정리

- Edge Location : 컨텐츠들이 `Cache` 되어 보관되어지는 장소
- Origin : 원래 컨텐츠들이 들어있는 곳. 웹서버 호스팅이 되어지는 곳. 일반적으로 S3, EC2 인스턴스가 오리진이 될 수 있음.
- Distribution : 분산이라는 의미를 갖으며, CDN 에서 사용되어지며 `전세계적으로 퍼져있는 Edge Location 들을 묶어 총칭`하는 개념이다.

### II. AWS CloudFront 실습

#### S3 생성과 ACL 변경

첫번째 단계로 `S3` 를 생성해준다. 우선 `Latency(지연)` 을 확인해보기 위해 `서울과 먼 Region` 을 선택해준다.

![img_2.png](https://revi1337.github.io/posts/aws-cloudfront/img_2.png)

`ACL 활성화됨` 을 선택해주고

![img_3.png](https://revi1337.github.io/posts/aws-cloudfront/img_3.png)

전세계적으로 접근할 수 있는 버킷을 만들 것이기 때문에 `모든 퍼블릭 액세스 차단` 옵션을 해제해주고
버킷을 만들어 준다.

![img_4.png](https://revi1337.github.io/posts/aws-cloudfront/img_4.png)

버킷이 생성되었으면, 생성된 버킷을 선택 후, `업로드` 를 눌러준다. 이제 업로드 창이 뜨게 되면 아래로 내려
`ACL(액세스 제어 목록)` 섹션에서 `퍼블릭 읽기 액세스 권한 부여` 를 선택해준다.

> * 이래와 버킷 레벨뿐만 아닌, 오브젝트레벨(파일) 에서도 Public 권한
> * 생기게 된다. 

![img_5.png](https://revi1337.github.io/posts/aws-cloudfront/img_5.png)

#### S3 파일 업로드 후 Latency 확인

이제 동일하게 `업로드` 창에서 사진하나를 업로드한다.

![img_6.png](https://revi1337.github.io/posts/aws-cloudfront/img_6.png)

이제 업로드된 `오브젝트(파일)` 을 열람해보면 사진이 버퍼링이 걸리면서 렌더가 늦는것을 확인할 수 있다.

![img_7.png](https://revi1337.github.io/posts/aws-cloudfront/img_7.png)

> * 여기서 CloudFront 가 사용된다.

#### CloudFront 생성 - 원본

자 이제 AWS 콘솔에서 CloudFront 로 이동해 준다. CloudFront 를 들어가게되면, 대문짝만하게 `고속 CDN 서비스`라고 소개하고 있다.
여기서 `CloudFront 배포 생성` 을 눌러주자.

![img_8.png](https://revi1337.github.io/posts/aws-cloudfront/img_8.png)

* `원본도메인`에는 CloudFront 를 적용하려는 서비스를 선택해준다.

* `원본 경로` 는 명시하지 않는다. 해당 옵션은 S3 의 특정한 폴더만 적용하고 싶을때 사용된다.

* `이름` 은  알아서 생성된다.

* 원본 액세스에는 `Legacy Access Identities` 를 선택해준다.
`새 OAI 생성` 를 통해 새로운 OAI 를 만들어준다.

*  버킷 정책에는 `예 버킷 정책 업데이트` 를 선택해준다. 이는 버킷의 읽기 권한을 사용자에게 부여할지 안할지에 대한 권한을 묻는 것이다.

> * Legacy Access Identities 는 `OAI` 라는 `원본 액세스 ID` 를 사용해서 버킷에 접근한다는 의미이다.
> * OAI 는 CloudFront 에 존재하는 `가상 유저`를 의미하며 콘텐츠 접근 권한을 가지고 있다.  

![img_9.png](https://revi1337.github.io/posts/aws-cloudfront/img_9.png)

* 이어서 `사용자 정의 헤더 추가` 필요없으니까 패스해준다. 이는 `Origin` 으로 보내는 요청에 사용자 지정 Header 를 추가할 때 필요하다.

* `Origin Shied` 는 필요없으니까 아니오 를 선택해준다. Origin Shield 는 원본의 부하를 줄이고, 가용성을 보호하는데 도움이 되는 추가 캐싱 계층이라 설명되어있으며
캐시 적중률 향상을 통해서 더 효율적인 콘텐츠 로딩을 위해 사용되어 질 수 있다. (추가요금이 발생할 수 있음.)

![img_10.png](https://revi1337.github.io/posts/aws-cloudfront/img_10.png)

#### CloudFront 생성 - 기본 캐시 동작

여기서부터는 기본캐시 동작 설정이다.

* `경로 패턴` 은 우리가 직접 `변경할 수 없으며` 와일드카드 `*` 를 통해 모든것들을 가져온다는 얘기이다.

* `자동으로 객체 압축` 에는 yes 를 선택해준다. 해당 설정은 콘텐츠를 `Origin` 으로 보낼 때, 압축해서 보낼지 아닐징 대한 
여부를 설정하는 것이다.

* `뷰어 프로토콜 정책` 에는 Redirect HTTP to HTTPS 를 선택해준다. 해당 설정을 통해 접속하려는 프로토콜에 대한 정책을 설정할 수 있다.
여기서는 `HTTP` 로 접속하게되면 `HTTPS` 로 리다이렉트 시키게 된다.

* `허용된 HTTP 방법` 은 API 요청을 할때 허용할 HTTP 메서드를 지정해 줄 수 있다. 여기서는 `GET, HEAD` 를 설정해준다.

* `뷰어 액세스 제한` 에는 `No` 를 선택해준다. `yes` 를 통해 제한시키게되면 CloudFront 에 서명된 URL 또는 서명된 쿠키를 사용해야한다.
이것은 EC2 인스턴스에 접속할 때 썼던 PEM 파일과 비슷한 개념으로 액세스 권한을 부여받은 사용자만 콘텐츠에 접근할 수 있게 제한하는 것이다.

![img_11.png](https://revi1337.github.io/posts/aws-cloudfront/img_11.png)

* `캐시 키 및 원본 요청` 에는 Cache policy and origin request policy(캐시 정책과 오리진 요청 정책) 를 선택해준다.

* `캐시 정책` 에는 CachingOptimized 를 선택해준다.

* 그리고 나머지는 모두 디폴트로 패스해준다.

![img_12.png](https://revi1337.github.io/posts/aws-cloudfront/img_12.png)

#### CloudFront 생성 - 함수 연결

함수 연결은 선택사항이기 때문에 패스해준다. 해당 설정을 통하여 CloudFront 를 사용할 때 
일어날 수 있는 다양한 상황에서 `Lambda` 또는 `ClountFront 함수` 중 하나를 사용할 수 있다.

![img_13.png](https://revi1337.github.io/posts/aws-cloudfront/img_13.png)

#### CloudFront 생성 - WAF 설정

웹 애플리케이션 방화벽(WAF) 는 선택사항이기 때문에 패스해준다.

![img_16.png](https://revi1337.github.io/posts/aws-cloudfront/img_16.png)

#### CloudFront 생성 - 설정 (가장 중요)

이제 가장 중요한 설정이다.

* `가격 분류` 에 따라 `Edge Location` 이 전세계에 얼마나 생성될지 결정할 수 있다.
`Edge Location` 가 많을수록 속도는 향상된다. 여기서는 북미, 유럽, 아시아, 중동 및 아프리카에서 사용을 선택해준다.

* `대체 도메인 이름` 은 선택사항이며 도메인주소를 제공하지 않으면 CloudFront 가 임의의 도메인 주소를 생성해준다.

* `사용자 정의 SSL 인증서` 는 패스해준다. 해당 옵션을 통해 AWS 로부터 Public SSL 인증서를 생성할 수 있지만. 
설명에 나와있는것처럼 SSL 인증서를 발급하려면 미국 동부(버지니아 북부) 리전(us-east-1)에 있어야 한다.

* `지원되는 HTTP 버전` 을 통해 HTTP 버전을 선택할 수 있다. 더 빠른 네트워크 처리를 위해 최신버전인 HTTP 3 을 선택해준다.

* `기본값 루트 객체` 와 `표준 로깅` 은 패스해준다.

* `IPv6` 에는 `켜기` 를 선택해준다. IPv4 에 비해 더욱 다양한 IP 주소를 포함하기 때문이다.

![img_14.png](https://revi1337.github.io/posts/aws-cloudfront/img_14.png)
![img_15.png](https://revi1337.github.io/posts/aws-cloudfront/img_15.png)

이제 하단의 `배포 생성` 을 눌러 CloudFront 를 만들어준다.

#### CloudFront 정보 확인

자 이제 생성된 `CloudFront` 정보를 확인해보자. 우선 `배포 도메인 이름` 를 확인할 수 있고, 이는 
CloudFront 에서 직접 생성한 URL 이다. 또한 `ARN` 도 확인할 수 있다.

![img_17.png](https://revi1337.github.io/posts/aws-cloudfront/img_17.png)

이제 `원본` 탭을 넘어온다. `원본 도메인` 은 콘텐츠가 들어있는 S3 버킷주소와 동일함을 확인할 수 있다.

![img_18.png](https://revi1337.github.io/posts/aws-cloudfront/img_18.png)

이제 `동작` 탭을 넘어온다. 앞서 설정할 때 경로값을 설정하지 않았기 때문에 `*` 설정되어있다.
또한 `뷰어 프로토콜 정책` 에는 앞서 모든 `HTTP` 요청을 `HTTPS` 로 리다이렉트 시켜주는 옵션이 보이는것을 
확인할 수 있다.

![img_19.png](https://revi1337.github.io/posts/aws-cloudfront/img_19.png)

#### CloudFront 동작 확인

이제 생성한 `CloudFront` 로 돌아와 `배포 도메인 이름` 을 복사해준다.

![img_20.png](https://revi1337.github.io/posts/aws-cloudfront/img_20.png)

이제 해당 주소를 새탭으로 열어 `http` 로 접속하여 네트워크 탭으로 확인해보면
`http` 로 접속했던 요청이 `https` 로 리다이렉트 되는것을 확인할 수 있다.

이는 이전에 설정한 `뷰어 프로토콜 정책` 이 잘 동작하고있음을 의미한다.

![img_21.png](https://revi1337.github.io/posts/aws-cloudfront/img_21.png)

> * 사실 아쉬운것은 같은 리소스주소를 재요청해서 캐시된 데이터와 얼마나 속도가 차이나는지 확인해보고 싶었지만,
아래의 사진과 같이 너무 차이가 안나서 확인할수가 없었다...

![img_22.png](https://revi1337.github.io/posts/aws-cloudfront/img_22.png)
![img_23.png](https://revi1337.github.io/posts/aws-cloudfront/img_23.png)

여하튼 `CloudFront` 가 잘 동작하는것을 확인해봤으니 만족이다.