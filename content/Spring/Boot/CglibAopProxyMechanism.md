---
title: 하나의 Method에 여러 Advice가 있을 때, 어떤 원리로 실행될까?
---

## 들어가며
프로젝트를 진행하던 중, `@Transactional`과 직접 만든 `@Before` 같은 어노테이션 기반 AOP를 여러 개 선언하면 어떤 방식으로 동작할까? 라는 궁금증이 생겼습니다. 물론 `@Ordered` 를 사용하면 순서를 명시적으로 지정할 수 있지만, `하나의 메서드에 적용된 여러 개의 Advice 가 어떤 원리로 실행되는지가 궁금`해 이를 정리해보고자 합니다.

### 전제조건
테스트 해보고자하는 메서드는  어노테이션을 기반으로 트랜잭션을 관리하는 @Transactional Advice 와 직접 만든 @Before Advice 를 사용합니다.

![](Spring/Boot/images/Pasted%20image%2020250315153548.png)


직접 만든 @Before Advice 는 @Transactional 보다 먼저 호출될 수 있도록  @Transactional 우선순위보다 1 적게 설정하였습니다.

![](Spring/Boot/images/Pasted%20image%2020250315153750.png)


이제 해당 API 를 호출했을 때, 하나의 Method 에서 여러개의 Advice 가 적용되는지에 대한 원리를 자세하게 알아보도록 하겠습니다.

## CglibAopProxy
API 를 호출하게되면, Controller 에서 Service 를 호출하기 때문에, Service 의 메서드가 호출됩니다. 하지만 이 때, Spring AOP 기능을 사용하였기 떄문에 내부적으로 `~~Service$$SpringCGLIB` 라는 프록시 객체가 호출되게 됩니다.

Postfix 로 `$$SpringCGLIB` 가 붙은 클래스는 Spring CGLIB 가 관리하는 Proxy 클래스를 의미합니다. 이 프록시 객체는 `CglibAopProxy` 로부터 생성되며, 본래 메서드에 적용된 `MethodInterceptor Chain` 을 활용하여 본래 메서드 호출 전후로 여러 `Advice` 들을 실행하는 매우 중요한 역할을 합니다.

> Spring CGLIB 프록시는 애플리케이션이 실행되는 초기화 단계에서 스프링이 자동으로 생성합니다. 그래서 메서드가 호출될 때마다 동적으로 생성되는 것이 아니라, 스프링 컨테이너가 초기화되는 동안 해당 대상 객체의 프록시가 생성되고, 이후에 메서드가 호출될 때 해당 프록시 객체를 통해 호출되는 원리입니다.  Spring 초기화 시, CGLIB 프록시가 생성되는 원리는 다음에 포스팅해보도록 하겠습니다.

![](Spring/Boot/images/Pasted%20image%2020250315160259.png)

`CglibAopProxy` 에서 CGLIB 프록시가 적용된 메서드 호출은 CglibAopProxy 의 Inner Class 인`DynamicAdvisedInterceptor` 의 `intercept` 메서드를 통해 처리됩니다. 이 메서드는 CGLIB 프록시 객체에서 호출된 실제 메서드 전후로 `Advice`들을 적용하는 중요한 역할을 합니다.


### 사용 가능한 MethodInterceptor  조회
현재 호출하려는 Service 메서드는 CGLIB 프록시를 기반으로 한 메서드이기 때문에, 프록시 객체는 실행하려는 메서드에 적용할 수 있는 Advice Chain 을 조회합니다.

코드에서 `this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);`  가 `this.advised`. 즉, AdvisedSupport 로부터 `메서드 실행에 적용될 Advice(MethodInterceptor) 리스트(chain)를 반환` 하는 역할을 합니다. 

> [!note] AdvisedSupport 
> - AdvisedSupport 는 AOP 프록시를 생성할 때 사용할 Advisor 들을 체인 형태로 관리하는 역할을 합니다. 실제로 실제로 내부필드에는  DefaultAdvisorChainFactory.INSTANCE 가 선언되어있습니다.

