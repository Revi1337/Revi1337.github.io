해당 글은 인프런의 `AWS(Amazon Web Service) 입문자를 위한 강의` 를 보며 작성한 포스팅입니다.

### AWS Lambda 의 기능과 역할

AWS Lambda 는 AWS 리소스들 중에 `Serverless` 를 구현하는데 매우 중추적인 리소스이다.
그렇다면 Serverless 가 무엇일까? 제일 간단하게 생각해보면 말 그대로 `Server 가 없는..` 이라고 해석할 수 있다.

굳이 비유를 해보면.. 직접 함수로 정의되어 있지는 않지만, 함수의 역할을 대신해주는 `Python` 의 `lambda` 함수처럼
`AWS Lambda` 도 Server 는 존재하지 않지만 `AWS Lambda` 가 `Server 의 역할` 을 대신 해준다고 볼 수 있다.

그렇기 때문에 서버를 직접 만들어 운영하면서 다양한 모니터링을 하며 문제점이 발생할때 일일이 참견하여 해결했던
방식과는 다르게, `AWS Lambda` 를 통해 Serverless 한 환경을 만들어줌으로서 클라우드가 대신 직접 서버를 돌려주고 
생성하며 리소스들을 `서버의 사용량에 따라 직접 할당` 해주어 사람의 간섭을 비교적 줄게하여 결국 문제점이 덜 발생되게 만들어줄 수 있다.

그리고 `AWS Lambda` 는 `Event` 를 통해 실행된다. 여기서 `Event` 는 S3 에 파일이 `추가`되었거나 S3 에 파일이
`삭제`되거나 하는 등의 `추가`, `삭제` 와 같은 동사를 의미한다.

Lambda 는 이런한 이벤트들이 발생하였을 때 `우리가 직접 짠 코드` 을 의미하는 `람다함수` 가 실행되며,
이렇게 짠 람다함수가 실행될 때와 작업이 마무리될때 또 다른 서비스를 불러올 수 있다. 

> * 따라서 AWS Lambda 는 AWS 아키텍쳐를 구현할때 `중간 중간에 배치`되는 경우가 흔하다.

AWS Lambda 의 기능과 역할을 요약해보면 아래와 같다.

- Severless 의 주축을 담당
- Events 를 통하여 Lambda 를 실행시킴
- NodeJS, Python, Java, GO 등 다양한 언어를 지원
- Lambda Function

### AWS Lambda 비용과 기타 정보

- 기본적으로 AWS Lambda 는 우리가 직접 짠 코드를 의미하는 `Lambda 함수` 가 실행될때만 돈을 지불한다.
- 매달 `백만번` 의 람다함수의 호출은 무료이다. 사실상 개인 프로젝트용이면 무료아닐까 싶다.
- 최대 `15분` 의 Runtime 의 시간을 허용한다. (넘어가면 Timeout)
- `512MB` 의 일시적인 디스크 공간(/tmp/) 을 제공한다. 또한, 람다 함수로 들어오는 Input 을 코딩을 통해 일시적인 공간에 저장하고 통해 꺼내올 수 있다.
- 최대 `50MB` Deployment Package 허용한다. AWS 콘솔에서 직접 코딩을 짤 수 있지만 로컬에서 다수의 파일을 하나의 압축파일로 저장하여 AWS 에 업로드해서 Deployment 를 통하여
사용할 수도 있다. 또한, 파일의 크기가 `50MB` 를 넘어가면 기본적으로 업로드가 되지 않지만, 이는 S3 에 업로드한 후, 람다에서 그 파일에 대한 경로를 지정해주어 해결해줄 수 있다.

### AWS Lambda 사용 용례

AWS Lambda 를 사용하게 되면 아래와 같은 일련의 Flow 를 가능하게 해준다.

