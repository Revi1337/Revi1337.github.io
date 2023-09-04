스프링에서 `key=value` 형태의 외부설정을 설정하는 방법에는 아래와같은 방법들이 있었다.

1. 설정 데이터 (application.properties, 혹은 application.yml)

2. OS 환경변수

3. Java System Property (자바 시스템 속성)

4. 스프링에서 제공하는 커맨드라인 옵션인수

바로 이전에는 글에서는 `@Value` 를 통해 외부설정을 조회하고 사용하는법에 대해 포스팅했었다.
`@Value` 는 `Environment` 의 단점을 해결했지만, `env.values.username`, `env.values.password` 같이 `env.values` 라는 공통 필드들이 많으면
모두 다 써줘야한다는 단점이 아직 남아있었다.

하지만 Spring 에서는 이러한 `@Value` 의 단점과 기존 `Environment` 의 단점을 모두 해결하는 방법을 제공하는데, 그 방법이
`@ConfigurationProperties` 를 통해 해결하는 것이다.
따라서 해당 포스팅에서는 `@ConfigurationProperties` 어노테이션을 통해 `이전의 방식들의 단점들을 모두 해결`하고 외부설정들을 더 편리하게 조회하여 사용하는 방법을 소개하고자 한다.

## @ConfigurationProperties 를 통한 외부 설정 사용

* 스프링은 외부 설정의 묶음 정보를 객체로 변환하는 기능을 제공한다. 이를 `타입 안전한 설정 속성` 이라고 부른다.

* 객체를 사용하면 Type 들을 사용할수있어, 외부설정으로부터 들어온값이 타입에 맞는지 검사를 할 수 있기 때문에 `Runtime` 오류가 아닌 `컴파일 시점 혹은 애플리케이션 로딩 시점` 에 오류를 뱉게할 수 있다.

### @ConfigurationProperties 장점

1. 외부 설정을 객체로 편리하게 매핑하여 사용 가능하다.

2. 외부 설정의 계층을 객체로 편리하게 표현 가능하다.

3. 외부 설정을 Type Safe 하게 사용할 수 있다.

4. Bean Validation 을 적용할 수 있다.

## @ConfigurationProperties 관련 Annotation

ConfigurationProperties 를 이해하기전에 숙지하고 있어야할 `Annotation` 들을 간단히 알아보자.

1.  `@ConfigurationProperties`
    
   : 외부 설정을 주입받을 `객체`라는 것이다. `기본 주입방식이 프로퍼티 방식` 이기때문에 `Getter` `Setter` 가 필요하다.
   결과적으로 `@EnableConfigurationProperties` 혹은 `@ConfigurationPropertiesScan` 로 인해 해당 `객체` 가 `Bean` 으로 등록되게 된다.

2. `@EnableConfigurationProperties(Class<?> clazz)`
   : Spring 에게 사용할 `@ConfigurationProperties` 를 지정하는 어노테이션이다.
   `@ConfigurationProperties` 가 달린 Class 는 외부설정이 주입되어 `Bean` 으로 등록되게 된다.

3. `@ConfigurationPropertiesScan`
   : `@ConfigurationProperties` 가 달려있는 클래스 하나하나 `Bean` 으로 등록하는거라면,
   `@ConfigurationPropertiesScan` 는 특정 범위를 기준으로  `@ConfigurationProperties` 가 달려있는 클래스들을 모두 `Bean` 으로 등록하는 어노테이션.
   **Bean 을 직접 등록하는것과 @ComponentScan 을 사용하는 차이와 비슷하다.**

## @ConfigurationProperties 사용법

`@ConfigurationProperties` 를 통해 외부설정값을 주입받는 방식에는 두가지 방법이 존재한다.
첫번째로는 `Property(Getter Setter)` 를 통한 방법이고 두번쨰로는 `Constructor(생성자)` 를 통한 방식이다.
이 두가지 방법에 대해 알아보자.

### @ConfigurationProperties Property 방식

첫번째로 Property 방식을 통해 외부설정값을 주입받는 방식에 대해알아보자.
제일 먼저 외부설정들을 `yml` 에 세팅해준다.

#### 1. yml 세팅

* 아래 사진과 같이 `yml` 에 외부설정값을 셋팅해준다.
* 설정한 값들은 `env.values` 라는 `prefix` 를 `공통필드`로 갖고있음을 확인해 두자.
* 거기에 더해 추가적으로 `env.values.inner` 라는 `prefix` 를 `공통필드` 로 설정들도 있음을 기억해두자.

