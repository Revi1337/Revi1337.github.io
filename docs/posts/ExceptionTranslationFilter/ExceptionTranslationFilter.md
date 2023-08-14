# [SpringSecurity] ExceptionTranslationFilter 프로세스 분석 및 동작 원리

## ExceptionTranslationFilter 는 뭐하는 놈인가?

* ExceptionTranslationFilter 는 말그대로 `Exception` 을 번역 및 해석하는 역할을 수행한다.
* ExceptionTranslationFilter 는 `SecurityFilterChain` 에서 마지막 두번째에 위치해 있다.
* ExceptionTranslationFilter 는 핵심적으로 두가지 종류의 `Exception` 을 처리한다.

1. `AuthenticationException`
 
2. `AccessDeniedException`

그렇다면 AuthenticationException 과 AccessDeniedException 는 누가 `Throw` 하는 것일까?

정답은 `AuthorizationFilter` 이다. (예전엔 FilterSecurityInterceptor 였음)

`ExceptionTranslationFilter` 에서 `try catch` 문으로 감싸진 `doFilter` 메서드를 통해 다음 필터로 이동시키면 `AuthorizationFilter` 가 실행되게 되는데, 여기서 `Throw` 된 `Exception` 이 `ExceptionTranslationFilter` 에서 핸들링 되는 구조이다.

> 여기서 알 수 있는 것은 `ExceptionTranslationFilter` 는 SecurityFilterChain 의 말전에 위치하고, `AuthorizationFilter` 는 바로 뒤에 위치하니까, `AuthorizationFilter` 는 SecurityFilterChain 의 맨 마지막에 위치하게 된다.

### ExceptionTranslationFilter 는 뭐하는 놈인가? [증명]

*ExceptionTranslationFilter 의 doFilter 메서드가 try catch 문으로 감싸져 있다는 증명* 
![img.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img.png)

*AuthorizationFilter 에서 인증,인가 Exception 들이 Throw 된다는 증명.(AuthenticationCredentialsNotFoundException 은 AuthenticationException 의 구현체. 대표적으로  AuthenticationException 의 구현체들은 UsernameNotFoundException 과 BadCredentialsException 이 있다.)*
![img_1.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_1.png)
![img_2.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_2.png)

*ExceptionTranslationFilter 는 SecurityFilterChain 에서 말전에 위치해있고, AuthorizationFilter 는 마지막에 위치해있다는 증명.*
![img_3.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_3.png)

## ExceptionTranslationFilter 의 핵심 역할.

일단 Spring Security 공식문서에 나와있는 인증,인가 Exception Flow 는 아래와 같다.

![img_4.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_4.png)

전에도 얘기했지만, 상단의 흐름을 요약해보면 `ExceptionTranslationFilter` 는 `AuthenticationException` 와 `AccessDeniedException` 을 처리한다
그렇다면, 각 Exception 이 발생하게되면 어떻게 동작할까?

1. 인증 예외 처리 (AuthenticationException) 경우

    1. 첫번쨰로 인증객체를 저장하는 저장소인 `SecurityContext` 에 `null` 을 넣어, `SecurityContextHolder` 를 비운다.
        
    2. 두번째로 인증 예외인 `AuthenticationException` 가 발생하기 전의 `Request` 정보를 저장한다.
 
       * 인증 예외인 `AuthenticationException` 가 발생하게 되면 `RequestCache` 에 인증예외가 터지기전의 `Request` 정보를 저장한다.
       * 더 정확히는 `RequestCache` `Request` 정보를 저장하면, `SavedRequest` 곳에 사용자가 요청했던 `Request` 파라미터 값들, 그 당시의 헤더값들이 저장되게 된다.
       * 결론은 인증되지 않은 사용자가 인증이 필요한 endpoint 인 /users 라는 경로에 접근하게되면, `AuthenticationException` 가 터져 `AuthenticationEntryPoint` 가 호출되게 되는데, 이 `AuthenticationEntryPoint` 가 호출되기 전에 /users 경로의 `Request` 를 `RequestCache` 에 저장한다는 의미이다.
        
       > 이렇게  RequestCache 에 예외 전의 요청을 담아두는 이유는 인증예외로 인해 호출된 AuthenticationEntryPoint 가 Redirection 로그인페이지에서 정상적으로 로그인에 성공하게되면, RequestCache 안에 저장했던 요청정보를 꺼내어 인증실패시 저장했던 endpoint 로 Redirection 시키게된다.
       
    3. 세번째로 `AuthenticationEntryPoint` 호출한다.

       *  `AuthenticationException` 발생시 호출되는 `AuthenticationEntryPoint` 는, 로그인 페이지로 `Redirection` 및 401 Status Code 전달하는 역할을 수행한다.
       *  `AuthenticationEntryPoint` 를 구현하여 사용하면, 인증예외 발생 시 흐름을 커스터마이징할 수 있다.

