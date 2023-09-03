스프링에서 `key=value` 형태의 외부설정을 설정하는 방법에는 아래와같은 방법들이 있었다.

1. 설정 데이터 (application.properties, 혹은 application.yml)

2. OS 환경변수

3. Java System Property (자바 시스템 속성)

4. 스프링에서 제공하는 커맨드라인 옵션인수

바로 이전에는 글에서는 `Environment` 를 통해 외부설정을 조회하고 사용하는법에 대해 포스팅했었다.
하지만, `Environment` 를 통해 외부설정을 사용할때는 매번 `getProperty(key)` 를 통해 설정값을 찾아와야 한다는 번거로운점이 있었다.
하지만, `Spring Boot` 에서는 이러한 번거움을 해소하기위해 `@Value` 어노테이션을 제공한다.

따라서 해당 포스팅에서는
`@Value` 어노테이션을 통해 이러한 외부설정들을 더욱 편리하게 조회하고 사용하는 방법을 소개하고자 한다.

### 1. yml 에 외부설정 세팅

* 아래 사진과 같이 `yml` 에 외부설정값을 셋팅해준다.
* 설정한 값들은 `env.values` 라는 `prefix` 를 갖고있음을 확인해 두자.

![img.png](https://revi1337.github.io/posts/value/img.png)

### 2. 외부설정에 대응하는 클래스 생성

* 이제 `yml` 에 셋팅한 설정과 대응하는 클래스인 `SqlConfigData` 를 생성해준다. 생성한 클래스의 `Field` 에는
  `yml` 에 설정하였던 prefix 를 제외한 `key` 들을 따라 생성해주면 된다.

* 해당과정까지는 `Environment` 를 사용했을때와 다른점이 없어보인다. 하지만 다음 step 부터 다른점이 생기게된다.

![img_1.png](https://revi1337.github.io/posts/value/img_1.png)

### 3. @Value 를 통해 외부설정을 주입받고 클래스 파일을 Bean 으로 등록 

* 이제 `SqlConfigData` 를 Bean 으로 만들어주기위해 설정파일을 만들어준다.

* 이제 이 설정파일에서 차이점이 발생하게 된다. `Environment` 를 사용했을때는 해당 설정파일에서 `Environment` 를 주입받았었지만,
현재 방법에서는 `@Value` 를 통해 외부설정값을 주입받아준다.

* 따라서 `Environment` 의 `getProperty(key)` 를 통해 외부설정값을 매번 찾아와야했던 것과는 다르게
`@Value` 를 통해 외부설정값을 다이렉트로 주입받음으로서 반복적인 코드가 제거됨을 확인할 수 있다.
  
![img_2.png](https://revi1337.github.io/posts/value/img_2.png)

### 4. 생성된 Bean 을 확인 후 사용

* 이제 `Spring Boot` 의 메인 클래스에서 `SqlConfigData` Bean 을 주입받아 사용해주면

![img_4.png](https://revi1337.github.io/posts/value/img_4.png)

* 로그가 잘 찍히는것을 확인할 수 있다. 

![img_3.png](https://revi1337.github.io/posts/value/img_3.png)

* 따라서 이제 어떠한 클래스에서 `SqlConfigData` Bean 을 주입받아, 외부설정값을 참조할수 있게 된다.

### 디폴트값 설정

`Environment` 를 사용했을때와 다르게 `@Value` 를 사용하여 외부설정값을 다이렉트로 주입받을때는 주의사항이 있다.
바로 주입받으려는 `외부설정이 존재하지않으면 익셉션`이 터진다는 것이다.

![img_5.png](https://revi1337.github.io/posts/value/img_5.png)

하지만 Spring 은 이러한점을 예방하기위해 `@Value` 를 사용할때 `디폴트값` 을 설정할 수 있는 기능을 지원해준다.
  아래와같이 `@Value("${env.values.username:DUMMYUSER}")` 를 명시해주면 `:` 뒤에있는 값인 `DUMMYUSER` 가 디폴트값으로 설정되게된다.
  따라서 `env.values.username` 라는 외부설정이 없어도 예외가 터지지않게된다.

* 아래와 같이 `yml` 에서 `username` 을 주석친 후 

![img_6.png](https://revi1337.github.io/posts/value/img_6.png)

* 특정 외부설정에 디폴트 값을 설정해주면

![img_7.png](https://revi1337.github.io/posts/value/img_7.png)

* 익셉션이 터지지않고, 디폴트값이 출력되는것을 확인할 수 있다.

![img_8.png](https://revi1337.github.io/posts/value/img_8.png)

### 단점

* `@Value` 를 통해 외부설정값을 다이렉트로 주입받아 사용하는것도 좋다. 하지만 설정값이 많아지만, 이러한 과정이 귀찮아지게된다.
또한 이전에 `yml` 에서 설정했던 외부설정들은 모두 `env.values` 라는 공통적인 `prefix` 를 갖고있다.
`Spring Boot` 는 이러한 점도 해결해주는 방법을 지원하는데 그것이 `@ConfigurationProperties` 어노테이션이다.
이놈은 다음 포스팅에서 알아도보록 하자.

