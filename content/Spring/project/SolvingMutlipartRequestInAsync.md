---
title: 비동기 파일 업로드시 MultipartFile 주의사항
tags: ['trouble_shoot', 'spring_mvc', 'multipart']
---

## 문제상황
최근 진행하고 있는 프로젝트에는 회원정보 수정 API가 있습니다. 해당 로직은 다음과 같은 흐름으로 동작합니다.

1. 회원 사진을 제외한 나머지 회원정보를 먼저 업데이트합니다.
2. Event 를 발행합니다.
3. 비동기적으로 EventListener 에서 회원 사진을 AWS 에 업로드 하고, 반환된 URL 을 새롭게 회원 이미지 정보에 업데이트합니다.

하지만 비동기로 처리되는 EventListener 에서 MultipartFile 에 대해 Exception 이 발생했고, 회원 사진이 정상적으로 수정되지 않는 것을 확인했습니다. 이번 포스팅에서는 예외가 일어난 이유와 그 해결방법에 대해 알아보고자 합니다.


## 왜 발생했을까?
이유는 정말 간단했습니다. `MultipartFile` 의 생명주기를 잘 모르고있었기 때문이었습니다. `MultipartFile은 요청 스레드가 종료되면 임시 파일이 자동으로 삭제되는데, 별도의 Thread 를 할당받아 사용하는 비동기 EventListener 에서는 Thread 가 달라 Multipart 의 데이터를 참조할 수 없어 예외가 났던 것` 이었습니다.

EventListener 를 비동기로 처리하지 않으면 요청에서 사용되는 Thread 와 EventListener 에서 사용되는 Thread 가 동일해 MulipartFile 에서 임시 저장된 정보를 참조할 수 있어, AWS 에 사진이 정상적으로 올라가지만

EventListener 를 비동기로 처리하게 되면 요청에서 사용되는 Thread 와 EventListener 에서 사용되는 Thread 가 달라 MultipartFile 에서 임시 저장된 정보를 참조할 수 없어, 예외가 발생한 것입니다.

![](Spring/project/images/Pasted%20image%2020250223003121.png)

## Multipart 정보는 어디서 사라지나
Multipart 정보는 Spring MVC 흐름의 큰 뼈대를 담당하는 `DispatcherServlet` 의 `doDispatch` 메서드 내부 `finally` 구문에서 사라지게 됩니다.

![](Spring/project/images/Pasted%20image%2020250223001120.png)


 해당 메서드 안에서는 MultipartResolver 의 구현체인 `StandardServletMultipartResolver` 가  MultipartHttpServletRequest 의 구현체인 `StandardMultipartHttpServletRequest` 의 Multipart 정보를 삭제시킵니다.
 
![](Spring/project/images/Pasted%20image%2020250223001307.png)


최종적으로 요청에서 사용된 Multipart 정보가 사라지게 됩니다.

![](Spring/project/images/Pasted%20image%2020250223001550.png)

## 그래서 해결책은?
해결책은 매우 간단합니다. EventListener 에게 Event 를 넘겨줄 때, Event 에 MultipartFile 자체를 넘기지말고 Byte 정보를 넣어주면 해결 가능합니다.

```java
// MemberService 일부
private void publishEventIfMultipartAvailable(MultipartFile file, Member member) {  
    if (file == null || file.isEmpty()) {  
        return;  
    }  
    try {  
        applicationEventPublisher.publishEvent(  
                new MemberUpdateEvent(member.getId(), file.getBytes(), file.getOriginalFilename())  
        );  
    } catch (IOException ignored) {  
    }
}
```


```java
// EventListener
@Slf4j  
@RequiredArgsConstructor  
@Component  
public class MemberUpdateEventListener {  
  
    private final MemberRepository memberRepository;  
    private final S3StorageManager memberS3StorageManager;  
  
    @Async  
    @Transactional(propagation = Propagation.REQUIRES_NEW)
	@TransactionalEventListener    
    public void handleMemberUpdateEvent(MemberUpdateEvent event) {  
        try {  
            Member member = memberRepository.getById(event.memberId());  
            String uploadUrl = memberS3StorageManager.updateFile(  
                    member.getProfileImage(), event.fileContent(), event.originalFilename()  
            );  
            member.updateProfileImage(uploadUrl);  
            log.debug("[사용자 프로필 이미지 업데이트 성공] : member_id = {}", event.memberId());  
        } catch (Exception e) {  
            log.error("[사용자 프로필 이미지 업데이트 실패] : member_id = {}", event.memberId());  
        }  
    }  
}
```

## 마치며
Spring MVC 흐름의 큰 뼈대를 담당하는 `DispatcherServlet` 의 `doDispatch` 의 흐름에 대해서는 굉장히 자신있었습니다. finally 구문에서 실행되는 무언가를 "그냥 리소스 정리겠지~" 라고 넘어갔었는데, 그 내용이 Multipart 관련인줄은 정말 상상조차 못했습니다. 정말.. 더 꼼꼼히 공부해야겠습니다.