2. 인가 예외 처리 (AccessDeniedException) 경우

   1. 인가 예외처리때의 흐름은 매우 간단하다. `AccessDeniedHandler` 를 호출하여 예외처리를 수행한다.
   조심해야할 것은 `AccessDeniedHandler` 가 호출됬다는 것은, **권한이 부족하다는 의미이지. 인증되지 않은 사용자가 아니라는 것**이다.

### ExceptionTranslationFilter 의 핵심 역할. [DEBUGGING]

`AuthenticationException`  `AccessDeniedException` 가 발생했을떄 `ExceptionTranslationFilter` 의 흐름을 분석해보자.

분석하기 전 나의 설정은 아래와같다.

*컨트롤러 코드*

![img_6.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_6.png)

*Security 설정*  
`/user` 경로는 인증된사용자만 접근 가능.  `/manager` 경로는 `ROLE_MANAGER` 권한이 필요. `/admin` 경로는 `ROLE_ADMIN` 권한이 필요 하도록 설정해놓았다.
또한, formLogin 은 디폴트값으로 설정해놓았다.

![img_5.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_5.png)

#### AuthenticationException 이 발생했을 경우.

우선 permitAll() 인 `index` 에서 `/user` 경로로 요청을 보낸다.

![img_7.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_7.png)

`/users` 경로로 가는 요청이 `SecurityFilterChain` 안의 Filter 들의 `doFilter` 메서드들을 거쳐 `ExceptionTranslationFilter` 
의 doFilter 메서드로 들어오게된다. 여기서 `try catch` 문으로 감싸진 `chain.doFilter` 가 실행되면 `AuthorizationFitler` 로 넘어가게 된다.

![img_8.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_8.png)

`AuthorizationFitler` 에서 `AccessDeniedException` 이 터지게 된다.

> 여기서 왜 AuthenticationException 이 아니라 AccessDeniedException 이 터지냐는 의문을 갖을 수 있다.
스프링에서 인증되지않은 사용자는 익명 사용자로 취급되어 일단 AccessDeniedException 를 터뜨리는데, 이 익셉션을 ExceptionTranslationFilter 에서 받아 
익명사용자인지 아닌지 제일 우선적으로 판단하게 된다. 만약 익명사용자이면 sendStartAuthentication 메서드를 호출해 AuthenticationException 을 핸들링하는 과정을 수행하게되고,
진짜 권한부족으로인한 AccessDeniedException 이면 AccessDeniedHandler 를 호출하게된다. 이 과정은 밑에 나오니 조금 더 보도록 하자

![img_9.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_9.png)

`AuthorizationFitler` 에서 터진 `AccessDeniedException` 은  결국 `ExceptionTranslationFilter` 에서 받게된다.

![img_10.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_10.png)

`AccessDeniedException` 를 받은 `ExceptionTranslationFilter` 의 doFilter 메서드에서는 마지막에 `handleSpringSecurityException` 메서드를 호출하게 된다.

![img_11.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_11.png)

`handleSpringSecurityException` 메서드는 발생한 익셉션이 `AccessDeniedException` 인지 `AuthenticationException` 인지에 따라 실행되는 메서드가 달라진다.
여기서는 익명사용자이기 때문에 `AccessDeniedException` 로 분기하여 `handlingAccessDeniedException` 이 실행되게 된다

![img_12.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_12.png)

> 해당 부분이 `AccessDeniedException` 이 터졌을 떄 익명사용자인지 아닌지 판단하여, AccessDeniedHandler 를 호출할지 AuthenticationException 처리 과정을 수행할지 결정하는 부분이다.
if (isAnonymous) 로 인해 익명 사용자임이 확정되었기때문에 AuthenticationException 처리과정을 수행할 것이다. (sendStartAuthentication) 메서드

![img_13.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_13.png)

아래 사진은 `AuthenticationException` 처리과정을 수행하는 `sendStartAuthentication` 메서드 내부이다.
해당 메서드에서는 `SecurityContext` 에 `null` 을 집어넣어 `SecurtiyContextHolder` 를 비우는 과정을 수행하고
실패한 `Reqeuest` 를 `RequestCache` 에 저장하고, `AuthenticationEntryPoint` 의 `commence` 메서드를 호출하는 역할을 수행한다.

솔직히 하는 행동은 메서드이름인 sendStartAuthentication 과 전혀관계없어보인다. 나만그런가? ㅋㅋㅋ 내가 잘못알고있는걸지도? 하하하!!!!

여튼 현재 활성화된 BreakPoint 를 보면 `SecurityContext` 에 `null` 을 집어넣고있는 장면이다. 

![img_14.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_14.png)

