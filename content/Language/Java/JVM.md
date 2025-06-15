---
title: JVM
tags: ['language', 'java']
---

## JVM


## JVM Architecture
JVM(Java Virtual Machine) `Method Area`, `Heap`, `Stack`, `PC Register`, `Native Method Stack`

![](Language/Java/images/Pasted%20image%2020250616005834.png)


### Class Loader


### Runtime Area
#### Method Area
Method Area는 JVM이 시작될 때 생성되는 메모리 영역으로, 클래스 로더에 의해 로드된 클래스의 구조 정보(클래스 이름, 상속 관계, 메서드, 필드 정보), 정적 변수, 상수 풀(Constant Pool) 등이 저장됩니다. 이 영역은 모든 스레드가 공유합니다.

#### Heap
Heap은 new 키워드를 통해 동적으로 생성된 객체들이 저장되는 공간으로, 모든 스레드가 공유합니다. 이 영역은 가비지 컬렉션(GC)의 대상이 되며, 객체가 명시적으로 소멸되기 전까지 또는 GC가 회수하기 전까지 유지됩니다.


#### Stack
Stack은 각 스레드마다 독립적으로 생성되며, 메서드 호출 시 생성되는 스택 프레임이 쌓이고 제거되는 구조입니다. 각 프레임에는 지역 변수, 매개변수, 리턴 주소, 중간 연산 결과 등이 저장됩니다.


#### PC Register
PC Register는 스레드가 시작될 때 생성되며, 현재 수행중인 JVM의 명령어 주소를 저장하는 공간입니다. 즉, 스레드가 어떤 부분을 명령어로 수행할지를 저장합니다.


#### Native Method Stack
Native Method Stack은 JVM이 Java가 아닌 C/C++ 등의 네이티브 코드를 실행할 때 사용하는 별도의 스택입니다. JNI(Java Native Interface)를 통해 호출된 네이티브 메서드의 정보를 저장하며, 일반적인 Java 스택과는 분리된 영역입니다.


### Execution Engine 
Execution Engine은 Method Area에 있는 바이트코드를 실제로 실행하는 역할을 합니다. 바이트코드를 해석(인터프리팅)하거나, JIT(Just-In-Time) 컴파일을 통해 네이티브 코드로 변환하여 성능을 높이기도 합니다.


### Native Method Interface
Native Method Interface(JNI)는 자바 코드에서 C/C++로 작성된 네이티브 코드를 호출하거나, 반대로 네이티브 코드에서 자바 메서드를 호출할 수 있도록 연결해주는 인터페이스입니다.


### Native Method Library
Native Method Library는 JNI를 통해 호출되는 네이티브 메서드의 실제 구현체가 포함된 라이브러리입니다. 일반적으로 C/C++로 작성된 .dll(Windows) 또는 .so(Linux) 파일 형태로 제공됩니다.