`CglibAopProxy$DynamicAdvisedInterceptor#intercept` 

![](Spring/Boot/images/Pasted%20image%2020250314172052.png)


위 `List<Object> chain`. 즉, MethodInterceptor(Advice) 체인을 반환하는 역할은`DefaultAdvisorChainFactory#getInterceptorsAndDynamicInterceptionAdvice` 에 있습니다. 

> DefaultAdvisorChainFactory#getInterceptorsAndDynamicInterceptionAdvice 는 AdvisedSupport#getInterceptorsAndDynamicInterceptionAdvice 로부터 호출됩니다.

![](Spring/Boot/images/Pasted%20image%2020250315023101.png)


`DefaultAdvisorChainFactory#getInterceptorsAndDynamicInterceptionAdvice` 메서드가 반환하는 체인속 Advice(MethodInterceptor) 들은 두가지로 구분됩니다.

1.  Static Advice (MethodInterceptor)
	- Static Advice 는 항상 적용되는 인터셉터를 의미합니다 즉, `어떤 조건 없이 특정 메서드가 호출되면 무조건 실행`됩니다.
	-  `@Transactional`, `@Cacheable` 같은 것들이 해당됩니다.
2. Dynamic Advice (MethodMatcher + MethodInterceptor)
	- Dynamic Advice 는 특정 조건을 만족하는 경우에만 실행되는 인터셉터를 의미합니다. 즉, 메서드 실행 전에 MethodMatcher 가 실행되어 Advice 를 적용할지 말지 결정합니다.
	- 직접 작성한 `@Aspect` 를 통해 Spring 에게 Advisor 생성을 위임한 경우가 해당합니다.


`DefaultAdvisorChainFactory#getInterceptorsAndDynamicInterceptionAdvice` 의 핵심로직은 다음과 같습니다. 개인적으로 중요하지 않다고 생각하는 부분은 제외했습니다.

```java
@Override  
public List<Object> getInterceptorsAndDynamicInterceptionAdvice(  
       Advised config, Method method, @Nullable Class<?> targetClass) {  
  
    Advisor[] advisors = config.getAdvisors();  
    List<Object> interceptorList = new ArrayList<>(advisors.length);  
    Class<?> actualClass = (targetClass != null ? targetClass : method.getDeclaringClass());  
    ...
  
    for (Advisor advisor : advisors) {  
       if (advisor instanceof PointcutAdvisor pointcutAdvisor) {  
          if (config.isPreFiltered() || pointcutAdvisor.getPointcut().getClassFilter().matches(actualClass)) {  
             MethodMatcher mm = pointcutAdvisor.getPointcut().getMethodMatcher();  
             boolean match;  
             if (mm instanceof IntroductionAwareMethodMatcher iamm) {  
                ...
             }  
             else {  
                match = mm.matches(method, actualClass);  
             }  
             if (match) {  
                MethodInterceptor[] interceptors = registry.getInterceptors(advisor);  
                if (mm.isRuntime()) {  
                      interceptorList.add(new InterceptorAndDynamicMethodMatcher(interceptor, mm));  
                   }  
                }  
                else {  
                   interceptorList.addAll(Arrays.asList(interceptors));  
                }  
             }  
          }  
       }  
       ...  
    }  
  
    return interceptorList;  
}
```


가장 먼저 config.getAdvisors(). 즉, AdvisedSupport 로부터 사용 가능한 `Advisor` 들을 가져옵니다. Advisor 들을 순회하면서 아래와 같은 동작이 반복됩니다.

각 Advisor 가 Advisor 를 확장한 `PointcutAdvisor` 인스턴스인지 확인합니다.

```java
if (advisor instanceof PointcutAdvisor pointcutAdvisor) {  
	...
}
```


`actualClass` 가 `Pointcut` 의 ClassFilter 를 통과하는지 확인합니다. 즉, 메서드가 어느 클래스에서 실행되는지를 확인하고, `Pointcut` 이 적용될 수 있는 클래스인지 체크합니다.

