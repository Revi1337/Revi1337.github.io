---
title: String
tags: ['language', 'java']
---

## String
- `String` 클래스는 문자열을 다루는 클래스로, Java에서 가장 많이 사용되는 클래스 중 하나입니다.
- `java.lang.String` 패키지에 포함되어 있으며, `불변(Immutable)` 객체라는 특징이 있습니다. 실제로 String 내부에서는 `private final char[] value;` 로 문자열을 관리합니다. (`Java 9 이상 부터는 private final byte[] value;` 로 문자열을 관리합니다.)

```java
public final class String  
    implements java.io.Serializable, Comparable<String>, CharSequence,  
               Constable, ConstantDesc {  

	@Stable
    private final byte[] value;
    
	...
}
```

> [!question] 문자열은 기본 데이터 유형인가요?
> - 문자열은 기본 데이터 유형(Primitive Data Type) 이 아닙니다.
> - 기본 데이터 유형은 정수, 실수, 문자, 불리언 등과 같은 간단한 데이터를 나타내는 유형입니다.
> - 문자열은 여러 문자로 구성된 데이터이며, Java 에서는 문자열 을 다루기 위해 String 클래스를 제공합니다.

> [!question] 왜 Immutable 로 설계되었을까요?
> String Constant Pool 에 있는 String 인스턴스 값이 중간에 변경되면 같은 문자열을 참고하는 다른 변수의 값도 함께 변경되는 Side Effect 가 발생할 수 있기 때문입니다.

> [!question]  왜 private final char[] value; 에서 private final byte[] value; 로 바뀌었을까요?
> - 메모리를 더 효율적으로 사용하기 위해서입니다.
> - 자바에서 char 타입은 2Byte 로 고정되어 있기 때문에, 영문자, 숫자 등 1Byte 로 표현할 수 있는 문자에 대해 불필요하게 Byte 를 사용하게 됩니다.
> - 하지만 byte[]를 사용하면, 영어 또는 숫자로만 구성된 경우 1Byte 만 사용하고, 그 외의 문자들은 2Byte 로 사용할 수 있습니다.
> - 따라서 메모리를 더 효율적으로 사용할 수 있습니다.

## 생성 방법
자바에서는 `리터럴` 방식 혹은 `new` 키워드를 통해 String 인스턴스를 만들어 줄 수 있습니다.

1. `String string = "문자열"` 
	- 리터럴 방식이며 `""` 로 String 인스턴스를 생성합니다.
	- Java 실행 시, Class 에 문자열 리터럴이 있으면 `String Constant Pool` 에 동일한 `"문자열"` 이 있는지 확인합니다. 만약 이미 있다면, 재사용되며, 없으면 새로운 String 인스턴스가 생성되어 `String Constant Pool 에 저장`됩니다.
	- 이러한 최적화를 통해 불필요한 메모리 사용을 줄일 수 있습니다.

2. `String string = new String("문자열")`
	- 명시적 방식이며 `new` 키워드로 String 인스턴스를 생성합니다.
	- 매번 새로운 String 인스턴스를 만들어 `Heap` 영역에 저장됩니다.
	- 별도의 최적화가 진행되지 않기 때문에 메모리를 많이 사용합니다.

```java
public class Solution {  
  
    public static void main(String[] args) {  
        String str1 = "hello"; // Literal  
        String str2 = new String("hello"); // new  
    }  
}
```


## 비교
문자열을 비교할때는 꼭 `동등성 비교`인 `equals()` 를 사용해야 합니다.

> [!question] 왜 꼭 동등성 비교인 equals() 를 사용해야하나요? 
> - 만약 동일성 비교인 == 를 사용하면 String Constant Pool 의 영향을 받기 때문입니다. 
> - 동일한 문자열 리터럴을 사용하는 경우 같은 참조값을 가지므로 동일성 비교에 성공하지만, 문자열 리터럴과 **new String()** 을 비교하면 같은 문자열이라해도 참조값이 달라 동일성 비교에 실패하게 됩니다.
> - 따라서 문자열 비교에는 꼭 equals() 를 사용해야 합니다.

> [!question] 그렇다면 리터럴이면 == 를 사용하고, new String() 이면 equals() 를 사용하면 되지 않나요?
> - 어떠한 경우에도 equals() 로 동등성 비교를 해야합니다.
> - 만약 두 문자열을 비교하는 메서드가 있다고 가정한다면, 매개변수로 들어오는 두개의 String 타입이 문자열 리터럴인지, new String() 으로 만들어진 객체인지 판단이 불가능하게 됩니다.
> - 따라서 그 어떠한 경우에도 문자열 비교에는 동등성 비교를 해야 합니다.

```java
public class Solution {  
  
    public static void main(String[] args) {  
        // new String() 동일성 비교 (매번 새로운 인스턴스를 만들어 Heap 영역에 저장)  
        String hello1 = new String("hello");  
        String hello2 = new String("hello");  
        System.out.println("객체 동일성 " + (hello1 == hello2)); // 동일성 (False : 서로 다른 인스턴스이기 때문)  
        System.out.println("객체 동등성 " + (hello1.equals(hello2))); // 동등성 (True : 같은 값을 가지고 있음)  
  
        // 리터럴 동일성 비교 (동일한 리터럴이 있으면 Pool 에 있는 것을 재사용. 없으면 새로운 인스턴스를 만들어 String Constant Pool 에 저장)  
        String hello3 = "hello";  
        String hello4 = "hello";  
        System.out.println("리터럴 동일성 " + (hello3 == hello4)); // 동일성 (True : String Constant Pool 에서 같은 값을 가져오기 때문)  
        System.out.println("리터럴 동등성 " + (hello3.equals(hello4))); // 동등성 (True : 같은 값을 가지고 있음)  
  
        String hello5 = "hello";  
        String hello6 = new String("hello");  
        System.out.println(isSame(hello5, hello6));  
    }  
  
    private static boolean isSame(String str1, String str2) { // str1, str2 가 문자열 리터럴인지, new String() 인지 판단 불가  
        return str1.equals(str2); // 따라서 동등성 비교를 해야함.  
    }  
}
```