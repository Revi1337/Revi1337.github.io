### 1. AWS 콘솔의 Service 탭으로 이동

제일 첫번째로 회원가입 후, AWS 콘솔에서 `서비스` 를 누르고 `모든 서비스 보기`  를 누른다.

![img.png](https://revi1337.github.io/posts/s3-web-host/img.png)

### 2. Storage 의 S3 선택

굉장히 많은 서비스들이 노출되게 되는데, 이 중에서 `스토리지` 섹션의 `s3` 를 선택한다.

![img_1.png](https://revi1337.github.io/posts/s3-web-host/img_1.png)

이어서`버킷 만들기` 를 선택한다. `Bucket` 은 데이터를 저장할수 있는 일종의 저장소를 의미한다.

![img_2.png](https://revi1337.github.io/posts/s3-web-host/img_2.png)

### 3. Name, Region 설정

이제 버킷을 생성하기위한 필수 정보들을 입력해야한다. 각 필드들은 아래와 같은 의미를 갖는다.
(해당 글에 설명하지 않은 설정들은 중요치않거나 Optional 하기때문에 딱히 건드리지 않아도 된다.)

* 버킷 이름 : 저장소이름을 나타낸다. (전세계적으로 Unique 해야한다.)
* AWS Region : 전국 각지에 퍼져있는 인프라가 존재하는 위치를 선택. (가까울수록 빠르기 떄문에 Seoul 을 선택해준다.)

![img_4.png](https://revi1337.github.io/posts/s3-web-host/img_4.png)

### 4. Block Public Access 해제

이부분이 좀 중요하다. 바로 `퍼블릭 액세스 차단 설정` 을 해주어야 한다. 처음에는 `모든 퍼블릭 액세스 차단` 이라는 값이 체크되어있을 것이다.(내가 바꾼것이다.)

`퍼블릭 액세스 차단` 이라는 의미는 자신을 제외한 모든 사용자들이 해당 버킷에 접근할 수 없도록 모두 차단한다는 의미를 갖고 있다.
간단하게 **Private IP 에는 다른사용자들이 접근할수 업고, Public IP 를 통해 다른 사용자들이 접근할 수 있는 것과 비슷한 맥락이라고 생각하면 된다.**

AWS 에서는 해당설정에 해단 디폴트 값을 `모든 퍼블릿 액세스 차단` 으로 설정해두고 있다.
이는 보안적인 관점에서 생각해보면 모든 IP 를 허용해놓고 특정 IP 만 차단하는 `Blacklist 기반 필터링` 과  
모든 IP 를 차단해둔 상태에서 특정 IP 들만 허용하는 `Whitelist 기반 필터링` 을 비교해보면
말할 필요도없이 후자가 보안적으로 유리하기 때문이다.

또한, `S3` 는 기본적으로 `정적 Resource` 들을 저장하고 `특정 IP` 만 그 리소스에 접근할 수 있게 사용하지.
굳이 이 정적 리소스들을 `public` 하게 만들 필요가 전혀 없기때문이다.

하지만 우리는 정적 웹 호스팅을 할것이고, `다른 모든 사용자들에게 노출되는것이 목적` 이기 때문에
`모든 퍼블릭 액세스 차단` 이라는 옵션을 `해제`시켜주어야 한다.

아래 사진 제일 하단을 보면 `퍼블릭 상태가 될 수 있음을 알고 있습니다.` 라는 옵션을 체크해준 것을 볼 수 있다.
 이는 방금전 `모든 퍼블릭 액세스 차단` 라는 옵션을 해제시켜주었기 때문에 곧 생성될 `S3` 버킷(저장소) 는
모두에게 공개될 수 있는 `public` 상태가 될 수 있음을 의미함과 동시에 `아직은 Public 한 상태가 아니구나` 라는것을 알 수 있다.

> 꼭 알아두어야하는것은 모든 Public IP 에 대한 접근차단을 해제시킨것 뿐이지, 
아직까지는 모든 Public IP 가 접근할 수있는 상태를 의미하는 Public 한 상태가 아니라는 것이다. 

![img_5.png](https://revi1337.github.io/posts/s3-web-host/img_5.png)

### 5. 생성된 Bucket 확인

아래 사진의 `액세스` 를 보면 `객체를 퍼블릭으로 설정할 수 있음` 이라고 나와있다.
앞서 설명한것처럼 이는 `아직까지는 Public IP 들이 접근할 수 있는 상태가 아님을 의미`한다.
또한, `객체` 라는 단어가 나오게되는데, S3 에서의 `객체` 는 S3 라는 `저장소에 올라가게되는
파일` 이라고 생각하면된다.

![img_6.png](https://revi1337.github.io/posts/s3-web-host/img_6.png)

### 6. Bucket 에 객체(File) 업로드

이제 생성된 Bucket 을 선택하면 객체(파일) 을 업로드시킬수 있는 창이나온다.
해당 창에서 `react` 나 `vue` 가 `build` 된 파일들을 업로드시켜주면 된다. 

![img_7.png](https://revi1337.github.io/posts/s3-web-host/img_7.png)

업로드할떄는 `Drag & Drop` 이 가능하며, 업로드가 완료되면 아래와같이 업로드된
`객체` 들을 확인할 수 있다.

![img_8.png](https://revi1337.github.io/posts/s3-web-host/img_8.png)

### 7. 정적 웹 사이트 호스팅 활성화

이제 업로드된 객체 중 하나를 선택해보면, 해당 객체를 확인할 수있는 URL 이 나오게된다.

![img_9.png](https://revi1337.github.io/posts/s3-web-host/img_9.png)

하지만 이 URL 을 클릭하게되면 `Access Denied` 가 발생하게된다.
이는 `정적 웹 사이트 호스팅 활성화` 설정을 해주지 않았기 때문이다.

![img_10.png](https://revi1337.github.io/posts/s3-web-host/img_10.png)

자 이제 생성한 `Bucket` 의 `속성` 탭 을 누르고

![img_11.png](https://revi1337.github.io/posts/s3-web-host/img_11.png)

제일 아래를 보면 `정적 웹 사이트 호스팅` 을 설정할 수 있는 설정 탭이나오게 된다.
여기서 편집을 눌러주면

![img_12.png](https://revi1337.github.io/posts/s3-web-host/img_12.png)

아래와같이`정적 웹 사이트 호스팅` 을 `활성화` 시켜줄 수 있는 checkbox 가 보이게 되는데,
이를 `활성화` 로 바꾸어주자. 또한, `호스팅 유형` 에는 사진에 나와있듯이 Bucket 주소를
웹 주소로 사용한다는 의미를 나타낸다.

이제 `인덱스 문서` 설정과 `오류 문서` 설정을 해주어야한다. 이 두가지 설정은 아래와같은 역할을 한다.

* `인덱스 문서` : `Bucket` 주소를 웹주소로 사용할것이기때문에 `웹 루트` 에 접근했을때 어떠한
페이지를 내려줄지 설정하는 옵션이다.
  
* `오류문서` : 오류가 발생했을때 어떠한 페이지를 내려줄지 설정이다. SPA 를 호스팅하려면 필수적으로 명시해야한다.

* `리다이렉션 규칙` : 이 설정은 `Error Status Code` 에 맞는 리다이렉션 경로를 지정해줄 수 있는 옵션이다.
Optional 하기 떄문에 명시하지 않아도 상관없다.

> 오류문서 기입은 Optional 이지만 만약 Vue, Spring 같은 SPA 의 빌드결과물을 호스팅한다면,
꼭 기입해주어야한다. 그렇지않으면, index.html 을 제외하한 나머지 라우트 주소를 요청하게되면
404 가 발생하게된다. 이점은 꼭 숙지해야한다.

![img_13.png](https://revi1337.github.io/posts/s3-web-host/img_13.png)

정상적으로 설정을 완료 후, `속성` 탭으로 다시 이동해보면 아래와같이 해당 업로드시켰던 `객체` 들에
접근할 수 있는 `URL` 가 나오게된다.

![img_14.png](https://revi1337.github.io/posts/s3-web-host/img_14.png)

하지만 이번에는 인증된 사용자지만 `권한이 부족해 터지게되는 Status Code` 인 `403 Forbidden` 이 뜨게된다.
이 이유는 접근하려는 `객체` 가 앞서 설명헀던 `퍼블릭 상태가 아직 아니기` 때문이다.

![img_15.png](https://revi1337.github.io/posts/s3-web-host/img_15.png)

### 8. Public Access 허용

바로 이전단계 에서 `403` 이 발생한 이유는 접근하려는 `객체` 가 `퍼블릭 상태가 아직 아니기` 때문이었다.
이 객체들에 접근할 수 있게 하려면`권한 설정` 을 해주어야 한다.

권한을 설정하기 전에 아래의 사진을 보자. 생성했던 `Bucket` 의 `권한` 탭으로 이동하게되면 `퍼블릭 액세스 차단` 이라는 설정 섹션을 볼 수 있다.
해당 섹션을 보면 `모든 퍼블릭 액세스 차단 : 비활성` 이라고 되어있는 것을 볼 수 있다.
이 이유는 `Bucket` 을 처음 생성할 당시 `모든 퍼블릭 액세스 차단` 이라는 옵션을 `해제` 시켰었기 때문이다.
그렇기 때문에 `Public Ip` 들이 Bucket 안의 `객체(파일)` 에 접근할 수 있게 가능성을 열어둔 것이다.

> 이제 다음 차례애 권한을 설정을 통해 Bucket 의 객체 들에 접근할 수 있게 Public 상태로 만들어줄 것인데,
방금 알아본 `모든 퍼블릭 액세스 차단` 이 활성화가 되어있다면, 권한설정을 하여도 Public Ip 들이 접근할 수 없게 된다. 

![img_16.png](https://revi1337.github.io/posts/s3-web-host/img_16.png)

아래의 사진을 보면` 권한설정` 을 할 수 있는`버킷 정책` 폼이 보인다. 해당 설정또한 `권한` 탭에 
존재하며, 해당 설정을 통해 `객체` 들에 대한 접근을 `Public 상태` 로 만들어줄 수 있다.
자 이제 편집을 눌러 권한을 설정해주자.

![img_17.png](https://revi1337.github.io/posts/s3-web-host/img_17.png)

편집을 눌러줬으면 폼에 아래의 `json` 을 복사해서 붙여넣어주자.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TestObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::revi1337/*"
    }
  ]
}
```

각 `key` 들은 아래와같은 의미를 갖는다.

* `Version` : 버킷 정책을 설정할때 사용하는 `Syntax` 버전을 명시. (2012-10-17 이 최신버전이다.)

* `Statement` : 권한들의 집합을 의미하며, 배열안에 들어오는 각각의 `JSON` 이 하나의 권한을 의미한다.

* `Statement.Sid` : 하나의 권한을 의미하는 id 를 의미하며 권한들을 구분하는 id 로 사용된다. (아무값을 설정해도 된다.)

* `Statement.Effect` : 해당 권한을 허용할지 거부할지를 결정한다. `Allow`, `Deny` 가 있다.

* `Statement.Principal` : 누구한테 적용할것인지라는 의미하며, `*` 는 모두를 의미한다.

* `Statement.Action` : 수행할 작업을 의미한다.
여기서는 `s3` 의 객체(파일)을 가져올 수 있는 의미를 갖는 `s3:GetObject` 를 설정하였다.
(Action 들의 이름은 정해져있다.) 

* `Statement.Resource` : 어떤 객체(파일)을 대상으로 지정할지를 의미한다.
여기서는 `arn:awss3:::revi1337/*` 를 사용했는데, 이는 `ARN(Amazon Resource Name)` 이 `arn:aws:s3:::revi1337` 인 `Bucket` 으로 지정하였음을 의미한다. 
그리고 해당 `Bucket` 의 모든 객체 `/*` 로 지정했다.

> 따라서 상단의 JSON 은 ARN 이 `arn:aws:s3:::revi1337` `Bucket` 의 모든 객체(파일)를 가져올 수 권한을
모두에게 허용한다는 것을 의미한다.

잘 입력하였으면 `버킷 정책` 에 설정했던 `JSON` 이 보이는것을 확인할 수 있고,
이제 업로드된 객체(파일) 중 아무거나 접근하게되면, 어떠한 에러가 뜨지않고 정적 페이지가 호스팅됨을 확인할 수 있다. 

![img_18.png](https://revi1337.github.io/posts/s3-web-host/img_18.png)

![img_19.png](https://revi1337.github.io/posts/s3-web-host/img_19.png)

### 9. 중요한점 정리

* `Block Public Access` 설정을 해제하지 않으면 권한설정을 통해 `Bucket` 의 모든 `객체` 들에 대해 접근권한을 허용하여도
  접근이 되지 않는다. 따라서 `Block Public Access` 설정을 꼭 해제해야 한다.

* SPA 를 배포할때는 `오류페이지` 설정을 꼭 해주어야한다.
