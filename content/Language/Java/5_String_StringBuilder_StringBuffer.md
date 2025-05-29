---
title: String & StringBuilder & StringBuffer
tags: ['language', 'java']
---

> [!question] 문자열은 기본 데이터 유형인가요?
> - 문자열은 기본 데이터 유형(Primitive Data Type) 이 아닙니다.
> - 기본 데이터 유형은 정수, 실수, 문자, 불리언 등과 같은 간단한 데이터를 나타내는 유형입니다.
> - 문자열은 여러 문자로 구성된 데이터이며, Java 에서는 문자열 을 다루기 위해 String 클래스를 제공합니다.

^is-string-primitive


> [!question] String Class 는 뭔가요? 
> - String 클래스는 문자열을 다루기 위한 Java 의 대표적인 클래스입니다.
> - 내부적으로 문자 배열(char[])(`Java 9 이상은 바이트 배열(byte[])`) 을 사용하여 문자열 데이터를 저장하고 관리합니다.
> - 변경이 불가능한 Immutable 객체이므로, 한번 생성된 문자열을 변경할 수 없습니다. String 클래스에서 제공하는 변경 메서드를 취하거나 연산을 하면 새로운 String 객체를 반환하기 때문에 멀티 스레드 환경에서 ThreadSafe 하게 동작합니다.
> - 문자열 연산이 많다면, StringBuilder 또는 StringBuffer 를 사용하는 것이 더 효율적입니다.
> - String 객체는 Thread Safe 하다. 여러 스레드에서 동시에 특정 String 객체를 참조하더라도 안전하다.

^what-is-string-class


> [!question] 왜 String Class 는 Immutable 로 설계되었을까요?
> String Constant Pool 에 있는 String 인스턴스 값이 중간에 변경되면, 같은 문자열을 참조하는 모든 객체의 값도 함께 변경되는 Side Effect 가 발생할 수 있기 때문입니다.

^why-string-immutable


> [!question]  왜 String Class 내부 private final char[] value; 필드가 private final byte[] value; 로 바뀌었을까요?
> - 메모리를 더 효율적으로 사용하기 위해서입니다.
> - 자바에서 char 타입은 2Byte 로 고정되어 있기 때문에, 영문자, 숫자 등 1Byte 로 표현할 수 있는 문자에 대해 불필요하게 Byte 를 사용하게 됩니다.
> - 하지만 byte[]를 사용하면, 영어 또는 숫자로만 구성된 경우 1Byte 만 사용하고, 그 외의 문자들은 2Byte 로 사용할 수 있습니다.
> - 따라서 메모리를 더 효율적으로 사용할 수 있습니다.

^why-string-field-changed


