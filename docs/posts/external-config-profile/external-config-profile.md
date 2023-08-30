# Java 에서 할 수 있는 4가지 외부설정 방법과 스프링에서의 외부설정

## 1. OS 환경변수

### 기본 사용법

* OS 에서 지원하는 외부 설정방법이며, 해당 OS 를 사용하는 모든 프로세스에서 사용한다.

* 아래에서 소개될 다른 외부 설정방법들과 비교해 `사용 범위가 가장 넓다.`

* `System.getEnv()` 로 전체 OS 환경 변수를 `Map` 으로 조회 가능하다

* `System.getEnv(String key)` 로 특정 OS 환경 변수값을 String 으로 조회할 수 있다.

* 이를 응용하여 환경변수에 `Local` 과 `Product` DB URL 을 각각 설정하여 환경에 따라 서로다른 값을 읽게 할 수 있다.

![img.png](https://revi1337.github.io/posts/external-config-profile/img.png)

>  * OS 환경변수는 Java 에서뿐만아니라, 다른 프로세스에서도 사용되는 값이기때문에 전역변수와같은 느낌이 있다.
하지만 Java 를 위해 전역으로 사용되는 OS 환경변수에 값을 추가하기는 좀 그렇다.
> * 따라서, Java 시스템 속성을 사용하여 외부설정이 Java 에서만 사용할수있게 사용하는것이 바람직하다고 생각된다.

## 2. Java 시스템 속성 (Java System Properties)

### 기본 사용법

* `Java System Properties` 방법은 실행된 `JVM` 안에서 접근가능한 외부설정 방법이며, 자바 내부에서 미리 설정해두고 사용하는 속성들도 존재한다.
 
* `Java System Properties` 방법은 아래와 같은 `Format` 으로 사용되며, JAVA 프로그램을 실행할때 사용된다.

```shell
$java -Durl=dev -jar app.jar
```

* `Java System Properties` 방법으로 `key=value` 형태의 외부설정을 셋팅할때는 `key` 의 `Prefix` 에 `-D` 를 붙여주어야 한다.

*  `Java System Properties` 를 통해 외부설정을 셋팅할때는 순서에 주의해야한다. `-D` 옵션이 무조건 `-jar` 보다 앞에 위치해야 한다.

### Java 에서 제공하는 기본 Properties

* 자바에서 기본으로 제공하는 `Properties` 를 확인할 수 있다.

* `System.getProperties()` 를 통해 `Proterties` 들을 얻을 수있으며, iter 로 돌면서 `System.getProperty(String key)` 로 키에 해당하는 값을 확인할 수 있다.
`key` 는 `Object` 타입 이기때문에, String 으로 변환하여 사용해야 한다.
  
![img_1.png](https://revi1337.github.io/posts/external-config-profile/img_1.png)

### System Properties 를 추가하는 법.

* `Edit Configuration` 을 눌러주고

![img_2.png](https://revi1337.github.io/posts/external-config-profile/img_2.png)

* `$` 버튼을 눌러 `Add VM Options` 를 눌러준다. 그리고 `input` 창에 `-Durl=devdb -Dusername=dev_user -Dpassword=dev_pw` 를 작성해주면 Properties 추가가 완료된다.

![img_3.png](https://revi1337.github.io/posts/external-config-profile/img_3.png)

* 이제 설정했던 Property 들을 확인해볼수 있는 코드를 작성 후, 실행해보면 설정했던 `Property` 정보가 출력됨을 볼 수 있다.

![img_4.png](https://revi1337.github.io/posts/external-config-profile/img_4.png)

* 추가적으로 jar 파일을 실행할때도 마찬가지로 -D Flag 를 주고 실행하면 된다.

`java -Durl=devdb -Dusername=dev_user -Dpassword=dev_pw -jar app.jar`

### System Properties 를 자바 코드로 설정 

* 자바 시스템 속성은 `-D` Flag 를 주어 `실행 시점에 전달해주는것도 가능`하고 `자바 코드 내부에서 추가하는 것도 가능`하다.

* `System.setProperty("dummyProperty", "dummy");` 를 통해 `Property` 를 설정가능하고, 동일하게 `System.getProperty(String key)` 로 설정했는 `Property` 값을 가져올 수 있다.

![img_5.png](https://revi1337.github.io/posts/external-config-profile/img_5.png)

> * 참고로 Java System Properties 를 자바 코드로 직접 설정하는 방법은 설정을 외부로 분리하는 효과는 없다.

## 3. 자바 커맨드라인 인수

### 기본 사용법

* 자바 커맨드라인 인수라고 불리우는 `Command line arguments` 방법은 애플리케이션 실행 시점에 외부 설정값을 `main(args)` 메서드의 `args` 파라미터로 전달하는 방법이다.

* `args` 에 전달할 데이터를 제일 마지막에 `공백으로 구분해서 전달`해주는게 끝이다.

* 현재는 cli 환경에서 직접 java 를 실행하여 공백을 기준으로 `asdf` 와 `asdf` 이라는 값을 넣어주었지만, `Java System Properties` 때와 마찬가지로 `Edit Configurations` 탭에서 설정해서 사용해도 된다.

![img_6.png](https://revi1337.github.io/posts/external-config-profile/img_6.png)

### 그렇다면 key=value 형태는?

* 아쉽게도.. 자바 커맨드라인 인수 방법에서는 `key=value` 형태를 값을 입력해주려면 `=` 를 기준을 직접 파싱해주어야 한다.

![img_8.png](https://revi1337.github.io/posts/external-config-profile/img_8.png)
  
* 만약 파싱해주지 않으면 `key=value` 라는 값이 `String` 그자체로 들어가게된다.

![img_7.png](https://revi1337.github.io/posts/external-config-profile/img_7.png)

## 4. 스프링에서 제공하는 커맨드 라인 옵션 인수

* 앞서 말한 `커맨드라인 인수`는 따로 `format` 이 따로 없고, `공백을 기준`으로 설정값을 구분헀다. 또한, `key=value` 와 같은 형태를 지원하지 않기 때문에 직접 파싱해주어야하는 번거로움이 있었다.

* 이 때문에 `Spring` 에서는 `커맨드 라인 옵션 인수` 라는 것을 지원하는데 해당 방법을 사용하게 되면 `key=value` 와 같은 형태도 자동으로 파싱해준다.
  
* `커맨드 라인 옵션 인수` 는 `-` 가 2개인 `--` 로 시작해 `--key=value` 의 형태를 갖으며, 하나의 `key` 에 여러개의 값을 지정할 수 있다.

### 기본 사용법

*  `DefaultApplicationArguments` 객체는 매개변수로 들어온 `args` 를 파싱해주는 객체이다.

* `.getSourceArgs()` 메서드는 파싱 이전의 `args` 의 값을 보여준다. 리턴값이 `Array` 이기때문에 `List` 로 감싸거나 `Arrays.toString` 을 사용해야 한다.

* `.getNonOptionArgs()` 메서드는 `prefix` 로 `--` 가 붙지않은 옵션을 출력해준다. (커맨드라인 옵션 인수가 아닌것을 출력해주는것을 의미한다.)

* `getOptionNames()` 메서드는 커랜드라인 옵션 인수들을 파싱하여 `Key 들을 반환` 한다. (prefix 에 -- 가 붙지않은 설정은 파싱이 되지 해당 메서드에서 반환되지 않는다.)

![img_9.png](https://revi1337.github.io/posts/external-config-profile/img_9.png)

* `.getOptionValues(KEY)` 메서드를 통해 `args` 를 파싱하여 `key` 를 기준으로 `value` 를 꺼내어 볼 수 있다.

![img_10.png](https://revi1337.github.io/posts/external-config-profile/img_10.png)

* 하지만, `커맨드 라인 옵션 인수` 가 아닌 것은 파싱할수 없어 `null` 이 출력된다.

![img_11.png](https://revi1337.github.io/posts/external-config-profile/img_11.png)

### 어디서든 사용 가능한 커맨드라인 옵션 인수

* 스프링 부트는 `DefaultApplicationArguments` 의 인터페이스인 `ApplicationArguments` 를 `Bean` 으로 등록해주기 때문에 해당 Bean 을 주입받으면 어디서든 사용할 수 있다.

* 의존성 주입이 완료되면 호출되는 `@PostConstruct` 를 통해 `커맨드라인 옵션 인수` 에 들어온 설정값들을 확인해보자.

![img_13.png](https://revi1337.github.io/posts/external-config-profile/img_13.png)

* `Program Arguments` 설정을 통해 아래와같이 `prefix` 로 `--` 를 주고 username 과 password 에 대한 설정을 셋팅하고 Application 을 run 시켜주면

![img_12.png](https://revi1337.github.io/posts/external-config-profile/img_12.png)

* 아래와같이 주입된 `ApplicationArguments` 통해 `args` 를 확인해볼수있다.

![img_14.png](https://revi1337.github.io/posts/external-config-profile/img_14.png)

## 5. Environment 주입받아 사용

[//]: # (## 5. 스프링 통합 &#40;Environment&#41;)

* 지금까지 `OS 환경변수` `Java System Properties`, `커맨드라인 인수`, `커맨드라인 옵션 인수` 를 사용해 외부 설정을 읽는법을 알아보았다.
생각해보면`커맨드라인 인수` 방법만 제외하면, 나머지 3가지 방법 모두 `key=value` 형태를 지원하지만 각 방법마다 코드가 다 상이했다.

* 개발자입장에서는 모두 `key=value` 형태의 설정값을 읽어오는것일뿐인데 그 값들을 읽어오는 코드는 모두 다르기 때문에 불편함을 느낄 수 있다.
또한, 만약 프로젝트를 하다가 외부설정을 읽어오는 방법이 바뀌게되면 `key=value` 와 같은 형태의 외부설정을 갖고오는 코드를 변경해야하는 문제가 생기기도 한다.

그래서 `Spring` 은  `Environment` 인터페이스와 `PropertySource` 라는 추상 클래스를 통해 이러한 `key=value` 와 같은 설정을 읽어오는 과정을 추상화시켜 앞서 설명한 번거로움을 해결한다.

`Spring` 은  `OS 환경변수` `Java System Properties`, `커맨드라인 옵션 인수` 와 같이 각각의 외부설정을 조회하는 
`PropertySource` 추상클래스의 구현체들을 `XXPropertySource` 이름으로 미리 다 만들어두었으며,
`Environment` 를 통해서 특정 외부 설정에 종속되지 않고, 일관성있게 `key=value` 포맷의 외부설정을 읽어오게 지원한다.
또한 여기서 그치지 않고 `Environment` 를 `Bean` 으로 등록시켜 어디서든 외부설정을 읽을수있게 지원한다. 

> * 결과적으로 `environment.getProperty(KEY)` 를 통해 내부적으로 여러 과정을 거져 `PropertySource` 에 접근하여 설정을 조회할 수 있게된다. 
> * 어디서든 `Environment` 를 주입받으면 외부설정을 읽어올 수 있다. 

아래 사진은 `PropertySource` 추상클래스의 구현체를 만들때 오버라이딩해야하는 `getProperty()` 추상메서드이다.

![img_19.png](https://revi1337.github.io/posts/external-config-profile/img_19.png)

그리고 아래사진은 `PropertySource` 추상클래스의 구현체들중 하나인 `CommandLinePropertySource` 클래스인데, `getProperty` 추상메서드를 오버라딩하여 
사용하고 있다. (낯이있는 메서드들이 보인다.)

![img_20.png](https://revi1337.github.io/posts/external-config-profile/img_20.png)

하여튼 스프링은 로딩 시점에 필요한 `PropertySource` 들을 생성하고 `Environment` 에서 사용할 수 있게 연결해두었다.
결과적으로 `Environment` 를 사용하면 `OS 환경변수`, `Java System Properties`, `커맨드라인 옵션 인수` 가릴 것 없이 동일하게 오버라이딩한 `getProperty()` 메서드로 기존의 코드를 변경하지않고 외부설정을 갖고올수 있게된다.

### 커맨드라인 옵션 인수로 사용 시 

`커맨드라인 옵션 인수` 방법을 사용하면 `PropertySource` 구현체로 `CommandLinePropertySource` 가 사용된다.

* `Program arguments` 설정 후 애플리케이션을 실행하면

![img_15.png](https://revi1337.github.io/posts/external-config-profile/img_15.png)

* `key=value` 형태의 값을 가져올 수 있다.

![img_16.png](https://revi1337.github.io/posts/external-config-profile/img_16.png)

### Java System Properties 사용 시

`Java System Properties` 을 사용하면 `PropertySource` 구현체로 `PropertiesPropertySource` 가 사용된다.

* VM Options 설정 후 애플리케이션을 실행하면

![img_17.png](https://revi1337.github.io/posts/external-config-profile/img_17.png)

* `key=value` 형태의 값을 가져올 수 있다.

![img_18.png](https://revi1337.github.io/posts/external-config-profile/img_18.png)

> 이 결과를 보면 하나로 커맨드라인옵션인수이든 Java System Properties 이든 `Environment` 하나로 특정 외부설정에 종속되지 않고 `key=value` 형태의 외부설정을 갖고올 수 있음을 확인할 수 있다.

### 외부설정방법 중 두가지 이상 같이 사용하면? (우선순위)

* 만약 `커맨드라인 옵션인수`와 `Java System Properties` 를 중복 설정하면 어떤설정이 우선시되어질까?

* 아래와같이 중복설정 후 애플리케이션을 실행해주면

![img_21.png](https://revi1337.github.io/posts/external-config-profile/img_21.png)

* `커맨드라인 옵션인수` 가 우선시되는것을 확인할 수 있다.

![img_22.png](https://revi1337.github.io/posts/external-config-profile/img_22.png)

> * 우선순위는 대체로 넓은 범위보다 좁은 범위의 설정이 더 우선시된다는 것만 기억하면 된다.
`커맨드라인 옵션인수` 는 Spring 에서 사용하는 설정이지만, `Java System Properties` 는 JVM 에서 사용하는 설정이다.
그렇기 때문에 범위가 더 좁은 `커맨드라인 옵션인수` 가 우선순위를 갖는다고 생각하면된다.

## 6. 설정 데이터

### 외부에 위치한 파일 참조

* 지금까지 알아본 `OS 환경변수`, `자바 시스템 속성`, `커맨드라인 옵션 인수` 는 사용해야 하는 값이 늘어날수록 유지보수도 힘들고 사용하기 불편해진다. 
그래서 등장한 대안이 `설정값을 파일에 넣어서 관리하는 방법` 이다.
  
* 예를 들면 아래의 코드블럭들과 같이 개발서버와 운영서버 동일한 위치에 각각 `application.properties` 파일(혹은 yml)을 설정하고,
애플리케이션 로딩 시점에 해당 설정파일을 읽어들여 그 값을 외부설정값으로 사용하면 된다.

> 여기서 말하는 application.properties 는 프로젝트 생성 시 resources 하위에 자동으로 생기는 파일을 말하는것이 아닌, 별도로 설정하는 properties 파일을 의미한다. 

*개발 서버에 있는 외부 파일*

```properties
url=dev.db.com
username=dev_user
password=dev_pw
```

*운영서버에 있는 외부 파일*

```properties
url=prod.db.com
username=prod_user
password=prod_pw
```

* 원래라면 프로젝트 루트 밖에 존재하는 이러한 외부 설정파일을 직접 읽어야겠지만, `SpringBoot` 는 외부설정파일인 `application.properties` 를 읽어 설정값으로 지정하는 것을 이미 구현해두었다.

* 그러면 스프링이 해당 파일을 읽어서 사용할 수 있는 `PropertySource` 를 제공한다. 당연하게도 해당 설정도 `Environment` 로 조회할 수 있다.

* 우선 프로젝트를 `build` 하고 output 파일인 `.jar` 파일이 있는 곳에 `application.properties` 파일을 만들고 설정한다.

![img_23.png](https://revi1337.github.io/posts/external-config-profile/img_23.png)

* 이렇게 빌드파일이 위치된 경로에 `application.properties` 파일을 만들어 설정해두면 잘 읽어들이는 것을 확인 가능하다.

![img_24.png](https://revi1337.github.io/posts/external-config-profile/img_24.png)

> 하지만 이러한 방법도 서버가 많아지면 서버의 설정파일을 모두 변경해야하는 번거로움이 존재한다.

### 내부 파일 분리

* `SpringBoot` 는 `설정파일`을 `프로젝트 내부에 포함` 시켜 빌드시점에 함께 빌드되게 하는 방법을 제공한다.
  **한마디로 `jar` 파일 하나로 설정 데이터까지 포함해서 관리하는 방법이다.**
  
* 이러한 방법으로 설정데이터를 관리하면 `dev` 환경에서는 프로젝트내부에서 `어떤설정파일` 을 읽게하고, `prod` 환경에서는 프로젝트내부에서 `어떤설정파일` 읽게 시킬수 있다.

*예를 들면 `외부설정값`으로 `dev` 라는 값이 들어오면 프로젝트 내부에서 `application-dev.properties` 를 읽게하고
`prod` 라는 값이 들어오면 `application-prod.properties` 값을 읽게 시키는 것이다.*

> * 이렇게 Spring 에서는 환경에따라 다른 내부설정파일을 읽게할 수 있는데 이 환경을 `프로필(Profile)` 이라고 한다.
> * 스프링은 `spring.profiles.active` 이라는 외부설정값이 있으면 해당값을 이름으로하는 `프로필(Profile)`을 사용한다고 판단한다.
> * 스프링은 이미 설정 데이터를 내부파일로 분리해주었고, `spring.profiles.active` 이름의 외부 설정값으로 들어온 `Profile` 따라 내부적으로 다른 파일을 읽는 방법을 다 구현해두었다.
> * 참고로 스프링이 프로필에 따라서 읽어들이는 내부설정파일의 네이밍 규칙은 `application-{profile}.properties` 형태이다.

#### 내부 파일 분리 [EXAMPLE]

* 프로젝트 생성시 자동으로 생성되는 `application.properties` 파일과 동일한 위치에
`application-dev.properties` 와 `application-prod.properties` 파일을 만든다. 
  
![img_25.png](https://revi1337.github.io/posts/external-config-profile/img_25.png)

* 이제 `커맨드 라인 옵션 인수` 방식을 사용해서 외부설정값으로 `spring.profiles.active=dev` 이라는 값을 주어 애플리케이션을 실행시키면

> spring.profiles.active=dev 이라는 외부설정을 줄때는 OS 환경변수방식, 커맨드 라인 옵션 인수 방식, 자바 시스템 속성 방식 모두 사용 가능하다.  

![img_26.png](https://revi1337.github.io/posts/external-config-profile/img_26.png)

* 스프링은 실행된 프로필이 `dev` 로 판단하여 내부 설정파일인 `application-dev.properties` 읽어들인다.
드래그 한 부분을 보면, 현재 `dev` 프로필이 활성화되어있다고 나와있다.

![img_27.png](https://revi1337.github.io/posts/external-config-profile/img_27.png)

* 이번에는 프로젝트 빌드 후, 외부설정 `spring.profiles.active` 의 값으로 `prod` 을 주면, 스프링은 실행환경(Profile) 이 `prod` 프로필이라는 것을 인지하고
`application-prod.properties` 읽어들인다. 아래사진을 보면 `prod` 프로필이 활성화됬다는 로그를 볼 수 있으며
정상적으로 `application-prod.properties` 파일을 읽어왔음을 확인 가능하다.

![img_28.png](https://revi1337.github.io/posts/external-config-profile/img_28.png)

**이러한 방법으로 설정파일도 프로젝트안에서 함꼐 관리할수 있게 되었고, 배포 시점에 설정정보도 함께 배포시킬 수 있다.**

> * 하지만 설정 파일을 각각 분리해서 관리하면 한눈에 전체가 들어오지 않는 단점같이 않은 단점이 있다.

### 내부 파일 합체

* `Spring Boot` 는 앞서 설명했듯이 프로젝트 내부에 `Profile` 마다 사용하는 설정데이터 파일을 `application-{profile}.properties` 포맷으로 만들어 관리할수도 있지만,
`Profile` 마다 사용할 설정을 하나의 `properties` 파일에서 관리할 수 있도록하는 기능도 지원한다.

* 정확히 말하자면 `하나의 물리적인 하나의 파일 안` 에서 각 Profile 들을 구분할 수 있는 `논리적인 구분자` 를 사용해 
`Profile` 환경에 따라 사용되는 설정데이터를 셋팅할 수 있다.

> * 결과적으로 이 방법을 통해서 하나의 설정파일에서 다수개의 `Profile(파일)` 을 설정할 수 있다.

#### 내부 파일 합체 [EXAMPLE]

1. 첫번째로 `dev` 프로필 내부설정파일과 `prod` 프로필 내부설정파일을 하나의 `application.properties` 파일에 합친다.

2. 두번째로 `#---` 구분자 혹은 `!---` 를 프로필 설정정보들 사이에 넣어준다. 여기서 `#---` 혹은 `!---` 는 하나의 파일에서 다수개의 `Profile` 을 구분 및 설정할수 있는 구분자이다.

3. 세번째로 각 프로필의 상단에 `spring.config.activate.on-profile=프로필` 을 설정해준다.
이는 활성화되는 프로필에따라 사용되는 데이터가 변경되는 역할을 해준다. 만약, `dev` 프로필이 활성화되면 상단의 데이터들이 사용되게 된다.

4. 마지막으로 `spring.profiles.active=dev` 와 같이 외부설정값을 주고 애플리케이션을 실행해주면 `dev` 프로필이 활성화되어
그에 맞는 설정정보가 사용되게 된다.

> * .yaml 파일에서는 --- 를 쓰면 되고, .properties 에서는  #--- 혹은 !--- 를 사용해야 한다.

![img_29.png](https://revi1337.github.io/posts/external-config-profile/img_29.png)
   
#### 주의사항

*  속성 파일 구분 기호에는 선행 공백이 없어야 하며 정확히 3개의 하이픈 문자가 있어야 한다.

*  구분 기호 바로 앞과 뒤의 줄은 같은 주석 접두사가 아니어야 한다.

*  파일을 분할하는 구분자인 `#---` 위에는 주석을 적으면 안된다.

#### 외부설정으로 어떠한 Profile 도 넘겨주지 않으면?

* 외부설정으로 어떠한 `Profile` 값을 넘겨주지않으면 `default` 라는 이름의 프로필이 활성화되게 된다.

* 당연히 log 에는 null 이 출력되게 된다.

![img_30.png](https://revi1337.github.io/posts/external-config-profile/img_30.png)

* 이를 위해 스프링은 `spring.confing.activate.on-profile=프로필` 을 명시하지 않은 부분은 자동으로 `default` 프로필로 설정하게된다.

![img_32.png](https://revi1337.github.io/posts/external-config-profile/img_32.png)

* 어떠한 `Profile` 도 설정하지않고 애플리케이션을 실행하면 

![img_33.png](https://revi1337.github.io/posts/external-config-profile/img_33.png)

* `default` 프로필이 활성화됨을 확인할수 있고, `default` 프로필 설정들이 잘 읽힌것을 확인 가능하다.

![img_34.png](https://revi1337.github.io/posts/external-config-profile/img_34.png)

#### 우선순위 [매우중요]

 `default 프로필` 설정값은 Profile 을 설정하던 안하던 `무조건 읽히는 값`이다.
또한, Spring 은 설정 문서를 읽을때 `위에서 아래방향으로 순서대로 읽으면서 기존의 데이터를 덮어쓰는 방식`으로 동작한다.
따라서 이는 default 값과 dev 값을 한나의 파일에 설정해도, `default 설정이 dev 설정보다 아래에 있으면` 
외부설정값으로 dev 를 넘겨주어도 `default 프로필의 값으로 overwrite` 된다는 의미이다.

* 아래 사진을 보면 `Profile` 을 설정하는데 `default` 프로필의 설정값들이 `dev` 프로필 설정값보다 아래에 위치해 있다.

![img_35.png](https://revi1337.github.io/posts/external-config-profile/img_35.png)

* 이제 `커맨드라인 옵션 인수` 방법으로 외부설정으로 `Profile` 을 `dev` 로 주고 애플리케이션을 실행시키면

![img_36.png](https://revi1337.github.io/posts/external-config-profile/img_36.png)

* 활성화된 profile 은 `dev` 라고 뜨지만, 정작 읽어들인 설정값은 `default` 프로필값인것을 확인할 수 있다.
**이는 설정파일을 위에서 아래로읽는다는 의미이고 default 프로필값은 프로필을 설정하든 안하든 무조건 읽어들인다는 것이다.**

![img_37.png](https://revi1337.github.io/posts/external-config-profile/img_37.png)