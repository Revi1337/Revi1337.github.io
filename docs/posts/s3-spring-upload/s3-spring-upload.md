Spring Boot 에서 S3 Bucket 에 파일을 업로드하는 방법에 대해 알아보자.

### AWS 설정

#### 1. S3 Bucket 생성

우선 AWS 콘솔에서 `S3` 서비스에 들어온 후, `버킷 만들기` 를 선택해준다.

![img.png](https://revi1337.github.io/posts/s3-spring-upload/img.png)

`Bucket` 이름은 마음대로 해도되며, `Region` 만 `ap-northeast-2` 로 바꾸어준다.

![img_1.png](https://revi1337.github.io/posts/s3-spring-upload/img_1.png)

객체 소유권은 `ACL 비활성화됨` 을 선택해준다

![img_2.png](https://revi1337.github.io/posts/s3-spring-upload/img_2.png)

또한 `퍼블릿 액세스 차단 설정`을 `해제`해준다.

![img_3.png](https://revi1337.github.io/posts/s3-spring-upload/img_3.png)

#### 2. IAM 에서 사용자 생성

AWS 콘솔에서 IAM 서비스로 들어와 `IAM > 액세스 관리 > 사용자` 탭에서 `사용자를 생성` 해준다.

![img_4.png](https://revi1337.github.io/posts/s3-spring-upload/img_4.png)

`사용자 이름` 은 마음대로 설정해주고 다음으로 넘어가준다.

![img_5.png](https://revi1337.github.io/posts/s3-spring-upload/img_5.png)

이제 `권한 설정` 창에서 `직접 정책 연결` 을 선택해준 다음, `권한 정책` 검색창에 `AmazonS3FullAccess` 를 검색하여 해당 권한을 선택주어
사용자 생성을 완료한다.

![img_6.png](https://revi1337.github.io/posts/s3-spring-upload/img_6.png)

#### IAM 에서 사용자 AccessKey 생성

이제 생성한 사용자의 AccessKey 및 Secret Key 를 발급받아야 한다.

`IAM > 액세스 관리 > 사용자` 에서 방금 생성한 사용자를 클릭하고 `보안 자격 증명` 탭으로 이동하여
`액세스 키 만들기` 선택해준다.

![img_7.png](https://revi1337.github.io/posts/s3-spring-upload/img_7.png)
![img_8.png](https://revi1337.github.io/posts/s3-spring-upload/img_8.png)

`액세스 키 모범 사례 및 대안` 은 아무거나 선택해주고 넘어가준다.

![img_9.png](https://revi1337.github.io/posts/s3-spring-upload/img_9.png)

`설명 태그 설정`은 해도되고 안해도 된다. 나는 만들어주었다.

![img_10.png](https://revi1337.github.io/posts/s3-spring-upload/img_10.png)

이제 아래와같이 `액세스 키` 와 `비밀 액세스 키` 가 생성된다.

![img_11.png](https://revi1337.github.io/posts/s3-spring-upload/img_11.png)

#### S3 정책 설정

이제 다시 생성했단 S3 Bucket 을 선택하여 `권한 > 버킷 정책 > 편집` 을 눌러준다.
그리고 아래와같이 정책을 설정해주자.

* `Statement` : 배열의 각 `JSON` 요소는 하나의 `권한`을 의미한다.
* `Sid` : 권한을 구분하는 id 로 사용되며, 아무런값을 설정해도 된다.
* `Effect` : 해당 권한을 허용할지 거부할지 결정하는 역할을 한다.
* `Principal` : 누구에게 적용할것이냐는 의미를 갖고있으며, 여기서는 모두(*) 를 나탸낸다.
* `Action` : 수행할 작업을 의미하며 여기서는 `s3` 버킷의 모든 작업을 의미한다.
* `Resource` : 어떤 객체(파일) 을 대상으로 지정할지를 의미한다.

> 따라서 상단의 JSON 은 `ARN` 이 `arn:aws:s3:::apartribe` 인 Bucket 의 
모든 객체(파일)에 대해 모든 작업을 수행할 권한을 모든 사용자들에게 주겠다는 의미이다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "apartribe",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::apartribe/*"
    }
  ]
}
  ```
### Spring 연동

자 여기부터는 Spring 의 영역이다.

#### build.gradle 에 의존성 추가

첫번째로 `build.gradle` 에 해당 아래의 의존성을 추가해준다.

```text
implementation 'org.springframework.cloud:spring-cloud-starter-aws:2.2.6.RELEASE'
```

![img_12.png](https://revi1337.github.io/posts/s3-spring-upload/img_12.png)

#### yml 에 aws 설정 추가

아래와같이 aws `Bucket` 에 대한 설정을 작성해준다.
이전에 발급받은 사용자의 `access_key`, `secret-key` 는 민감정보이기 때문에`Environment` 로 뺴준다.
또한 나는 어떠한 정보도 노출시키고 싶지않기때문에 `bucket` 이름도 `Environment` 로 빼주었다.

```yml
cloud:
  aws:
    s3:
      bucket: ${AWS_BUCKET_NAME}
    credentials:
      access-key: ${AWS_ACCESS_KEY}
      secret-key: ${AWS_SECRET_KEY}
    region:
      static: ap-northeast-2
      auto: false
    stack:
      auto: false
```

#### S3 Bucket 설정 파일 작성

이제 아래와같이 설정파일을 작성해준다. 각 `Environment` 외부설정값을 주입받고 그 값들을 토대로
`AmazonS3Client` 설정을 해준다.

![img_13.png](https://revi1337.github.io/posts/s3-spring-upload/img_13.png)

#### 파일 업로드 로직 작성

아래와같이 `S3` 에 업로드할 수 있는 로직을 작성해준다.
`AmazonS3` 타입의 Bean 을 주입받아, `.putObject()` 메서드로 파일을 버킷에 업로드시킬 수 있다.
또한, 주입받은 `AmazonS3` 의 `.getUrl()` 메서드를 통해 업로드된 파일의 경로를 획득할 수 있다.

> 프로젝트 진행중이기때문에, AttachmentRepository 는 무시해도된다.

![img_14.png](https://revi1337.github.io/posts/s3-spring-upload/img_14.png)

#### 동작 확인

이제 아래의 컨트롤러를 토대로 API 요청을 날려보자.

![img_15.png](https://revi1337.github.io/posts/s3-spring-upload/img_15.png)

아래와 같이 `Postman` 에서 요청을 날려보면 

![img_16.png](https://revi1337.github.io/posts/s3-spring-upload/img_16.png)

잘 업로드되는 것을 볼 수 있다.

![img_17.png](https://revi1337.github.io/posts/s3-spring-upload/img_17.png)

