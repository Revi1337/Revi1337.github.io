---
title: Override & Overload
tags: ['language', 'java']
---

## Override
`Overriding`은 부모 클래스나 인터페이스에 존재하는 메서드를 자식 클래스에서 필요에 따라 재정의하는 것을 말합니다.

- 필수는 아니지만, 오버라이딩한 메서드 위에는 `@Override` 어노테이션을 붙이는 것이 좋습니다.
	- 컴파일러가 정확히 오버라이딩되었는지 검증하며 오타나 시그니처 불일치 시 컴파일 오류를 발생시켜 실수를 방지할 수 있습니다.
- Overriding한 메서드는 `동적 바인딩(Dynamic Binding)`이 적용되어 런타임에 실제 객체의 타입을 보고 호출할 메서드를 결정합니다.

>[!note] 동적 바인딩(Dynamic Binding)
> - 동적 바인딩은 Override에 적용되는 개념이며 런타임에 실제 객체의 타입을 보고 호출할 메서드를 결정하는 것을 말합니다.
> - 즉 컴파일 시점이 아닌 실행 시점에 실제 객체의 타입을 기준으로 호출할 메서드가 결정되므로, 다형성을 실현하는 핵심 개념입니다.


- ChildTestObject는  TestObject 를 상속하고 있으며, `add(int, int)` 메서드를 오버라이딩(재정의) 하고 있습니다.
- 오버라이딩된 메서드 내부에서 `super.add(a, b)`를 호출하여 부모 클래스의 메서드 결과를 가져오고, 여기에 `a * b`를 더해 `기능을 확장`하고 있습니다.
- 이처럼 오버라이딩은 기존 기능을 덮어쓰는 것뿐 아니라, `기존 동작을 기반으로 새로운 기능을 추가하는 데에도 사용`됩니다.

```java
public class TestObject {  
  
    public int add(int a, int b) {  
        return a + b;  
    }  
}

public class ChildTestObject extends TestObject {  
  
    @Override  
    public int add(int a, int b) {  // Override TestObject.add Method  
        int value = super.add(a, b);  
        return value + a * b;  
    }  
}
```


- Overridable 인터페이스는 `add(int, int)`라는 추상 메서드를 선언합니다.
- TestObject 클래스는 이 인터페이스를 `구현(implements)`하면서 해당 메서드를 오버라이딩합니다.
- ChildTestObject는 TestObject를 `상속(extends)`하고 같은 메서드를 다시 오버라이딩합니다.
- 결과적으로, `ChildTestObject`의 `add()`는 인터페이스에서 정의된 메서드를 구현한 형태입니다.

```java
public interface Overridable {  
  
    int add(int a, int b);  
  
}

public class TestObject implements Overridable {  
  
    @Override  
    public int add(int a, int b) { // Override Overridable.add Method  
        return a + b;  
    }  
}

public class ChildTestObject extends TestObject {  
  
    @Override  
    public int add(int a, int b) {  // Override TestObject.add Method  
        return a + b;  
    }  
}
```


## Overload
`Overload`는 같은 클래스 내에서 동일한 이름의 메서드를 매개변수 리스트(개수, 타입, 순서)를 다르게 하여 여러 개 정의하는 것을 말합니다. 이는 메서드 호출 시 컴파일러가 가장 적합한 시그니처를 찾아 바인딩합니다.

- 오버로딩이 성립하기 위해서는 `메서드 이름은 같지만 매개변수 타입과 순서가 달라야 합니다.`
- Overloading한 메서드는 `정적 바인딩(Static Binding)`이 적용되어 컴파일 타임에 호출될 메서드가 결정됩니다.

>[!note] 정적 바인딩(Static Binding)
> 정적 바인딩은 Overload에서 적용되는 개념이며 런타임 시점이 아닌 컴파일 시점에 호출할 메서드가 결정되는것을 말합니다.

> 엄밀히 말하면 Overloading은 일반적으로 컴파일 타임 다형성(Compile-Time Polymorphism)이라고도 불리지만, 실행 시점에서 동적으로 결정되는 것이 아니기 때문에 진정한 의미의 다형성(런타임 다형성)과는 구분되기도 합니다.


- `int add(int a, int b)`는 기본이되는 메서드입니다.
- `double add(int a, double b)` 는 메서드 이름이 같고 매개변수 순서가 다르기 때문에 오버로딩된 메서드입니다.
	- 반환타입은 메서드 시그니처가 포함되지 않기에 여전히 오버로딩이 성립합니다.
- `int add(double a, int b)` 는 메서드 일름이 같고 매개변수 순서가 다르기 때문에 오버로딩된 메서드입니다.
	- throws Exception 부분은 메서드 시그니처에 포함되지 않기 때문에 여전히 오버로딩이 성립합니다.

```java
public class TestObject {  
  
    public int add(int a, int b) { // Base Method  
        return a + b;  
    }  
  
    public double add(int a, double b) { // Overload Method  
        return a + (int)b;  
    }  
  
    public int add(double a, int b) throws IllegalArgumentException { // Overload Method  
        return (int)a + b;  
    }  
}
```


