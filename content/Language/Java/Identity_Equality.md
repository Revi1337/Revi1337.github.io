---
title: Identity & Equality
tags: ['language', 'java']
---

## Identity
동일성(Identity)은 두 객체가 `정확히 같은 객체인지를 판단`하는 개념입니다. 이는 두 변수가 참조하고 있는 객체의 메모리 주소가 동일한지를 비교하여, 같으면 같은 인스턴스(두 객체가 동일하다)라고 얘기할 수 있습니다.

- `==` 연산자를 사용하여 객체의 동일성을 비교합니다.
- `==` 연산자는 기본형에서는 값 자체를 비교하고, 참조형에서는 동일성(메모리 주소)를 비교합니다.

```java
public class IdentityAndEquality {  
  
    static class DummyObject {  
    }  
    
    public static void main(String[] args) {  
        DummyObject obj1 = new DummyObject(); // research.array.Equality$DummyObject@3796751b  
        DummyObject obj2 = new DummyObject(); // research.array.Equality$DummyObject@67b64c45  
  
        DummyObject obj3 = obj1;  
  
        System.out.println(obj1 == obj2); // false  
        System.out.println(obj1 == obj3); // true  
    }  
}
```


## Equality
동등성(Equality)은 두 객체가 `동일한 정보(내용)를 갖고 있는지를 판단`하는 개념입니다. 두 변수가 참조하고 있는 객체의 주소가 서로 다르더라도 내용만 같으면 두 객체는 동등하다고 얘기할 수 있습니다.

- `.equals()` 메서드를 사용하여 객체의 동등성을 비교합니다.
- `.equals()` 메서드는 오버라이딩하지 않으면 기본적으로 `==` 연산자와 동일하게 동일성(Identity)를 비교합니다.
	- 모든 객체는 `Object` 클래스를 상속하므로, `.equals()` 메서드를 오버라이딩하지 않으면 `Object` 클래스에 정의된 기본 구현이 동작합니다.
	- 이 기본 구현은 `return (this == obj);`로, 동일한 객체인지(동일성)를 비교합니다.
	- 따라서 `.equals()` 메서드를 오버라이딩하여 동등성 비교 로직을 직접 정의할 수 있습니다.

![](Language/Java/images/Pasted%20image%2020250625003207.png)


따라서, `equals()` 메서드를 오버라이딩하지 않으면 두 객체가 같은 메모리 주소를 참조하고 있는지를 비교하는 동일성 비교만 수행됩니다.

```java
public class IdentityAndEquality {  
  
    static class DummyObject {  
  
        private final String name;  
  
        public DummyObject(String name) {  
            this.name = name;  
        }  
    }  
  
    public static void main(String[] args) {  
        DummyObject obj1 = new DummyObject("object1");  
        DummyObject obj2 = new DummyObject("object1");  
  
        System.out.println(obj1 == obj2); // false  
        System.out.println(obj1.equals(obj2)); // false  
    }  
}
```


하지만, `equals()` 메서드를 오버라이딩하면, 두 객체의 내용이 같은지 판단하는 동등성 비교 로직을 정의할 수 있습니다. 아래 예시에서는 `name` 이라는 필드가 같다면. 즉 객체의 정보가 동일하여 `동등하다`고 간주하도록 구현했습니다.

> hashCode()는 equals()와 항상 함께 오버라이딩해야 HashSet, HashMap 등에서 예상대로 작동합니다. hashCode 에 대한 내용은 나중에 다루겠습니다.

```java
public class IdentityAndEquality {  
  
    static class DummyObject {  
  
        private final String name;  
  
        public DummyObject(String name) {  
            this.name = name;  
        }  
  
        @Override  
        public boolean equals(Object o) {  
            if (this == o) return true;  
            if (!(o instanceof DummyObject that)) return false;  
            return Objects.equals(name, that.name);  
        }  
  
        @Override  
        public int hashCode() {  
            return Objects.hashCode(name);  
        }  
    }  
  
    public static void main(String[] args) {  
        DummyObject obj1 = new DummyObject("object1");  
        DummyObject obj2 = new DummyObject("object1");  
  
        System.out.println(obj1 == obj2); // false  
        System.out.println(obj1.equals(obj2)); // true  
    }  
}
```


## String equals
- 먼저 비교 대상과 메모리주소로 동일성을 판단합니다.
- `String` 타입이 아니라면 `false`를 반환합니다.
- 문자열 압축이 활성화되어 있을 경우, `coder` 값이 서로 다르면 `false`를 반환합니다.
	- Java 9이상부터는 `Compact Strings`로 인해 `LATIN1` 또는 `UTF16` 인코딩을 사용하므로, `coder`가 다르면 내용이 다를 가능성이 높습니다.
- 실제 문자열을 이루는 `byte[]` 를 비교합니다.

![](Language/Java/images/Pasted%20image%2020250625020323.png)


## Integer equals
- 먼저, 비교 대상이 `Integer` 타입인지 검사합니다.
- `Integer` 타입이라면, 비교 대상 객체를 형변환한 뒤, 내부의 `int` 값을 꺼냅니다.
- 그런 다음, 현재 객체가 갖고 있는 `int` 값과 `==` 연산자를 통해 값의 같은지 비교합니다.
	- `int`는 기본형이므로, `==` 연산자는 값 자체를 비교하며 동일성(identity) 개념은 적용되지 않습니다.
	- 따라서 기본형 타입끼리의 `==` 연산은 메모리 주소가 아닌 실제 값을 비교합니다.

![](Language/Java/images/Pasted%20image%2020250625020258.png)


## ArrayList equals
- 먼저 비교 대상과 메모리주소로 동일성을 판단합니다.
- 타입이 `List`인지 검사합니다.
- 정확히 `ArrayList` 타입이면 `equalsArrayList()`를 실행하고, 아니라면 `equalsRange()`를 실행합니다.
	- equalsArrayList()는 인덱스 기반으로 동등성을 비교합니다.
	- equalsRange()는 다양한 List 구현체에 대해 Iterator를 통해 동등성을 비교합니다.
- 비교 중 리스트의 구조가 변경되었는지(`modCount`) 검사하여, 동시 수정이 감지되면 예외(`ConcurrentModificationException`)를 발생시킵니다.

![](Language/Java/images/Pasted%20image%2020250625020232.png)


## Reference
[List 내부 구조 탐험 (4)]https://blog.naver.com/gomets_journey/223319509902

[동일성과 동등성](https://steady-coding.tistory.com/534)

