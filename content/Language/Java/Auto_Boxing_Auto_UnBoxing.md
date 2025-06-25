---
title: Auto Boxing & UnBoxing
tags: ['language', 'java']
---

## Boxing
`박싱(Boxing)`은 특정 기본형(Primitive Type) 값을 그에 맞는 Wrapper 클래스 객체로 변환하는 동작을 말합니다.

```java
public class BoxUnBoxExample {  
  
    public static void main(String[] args) {  
        int integer = 10;  
        Integer boxedInteger = new Integer(integer); // Boxing  
    }  
}
```


## UnBoxing
언박싱(UnBoxing)은 Wrapper 클래스를 기본 타입으로 변환하는 동작을 말합니다.

```java
public class BoxUnBoxExample {  
  
    public static void main(String[] args) {  
        Integer integer = new Integer(10);  
        int unboxedInteger = integer.intValue(); // UnBoxing
    }  
}
```


## Auto Boxing & UnBoxing
Java 1.5부터는 자바 컴파일러가 컴파일 시점에 박싱(Boxing)과 언박싱(UnBoxing)을 자동으로 처리해 줍니다. 덕분에, 기본형과 그에 대응하는 Wrapper 클래스 간의 연산이 가능해졌습니다.

```java
public class BoxUnBoxExample {  
  
    public static void main(String[] args) {  
        Integer autoBoxing = 20;             // Auto Boxing (Wrapper)  
        int autoUnboxing = new Integer(30);  // Auto UnBoxing (Primitive)  
  
        System.out.println(autoBoxing + autoUnboxing); // Wrapper + Primitive  
    }  
}
```


- 컴파일러가 Auto Boxing을 수행했기 때문에, `Integer.valueOf()`를 호출하여 기본형 값을 Wrapper 객체로 변환한 것을 확인할 수 있습니다.
- 컴파일러가 Auto Unboxing을 수행했기 때문에, `.intValue()` 메서드를 호출하여 Wrapper 객체를 기본형 값으로 변환한 것을 확인할 수 있습니다.
- Wrapper 타입과 Primitive 타입 간의 연산에서는 Auto Unboxing에 의해 `Wrapper 객체의 .intValue()`가 호출되어, Primitive 타입으로 변환된 뒤 연산이 수행되는 것을 확인할 수 있습니다.

![](Language/Java/images/Pasted%20image%2020250626031023.png)


## Performance
1억까지 더하는 동일 타입 연산에는 총 `0.029`초가 소요되었습니다.

```java
public static void main(String[] args) {  
    long st = System.currentTimeMillis();  
    int sm = 0;  
    for (int i = 1; i <= 100_000_000; i++) {  
        sm += i;  
    }  
    long end = System.currentTimeMillis() - st;  
    System.out.println("수행 시간(s): " + (end / 1000.0) + " seconds");  
}
// 수행 시간(s): 0.029 seconds
```


1억까지 더하는 오토 박싱 연산에는 총 `0.2`초가 소요되었습니다.

```java
public static void main(String[] args) {  
    long st = System.currentTimeMillis();  
    Integer sm = 0;  
    for (int i = 1; i <= 100_000_000; i++) {  
        sm += i;  
    }  
    long end = System.currentTimeMillis() - st;  
    System.out.println("수행 시간(s): " + (end / 1000.0) + " seconds");  
}
// 수행 시간(s): 0.2 seconds
```


동일 타입연산에 비해 오토 박싱 연산이 `6.9배 느린 것`을 확인할 수 있습니다.


## Reference
[gyoogle](https://gyoogle.dev/blog/computer-language/Java/Auto%20Boxing%20&%20Unboxing.html)

