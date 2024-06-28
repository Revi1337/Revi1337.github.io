---
title: Interceptor
---

# Interceptor
Interceptor 는 Servlet 에서 제공하는 Filter 와 달리 SpringMVC 에서 제공하는 기능이다. 그렇기 때문에 Interceptor 는 스프링 MVC 구조에 특화된 Filter 기능을 제공하며 `서블릿에서 제공하는 Filter 보다 늦게 호출`된다. Filter 와 비슷하게 공통 관심사를 효과적으로 처리 및 분리시킬 수 있고 웹과 관련된 공통 관심사를 처리할 수 있지만 순서와 범위, 그리고 사용법이 다르다. Spring MVC 를 사용하고 특별히 Filter 를 꼭 사용해야 하는 상황이 아니라면 Interceptor 를 사용하는 것이 더 편리하다고 볼 수 있다. 추가적으로 Interceptor 의 위치 및 Request 의 생명주기는 [[Spring MVC Architecture|Spring MVC 아키텍쳐]]  에서 볼 수 있다.

## Interceptor 특징
1. Filter 보다 뒤에 호출된다.
2. Interceptor 는 `DispatcherServlet 과 Controller(Handler)` 사이에서 컨트롤러 호출 직전에 호출된다.
3. interceptor 들의 순서, 정밀한 `URL 패턴`, 제외시킬 `URL 패턴` 등을 지정할 수 있다.
4. 여러개의 Interceptor 로 이루어진 `InterceptorChain` 를 구성되어 있다.
5. `HandlerExecutionChain` 이라는 객체를 통해 Interceptor 의 실행을 위임시키는 구조로 동작한다.
6. Filter 에서는 HttpServletRequest, HttpServletResponse 에 대한 정보만 매개변수로 받을 수 있었지만, Interceptor 의 메서드에서는 호출되려는 Controller(Handler) 의 정보와 `ModelAndView` 에 대한 정보도 받을 수 있다.

> [!note] Handler, HandlerMethod, ModelAndView
> Handler 는 웹요청을 처리하는 객체인 Controller 와 같은 의미이며, HandlerMethod 는 Handler 내에 정의되어 ModelAndView 객체나 특정한 객체를 리턴하는 Handler 안의 메서드를 의미한다. 그리고 반환된 ModelAndView 는 후에 ViewResolver 를 통해 화면이 만들어진다.

## Interceptor 의 구조
기본적으로 Interceptor 인터페이스에는 3개의 메서드가 존재하며 모두 `default` 메서드로 이루어져있다. 

```java
public interface HandlerInterceptor {

	default boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {  
	    return true;
	}
	
	default void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable ModelAndView modelAndView) throws Exception {  
	}

	default void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable Exception ex) throws Exception {  
	}
}
```

### preHandle()
- Controller(Handler) 가 실행되기 직전에 호출되는 메서드이다.
- 해당 메서드는 Interceptor 를 구현하면 `무조건 호출되는 것을 보장한다.`
- boolean 타입을 리턴해야하며 true 를 리턴하면 `Handler` 가 호출되며, false 를 리턴하면 Handler 가 호출되지 않는다. 

### postHandle()
- Controller(Handler) 가 실행된 후 호출되는 메서드이다. 정확히는 Controller(Handler) 로부터 ModelAndView 혹은 특정한 객체가 반환되면 호출되며 Controller(Handler) 에서 `예외가 발생되게 되면 호출되지 않는다.`

