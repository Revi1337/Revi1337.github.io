스프링에서 `key=value` 형태의 외부설정을 설정하는 방법에는 아래와같은 방법들이 있었다.

1. 설정 데이터 (application.properties, 혹은 application.yml)

2. OS 환경변수

3. Java System Property (자바 시스템 속성)

4. 스프링에서 제공하는 커맨드라인 옵션인수

이러한 외부설정들은 SpringBoot 프로젝트 내부에서 사용할 수 있는데, 해당 포스팅에서는
`Environment` 를 통해 이러한 외부설정들을 조회하고 사용하는 방법을 소개하고자 한다.

### 1. properties 혹은 yml 에 외부설정 셋팅

* 아래 사진과 같이 `yml` 에 외부설정값을 셋팅해준다.
* 설정한 값들은 `env.values.environment` 라는 `prefix` 를 갖고있음을 확인해 두자.  

![img_2.png](https://revi1337.github.io/posts/environment/img_2.png)

### 2. 셋팅한 외부설정과 대응하는 클래스 파일 생성

* 이제 `yml` 에 셋팅한 설정과 대응하는 클래스인 `SqlConfigData` 를 생성해준다. 생성한 클래스의 `Field` 에는
`yml` 에 설정하였던 prefix 를 제외한 `key` 들을 따라 생성해주면 된다.

> * 뒤에 설명하겠지만, 최종적으로 SqlConfigData 타입의 Bean 이 생성되게 된다.
@PostConstruct 는 의존관계 주입 후, 각 Field 들을 확인하기 위해 명시하였다. 

![img.png](https://revi1337.github.io/posts/environment/img.png)

### 3. Environment 통해 생성한 클래스를 Bean 으로 등록 

* 설정파일을 만들어준 후, 스프링이 자동으로 등록해주는 `Environment` 타입의 `Bean` 을 주입받는다.
`Environment` Bean 에는 `yml` 에 설정했던 외부설정값들이 들어있다.

* 이제 주입받은 Environment 에서 `yml` 에서 설정했던 값들을 꺼낸 후, `SqlConfigData` 인스턴스를 만들어 값을 넣어준 후, `Bean` 으로 등록해준다.

**Environment 에서 설정값을 꺼낼때 `prefix + key` 를 통해 꺼내게된다. 이 때, 특정한 타입으로 형변환해서 값을 받을 수 있다는것을 알아두자.**

> * Environment 에는 yml 뿐만 아니라, `Java System Property`, `커맨드라인 옵션 인수`, `OS 환경변수` 와 같이 
`key=value` 형태의 외부설정값들이 들어있다.
 
![img_1.png](https://revi1337.github.io/posts/environment/img_1.png)

### 4. 생성된 Bean 을 확인 후 사용

* 이제 애플리케이션을 시작해주고 `SqlConfigData` 타입의  Bean 이 잘 생성되고 주입되는지 `SpringBoot` 메인 클래스에서 확인해준다.
아래 사진을 보면 `SqlConfigData` 타입의 Bean 이 생성되었기 때문에, `SpringBoot` 메인 클래스에서 `SqlConfigData` 의 값을 확인해 볼 수 있다. 

![img_3.png](https://revi1337.github.io/posts/environment/img_3.png)

* 아래 로그를 보면, `@PostConstruct` 를 통해 로그가 잘 찍힌 것을 확인 가능하다.

![img_5.png](https://revi1337.github.io/posts/environment/img_5.png)

* 이제 어디서든 `SqlConfigData` Bean 을 통해 `yml` 에 설정한 값들을 조회하여 사용할 수 있게된다.

### 단점

* `Environment` 를 주입받고 `environment.getProperty(key)` 를 통해 값을 꺼내는 과정을 반복해야하 함.
스프링은 이러한 단점을 `@Value` 를 통해 외부설정값을 편하게 주입받는 기능을 제공한다.