> [!question] String 인스턴스를 만드는 방식은 몇가지가 있나요?
> - 2가지가 있습니다. 문자열 리터럴 방식 혹은 new String() 을 통해 String 인스턴스를 만들어 줄 수 있습니다.
> - 리터럴 방식은 더블 쿼트"" 로 묵시적인 String 인스턴스를 만들고, Heap 영역의 [String Constant Pool](Language/Java/5_String_StringBuilder_StringBuffer.md#^what-is-string-constant-pool) 에 저장됩니다.
> - new String() 은 명시적으로 새로운 인스턴스를 만들고, Heap 영역에 저장됩니다.

^how-many-string-make


> [!question] 문자열 리터럴 방식과 new String() 방식은 어떤 차이가 있나요?
> - 결론적으로 메모리 효율성에 차이가 있습니다.
> - 문자열 리터럴 방식은 Class 로드 시, Class 에 문자열 리터럴이 있으면 String Constant Pool 에 동일한 "문자열" 이 있는지 확인합니다. 만약 이미 있다면 재사용되며, 없으면 새로운 String 인스턴스가 생성되어 Heap 영역의 String Constant Pool 에 저장됩니다. 이러한 최적화를 통해 불필요한 메모리 사용을 줄일 수 있습니다.
> - new String() 방식은 매번 새로운 String 인스턴스를 만들어 Heap 영역에 저장됩니다. 별도의 최적화가 진행되지 않기 때문에 메모리 효율성이 떨어집니다.

^diff-between-literal-new


>[!question] String Constant Pool 이 뭔가요?
> - String Constant Pool 은 문자열 리터럴을 저장하는 독립된 영역입니다.
> - Hashtable 자료구조로 이루어져 있으며 JVM - Perm/Metaspace 영역에 존재합니다.
> - String은 불변객체이기 때문에 문자열의 생성 시 String Constant Pool 에 저장된 리터럴을 재사용할 수 있습니다.
> - 소스코드에 문자열 자체를 선언하거나 [String.intern()](#^what-is-intern) 메서드를 사용한 경우에만 Pool 에 저장되게 됩니다.
> - new String() 혹은 동적(계산) 으로 할당된 문자열은 Pool 에 저장되지 않습니다.

^what-is-string-constant-pool


> [!question] String.intern() 메서드는 뭔가요?
> - 동적으로 생성된 문자열을 String Constant Pool 에 직접적으로 넣어주는 메서드입니다.
> - intern 메서드는 String Constant Pool 에 해당 문자열이 있는지 검증하고 없으면 Pool 에 저장한 후 주소값을 반환하고, 있으면 기존 Pool 에 있는 주소값을 반환합니다.
> - Pool 은 GC 의 대상이 아니기 때문에, 애플리케이션이 종료될때까지 계속 메모리에 남아있습니다. 이는 메모리 릭 발생 가능성을 높이기 때문에 해당 메서드는 사용하지 않는 것이 권장됩니다. 

^what-is-intern


> [!question] 문자열 비교에는 왜 꼭 동등성 비교인 equals() 를 사용해야하나요? 
> - 만약 동일성 비교인 == 를 사용하면 String Constant Pool 의 영향을 받기 때문입니다. 
> - 동일한 문자열 리터럴을 사용하는 경우 같은 참조값을 가지므로 동일성 비교에 성공하지만, 문자열 리터럴과 **new String()** 을 비교하면 같은 문자열이라해도 참조값이 달라 동일성 비교에 실패하게 됩니다.
> - 따라서 문자열 비교에는 꼭 equals() 를 사용해야 합니다.

^why-string-comp-equals


> [!question] 그렇다면 리터럴이면 == 를 사용하고, new String() 이면 equals() 를 사용하면 되지 않나요?
> - 어떠한 경우에도 equals() 로 동등성 비교를 해야합니다.
> - 만약 두 문자열을 비교하는 메서드가 있다고 가정한다면, 매개변수로 들어오는 두개의 String 타입이 문자열 리터럴인지, new String() 으로 만들어진 객체인지 판단이 불가능하게 됩니다.
> - 따라서 그 어떠한 경우에도 문자열 비교에는 동등성 비교를 해야 합니다.

^why-string-comp-equals2


> [!question] StringBuilder 와 StringBuffer 에는 어떤 메서드가 있나요?
> - StringBuilder 와 StringBuffer 모두 AbstractStringBuilder 를 구현하고 있어 append(), insert(), delete() 메서드를 제공합니다.
> - append() 메서드는 맨 뒤에 새로운 문자 및 문자열을 추가할 수 있고, insert() 와 delete() 는 offset 기반으로 특정 위치에 문자를 추가하고, 삭제할 수 있습니다.

^diff-between-builder-buffer


> [!question] StringBuilder 와 StringBuffer 중 어떤 것이 더 성능이 좋나요? 그렇다면 왜 더 좋나요? 
> - StringBuilder 가 더 성능이 좋습니다.
> - StringBuilder 는 단일스레드 환경에서 사용하며, StringBuffer 는 멀티스레드 환경에서 사용됩니다.
> - 이것은 곧 StringBuffer 는 스레드간의 동기화가 필요하고, StringBuilder 는 필요없다는 것을 의미합니다.
> - 실제로 StringBuffer 의 대부분의 메서드에는 synchronized 키워드가 달려있어, 스레드간의 동기화(Lock 을 걸고 해제하는 과정) 과정에서 오버헤드가 발생하여 성능이 떨어질 수 있습니다. 
> - 하지만 StringBuilder 는 이러한 동기화 과정이 없기 때문에 성능상 더 이점이 있습니다.

^diff-between-builder-buffer


> [!question] Java에서 문자열을 조작하기 위한 클래스는 어떤것들이 있나요? 그들 사이의 차이점은 무엇인가요?
> - Java 에서 문자열을 조작하기 위해 주로 사용되는 클래스에는 String & StringBuilder & StringBuffer 가 있습니다. 이 클래스들은 문자열을 생성, 조작, 비교하는 데 사용됩니다.
> <br>
> - String 은 변경이 불가능한 Immutable 한 객체이며, StringBuilder & StringBuffer 는 변경이 가능한 Mutable 한 객체인 점에서 차이가 있습니다.
>   <br>
> - String은 변경 불가능한(Immutable) 클래스이기 때문에, 문자열의 수정이 필요하지 않은 경우에 주로 사용됩니다. String 클래스에서 제공하는 변경 메서드를 취하면 새로운 String 객체를 반환하게 됩니다.
>   <br>
> - StringBuilder 과 StringBuffer는 변경 가능한(Mutable) 클래스로, 문자열의 동적인 수정이 필요한 경우에 사용됩니다. StringBuilder는 단일 스레드 환경에서 사용되며, StringBuffer는 멀티스레드 환경에서 사용된다는 차이점이 있습니다.
> - StringBuffer는 동기화를 지원하여 스레드 안전성(thread-safe)을 제공합니다.



> [!question] Java 에서 반복문을 사용하지 않고 + 혹은 += 연산자로 문자열 Concatenation 을 진행할 때, 버전별 최적화 방식에 대해 설명해주세요.
> - JDK 1.5 이전에는 별도의 최적화가 진행되지 않았습니다. String 은 Immutable 한 객체이기 때문에, **+** 또는 **+=** 로 만들어지는 중간 결과들이 모두 새로운 인스턴스로 만들어져 메모리 낭비가 매우 심합니다.
>   <br>
> - JDK 1.5 이상부터는 내부적으로 StringBuilder 를 통해 최적화를 시도합니다. 
> - **+** 연산자로 합치려는 문자열들이 문자열 리터럴로만 구성되어 있는 경우에는, StringBuilder를 사용하지 않고 컴파일 시점에 문자열 리터럴들을 모두 합쳐 하나의 문자열 리터럴을 로드하는 최적화를 수행하게 됩니다. 
> - **+** 연산자로 합치려는 문자열이 동적이어서 컴파일 시점에 문자열이 합쳐질 수 없는 경우에는. 하나의 StringBuilder() 인스턴스를 만들고, 피연산자들을 append() 하여 최종적으로 하나의 문자열 인스턴스가 만들어지는 최적화를 수행하게 됩니다.
> - 그렇지 않고, **+=** 로 문자열을 합치려한다면, 런타임 시점에 **+=** 호출마다 StringBuilder() 를 새롭게 만들고, append(), toString() 이 반복적으로 호출되어 비효율적으로 메모리를 사용하게 됩니다.
> <br>
> - JDK 9 이상부터는 Indy String Concat(InvokeDynamic String Concatenation) 이 도입되어 단순한 + 연산과 반복문 대신 StringConcatFactory 가 사용됩니다.
> - String Concat 이 여러번 이루어질 때 그때마다 바로바로 String 을 이어붙이지 않고, MethodHandle 에 기억해두고 마지막에 한번에 이어붙입니다. 그렇게 되면 이어붙일 String 의 전체 사이즈를 알 수 있게 되어 byte 배열을 한 번만 할당하고 이어붙인 String 을 더 효율적으로 구할 수 있게 됩니다. 



`Java 1.8` `+` 연산자로 합치려는 문자열들이 문자열 리터럴로만 구성되어 있는 경우에는, StringBuilder 를 사용하지 않고 컴파일 시점에 문자열 리터럴들을 모두 합쳐 하나의 문자열 리터럴을 로드하는 최적화를 수행하게 됩니다. 

```java
public class Solution {  
  
    public static void main(String[] args) {  
        String result = "Test1 " + "Test2 " + "Test3 " + "Test4 " + "Test5 ";  
    }  
}
```

![](Language/Java/images/Pasted%20image%2020250214150404.png)


`Java 1.8`  `+=` 연산자로 문자열을 합치려한다면, 런타임 시점에 `+` 호출마다 StringBuilder() 를 새롭게 만들고, append(), toString() 이 반복적으로 호출되어 비효율적으로 메모리를 사용하게 됩니다.

```java
public class Solution {  
  
    public static void main(String[] args) {  
        String result = "";  
        result += "Test1 ";  
        result += "Test2 ";  
    }  
}
```

![](Language/Java/images/Pasted%20image%2020250214150053.png)


`Java 1.8` 합치려는 문자열이 동적이어서 컴파일 시점에 문자열이 합쳐질 수 없는 경우에도 런타임 시점에 StringBuilder() 객체를 하나 만들고, + 연산이 append() 로 대체되어 최종 문자열 하나만 인스턴스화 되는 최적화를 진행하게 됩니다.

```java
public class LoopStringMain {  

    public static void main(String[] args) {  
        String string1 = "Test1";  
        String string2 = "Test2";  
        String result = string1 + string2;  
    }  
}
```

![](Language/Java/images/Pasted%20image%2020250214150020.png)

`JDK 25`  

![](Language/Java/images/Pasted%20image%2020250214154528.png)

