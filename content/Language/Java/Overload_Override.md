---
title: Override & Overload
tags: ['language', 'java']
---

>[!question] Overriding 이 무엇인가요?
>- Overriding 은 부모 클래스 혹은 인터페이스에 존재하는 메서드를 자식 클래스에서 필요에 맞게 재정의하는 것을 의미합니다.
>- Overriding 한 메서드는 동적 바인딩(Dynamic Binding)이 적용되어 런타임에 실제 객체의 타입을 보고 호출할 메서드를 결정합니다.

^what-is-overriding


>[!question] Overloading 이 무엇인가요?
>- Overloading 은 같은 클래스 내에서 이미 존재하는 메서드와 동일한 이름을 사용하지만, 매개변수의 개수나 타입 혹은 순서를 다르게하여 새로운 메서드를 정의하는 것을 의미합니다.
>- 예외처리하는 부분과 반환타입은 오버로딩을 결정하는 기준이 아니며, 메서드 이름이 같고, 매개변수(개수, 타입, 순서) 가 다르면 성립합니다.
>- Overloading 한 메서드는 정적 바인딩(Static Binding)이 적용되어 컴파일 타임에 호출될 메서드가 결정됩니다.

^what-is-overriding


>[!question] Overriding 과 Overloading 은 어떤 공통점과 차이점이 있나요? 
>- Overriding 과 Overloading 은 모두 같은 이름의 메서드를 정의할 수 있다는 공통점이 있습니다. 이는 객체지향 특징 중 하나인 다형성과 밀접한 관련이 있습니다.
>- 그러나 다형성을 실현하는 방식에는 차이점이 있습니다. 
>- Overriding 은 부모클래스와 자식클래스. 즉, 상속관계에서 다형성을 실현하는 반면
>- Overloading 은 같은 클래스 내에서 같은 이름의 메서드를 매개변수를 다르게 하여 여러개를 정의하는 방식으로, 컴파일 타임 다형성을 제공한다는 차이점이 있습니다.

^diff-bet-overriding-overloading


>[!note] 엄밀히 말하면 Overloading 은 다형성을 실현한다고 보기 어려운 개념입니다.
>- 다형성(Polymorphism) 은 동적 바인딩(Dynamic Binding) 을 통해 동일한 코드가 다양한 실행 결과를 가지는 것을 의미합니다.
>- 하지만 Overloading 은 정적 바인딩(Static Binding) 방식 때문에, 다형성을 실현하는 개념이라고 보기에 애매할 수 있습니다.


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