```java
if (config.isPreFiltered() || pointcutAdvisor.getPointcut().getClassFilter().matches(actualClass)) {  
	...
}
```


PointcutAdvisor 의 Pointcut 으로부터 MethodMatcher 를 가져옵니다. 그 후,  `MethodMatcher` 를 통해 `현재 메서드와 클래스가 Pointcut 의 조건을 만족하는지 체크` 합니다. `AnnotationMethodMatcher` 와 `AspectJExpressionPointuct` 이 MethodMatcher 의 대표적인 구현체 중 하나입니다.

> `mm instanceof IntroductionAwareMethodMatcher iamm` 는 무시해도 됩니다.

```java
MethodMatcher mm = pointcutAdvisor.getPointcut().getMethodMatcher();  
boolean match;  
if (mm instanceof IntroductionAwareMethodMatcher iamm) {  
	...
}  
else {  
	match = mm.matches(method, actualClass);  
}  
```


만약 MethodMatcher 로부터 true 를 반환받았다면, 현재 Advisor 에 등록된 `MethodInterceptor` 를 가져옵니다. 그리고 `MethodMatcher#isRuntime()` 을 통해 런타임 시 동적 매칭이 필요한 경우인지 확인하게 됩니다. 

동적 매칭이 필요한 경우, Advisor 체인(interceptorList) 에 `InterceptorAndDynamicMethodMatcher` 와 MethodMatcher, MethodInterceptor 를 함께 체인에 추가합니다. (Dynamic Advice)

동적 매칭이 필요하지 않은 경우, Advisor 체인(interceptorList) 에 `interceptors` 를 모두 추가합니다. (Static Advice)

> [!note] Advice 와 MethodInterceptor 차이
> - Advice 는 AOP 에서 전후로 실행되는 어떤 동작을 실행할지 정의하는 추상적인 개념입니다.
> - MethodInterceptor 는 Advice 의 구현체로, 실제 Method 객체 전후로 실행될 수 있는 동작을 나타냅니다. intercept() 를 통해 메서드를 후킹하고 Method 실행을 제어합니다.

```java
if (match) {  
	MethodInterceptor[] interceptors = registry.getInterceptors(advisor);  
	if (mm.isRuntime()) {  
		  interceptorList.add(new InterceptorAndDynamicMethodMatcher(interceptor, mm));  
	   }  
	}  
	else {  
	   interceptorList.addAll(Arrays.asList(interceptors));  
	}  
 }  
```


실행되려는 Method 에 적용하려는 Advice Chain 을 가져오는 흐름은 다음과 같습니다.


#### ExposeInvocationInterceptor 조회
가장 먼저 `ExposeInvocationInterceptor` 가 interceptorList 에 추가됩니다. ExposeInvocationInterceptor 는 @Transactional 을 사용하던, @Cacheable 을 사용하던, 직접 @Aspect 를 통해 Spring 에게 Advisor 생성을 위임하던, `Spring AOP 기능을 사용하면 추가되는 MethodInterceptor` 입니다.

![](Spring/Boot/images/Pasted%20image%2020250315035333.png)


`ExposeInvocationInterceptor` 는 현재 실행 중인 AOP 메서드 호출 (`MethodInvocation`) 을 `ThreadLocal` 에 저장하는 역할을 합니다. 즉, `실행 중인 AOP 프록시 내부에서 현재 메서드 실행 정보를 어디서든 가져올 수 있도록` 합니다.

- MethodInvocation 은 Spring AOP 에서 Method 의 대한 호출을 추상화한 인터페이스입니다.
- Spring AOP에서 프록시 객체를 통해 메서드가 호출될 때, 실제 메서드 실행을 감싸는 구조를 제공합니다. 
- 즉, 실행 중인 AOP 프록시 내부에서 현재 메서드 실행 정보를 어디서든 가져올 수 있도록 노출하는 기능을 함.

