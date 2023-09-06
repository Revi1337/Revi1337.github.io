### I. IAM 이란

IAM(Identity and Access Management) 는 `사용자들에 대한 관리가 주된 목적` 이며
다른 서비스들을 쓰기 앞서 필수로 알고있어야 서비스이다. IAM 을 풀어서 설명하면 유저를
관리하고 `접근 레벨` 및 `권한` 에 대한 관리를 할 수 있는 서비스를 말한다.

### II. IAM 의 기능

`IAM` 에서 제공하는 기능은 아래와 같다.

#### 1. 접근키, 비밀키 부여

AWS 에 계정을 만들게 되면, 그 계정은 `Root` 유저가 되고, 또 다른 유저를 생성할 수 있게 된다.
만약 Root 유저 안에서 또 다른 사용자인 `A 유저` 를 만들었다고 치면, `IAM` 은 유저 A 에게 `접근키(Access Key)` 와 `비밀키(Secret Access Key)` 를 생성하여 부여해주게되는데
그렇게 되면, `유저 A` 는 이 키들을 가지고 AWS 의 다양한 서비스들을 사용할 수 있게 되는것이다.

> `접근키(Access Key)` 와 `비밀키(Secret Access Key)` CLI 혹은 API 를 통해 AWS 서비스를 원격에서 사용할 수 있게 해줌을 의미한다.

#### 2. 매우 세밀한 접근 권한 부여 가능 (Granular Permission)

또한, `IAM` 은 매우 세밀한 접근 권한 부여 기능을 제공한다. 예를 들어 `DynamoDB` 라는 DB 서비스를 사용한다고 하자.
DB 이면 테이블 의 생성, 삭제, 복사같은 세부적인 기능들이 있을텐데, 이러한 기능들을 `접근 권한` 을 통해 혹은 불가능케 할 수있음을 의미한다.

#### 3. 비밀번호를 수시로 변경 가능

해당 기능은 `한달` 혹은 `분기별`로 한번씩 모든 AWS 의 사용자들의 비밀번호 업데이트를 `강제함` 을 의미한다.
순전히 그냥 보안적인 이유이다.

#### 4. Multi-Factor Authentication (다중 인증) 가능

해당 기능은 AWS 에 로그인할때 `단순히 비밀번호만 치고 들어오는 것`이 아닌, 구글, 페이스북과 같은 다른 계정으로
인증을 요구함으로서 보안을 더욱 강화하는것을 의미한다.

> 특히 Root 유저는 MFA 를 적극 권장하고 있다.

### III. Root 유저의 기능

`Root 유저` 는 새로운 유저뿐만 아니라, 더욱 많은것을 생성할 수 있다.
대표적으로 `그룹`, `유저`, `역할`, `정책` 이 있다.

1. 그룹 (Group) : 단일 유저 혹은 다수의 유저가 존재할 수 있는 그룹을 의미한다.
2. 유저 (User) : 말그대로 Root 로부터 생성된 사용자이다.
3. 역할 (Role) : 유저와 의미는 비슷하지만, 역할은 `하나 혹은 다수의 정책`을 추가 및 적용시킬 수 있다. 
그렇기 때문에, 유저마다 다양한 정책을 부여함으로서 `Full Access` 를 줄 것이나 `일부만 줄 것이냐` 등의 다른 권한들을 위임할 수 있다
4. 정책 (Policy) : `JSON 형태의 document` 를 가리키며, 세밀한 접근권한을 일일히 설정하여 하나의 정책 docs 를 만들 수 있다.
따라서 다양한 정책을 만들어 다양한 접근레벨 및 권한이 가능해진다.

> 정책은 `그룹`, `역할`에 추가시킬 수 있으며, 하나의 그룹 안에 다수의 유저가 존재 가능하다.
따라서 그룹에 역할 혹은 정책을 추가시키게 된다면, 해당 그룹 안에 있는 모든 유저들에게 영향이 간다는 의미이다.

따라서 다양한 정책을 만들어, 다양한 접근레벨 및 권한이 가능해지는 것이다.

### IV. IAM Simulator 를 통한 정책 테스트

#### 1. IAM 대시보드 접속
 
* AWS 콘솔을 통해 IAM 검색 및 선택하여 `IAM 대시보드`로 접근한다.