### afterCompletion()
- 해당 메서드는 Interceptor 를 구현하면 `무조건 호출되는 것을 보장한다.`
- Handler 로부터 반환된 ModelAndView 가 ViewResolver 를 통해 `View 를 렌더링하고 호출된다.
- 또한, Handler 에서 `예외가 발생했을 때`, 그리고 Handler 에서 발생한 `예외가 핸들링되고 난 후 호출`되는 메서드이다. 

### 메서드 정리
- 정리하면 Interceptor 구현하고 등록하면 preHandle() 과 afterCompletion() 메서드는 무조건 호출되는것을 보장한다.
- 또한, Filter 의 메서드에서는 HttpServletRequest, HttpServletResponse 에 대한 정보만 매개변수로 받을 수 있었지만 Interceptor 의 메서드에서는 호출되려는 Handler 의 정보와 Handler 로부터 반환되는 ModelAndView 받을 수 있다.
    
# Interceptor 사용법
## Interceptor 구현
제일 먼저 Interceptor 를 구현해준다.

```java
@Slf4j  
public class LoggerInterceptor implements HandlerInterceptor {  
  
    @Override  
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {  
        if (handler instanceof HandlerMethod) {  
            log.info("preHandle triggered");  
        }  
  
        return true;  
    }  
  
    @Override  
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {  
        log.info("postHandle triggered");  
        log.info("modelAndView : {}", modelAndView);  
    }  
  
    @Override  
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {  
        log.info("afterCompletion triggered");  
        if (ex == null) {  
            log.info("afterCompletion ex triggered {}", ex);  
        }  
    }  
}
```

## WebMvcConfigurer 에 등록
그리고 WebMvcConfigurer 를 구현해준 다음 `addInterceptors()` 메서드를 오버라이딩하여 인터셉터를 등록해준다. 해당 클래스에 `@Configuration` 을 달아주는것을 잊지 말자.

- 여기서 자세히봐야할 것은 인터셉터에 Order 로 순서를 정할 수 있다는 것이다.
- 그리고 addPathPatterns 로 Interceptor 가 동작할 URL 패턴을 지정해줄 수 있다는 것이다.
- 마지막으로 excludePathPatterns 로 Interceptor 가 제외시킬 URL 패턴도 지정해줄 수 있다는 것이다.

```java
@Configuration  
public class WebMvcConfiguration implements WebMvcConfigurer {  
  
    @Override  
    public void addInterceptors(InterceptorRegistry registry) {  
        registry.addInterceptor(new LoggerInterceptor())  
                .order(Integer.MIN_VALUE)  
                .addPathPatterns(  
                        "/test/*/interceptor",  
                        "/path/pattern/*",  
                        "/path2/pattern2/**",  
                        "/*.ico"  
                )  
                .excludePathPatterns(  
                        "/test/admin/interceptor",  
                        "/error",  
                        "/favi*.ico"  
                );  
    }  
}
```

> [!note] PathPattern 객체를 확인하자.
> Interceptor 는 URL 패턴 매칭을 할 때  PathPattern 객체를 사용한다. 해당 객체를 통해 Filter 보다 강력한 URL 패턴 매칭을 지정할 수 있는 것이다. 요점만 말하면 /\*\* 는 모든 하위 모든 경로를 의미하고, /* 는 하나의 단일 경로 혹은 정규식 (아스타리스크)를 의미한다. PathPattern 에 관한 내용은 Interceptor 인터페이스의 주석에 달려있으니 이를 확인하자.

# 정리
1. Interceptor 는 Spring MVC 에서 제공하는 기능이다.
2. preHandle() 은 Controller(Handler) 가 호출되기 전에 실행된다.
3. postHandle() 은 Controller(Handler) 로부터 ModelAndView 객체가 반환되면 실행된다.
4. afterCompletion() 은 ModelAndView 가 렌더링되고 난 후 실행되고, Handler 에서 발생한 `예외가 핸들링 난 후` 에도 호출된다. 
5. preHandle() 과 afterCompletion() 메서드는 무조건적인 호출이 보장되며 postHandle() 은 Controller(Handler) 내부에서 예외가 발생하면 호출되지 않는다.
6. Interceptor 의 모든 메서드는 직접적으로 실행되는 것이 아닌, DispatcherServlet 의 doDispatch() 메서드 안에 지역변수로 선언된 HandlerExecutionChain 에 의해 대신 호출된다.
