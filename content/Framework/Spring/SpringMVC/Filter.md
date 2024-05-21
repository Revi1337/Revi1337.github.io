---
title: Filter
---
## Filter
Filter 는 Servlet 에서 제공하는 기능이며 Servlet 보다 먼저 호출된다. 이 뜻은 당연하게도 Controller(Handler) 보다도 먼저 동작한다는 의미와 같기 때문에  `접근제어, 로깅, 악성문자 필터링` 과 같은 공통 관심사를 효과적으로 분리하여 처리할 수 있다.

### Filter 의 특징
Filter 의 위치 및 Request 의 생명주기는  [[Framework/Spring/SpringMVC/Analyze/Spring MVC Architecture|Spring MVC 아키텍쳐]]  에서 볼 수 있다.

1. Servlet(DispatcherServlet) 보다 먼저 호출된다.
2. 자신이 호출될 `URL Pattern` 및 `Filter 들의 순서` 를 지정해줄 수 있다.
3. Servlet 을 호출할지 호출하지 않을지 결정할 수 있다. (뒤에 Filter 가 더 존재하면 Filter 가 호출되고, 존재하지 않으면 Servlet 이 호출되는 구조이다)
4. 요청 처리가 완료되어 응답이 나갈때도 실행되었던 Filter 를 타고 나간다.

> [!note] Filter 의 URL 패턴 매칭은 그리 강력하지 않다
> Servlet 이 제공하는 Filter 에서는 URL 패턴을 세밀하게 매핑할 수 없다. 하지만 Spring 이 제공하는 Interceptor 에서는 AntPathMatcher 라는 객체가 URL 의 패턴을 검증하는데, 해당 객체로 URL 패턴을 굉장히 세밀하게 매핑할 수 있다.

### Filter 의 구조
아래 코드는 Filter 인터페이스의 메서드들이다. 기본적으로 3개의 메서드가 존재하지만 2개는 default 메서드이므로 꼭 오버라이딩 해야하는 메서드는 `doFilter` 메서드가 된다.

- init() : Filter 가 초기화될때 생성되는 메서드이며, 서블릿 컨테이너가 생성될때 호출된다.
- doFilter() : FilterRegistration 을 통해 등록한 `URL Pattern` 와 요청 URI 가 일치할때 호출되는 메서드이며, 서블릿이 호출되기 전 수행할 코드를 작성해주면 된다. 또한, 코드를 작성하고 `꼭 chain.doFilter()` 를 호출해주어야 한다. 그렇지 않으면 뒤에있는 Filter 혹은 Servlet 이 호출되지 않는다.
- destroy() : Filter 가 종료될때 호출되는 메서드이며, 서블릿 컨테이너가 종료될때 호출된다.

```java
public interface Filter {

	default void init(FilterConfig filterConfig) throws ServletException {}

	void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException;
        
	default void destroy() {}
}
```

## Filter 등록방법 3가지
### @WebFilter 에서 등록
Servlet 이 제공하는 `@WebFilter` 를 사용해 Filter 를 등록해줄 수 있다. Filter 를 구현해주고 클래스 위에 `@WebFilter` 를 달아주면 된다. 이 때 `urlPatterns` 속성으로 필터가 호출되길 원하는 URL Pattern 을 지정해줄 수 있다.

> [!note] Filter 들의 Order 를 조절할 수 없다.
> @WebFilter 를 통해 Filter 를 등록하면 Filter 들의 집합인 FilterChain 에서의 Filter 동작순서(Order) 를 지정해줄 수 없다.

```java {2}
@Slf4j  
@WebFilter(urlPatterns = {"/pattern/*", "/sub-pattern"})  
public class LoggingFilter implements Filter {  
  
    @Override  
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {  
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;  
        String requestURI = httpServletRequest.getRequestURI();  
  
        log.info("{} request in", requestURI);  
        chain.doFilter(request, response);  
        log.info("{} response out", requestURI);  
    }  
}
```

@WebFilter 를 통해 Filter 를 등록시키기 위해서는 별도의 설정파일 혹은 프로젝트 루트에 `@ServletComponentScan` 를 달아줘야한다는 것이다. 그렇지 않으면 Filter 가 싱글톤으로 관리되지도 않고 등록되지도 않는다.

```java {1}
@ServletComponentScan  
@SpringBootApplication  
public class FilterTestApplication {  
  
    public static void main(String[] args) {  
        SpringApplication.run(FilterTestApplication.class, args);  
    }  
}
```

### FilterRegistrationBean
스프링 부트에서 제공하는 `FilterRegistrationBean` 를 통해 Filter 를 등록할 수 있다. 우선 Filter 를 구현해주고

> [!note] 가장 좋은 방법
> FilterRegistrationBean 을 통해 Filter 를 등록하면 urlPattern 과 Order 를 모두 지정해줄 수 있다. 

```java {9,11}
@Slf4j  
public class LoggingFilter implements Filter {  
  
    @Override  
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {  
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;  
        String requestURI = httpServletRequest.getRequestURI();  
  
        log.info("{} request in", requestURI);  
        chain.doFilter(request, response);  
        log.info("{} response out", requestURI);  
    }  
}
```

구현한 필터를 FilterRegistrationBean 을 통해 Bean 으로 등록시켜 주면 된다. FilterRegistrationBean 에서 urlPattern 과 Order 를 지정해줄 수 있다.

```java
@Configuration  
public class FilterConfig {  
  
    @Bean  
    public FilterRegistrationBean<Filter> filterRegistrationBean() {  
        FilterRegistrationBean<Filter> filterFilterRegistrationBean = new FilterRegistrationBean<>();  
        filterFilterRegistrationBean.setFilter(new LoggingFilter());  
        filterFilterRegistrationBean.setUrlPatterns(List.of("/pattern/*"));  
        filterFilterRegistrationBean.setOrder(Integer.MIN_VALUE);  
        return filterFilterRegistrationBean;  
    }  
}
```

### @Component 로 Filter 등록
Filter 를 구현해주고 클래스 레벨에 `@Component` 를 달아주어 Bean 으로 등록해주면 알아서 Filter 가 등록된다.

> [!note] Filter 들의 urlPattern 과 Order 를 조절할 수 없다.
> urlPattern 을 지정할 수 없기 때문에 모든 요청에서 등록한 Filter 가 동작한다.

```java {2}
@Slf4j  
@Component  
public class LoggingFilter implements Filter {  
  
    @Override  
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {  
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;  
        String requestURI = httpServletRequest.getRequestURI();  
  
        log.info("{} request in", requestURI);  
        chain.doFilter(request, response);  
        log.info("{} response out", requestURI);  
    }  
}
```