> 실제로 AspectJExpressionPointcut 에서는 현재 실행중인 메서드의 전체 흐름(MethodInvocation) 이 필요할 때가 있기 떄문에 ExposeInvocationInterceptor.currentInvocation() 를 통해 ThreadLocal 로부터 MethodInvocation 를 참조합니다.

![](Spring/Boot/images/Pasted%20image%2020250315041328.png)


#### MethodBeforeAdviceInterceptor 조회
두번째로 조회된 MethodInterceptor 는 `MethodBeforeAdviceInterceptor` 입니다. MethodBeforeAdviceInterceptor 가 추가된 이유는, 직접 만든 `@Before` Advice 를 사용했기 때문입니다. 

하지만 이번에는 Runtime 에 동적으로 매칭해야 하기 때문에 `MethodBeforeAdviceInterceptor` 와 `AspectJExpressionPointcut` 를 `InterceptorAndDynamicMethodMatcher` 로 Wrapping 해서  interceptorList 에 추가됩니다.

![](Spring/Boot/images/Pasted%20image%2020250315042019.png)


`MethodBeforeAdviceInterceptor` 는 Spring AOP 에서 `@Before` Advice 를 적용하는 인터셉터입니다.

- MethodBeforeAdviceInterceptor 는 `MethodBeforeAdvice` interface 구현한 Advice 실행합니다.
- 다른 인터셉터들과 함께 Interceptor Chain 에 포함되어 실행됩니다.

![](Spring/Boot/images/Pasted%20image%2020250315052618.png)


#### TransactionInterceptor 조회
마지막으로 `TransactionInterceptor` 가 interceptorList 에 추가됩니다. TransactionInterceptor 가 추가된 이유는 어노테이션을 기반으로 한 트랜잭션 관리(`@Transactional`) 를 사용했기 때문입니다.

![](Spring/Boot/images/Pasted%20image%2020250315043518.png)


`TransactionInterceptor` 는 Spring AOP 를 이용해 트랜잭션을 관리하는 Advice 입니다.  내부적으로 트랜잭션을 생성하거나, 기존 트랜잭션을 활용하는 역할을 합니다. 실질적인 트랜잭션 로직은 부모 클래스인 `TransactionAspectSupport`에서 구현됩니다.

![](Spring/Boot/images/Pasted%20image%2020250315044135.png)


DefaultAdvisorChainFactory 로부터 Interceptor Chain 을 반환받았으면, `CglibAopProxy$DynamicAdvisedInterceptor#invoke()` 메서드로 되돌아갑니다. 반환받은 `List<Object> chain`  을 확인해보면, 앞서 살펴본 `ExposeInvocationInterceptor` (Static Interceptor), `InterceptorAndDynamicMethodMatcher` (Dynamic Interceptor), `TransactionInterceptor` (Static Interceptor). 총 3개가 있는 것을 확인할 수 있습니다.

![](Spring/Boot/images/Pasted%20image%2020250314172611.png)


### Method 에 Interceptor 들 적용
DefaultAdvisorChainFactory 로부터 Interceptor Chain 을 반환받았으면, 곧바로 실행하려는 메서드에 AOP Interceptor 체인을 적용시키게 됩니다. 이때, 그리고 이 Interceptor Chain 은 `CglibMethodInvocation` 객체로 Wrapper 되어 실행하려는 Method 에 Interceptor Chain 을 적용시킵니다.

> 실제로 Interceptor Chain 을 적용하는 역할은 CglibAopProxy$CglibMethodInvocation 와 ReflectiveMethodInvocation 가 담당합니다.  CglibMethodInvocation 는 ReflectiveMethodInvocation 를 extends 한 객체입니다.

반환받은 Interceptor chain 이 비어있지 않으면 현재 메서드에 적용할 Advice 가 적어도 하나는 존재한다는 것을 의미하게 때문에, 메서드에 `new CglibMethodInvocation(...).proceed();` 를 통해 실행하려는 메서드에 존재하는 Advice 들을 적용시킵니다.

