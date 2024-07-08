---
title: Observer(옵저버) 패턴
---

옵저버 패턴은 다수의 객체가 특정 객체의 상태 변화를 감지하고 알림을 받는 패턴이다. (뭔가 중요한 일이 일어났을 때 객체들에게 새 소식을 알려줄 수 있는 패턴이라고 보면 된다). 해당 패턴을 통해 발행(Pub:Publisher)/구독(Sub:Subscriber) 패턴을 구현할 수 있다.

> [!note] 옵저버 패턴 (Observer Pattern)
> 옵저버 패턴은 한 객체의 상태가 바뀌면 그 객체에 의존하는 다른 객체에게 연락이 가고 자동으로 내용이 갱신되는 방식으로 1:N 의존성을 정의한다.


옵저버의 실제 예로는 우리가 `특정한 유튜브 채널을 구독하고 알림설정`까지 해놓았을 때, 해당 채널에서 `새로운 영상이 올라오면 알림설정을 한 구독자들에게 알림`을 돌리는것을 생각해 볼 수 있다.

> [!note] 1 : N 관계를 정의
> 조금만 생각해보면 해당 예시에서 유튜브 채널은 Subject, 구독자는 Observer 인 것을 알 수 있으며, 1 : N 관계임에 있음을 알 수 있다. 물론 Subject 도 누군가의 Observer 가 될 수도 있다.

## 필수 구현 정보

1. Subject 에서는 Observer 를 등록 및 해제할 수 있어야 한다. 그렇기 때문에 Subject 내부에서는 Observer 들을 갖고 있어야 한다.
2. Subject 에서는 Observer 들을 등록 및 해제할 수 있도록 하는 메서드를 제공해야 한다.
3. Subject 에서 이벤트가 발생했을 때, Subject 를 의존하고 있는 Observer 들에게 연락을 돌리기 위한 메서드를 제공해야 한다.
## 구현
### Observer 구현
Observer 에 대한 기능을 인터페이스로 명세한다. Subject 에는 Observer 의 이름과 Observer 에서 의존할 Subject 에서 이벤트가 발생했을 때 호출할 메서드를 명시해주면 된다.

```java
public interface Observer {  
  
    String getName();  
  
    void alert(String message);  
  
}
```

Observer 에 대한 User 구현체를 만들어준다.

```java
public class User implements Observer {  
  
    private final String name;  
  
    public User(String name) {  
        this.name = name;  
    }  
  
    @Override  
    public String getName() {  
        return this.name;  
    }  
  
    @Override  
    public void alert(String message) {  
        System.out.println(message);  
    }  
}
```

### Subject 구현
Subject 에 대한 기능을 인터페이스로 명세한다. (굳이 추상화시키지 않아도 된다). Subject 에는 Observer 를 추가 및 제거할 수 있는 메서드, 그리고 Subject 에서 이벤트가 발생했을 때 자신을 의존하고있는 Observer 들에게 연락을 돌릴 메서드가 있다.

> [!note] 디자인 원칙 : 되도록 느슨한 결합을 사용하자
> 상호작용하는 객체 사이에서는 가능하면 느슨한 결합을 사용해야 훨씬 더 유연하고 변화에 강하기 때문이다.
> Loose Coupling 은 객체들이 상호작용할 수는 있지만, 서로를 잘 모르는 관계를 의미한다.

```java
public interface Subject {  
  
    void registerObservers(Observer... observers);  
  
    void removeObservers(Observer... observers);  
  
    void notifyObservers();  
  
}
```

Subject 의 구현체 YouTubeChannel 를 만들어준다. `21` 라인의 메서드는 채널의 주인장이 새로운 영상을 올리면, 채널을 구독하고 있는 User 들에게 알림들 보내도록 만든것이다.

```java {17,21}
public class YouTubeChannel implements Subject {  
  
    private final List<Observer> observers = new ArrayList<>();  
  
    @Override  
    public void registerObservers(Observer... observers) {  
        this.observers.addAll(Arrays.asList(observers));  
    }  
  
    @Override  
    public void removeObservers(Observer... observers) {  
        this.observers.removeAll(Arrays.asList(observers));  
    }  
  
    @Override  
    public void notifyObservers() {  
        this.observers.forEach(observer -> observer.alert(observer.getName() + " 에게 알림을 발송합니다!"));  
    }  
  
    public void publishNewVideo() {  
        System.out.println("[+] 새로운 비디오 만드는 중.\n"  
                        + "[+] ... \n"  
                        + "[+] ... \n"  
                        + "[+] ... \n"  
                        + "[+] 업로드 완료..!");  
        notifyObservers();  
    }  
}
```

### 확인
`10` 라인에서는 Observer 들을 등록하고있으며, `14`  라인에서는 Observer 들을 해제시키는 것을 볼 수 있다.

```java {10, 14}
public class MainBoard {  
  
    public static void main(String[] args) {  
        YouTubeChannel youTubeChannel = new YouTubeChannel();  
  
        User user1 = new User("Revi1337");  
        User user2 = new User("Roorun1337");  
        User user3 = new User("Rookan1337");  
  
        youTubeChannel.registerObservers(user1, user2, user3);  
        youTubeChannel.publishNewVideo();  
  
        System.out.println();  
        youTubeChannel.removeObservers(user1, user2);  
        youTubeChannel.publishNewVideo();  
    }  
}
```

결과를 보면 아래와 같이 나온다.

```text
[+] 새로운 비디오 만드는 중.
[+] ... 
[+] ... 
[+] ... 
[+] 업로드 완료..!
Revi1337 에게 알림을 발송합니다!
Roorun1337 에게 알림을 발송합니다!
Rookan1337 에게 알림을 발송합니다!

[+] 새로운 비디오 만드는 중.
[+] ... 
[+] ... 
[+] ... 
[+] 업로드 완료..!
Rookan1337 에게 알림을 발송합니다!
```

## 정리
전략패턴을 사용하면 변할 수 있는 행동 및 행위들이 인터페이스를 통해 관리되므로, 애플리케이션의 로직이 변경되도 기존의 코드는 고치지 않고 확장하거나 문제가 되는 부분을 수정할 수 있다.