![img.png](https://revi1337.github.io/posts/aws-lamdba/img.png)

1. S3 에 파일을 올릴때 `PutObject` 라는 이벤트가 발생이 된다.
2. 해당 이벤트가 발생이되면 정의한 `Lambda 함수` 를 실행시키게 된다.
3. `Lambda 함수` 는 데이터를 읽어보고 필요 시 데이터를 변환시키고 필요없는 데이터는 삭제시킨다.
4. 이러한 과정이 완료되면 `Lambda 함수` 는 DB 로 데이터를 업로드 시킨다.

> * 한마디로 중간에 다리와 같은 역할을 담당하는 것이다.

### AWS Lambda 테스트

우선 AWS 콘솔에서 AWS Lambda 로 이동해주고, `대시보드` 로 이동해주고 `함수 생성` 을 눌러주자.

![img_1.png](https://revi1337.github.io/posts/aws-lamdba/img_1.png)

#### Lambda 함수 생성

 `새로 작성`, `블루프린트 사용`, `컨테이너 이미지` 라는 옵션을 선택해줄 수 있다. 여기서 각 항목에 대한 기능은 아래와 같다.

![img_2.png](https://revi1337.github.io/posts/aws-lamdba/img_2.png)

새로 생성
: 처음부터 함수를 구현할 수 있게 해주는 기능이다.

블루프린트 사용
: AWS 에서 사용되는 기능들을 `Template` 화 시켜 가져다 쓸 수 있게 해주는 기능이다.

컨테이너 이미지
: 도커같이 가상 컨테이너 이미지 저장소 경로를 요구한다. 람다함수가 내포된 컨테이너 이미지를 찾아 배포하여 사용할 수 있는 기능이다.

우선 간단한 테스트를 위해 `블루프린트` 를 선택해주고, 블루프린트 이름으로는 `Python 3.7 의 Hello world function` 을 선택해준다.
또한, 함수 이름도 간단하게 설정해준다.

![img_3.png](https://revi1337.github.io/posts/aws-lamdba/img_3.png)

그리고 아래를 내리면 이미 작성되어있는 람다 함수를 볼 수 있으며 `함수 생성` 을 눌러 람다함수를 생성해주자.

![img_4.png](https://revi1337.github.io/posts/aws-lamdba/img_4.png)

#### Lambda 함수 테스트

람다함수를 정상적으로 생성하게되면 아래와같은 사진을 만나볼 수 있다.

![img_5.png](https://revi1337.github.io/posts/aws-lamdba/img_5.png)

아래로 내리면 `코드소스` 탭이 나오게 되는데 여기서 `Test` 드롭다운 버튼을 눌러준다.

![img_6.png](https://revi1337.github.io/posts/aws-lamdba/img_6.png)

`테스트 이벤트 구성` 탭에서 람다함수에 보내고싶은 값을 전달할 수 있는데, 해당 값으로 람다함수가 올바르게 동작하는지 테스트를 진행해볼 수 있다.
또한 `이벤트 공유 설정` 란 에서 해당 테스트를 다른 사람에게 공유할 것인지 나만 보게할 것인지 지정해줄 수 있다.
하지만 여기서는 private 으로 진행할것이다.

이제 저장을 눌러준다.

![img_7.png](https://revi1337.github.io/posts/aws-lamdba/img_7.png)

이제 다시 `Test` 드롭다운 버튼을 눌러주며 정상적으로 람다함수의 `테스트`가 진행된다.
아래의 사진의 로그를 보면 value1,2,3 의 key 값들에 대한 value 가 잘 출력되는것을 볼 수 있다.
또한, RequestID 값은 UUID 포맷이며, 매 `테스트마다 생성되는 고유한 ID` 값이며, 해당 
아이디를 가지고 CloudWatch 에서 검색하여 로고를 찾을 수 있다.

![img_8.png](https://revi1337.github.io/posts/aws-lamdba/img_8.png)

만약 아래 사진과 같이 코드를 변경해주면, `Deploy` 버튼이 활성화되게 되는데
해당 버튼을 눌러야 변경된 코드가 적용이되어 테스트가 진행된다.

![img_9.png](https://revi1337.github.io/posts/aws-lamdba/img_9.png)

### AWS Lambda 실습

자 이제 `S3` 에 `json` 파일이 업로드 되었을 때, 그 json 파일의 특정 `key` 값을 읽어
특정 메시지를 출력하는 예제를 실습해보자.

#### Lambda 함수 생성

lambda 함수를 만들어주는데 이름과 파이썬 버전은 재량껏 선택해 준다. 

![img_10.png](https://revi1337.github.io/posts/aws-lamdba/img_10.png)

`실행 역할` 에는 `AWS 정책 템플릿에서 새 역할 생성` 를 선택해준다.
왜냐하면 Lambda 함수가 S3 버켓의 특정 행동을 `감지할 수 있는 권한` 이 들어있기 때문이다.

`역할 이름` 은 재량껏 지어준다. 이제 `정책 템플릿` 을 설정해주어야하는데 `Amazon S3 객체 읽기 전용 권한` 을 선택해준다.

> * 이제 Lambda 함수가 S3 에 읽기 권한이 생기게 된다.

![img_11.png](https://revi1337.github.io/posts/aws-lamdba/img_11.png)

이제 `코드소스` 에는 아래의 코드를 입력해준다. 해당 코드는 다음과 같은 의미를 갖는다.

1. 현재 시간, bucket 이름, 파일이름을 추출한다. 
2. 추출한 정보들을 client 객체의 get_object() 메서드의 인자로 전달하여 response 롤 저장한다.
3. response 에 저장된 body 를 꺼내와 json 으로 load 시켜 해당 json 에서 `temperature` 키값이 40 이상인 것과
아닌 것은 분기하여 print() 처리하고 있다.

> * event 는 람다함수가 실행될때 의 여러가지 `메타데이터 정보` 들을 담고 있다.  

![img_12.png](https://revi1337.github.io/posts/aws-lamdba/img_12.png)

#### S3 버킷 생성 및 속성 변경

모든 설정을 디폴트로 설정하고 S3 버킷을 만들어준다.

![img_13.png](https://revi1337.github.io/posts/aws-lamdba/img_13.png)

이제 이 S3 버킷의 `속성을 변경` 해주어야 한다. `속성` 탭을 누른 후, 아래로 내리다보면
`이벤트 알림` 섹션이 나오게되는데 `이벤트 알림 생성` 을 눌러준다.

![img_14.png](https://revi1337.github.io/posts/aws-lamdba/img_14.png)

`이벤트 이름` 은 재량껏 지어준다. `접두사` 그리고 `접미사` 는 버킷의 특정 파일 혹은 특정 폴더에 대한 이벤트만
감지하고  싶을때 사용한다. 따라서 여기서는 명시하지않고 넘어가 준다.

![img_15.png](https://revi1337.github.io/posts/aws-lamdba/img_15.png)

이제 감지하고 싶은 `이벤트 유형`을 설정해주어야 한다.
우리는 Object(파일) 이 버킷에 업로드 되는 이벤에만 관심이 있기 때문에 `s3:ObjectCreated:Put` 을 의미하는 `전송` 을 선택해준다.

![img_16.png](https://revi1337.github.io/posts/aws-lamdba/img_16.png)

`대상` 을 설정해주어야 한다.
이게 정말 중요한데 해당 설정에서는 버킷에 Object(파일) 이 업로드 되었을 때. 즉, 설정한 `이벤트가 발생했을 때 실행할 
AWS 리소스를 정의` 할 수 있다. 우리는 Lambda 함수를 실행할 것이기 때문에 Lambda 들을 선택해주고, 이전에 생성한 Lambda 함수를 선택해준다.
그리고 `변경 사항 저장` 을 눌러준다.

![img_17.png](https://revi1337.github.io/posts/aws-lamdba/img_17.png)

이제 해당 `S3` 에 방금설정한 `이벤트` 가 등록된것을 확인할 수 있다.

![img_18.png](https://revi1337.github.io/posts/aws-lamdba/img_18.png)

#### Lambda 으로 복귀

이제 다시 `AWS Lambda > 함수 > 람다함수 이름` 으로 돌아오면 `S3` 버킷이 람다함수의 
트리거 역할을 하고있는 것을 볼 수 있다.

![img_19.png](https://revi1337.github.io/posts/aws-lamdba/img_19.png)

또한, 아래의 `구성 > 트리거` 를 선택하면 현재 활성화 된 이벤트에 대한 상세 정보를 확인할 수 있다.

![img_20.png](https://revi1337.github.io/posts/aws-lamdba/img_20.png)

#### S3 에 업로드 후 테스트

이제 `S3` 에 아래와같은 json 파일을 업로드 시켜주자. 과연 이벤트가 잘 실행되었을까?

```json
{
	"temperature":45
}
```

![img_21.png](https://revi1337.github.io/posts/aws-lamdba/img_21.png)

`AWS Lambda > 함수 > 람다함수 이름` 로 돌아와서 모니터링 탭에 들어가 `CloudWatch Logs 보기` 를 눌러준다. 

![img_22.png](https://revi1337.github.io/posts/aws-lamdba/img_22.png)

이제 새 탭이 열리면서 `CloudWatch` 로 이동하게 되는데, 하단의 `로그 스트림` 에 아래와 같은 로그가 생성된것을 확인할 수 있다.

![img_23.png](https://revi1337.github.io/posts/aws-lamdba/img_23.png)

이제 해당 로그를 열어보면 이전에 함다 함수를 정의할때 설정한 Python Script 대로 잘 동작한것을 확인할 수 있다.

![img_24.png](https://revi1337.github.io/posts/aws-lamdba/img_24.png)