![](Spring/Boot/images/Pasted%20image%2020250314172726.png)


#### CglibMethodInvocation 
`CglibAopProxy$CglibMethodInvocation` 는 

- `ReflectiveMethodInvocation` 를 확장한 클래스입니다. 
- 현재 실행 중인 메서드에 대해 Interceptor(Advice) 체인을 적용하며 실행을 제어합니다.
- 정확히는 `CglibMethodInvocation#proceed()` 메서드를 호출하면, 등록된 Interceptor(Advice) 들을 차례로 실행합니다. 하지만 아쉽게도 이해하기 힘들게 `재귀적으로 동작`합니다.
- Interceptor 체인을 따라가며 순차적으로 모두 적용하면, 마지막에는 `실제 대상(target) 객체의 메서드를 호출` 합니다.

`CglibMethodInvocation#proceed()` 는 부모인 `ReflectiveMethodInvocation#proceed()` 를 호출하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314173253.png)


#### ReflectiveMethodInvocation
`ReflectiveMethodInvocation` 는 CglibMethodInvocation 의 부모 클래스입니다. CglibMethodInvocation 가 재귀적으로 동작하는 이유가 ReflectiveMethodInvocation 가 재귀적으로 동작하기 때문입니다. 

우선 재귀에서 사용되는 제일 중요한 변수 두개를 먼저 살펴보겠습니다.

1. ReflectiveMethodInvocation 에는 `this.interceptorsAndDynamicMethodMatchers`  라는 필드변수가 있습니다. 해당 변수는 CglibMethodInvocation 혹은 ReflectiveMethodInvocation 가 초기화될 때, 전달된 Interceptor Chain 의 size() 로 초기화됩니다. 
2. ReflectiveMethodInvocation 에는 `this.currentInterceptorIndex` 라는 필드변수가 있으며 `int -1` 로 초기화되어있습니다. 

`CglibMethodInvocation` 은 현재 실행 중인 메서드에 인터셉터(Advice) 체인을 하나씩 적용할 때마다 `this.currentInterceptorIndex` 를 증가시킵니다. 그리고 `this.currentInterceptorIndex` 가 인터셉터(Advice) 체인의 크기보다 하나 작은 값에 도달하면, 적용할 수 있는 모든 Advice가 실행된 것이므로 최종적으로 원래의 메서드를 호출합니다.

![](Spring/Boot/images/Pasted%20image%2020250314173642.png)


#### Invoke ExposeInvocationInterceptor 
이제 Interceptor Chain 의 `0 번째` Interceptor(Advice) 를 실행합니다. 첫번째로 Interceptor 는 앞에서 소개했던 `ExposeInvocationInterceptor` 가 실행됩니다.

`ExposeInvocationInterceptor` 는 Runtime 시에 추가 매칭 작업이 필요없는 Advice. 즉, Static Advice 이기 때문에 `InterceptorAndDynamicMethodMathcer` 의 인스턴스가 아니라고 판단되어 (MethodInterceptor) 로 형변환되어 Invoke 되게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250315135030.png)


`ExposeInvocationInterceptor` 에서는 현재 메서드의 실행 컨텍스트. 즉 `MethodInvocation` 을 ThreadLocal 에 Set 하고, 자신을 호출했던 `ReflectiveMethodInvocation#proceed()` 를 다시 호출하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250315135917.png)


하지만, `ReflectiveMethodInvocation#proceed()` 는 `CglibAopProxy$CglibMethodInvocation` 가 Override 하였기 떄문에 `CglibAopProxy$CglibMethodInvocation` 의 proceed() 가 호출되게 됩니다.

CglibMethodInvocation 의 proceed() 에서는 super.proceed(). 즉, ReflectiveMethodInvocation#proceed() 의 호출하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314181140.png)