![img.png](https://revi1337.github.io/posts/configurationproperties/img.png)

#### 2. @ConfigurationProperties 설정

1. `yml` 에 세팅 설정과 대응하는 클래스인 `SqlConfigData` 를 생성해준다. 생성한 클래스의 `Field` 에는
`yml` 에 설정하였던 prefix 를 제외한 `key` 들을 따라 생성해주면 된다. 
그것과 동시에 `@ConfigurationProperties` 어노테이션을 명시하여 설정파일인 `application.yml` 의 `env.values` 로 그룹화된 설정들을 `객체로 변환`시키겠다고 명시해준다.
   
2. `Property` 방식을 통해 외부설정값을 주입받기 때문에 `@Getter`, `@Setter` 를 잊지말자.
   (ToString 은 값확인이 귀찮아서 명시해주었음.)

3. 또한, depth 가 더 깊은 `env.values.inner` 라는 설정에 대해서는 `Inner Class` 로 해결해준다. 

![img_2.png](https://revi1337.github.io/posts/configurationproperties/img_2.png)

#### 3. @EnableConfigurationProperties 설정

1. 이제 `@EnableConfigurationProperties` 를 통해 사용할 `@ConfigurationProperties` 의 Class 를 명시해준다.
해당 과정을 통해 `@ConfigurationProperties` 가 달려있는 Class 에 `외부설정이 주입`되고 `Bean` 으로 생성되어진다.

2. 이렇게 생성된 `SqlConfigData` 타입의 `Bean` 을 다시 생성자주입을 통해 주입받고
`@PostConstruct` 를 통해 `SqlConfigData` `Bean` 을 확인한다.

> * 현재는 편의상 `@Component` 를 통해 `@PostConstruct` 가 호출되도록 의도함으로서 SqlConfigData Bean 을 확인했다.
    이를 응용해서 SqlConfigData 의 값을 참조하는 다른 Bean 을 만들때, SqlConfigData 값을 참조해서 값을 대입하고 새로운 `Bean` 을 만들어 사용하면 된다.

![img_1.png](https://revi1337.github.io/posts/configurationproperties/img_1.png)

#### 4. 결과

* 아래 결과를 보면 `Inner Class` 를 통해 depth 가 깊은 설정값들을 잘 가져오는 것을 확인할 수 있다.

![img_3.png](https://revi1337.github.io/posts/configurationproperties/img_3.png)

##### 단점

일반적으로 설정파일은 처음 값을 사용하지 중간에 바꾸는 경우는 딱히 없다. 거의 `Read-Only` 데이터로 많이 사용한다.
하지만 `@ConfigurationProperties` 를 사용할때 `Setter` 를 통해 외부설정값을 주입하게되면, 다른 어느 클래스에서 모르고 `Setter` 를 통해 값을 변경하는 불상사가 일어나게된다.

하지만 스프링은 이러한 것을 방지하기 위해서 `생성자` 를 통해 외부설정값을 주입하는 방식도 지원한다.

### @ConfigurationProperties Constructor 방식

생성자를 통해 외부설정값을 주입해주는것을 어렵지않다. 단지 기존의 `Setter` 를 지우고 `생성자를 추가`시켜주면 된다.
그게 끝이다.

* 아래 사진과 같이 기존의 `Setter` 를 지우고 `생성자` 를 추가해주는게 끝이다.

![img_4.png](https://revi1337.github.io/posts/configurationproperties/img_4.png)

* 외부설정값이 로그로 잘 찍힌다.

![img_5.png](https://revi1337.github.io/posts/configurationproperties/img_5.png)

#### Default 값 설정

생성자를 통해 외부설정값을 주입해주는 방식의 장점은 설정값을 `Read-Only` 데이터로 만들어줄 수 있는것 뿐만아니라
`@DefaultValue` 를 통해 디폴트값을 설정해줄 수 있다는 것이다. 아래의 예시를 보자.

* 제일 먼저 외부설정에서 `username` 과 `inner.config` 를 제거킨다.

![img_7.png](https://revi1337.github.io/posts/configurationproperties/img_7.png)

* 그 다음에 생성자를 통해 외부설정값을 주입해줄떄, 생성자의 파라미터에 `@DefaultValue` 를 설정하여
특정 설정(필드) 에 대해 디폴트값을 설정해준다.

![img_8.png](https://revi1337.github.io/posts/configurationproperties/img_8.png)

* 결과적으로 `yml` 에 특정 값을 명시하지 않아도, 디폴트값이 잘 설정됨을 확인할 수 있다.

![img_9.png](https://revi1337.github.io/posts/configurationproperties/img_9.png)

> 참고로 @DefaultValue 는 파라미터와, Record 매개변수로만 들어갈수있다.

![img_11.png](https://revi1337.github.io/posts/configurationproperties/img_11.png)

#### Constructor 가 두개 이상이라면?

생성자를 통해 외부설정값을 주입할때 주의사항이 있다. 바로 `생성자가 두개 이상`일때다.
만약 생성자가 두개 이상이면 `Exception` 이 터지게된다.

* 이또한 해결방법은 간단하다. 만약 생성자가 2개 혹은 그 이상이면
외부설정을 주입해줄때 사용할 생성자에 `@ConstructorBinding` 어노테이션을 달아주면 된다.
  
![img_6.png](https://revi1337.github.io/posts/configurationproperties/img_6.png)

* 정상적으로 외부설정값이 주입되는것을 확인할수 있다.

![img_10.png](https://revi1337.github.io/posts/configurationproperties/img_10.png)

> 스프링 부트 3.0 이전에는 생성자 바인딩 시에 @ConstructorBinding 애노테이션을 필수로 사용해야 했었다.
하지만, 스프링 부트 3.0 부터는 생성자가 하나일 때는 생략할 수 있다. 생성자가 둘 이상인 경우에는 사용할
생성자에 @ConstructorBinding 애노테이션을 적용하면 된다.

## @ConfigurationProperties 검증

`@ConfigurationProperties` 를 사용하게되면 외부설정들이 자바 객체로 변환되기 때문에, 
스프링이 자바 빈 검증기를 사용할 수 있도록 지원한다. 이를 통해 외부설정값이 `기대한 포맷` 혹은 `기대한 값`과 다르거나하면 이를 잡아낼수 있다.
아래 예시를 보자.

* 아래와 같이 `Class` 단위에 `@Validated` 를 달아준다.

* 그 다음 검증하고 싶은 `Field` 에 값을 검증할 수 있는 `Annotation` 들을 달아준다.

> 패키지 이름에 jakarta.validation 이 들어가면 자바 표준 검증기이다.
만약 패키지 이름이 org.hibernate.validator 로 시작하면 표준 검증기의 구현체에서 직접 제공하는
Hibernate 검증기이다. (대부분 하이버네이트 검증기를 사용하기때문에 크게 문제가 되지 않는다.)

![img_12.png](https://revi1337.github.io/posts/configurationproperties/img_12.png)

* 그리고 Bean Validation 이 잘 동작하는지 확인하기 위해 기대값과 일치하지 않는 값으로
`yml` 을 수정해준다.

![img_13.png](https://revi1337.github.io/posts/configurationproperties/img_13.png)

* 이제 애플리케이션을 실행해보면, 기대값 이외의 값이 들어와 Exception 이 터진것을 볼 수 있다.

![img_14.png](https://revi1337.github.io/posts/configurationproperties/img_14.png)

## @ConfigurationPropertiesScan 를 통한 Bean 생성

지금까지 `@ConfigurationProperties` 를 사용해 외부설정들을 `객체로 변환` 한다고 명시하고 
`@EnableConfigurationProperties` 를 통해 `@ConfigurationProperties` 가 달려있는 클래스에 외부설정값들을 주입해줌으로서 
`Bean` 을 생성해주었다

하지만 이러한 그룹화된 설정들이 많아지면 어떨까? 모든 설정들마다 `@ConfigurationProperties` 를 달아주고
`@EnableConfigurationProperties` 를 달아주기에는 귀찮고 번거롭다.
이를 해결하기 위해서 Spring 에서는 `@ConfigurationPropertiesScan` 를 제공한다.
해당 어노테이션은 `@EnableConfigurationProperties` 를 달아주지 않아도
`@ConfigurationProperties` 어노테이션이 달려있는 클래스들을 모두 찾아 외부설정값들을 자동으로
주입해주게된다. 아래의 예시를 보자.

* 아래와같이 기존의 `@EnableConfigurationProperties` 를 제거해주자.

![img_15.png](https://revi1337.github.io/posts/configurationproperties/img_15.png)

* 그리고 Spring Boot 메인에 가서 `@ConfigurationPropertiesScan` 어노테이션을 달아준다.

> 편의상 부트 메인에 명시했지만 꼭 부트 메인에 명시해줄 필요는 없다. 설정파일을 만들어서 따로 명시해주는것을 추천한다. 

![img_16.png](https://revi1337.github.io/posts/configurationproperties/img_16.png)

* 이제 애플리케이션을 실행해주면 `@ConfigurationPropertiesScan` 를 통해
`@ConfigurationProperties` 가 달려있는 `SqlConfigData` 라는 파일이 찾아져 외부설정값이 주입되고
자동으로 `Bean` 으로 등록되게 된다.

![img_17.png](https://revi1337.github.io/posts/configurationproperties/img_17.png)