이제 익셉션이 터졌을때의 `Request` 정보를 `RequestCache` 인터페이스의 구현체인 `HttpSessionRequestCache` 에 저장한다.

![img_15.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_15.png)

아래의 사진은 `HttpSessionRequestCache` 의 `saveRequest` 메서드 내부이다. 
결과적으로 `RequestCache(HttpSessionRequestCache)` 에 실패한 `Request` 를 저장하게되면 
최종적으로 `SavedRequest` 인터페이스의 구현체인 `DefaultSavedRequest` 에 저장되게 된다.

![img_16.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_16.png)

`RequestCache(HttpSessionRequestCache)` 에 저장한 후, 값을 확인해보면, 실패한 요청이 잘 들어감을 확인할 수 있다.

![img_20.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_20.png)

이제 `AuthenticationException` 처리과정을 마지막인 `AuthenticationEntryPoint` 의 `commence` 메서드를 호출하게 된다.
여기서 호출되는 AuthenticationEntryPoint 는 `LoginUrlAuthenticationEntryPoint` 이다. 

![img_17.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_17.png)

아래 사진은 `AuthenticationEntryPoint` 의 구현체인 `LoginUrlAuthenticationEntryPoint` 의 `commence` 메서드의 내부이다.

![img_18.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_18.png)

결국 스프링 디폴트 페이지인 `/login` 페이지로 `Redirection` 되게 된다.

![img_22.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_22.png)

![img_23.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_23.png)

#### AccessDeniedException 이 발생했을 경우.

AccessDeniedException 이 발생하는 경우는 사실 볼게 정말없다.. 그냥 `AccessDeniedHandler` 를호출하는 것이 전부이기때문.. 

일단 디버깅하기전에 `AccessDeniedException` 을 터뜨려주어야하기때문에 `ROLE_USER` 권한을 갖는 더미 유저하나를 만들어주자.

![img_24.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_24.png)

이제 더미유저 로그인한다음 인증된사용자만 접근할 수 있는 `/user` 경로에 접근하자.

![img_25.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_25.png)

이제 `ROLE_ADMIN` 권한을 갖은 사용자마 접근할 수 있는 `/admin`경로에 접근하면 `AuthenticationException` 처리떄와 동일하게 
`AuthorizationFilter` 에서 `AccessDeniedException` 이 터지게 된다.

![img_26.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_26.png)

이 `AccessDeniedException` 은 당연히 자신(AuthorizationFilter)을 호출한 `ExceptionTranslationFilter` 가 받게되어
`AccessDeniedException` 을 처리하는 로직을 타게 된다.

![img_27.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_27.png)

여기서 이제 다른점이 나온다. `익명사용자` 가 접근했을때는 `sendStartAuthentication` 메서드가 샐행되어 
`SecurityContextHolder` 를 비우고, 실패한 요청을 `ReqeustCache` 에 저장하여 `login` 페이지로 `Redirection` 시켰다면,
현재 더미유저로 로그인한 사용자이기때문에 `익명사용자` 로 판단되지않고, `ROLE_USER` 권한을 갖고있어 권한부족으로 인한 익셉션으로 판단되어 
`AccessDeniedHandler` 의 `handle` 메서드가 호출된다.

![img_28.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_28.png)

아래 사진은 `AccessDeniedHandler` 의 구현체인 `AccessDeniedHandlerImpl` 의 `handle` 메서드 내부이다.
response 에 `403(Forbidden) Status Code` 를 달아주는것을 볼 수 있다

![img_30.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_30.png)

결국 response 에 `403 Forbidden` 이 달리게되어 스프링 디폴트 denied 페이지가 나오게 된다.

![img_29.png](https://revi1337.github.io/posts/ExceptionTranslationFilter/img_29.png)

## 그렇다면 AuthenticationEntryPoint 와 AccessDeniedHandler 를 커스터마이징하는 방법


## 참고한 문서 및 링크
https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-exceptiontranslationfilter
https://www.inflearn.com/course/%EC%BD%94%EC%96%B4-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard

### 언급한 클래스 및 밀접한 클래스

DelegatingFilterProxy
FilterChainProxy
ExceptionTranslationFilter
AuthorizationFilter(FilterSecurityInterceptor)

Authentication --> AbstractAuthenticationToken --> UsernamePasswordAuthenticationToken  
AuthenticationManager --> ProviderManger  
AuthenticationProvider --> AbstractUserDetailsAuthenticationProvider --> DaoAuthenticationProvider  
SecurityContext  
SecurityContextHolder  
SecurityContextHolderStrategy  

RequestCache --> HttpSessionRequestCache  
SavedRequest --> DefaultSavedRequest  
AuthenticationEntryPoint --> LoginUrlAuthenticationEntryPoint  
AccessDeniedHandler --> AccessDeniedHandlerImpl  

AuthenticationException  
AccessDeniedException  
