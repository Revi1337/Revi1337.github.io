---
title: PagableDefault 동작원리
tags: ['jpa', 'data_jpa']
---

## 들어가며
DataJPA 에서 제공하는 `@PagableDefault` 어노테이션은 페이징을 매우 쉽게 처리할 수 있도록 도와주는 어노테이션입니다. 이 어노테이션은 HandlerMethod 의 Argument 에 명시해주면 되는데, 해당 어노테이션을 처리하는 클래스가 바로`PageableHandlerMethodArgumentResolver` 입니다. `PageableHandlerMethodArgumentResolver` 동작 원리와 관련된 클래스들은 [[Spring/DataJPA/Multiple_Pageable|Class 의존관계도]]  를 참고하면 됩니다.

PageableHandlerMethodArgumentResolver 는 `resolveArgument` 메서드를 통해 Request 로부터 page 와 size 파라미터를 추출 후, Pageable 인스턴스를 생성하여 반환하게 되어, Controller 에서 사용할 수 있게 됩니다.

**PageableHandlerMethodArgumentResolver**
![](Spring/DataJPA/images/Pasted%20image%2020240920143440.png)


하지만, PageableHandlerMethodArgumentResolver 는 단점이 하나 있다(장점일수도 있음). 바로 page 와 size 파라미터가 음수값이 들어오거나 null 이 들어왔을 때, @PagableDefault 의 속성값에 명시한 디폴트 값으로 바꿔준다는 것이다.


## 예외 상황 1
DataJPA 에서 던지는 첫번째 예외는 `@PageableDefault(size = -10)` 와 같이 default size 의 값을 음수로 설정했을때이다.

```java {5}
@GetMapping("/comments/more")  
public ResponseEntity<RestResponse<List<CrewCommentResponse>>> findMoreChildComments(  
        @RequestParam Long crewId,  
        @RequestParam Long parentId,  
        @PageableDefault(size = -10) Pageable pageable,  
        @Authenticate AuthenticatedMember ignored  
) {  
    List<CrewCommentResponse> childComments = crewCommentService.findMoreChildComments(crewId, parentId, pageable).stream()  
            .map(CrewCommentResponse::from)  
            .toList();  
  
    return ResponseEntity.ok().body(RestResponse.success(childComments));  
}
```


Web 에서 요청이 들어오면 `PageableHandlerMethodArgumentResolver` 가 HandlerMethod 매개변수에 달려있는 @PageableDefault 의 디폴트 값을 검사하고 Pageable 인스턴스를 반환하게 된다. @PageableDefault 의 디폴트 값은 PageableHandlerMethodArgumentResolver 가 확장하고 있는  `PageableHandlerMethodArgumentResolverSupport` 가 수행하게 되는데 해당 부분에서 예외가 발생하게 된다.

**PageableHandlerMethodArgumentResolverSupport 의 getDefaultPageRequestFrom()**
![](Spring/DataJPA/images/Pasted%20image%2020240920153937.png)

## 예외 상황 2