#### Invoke InterceptorAndDynamicMethodMatcher
이제 `ReflectiveMethodInvocation` 애서 `this.currentInterceptorIndex` 를 1 증가시켜 `1 번쨰` Interceptor(Advice) 인 `InterceptorAndDynamicMethodMatcher` 를 실행시킵니다.

![](Spring/Boot/images/Pasted%20image%2020250314181243.png)


`InterceptorAndDynamicMethodMatcher` 는 Rutime 시 추가적인 동적 매칭이 필요한 (Dynamic Advice) 이기 때문에, `instanceof` 분기문에 걸리게 됩니다. 따라서 InterceptorAndDynamicMethodMatcher 에 저장했던

- MethodMatcher (`AspectJExpressionPointcut`)를 가져와 현재 실행 중인 메서드가 동적으로 Advice 적용 조건을 충족하는지 검증하고,
- MethodInterceptor (`MethodBeforeAdviceInterceptor`)를 `invoke`하여 실행 중인 메서드 전에 필요한 Advice를 실행하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314181557.png)


##### Invoke MethodBeforeAdviceInterceptor
`MethodBeforeAdviceInterceptor` 는 직접 만든 `@Before` Advice 를 실행하는 역할을 합니다. 한마디로  `this.advice`  `AspectJMethodBeforeAdvice` 의 before() 메서드를 실행하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314183458.png)


그 이후에는 내부적으로 Method 에 사용된 매개변수를 바인딩하는 과정이 이루어진 후 직접 만든 `@Before` 메서드가 실행되게 됩니다. 그 내용은 해당 포스팅 범위를 벗어나므로 흐름만 명시해두겠습니다.

- AspectJMethodBeforeAdvice  # before
- AbstractAspectJAdvice # getJoinPointMatch
- AbstractAspectJAdvice # invokeAdviceMethod
- AbstractAspectJAdvice # getJoinPoint
- AbstractAspectJAdvice # argBinding
- AbstractAspectJAdvice # invokeAdviceMethodWithGivenArgs
- Method # invoke
- DelegatingMethodAccessorImpl # invoke
- NativeMethodAccessorImpl # invoke
- NativeMethodAccessorImpl.Invoke (`native 메서드`)
- 최종적으로 직접만든 `ThrottlingAspect` 메서드가 실행됩니다.

![](Spring/Boot/images/Pasted%20image%2020250315143628.png)


직접 만든 `@Before` 메서드를 실행하면 `MethodBeforeAdviceInterceptor` 의 `invoke()` 메서드로 돌아오게 되는데요,  `mi.proceed()` 즉, 자신을 호출했던 `ReflectiveMethodInvocation#proceed()` 를 다시 호출하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314183607.png)


하지만, `ReflectiveMethodInvocation#proceed()` 는 `CglibAopProxy$CglibMethodInvocation` 가 Override 하였기 떄문에 `CglibAopProxy$CglibMethodInvocation` 의 proceed() 가 호출되게 됩니다.

CglibMethodInvocation 의 proceed() 에서는 super.proceed(). 즉, ReflectiveMethodInvocation#proceed() 의 호출하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314181140.png)


#### Invoke TransactionInterceptor
이제 `ReflectiveMethodInvocation` 애서 `this.currentInterceptorIndex` 를 1 증가시켜 `2 번쨰(마지막)` Interceptor(Advice) 인 `InterceptorAndDynamicMethodMatcher` 를 실행시킵니다.

![](Spring/Boot/images/Pasted%20image%2020250314181243.png)


`TransactionInterceptor` 는 Runtime 시에 추가 매칭 작업이 필요없는 Advice. 즉, Static Advice 이기 때문에 `InterceptorAndDynamicMethodMathcer` 의 인스턴스가 아니라고 판단되어 (MethodInterceptor) 로 형변환되어 Invoke 되게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250315145745.png)


`TransactionInterceptor#invoke` 에서는 `TransactionInterceptor#invokeWithinTransaction` 를 호출하여 트랜잭션을 새롭게 생성하거나 기존 트랜잭션에 참여시키는 등에 역항을 하게 됩니다.