![img.png](https://revi1337.github.io/posts/docker-image/img.png)

#### 2. 사용자 추가

* `IAM 대시보드`에서 AWS 를 사용하는 유저정보가 있는 `액세스관리 > 사용자` 탭으로 들어온다.

* 기존에 나와있는 사용자는 루트 유저이다.

![img_1.png](https://revi1337.github.io/posts/docker-image/img_1.png)

* 이제 `사용자 생성` 을 눌러 사용자를 새로만들어주자.

* 이제 `사용자 이름` 을 설정해주고 `사용자 유형` 을 선택해주어야 한다.
`AWS Management Console에 대한 사용자 액세스 권한 제공 ` 를 선택해주고
`IAM 사용자를 생성하고 싶음` 를 선택해주고 넘어가준다.

![img_2.png](https://revi1337.github.io/posts/docker-image/img_2.png)

* 이제 그룹을 생성하여 그 그룹에 넣을지, 아니면 기존 그룹에 넣을지 선택하는 창이 나오게 된다.
일단 아무것도 선택하지 말고 넘어가자.

![img_3.png](https://revi1337.github.io/posts/docker-image/img_3.png)

* 이제 태그를 추가하라고하는데 별로 중요치 않으니 스킵하고 `사용자를 생성` 해준다.

> * 여기서 `태그` 는 `생성하는 유저를 더 간편하게 검색하기 위한 방법` 을 의미한다. 별 중요치않으니 스킵해도 된다.

![img_4.png](https://revi1337.github.io/posts/docker-image/img_4.png)

* 이제 사용자 생성이 완료되었으므로, `콘솔 암호` 를 꼭 기억해두자. 이 창을 넘어가면 두번다시 볼 수 없다.

![img_5.png](https://revi1337.github.io/posts/docker-image/img_5.png)

#### 3. Access Key 생성

* 이제 AccessKey 를 만들어주어야 한다.

* `액세스 관리 > 사용자` 탭에서 방금 만든 사용자를 누른 후, `액세스 키 만들기` 를 선택해준다.

![img_28.png](https://revi1337.github.io/posts/docker-image/img_28.png)

> * `IAM Simulator` 를 통해 정책을 테스트할때는 사용되지않지만, 나중에 `IAM` 에서 생성된 다른 사용자를 통해 다른 서비스를 사용할 경우
필요하다.

* 아래와 같이 `AWS 컴퓨팅 서비스에서 실행되는 애플리케이션` 을 선택하고, 사진 하단의 체크박스를 체크하고 액세스키를 만들어주고 넘어가자.

![img_29.png](https://revi1337.github.io/posts/docker-image/img_29.png)

* 이제 태그를 설정할수 있는 창이 나오는데 이건 중요하지 않으니 넘어가고 `액세스 키 만들기` 를 눌러준다.

![img_30.png](https://revi1337.github.io/posts/docker-image/img_30.png)

* 여기서 나오는 `비밀 액세스 키` 는 꼭 어딘가 복사해놓아야한다. 이 창을 넘어가면 두번다시 볼 수 없다. 

![img_31.png](https://revi1337.github.io/posts/docker-image/img_31.png)

* 이제 다시 `액세스 관리 > 사용자` 탭에서 생성한 사용자 정보에 들어가면 액세스키가 만들어진 것을 확인할수 있다.

![img_32.png](https://revi1337.github.io/posts/docker-image/img_32.png)

#### 4. 그룹 생성

* 이제 `액세스관리 > 사용자 그룹` 탭으로 넘어와서 `그룹 생성` 을 선택해준다.

* 그리고 사용자 그룹 이름을 지정해준다.

![img_6.png](https://revi1337.github.io/posts/docker-image/img_6.png)

* 이제 그룹에 넣을 사용자를 선택할 수 있는 `그룹 이름 지정` 창이 나온다.

* 루트사용자와 이전단계에서 생성한 사용자가 보이지만 일단 넘어가준다.

![img_7.png](https://revi1337.github.io/posts/docker-image/img_7.png)

* 이제 `권한 정책 연결` 이라는 항목이 나오게 된다.
  
* `생성할 그룹`에 `정책을 추가` 하게되면, 그룹에 들어있는 모든 사용자들이 영향을 받게 된다. 

* 하지만, 이것 또한 선택사항이기 때문에 넘어가주고 그룹을 생성해준다. 

> * 우린 `사용자 그룹`만 만들어주었을 뿐, 어떠한 정책을 넣지 않았다.

![img_8.png](https://revi1337.github.io/posts/docker-image/img_8.png)

* 생성한 그룹을 보면, 현재 그룹내부 사용자는 0명이고, 어떠한 권한도 설정되어있지 않은것을 볼 수 있다.

![img_33.png](https://revi1337.github.io/posts/docker-image/img_33.png)

#### 5. 생성한 그룹에 사용자 추가

* 이제 `액세스 관리 > 사용자` 로 돌아와서 생성했던 사용자를 선택해준 후, `그룹` 탭을 눌러 
해당 사용자를 방금 만든 `aws_learner_group` 이라는 그룹의 구성원으로 만들어준다.

* 아래와 같이 `그룹` 탭으로 이동하여 `그룹에 사용자 추가` 를 누른 후

![img_35.png](https://revi1337.github.io/posts/docker-image/img_35.png)

* 아래와 같이 그룹을 선택해주고 `그룹에 사용자 추가` 를 눌러주면 해당 사용자는 `aws_learner_group` 의 구성원이 된다.

![img_9.png](https://revi1337.github.io/posts/docker-image/img_9.png)

* 이제 다시 `액세스 관리 > 사용자 그룹` 탭으로 돌아오게 되면, 생성했던 급루에 사용자가 `1` 로 늘어난것을 볼 수 있다.

![img_10.png](https://revi1337.github.io/posts/docker-image/img_10.png)

#### 6. 정책 구성

직접 정책을 만들어 역할을 추가할 수 있음.

* 정책을 생성하는 방법에는 원하는 서비스를 직접 선택하는 `시각적 편집기` 와 `JSON` 을 직접 입력하는 방식이 있다.

* `시각적 편집기` 가 훨씬 직관적이기 때문에 해당 방법을 사용하겠다.

* 우선 `액세스 관리 > 정책` 탭으로 들어와 `정책 생성` 버튼을 눌러준다.

> * 기존의 정책을 적용시킬수도 있지만, 직접 정책을 만들어 적용시킬 수 있다. 해당 방법은 직접 정책을 만드는 방법이다. 

![img_13.png](https://revi1337.github.io/posts/docker-image/img_13.png)

* `권한 지정` 창이 나오게 되는데 `서비스 선택` 에서 `DynamoDB` 를 검색하여 선택해주고
  
![img_14.png](https://revi1337.github.io/posts/docker-image/img_14.png)

* 우리는 `DynamoDB` 의 읽기와 쓰기에만 관심있다 가정하고 `액세스 수준`에 `읽기`, `쓰기` 를 선택해준다.
각 액세스 수준에는 숫자가 쓰여져있는데, 이 숫자들은 AWS 에서 서비스를 만들어낼때마다 그에 대한 정책들이 새롭게 생겨나는 것이기 때문에
해당 숫자는 가변적이다.

* 또한, `리소스` 에 `특정` 을 선택할지 `모두` 를 선택해주어야 한다.
리소스는 선택했던 DynamoDB 에서만 제공하는 `고유의 기능`들을 의미하며 정책을 특정 리소스에만 부여할지 아닐지를 정할 수 있다.
우리는 편의상 `모두` 를 선택해준다.

![img_15.png](https://revi1337.github.io/posts/docker-image/img_15.png)

* 이제 `검토 및 생성` 창이 나오게 되는데 해당 창에서 `정책의 이름` 을 설정해주고, `정책을 생성` 해준다.

![img_16.png](https://revi1337.github.io/posts/docker-image/img_16.png)

* 이제 다시 `액세스 관리 > 정책` 탭으로 이동해서 정책을 검색해보면 생성한 정책이 잘 검색되는것을 확인할 수 있으며

![img_17.png](https://revi1337.github.io/posts/docker-image/img_17.png)

* 생성했던 `정책` 에 맞는 `JSON` 이 생성된것을 확인할 수 있다.

![img_18.png](https://revi1337.github.io/posts/docker-image/img_18.png)

#### 7. 정책 Simulator 를 통해 정책 테스트

* 정책을 만들어줬으니, 정책 Simulator 를 통해 정책을 테스트해보자. `IAM 대시보드` 의 오른쪽 하단 `도구` 창에서
`정책 시뮬레이터` 버튼을 눌러준다.

![img_19.png](https://revi1337.github.io/posts/docker-image/img_19.png)

* 생생했던 사용자 를 선택해주면 아래와 같이 `현재 사용자에 활성화된 정책` 이 보인다.

* `IAMUserChangePassword` 정책 사용자를 생성할때 추가된 정책이기때문에 일단 무시해도 된다.

![img_20.png](https://revi1337.github.io/posts/docker-image/img_20.png)

* 이제 `Policy Simulator` 에서 `DynamoDB` 를 검색하여 선택해주고 `Select All` 을 눌러준다.
  `Select All` 은 `DynamoDB` 에서 지원하는 모든 기능을 선택 및 테스트 하겠다는 의미이다.

* 그리고 `Run Simulation` 을 눌러 테스트를 실행시켜주자. 과연 생성했던 사용자는 `DynamoDB` 에 대해 어떤 기능을 테스트할 수 있을까?

![img_21.png](https://revi1337.github.io/posts/docker-image/img_21.png)

* 아래 사진을 보면 모든 기능에 대해 `denied` 가 발생한 것을 볼 수 있다. 이전에 생성했던 `정책` 을  추가해주지 않아서 그렇다.

![img_22.png](https://revi1337.github.io/posts/docker-image/img_22.png)

* 이제 생성했던 `정책` 을 사용자에게 적용시켜 테스트해보자.

* `액세스 관리 > 정책` 탭으로 이동해서 이전에 생성하였던 정책을 누른 후,

![img_23.png](https://revi1337.github.io/posts/docker-image/img_23.png)

* `연결된 개체` 를 선택하여 생성했던 사용자를 선택하여 해당 사용자에 정책을 적용시켜준다.

![img_24.png](https://revi1337.github.io/posts/docker-image/img_24.png)

* 이제 다시 `Policy Simulator` 창으로 돌아와보면, 방금 추가했던 `정책` 이 잘 적용된 것을 확인할 수 있다.

![img_25.png](https://revi1337.github.io/posts/docker-image/img_25.png)

* 이제 다시 `DynamoDB` 의 모든 `Actions` 들에 대해 정책 테스트를 실행해보면,
`읽기`, `쓰기` 와 관련된 기능들이 `allowed` 되는것을 확인할 수 있다.

![img_26.png](https://revi1337.github.io/posts/docker-image/img_26.png)

이러한 Flow 로 사용자에게 적용된 `정책` 들을 `정책 Simulator` 로 테스트해볼 수 있다.