## Method Signature
메서드 시그니처(Method Signature)는 메서드를  고유하게 식별할 수 있는 정보를 말합니다. 컴파일러는 이 정보를 이용해 어떤 메서드를 호출할지 판단하게 됩니다.

- `메서드 이름`과 `매개변수의 타입과 순서`로 구성됩니다. 
- throws Exception 부분, 반환타입, 그리고 변수명은 메서드 시그니처에 포함되지 않습니다.


두 메서드는 시그니처가 동일하기 때문에, 하나의 메서드만 클래스에 작성할 수 있습니다. 만약 두 메서드 모두 작성한다면 `컴파일 에러`가 발생합니다.

```java
int add(int a, int b) // Method Signature: add(int, int)
int add(int x, int y) // Method Signature: add(int, int)
```


반대로 두 메서드는 시그니처가 다르기 때문에, 클래스에 동시에 정의할 수 있으며, 이는 `오버로딩이 적용된 예시`입니다.

```java
int add(int a, int b)       // Method Signature: add(int, int)
int add(double a, double b) // Method Signature: add(double, double)
```


이처럼 매개변수의 타입뿐 아니라 순서가 달라도 시그니처는 달라지므로, 이 예제들도 `오버로딩이 적용된 경우`입니다.

```java
int add(int a, double b)          // Method Signature: add(int, double)
double add(double a, int b)       // Method Signature: add(double, int)
```


## Interview
>[!question] Overriding 이 무엇인가요?
>- Overriding 은 부모 클래스 혹은 인터페이스에 존재하는 메서드를 자식 클래스에서 필요에 맞게 재정의하는 것을 의미합니다.
>- Overriding 한 메서드는 동적 바인딩(Dynamic Binding)이 적용되어 런타임에 실제 객체의 타입을 보고 호출할 메서드를 결정합니다.

^what-is-override


>[!question] Overloading 이 무엇인가요?
>- Overloading 은 같은 클래스 내에서 이미 존재하는 메서드와 동일한 이름을 사용하지만, 매개변수의 개수나 타입 혹은 순서를 다르게하여 새로운 메서드를 정의하는 것을 의미합니다.
>- 예외처리하는 부분과 반환타입은 오버로딩을 결정하는 기준이 아니며, 메서드 이름이 같고, 매개변수(개수, 타입, 순서) 가 다르면 성립합니다.
>- Overloading 한 메서드는 정적 바인딩(Static Binding)이 적용되어 컴파일 타임에 호출될 메서드가 결정됩니다.

^what-is-overload


>[!question] Overriding 과 Overloading 은 어떤 공통점과 차이점이 있나요? 
>- Overriding 과 Overloading 은 모두 같은 이름의 메서드를 정의할 수 있다는 공통점이 있습니다. 이는 객체지향 특징 중 하나인 다형성과 밀접한 관련이 있습니다.
>- 그러나 다형성을 실현하는 방식에는 차이점이 있습니다. 
>- Overriding 은 부모클래스와 자식클래스. 즉, 상속관계에서 다형성을 실현하는 반면
>- Overloading 은 같은 클래스 내에서 같은 이름의 메서드를 매개변수를 다르게 하여 여러개를 정의하는 방식으로, 컴파일 타임 다형성을 제공한다는 차이점이 있습니다.

^diff-bet-override-overload


>[!question] 동적 바인딩(Dynamic Binding) 이 뭔가요? 
>- 동적 바인딩은 런타임에 실제 객체의 타입을 보고 호출할 메서드를 결정하는 것을 의미합니다.
>- 즉, 컴파일 시점이 아니라 실행 시점에 호출할 메서드가 결정되므로, 다형성을 실현하는 핵심 개념입니다.
>- 동적 바인딩은 Overriding 에서 적용되는 개념입니다.

^what-is-dynamic-binding


>[!question] 정적 바인딩(Static Binding) 이 뭔가요? 
>- 정적 바인딩은 컴파일 타임에 호출할 메서드가 결정되는 것을 의미합니다.
>- 즉, 런타임 시점이 아니라 컴파일 시점에 호출할 메서드가 결정됩니다.
>- 정적 바인딩은 Overloading 에서 적용되는 개념입니다.

^what-is-dynamic-binding


> [!question] 메서드 시그니처(Method Signature) 가 뭔가요?
> - 메서드 시그니처는 메서드의 이름과 매개변수의 순서, 타입, 개수를 의미합니다. 메서드의 리턴타입과 예외처리하는 부분은 메서드 시그니처에 포함되지 않습니다.

^what-is-method-signature


## Reference
[가상함수와 동적 바인딩](https://plas.tistory.com/29)

[적정 바인딩과 동적 바인딩](https://hyunsb.tistory.com/58)

[오버로딩과 오버라이딩 차이](https://gmlwjd9405.github.io/2018/08/09/java-overloading-vs-overriding.html)
