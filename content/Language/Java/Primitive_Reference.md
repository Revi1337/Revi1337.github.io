---
title: Primitive & Reference
tags: ['language', 'java']
---


## Primitive Type
자바의 원시 타입(Primitive Type)은 참조값이 아닌 실제 데이터 값 자체를 저장하는 기본적인 데이터 타입입니다.

- `int`, `long`, `double`, `float`, `boolean`, `byte`, `short`, `char`의 총 8가지 타입이 존재합니다.
- 이 값들은 JVM의 Runtime Data Area 중 하나인 Stack 영역에 저장됩니다.
- 기본값이 존재하기 때문에 `null 개념이 없고`, null을 사용하고 싶을 경우 `Integer`, `Double` 등의 Wrapper 클래스를 활용해야 합니다.

```java
public class JvmResearch {

    public static void main(String[] args) {
        int x = 10;
        int y = 20;
    }
}
```


위 코드에서 10은 `bipush` 명령어로 Operand Stack(피연산자 스택)에 푸시된 후, `istore_1`에 의해 Local Variable Array의 인덱스 1에 저장됩니다. 20도 동일하게 Operand Stack에 푸시되고, `istore_2` 명령어를 통해 인덱스 2에 저장됩니다.

> [!note] Keyword
> - Operand Stack: 명령어 수행에 필요한 값들을 일시적으로 담는 스택
> - Local Variable Array : 메서드 내부에서 선언된 변수들이 저장되는 스택 프레임 내의 영역

![](Language/Java/images/Pasted%20image%2020250623163507.png)


각 연산은 다음 순서로 수행됩니다. 이해를 위해 그림을 첨부합니다.

1. `bipush` → 리터럴 값을 Operand Stack에 푸시
2. `istore_N` → Stack에서 pop하여 Local Variable Array의 인덱스 N에 저장


`bipush 10 & istore_1`

![](Language/Java/images/Pasted%20image%2020250623163305.png)


`bipush 20 & istore_2`

![](Language/Java/images/Pasted%20image%2020250623163305.png)


`bipush 20 & istore_2`

![](Language/Java/images/Pasted%20image%2020250623163404.png)


## Reference Type
자바의 참조형 타입(Reference Type)은 기본형 타입을 제외한 모든 타입을 말하며, 실제 객체가 저장된 메모리 주소를 저장하는 데이터 타입입니다.

- 참조형 타입은 모두 최상위 클래스인 `Object`를 상속합니다.
- 참조형 타입의 객체(인스턴스)는 `Heap`에 생성되며, 이 객체가 위치한 메모리 주소(reference)를 저장하는 참조 변수는 Stack에 저장됩니다.
- Stack에 있는 `참조 변수를 통해 힙에 있는 실제 객체(인스턴스)에 접근`할 수 있으며, 객체의 필드나 메서드에 간접적으로 접근할 수 있슴니다.
- 즉, 참조형 변수는 객체의 실체가 아닌 객체가 위치한 메모리 주소를 통해 간접적으로 객체를 다루는 방식으로 동작합니다.
- 빈 객체를 의미하는 `null`이라는 개념이 존재하기 때문에, 런타임에 NPE가 발생할 수 있습니다.

> 참조 타입의 객체(인스턴스)는 Heap 저장되기 때문에, Garbage Collector가 돌면서 메모리를 해제합니다.

![](Language/Java/images/Pasted%20image%2020250624003528.png)

```java
public class TestClass {  
  
    public void print() {  
        System.out.println("TestClass.print");  
    }  
}

public class JvmResearch {  
  
    public static void main(String[] args) {  
        int x = 30;  
        TestClass testClass = new TestClass();  
        testClass.print();  
    }  
}
```


아래 이미지는 위 코드를 실행할 때 JVM 바이트코드 명령어의 동작 과정을 보여줍니다. 핵심은 객체가 생성되고 참조변수에 저장되는 과정입니다. (빨간 글씨)

1. `new` 명령어를 통해 Heap에 객체를 만들고, 참조값을 피연산자 스택에 push합니다.
2. `dup` 명령어를 통해 피연산자 스택의 최상단 값. 즉, 참조값을 복제하여 다시 한번 push 합니다. (이는 생성자 호출 시, 객체 참조가 필요하기 때문입니다.)
3. `invokespecial` 명령어를 통해 피연산자 스택에서 복제된 참조값을 pop 하여 생성자(`<init>`)를 호출합니다.
4. 남아있던 참조값은 `astore_2` 명령어에 의해 pop되어, 지역 변수 배열의 2번 인덱스(testClass) 에 저장됩니다.

![](Language/Java/images/Pasted%20image%2020250624002444.png)



## Reference
[Primitive Type vs Reference Type](https://velog.io/@wkdwoo/Primitive-type%EC%9B%90%EC%8B%9C%ED%83%80%EC%9E%85-vs.-Reference-type%EC%B0%B8%EC%A1%B0%ED%83%80%EC%9E%85)

[자바의 데이터 타입](https://devpad.tistory.com/57)

[바이트 코드란?](https://jueun275.tistory.com/entry/Java-%EB%B0%94%EC%9D%B4%ED%8A%B8-%EC%BD%94%EB%93%9C1-%EB%B0%94%EC%9D%B4%ED%8A%B8-%EC%BD%94%EB%93%9C%EB%9E%80)

[바이트 코드 예제](https://jueun275.tistory.com/entry/Java-%EB%B0%94%EC%9D%B4%ED%8A%B8-%EC%BD%94%EB%93%9C2-%EB%B0%94%EC%9D%B4%ED%8A%B8-%EC%BD%94%EB%93%9C-%EC%98%88%EC%A0%9C)

[Oracle new Opcode](https://docs.oracle.com/javase/specs/jvms/se10/html/jvms-6.html#jvms-6.5.new)

[Oracle dup Opcode](https://docs.oracle.com/javase/specs/jvms/se10/html/jvms-6.html#jvms-6.5.dup)