> 트랜잭션 관련 작업이 종료되면 익명 CoroutinesInvocationCallback 클래스의 Callback 메서드인 proceedWithInvocation 이 호출되어 ReflectiveMethodInvocation 으로 돌아가게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314221822.png)


`TransactionInterceptor#invokeWithinTransaction` 에서는 `determineTransactionManager` 를 호출하여 `사용중인` `TransactionManager` 를 가져오고, `PlatformTransactionManager` 로 변환 후, 트랜잭션 작업을 처리하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314221926.png)


포스팅 범위를 조금은 벗어나지만, Transaction 을 생성하거나 기존 트랜잭션을 가져오는 핵심 역할은 `PlatformTransactionManager#getTransaction` 이 담당하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314222039.png)


새로운 트랜잭션이 생성되는 것을 확인할 수 있습니다.

![](Spring/Boot/images/Pasted%20image%2020250315170007.png)


트랜잭션 처리가 종료되면, `TransactionInterceptor#invoke` 로 돌아와 익명 `CoroutinesInvocationCallback` 클래스의 `processWithInvocation` `Callback` 메서드가 호출되어
`ReflectiveMethodInvocation#proceed()` 로 돌아가게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314222145.png)


하지만, `ReflectiveMethodInvocation#proceed()` 는 `CglibAopProxy$CglibMethodInvocation` 가 Override 하였기 떄문에 `CglibAopProxy$CglibMethodInvocation` 의 proceed() 가 호출되게 됩니다.

CglibMethodInvocation 의 proceed() 에서는 super.proceed(). 즉, ReflectiveMethodInvocation#proceed() 의 호출하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250314181140.png)

#### Invoke Original Method 
ReflectiveMethodInvocation 내부 Interceptor(Advice) Chain 이 모두 실행되어서,  드디어 `본래 메서드가 호출`되게 됩니다. 

![](Spring/Boot/images/Pasted%20image%2020250314222506.png)


내부적으로 `AopUtils#invokeJoinPointUsingReflection` 을 통해 본래 메서드가 호출되게 됩니다.

- `AopUtils#invokeJoinPointUsingReflection` 
- 본래 메서드 호출

![](Spring/Boot/images/Pasted%20image%2020250315151410.png)



## 사용된 Breakpoints
사용된 Breakpoint 정보들은 아래와 같습니다. 조금 많지만... 한번쯤 분석해보는것도 나쁘지 않은 경험일 것 같습니다.

![](Spring/Boot/images/Pasted%20image%2020250316221434.png)


## 마치며
지금까지 하나의 메서드에 여러 Advice 들이 적용되어있을떄, 어떤 원리로 Advice 들이 실행되는지에 대해 자세히 알아보았습니다.  정리하면

1. 호출하려는 메서드 전후로 Advice 들을 적용하는 시작점은 `CglibAopProxy$DynamicAdvisedInterceptor` 의 `intercept()` 메서드입니다.
2. `CglibAopProxy$DynamicAdvisedInterceptor` 에서 현재 CGLIB 프록시 객체에서 사용가능한 Interceptor Chain 을 조회하고 이를 `CglibMethodInvocation` 로 래핑하여 실행하려는 Method 에 Interceptor Chain 을 적용시킵니다.
3. Interceptor Chain 의 각 Interceptor 는 `CglibMethodInvocation` 와 `ReflectiveMethodInvocation` 을 통해 재귀적으로 Method 에 적용되며, Method 에 Interceptor 가 모두 적용되면 본래 메서드를 호출합니다.

가 되겠습니다. 왜 개발보다 분석이 재밌는건지 모르겠습니다. (이러면 안되는디...)


ProxyTransactionManagementConfiguration
BeanFactoryTransactionAttributeSourceAdvisor
TransactionInterceptor
TransactionAttributeSourcePointcut
AnnotationTransactionAttributeSource

TransactionInterceptor
TransactionAttributeSourcePointcut
