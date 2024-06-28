---
title: Multiple Pageable
---

Spring Data JPA 에서는 페이징처리에서 사용되는 Pageable 인스턴스와 해당 인스턴스의 디폴트 값을 변경할 수 있는 @PageableDefault 어노테이션을 제공한다.

```java
@GetMapping("/comments")  
public ResponseEntity<RestResponse<List<CommentsResponse>>> findComments(  
        @PageableDefault Pageable pageable,
        @RequestParam String crewName,  
        @Authenticate AuthenticatedMember ignored  
) {...}
```


위와같이 HandlerMethod 에서 @PageableDefault 를 사용하여 Pageable 인스턴스의 디폴트값을 변경할 수 있는 이유는 내부적으로 @PageableDefault 를 해석하기 위한 `PageableHandlerMethodArgumentResolver` 가 사용되기 때문이다.

### Classes 의존관계도
PageableHandlerMethodArgumentResolver 와 관련된 클래스에는`PageableHandlerMethodArgumentResolverSupport`, `PageableHandlerMethodArgumentResolverCustomizer`, `SortHandlerMethodArgumentResolver` 가 있다. 하지만 SortHandlerMethodArgumentResolver 는 범위를 벗어나므로 나중에 다뤄보기로 한다.

**PageableHandlerMethodArgumentResolverSupport**

- PageableHandlerMethodArgumentResolver 가 extends 하고 있는 클래스이며, WebRequest 로부터 페이징 정보를 만들기위한 메서드를 제공한다.

**PageableArgumentResolver**

- HandlerMethodArgumentResolver 를 extends 한 interface 이며, PageableHandlerMethodArgumentResolver 가 implement 한다.

**PageableHandlerMethodArgumentResolverCustomizer**

- PageableHandlerMethodArgumentResolver 를 마음대로 커스터마이징 할 수 있게 제공하는 Functional Interface 이다. 해당 설정을 통해 @PageableDefault 의 정보를 커스터마이징 할 수 있다.

![](SpringTip/DataJPA/images/Pasted%20image%2020240628223106.png)

## @PageableDefault 원리
PageableHandlerMethodArgumentResolver 에서는 WebRequest 로부터 Page 파라미터와 Size 파라미터를 통해 page 와 pageSize 를 가져오고  SortHandlerMethodArgumentResolver 를 통해 정렬조건을 가져온 후, Pageable 인스턴스를 만들어서 리턴하게 된다.

![](SpringTip/DataJPA/images/Pasted%20image%2020240628221747.png)


하지만 WebRequest 로부터 Page 파라미터와 Size 파라미터를 통해 page 와 pageSize 를 가져오는 작업은  
`PageableHandlerMethodArgumentResolverSupport` 가 수행한다.  기본적으로 Page 파라미터와 Size 파라미터 값이 page, size 로 정해져있고, HandlerMethod 에서 다중 Pageable 를 사용할 때 이를 구분하기 위한 Qualifier 구분자도 _ 로 설정되어 있다.

![](SpringTip/DataJPA/images/Pasted%20image%2020240628235324.png)


하지만 이러한 디폴트 값도 구현되어있는 setter 를 오버라이딩하면 커스터마이징 할 수 있다.

![](SpringTip/DataJPA/images/Pasted%20image%2020240628235436.png)

## Multiple Pageable
HandlerMethod 에서 다중 `Pageable` 를 사용하기 위해서는 `@Qualifier` 를 통해 각각의 Pageable 인스턴스를 구별할 수 있다.

> [!note] Pageable 들의 구분자.
> HandlerMethod 에서 2개 이상의 Pageable 인스턴스를 주입받는 경우에는 ${qualifier}\_가 구분자가 된다. 

```java {3,4}
@GetMapping("/comments")  
public ResponseEntity<RestResponse<List<CommentsResponse>>> findComments(  
        @Qualifier("parent") Pageable parentPageable,  
        @Qualifier("child") Pageable childPageable,  
        @RequestParam String crewName,  
        @Authenticate AuthenticatedMember ignored  
) {...}
```


하지만 이렇게되면 웹 요청을 날릴 때, 아래 curl 문과 같이 파라미터명을 `parent_size, parent_page` 그리고 `child_size, child_page` 로 구분해서 날려주어야 한다.

```bash
$curl -G "localhost:8083/api/v1/crew/comments" --data-urlencode "crewName=크루 1" --data "parent_page=1&parent_size=2&child_page=2&child_size=3" -H 'Authorization: Bearer TOKEN'
```


이럴 때는 PageableHandlerMethodArgumentResolverCustomizer 를 구현하여 QualifierDelimiter, PageParameterName, SizeParameterName 이름을 바꿔준 다음 Bean 으로 등록하게 되면, 디폴트 Qualifier 구분자와 Page 와 Size 디폴트 파라미터 이름을 변경할 수 있다.

```java
@Configuration  
public class JpaConfig {  
  
    @Bean  
    public PageableHandlerMethodArgumentResolverCustomizer customPageableResolver() {  
        return pageableResolver -> {  
            pageableResolver.setQualifierDelimiter("");  
            pageableResolver.setPageParameterName("Page");  
            pageableResolver.setSizeParameterName("Size");  
        };  
    }  
}
```


위와 같이 설정을 바꾸면 아래와 같이 자연스럽게 파라미터를 변경할 수 있다.

```bash
$curl -G "localhost:8083/api/v1/crew/comments" --data-urlencode "crewName=크루 1" --data "parentPage=1&parentSize=2&childPage=2&childSize=3" -H 'Authorization: Bearer TOKEN'
```

![](SpringTip/DataJPA/images/Pasted%20image%2020240629000113.png)


## Reference
[Spring DataJPA Web Support](https://docs.spring.io/spring-data/jpa/reference/repositories/core-extensions.html#core.web.basic)
[DataJPA Paging](https://gunju-ko.github.io/spring/2018/05/01/Spring-Data-JPA-Paging.html)