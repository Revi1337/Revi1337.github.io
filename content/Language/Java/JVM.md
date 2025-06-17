---
title: JVM
tags: ['language', 'java']
---

## JVM
JVM(Java Virtual Machine)은 자바 컴파일러가 생성한 바이트코드(.class 파일)를 실행하는 가상 머신입니다. JVM은 바이트코드를 하드웨어가 이해할 수 있는 네이티브 머신 코드로 변환해 실제 실행을 가능하게 합니다. JRE(Java Runtime Environment)를 설치하면 각 운영체제에 맞는 JVM이 함께 제공되기 때문에, 어떤 환경에서도 동일하게 실행될 수 있는 플랫 폼 독립성을 제공합니다.


## JVM Architecture
JVM(Java Virtual Machine)은 다음과 같은 5가지 주요 구성 요소로 이루어져 있습니다.

1. Class Loader Subsystem
    - 클래스 로딩(Loading), 링크(Linking), 초기화(Initialization) 과정을 통해 클래스 파일을 동적으로 로드하고 JVM Method Area에 적재합니다.
2. Runtime Data Areas
    - JVM이 런타임 중 사용하는 메모리 공간입니다.
        - Method Area : 클래스 메타데이터, static 변수, 메서드 정보 등을 저장합니다.
        - Heap: 인스턴스(객체)와 배열이 저장되는 영역으로, `GC(Garbage Collection)`의 대상이 됩니다.
        - Java Stack : 각 스레드마다 존재하며, 메서드 호출 시 생성되는 스택 프레임(Frame)을 저장합니다.
        - PC Register : 현재 실행 중인 JVM 명령어를 저장합니다.
        - Native Method Stack : C/C++ 등 네이티브 메서드 실행 시 사용하는 스택입니다.
3. Execution Engine
    - 바이트코드를 한 줄씩 해석하거나(Interpreting), JIT(Just-In-Time) 컴파일러를 통해 네이티브 코드로 변환하여 실행합니다.
4. Native Method Interface (JNI)
    - 자바 코드에서 C/C++로 작성된 네이티브 메서드를 호출할 수 있도록 해주는 인터페이스입니다.
5. Native Method Libraries
    - JNI를 통해 연결되는 실제 네이티브 라이브러리(.dll, .so 등)로, 운영체제의 기능을 활용할 수 있도록 해줍니다.

![](Language/Java/images/Pasted%20image%2020250617211716.png)


### ClassLoader
ClassLoader는 런타임 중에 JVM의 메소드 영역(Method Area)에 Java 클래스를 동적으로 로드하는 역할을 합니다. 이 과정은 `로드(Loading) → 링크(Linking) → 초기화(Initialization)` 순서로 진행됩니다.

![](Language/Java/images/Pasted%20image%2020250617211733.png)


#### Loading
Loading은 Class Loading의 첫 번째 단계로, 컴파일된 `.class` 파일을 `ClassLoader`가 읽어 해당 클래스의 정보를 JVM의 Method Area에 로드합니다. 이 과정에서 `해당 클래스가 JVM에 처음 로드`된다면, 그 클래스를 나타내는 `Class 객체가 생성되어 Heap에 저장`됩니다. Loading이 완료되면, 클래스는 Linking 단계로 넘어갈 준비가 완료됩니다.

- 패키지명을 포함한 클래스의 `FQCN`(Fully Qualified Class Name), `인스턴스 변수 정보`, `상위 클래스 정보(바로 위)`, 그리고 `클래스/인터페이스/열거형(enum) 여부` 등의 메타데이터가 JVM의 Method Area에 저장됩니다.

자바의 클래스 로딩은 위에서 아래로 위임되는 3계층의 ClassLoader Delegation 구조에 따라 이루어집니다. 클래스로더의 클래스 로딩 순서는 [Parent Delegation Model](Language/Java/JVM.md#Parent%20Delegation%20Model) 에서 설명합니다.

![](Language/Java/images/Pasted%20image%2020250616162946.png)

1. Bootstrap ClassLoader
	- 최상위 클래스로더
	- `jrt:/java.base` 모듈 등 JVM 필수 모듈을 로드
2. Platform ClassLoader (구 Extension ClassLoader)
	- Bootstrap ClassLoader 하위 클래스로더
	- JVM 필수는 아니지만, 표준 Java API 모듈들을 `jrt:`에서 로드
3. Application ClassLoader (구 System ClassLoader)
	- Platform ClassLoader 하위 클래스로더
	- `classpath` 경로에서 `.class`, `.jar` 파일을 로드

```java
public class TestingClassLoader {  
  
    public static void main(String[] args) {  
        ClassLoader appClassLoader = TestingClassLoader.class.getClassLoader();  
        System.out.println(appClassLoader); // ClassLoaders$AppClassLoader  
        ClassLoader platformClassLoader = appClassLoader.getParent();  
        System.out.println(platformClassLoader); // ClassLoaders$PlatformClassLoader  
        ClassLoader bootstrapClassLoader = platformClassLoader.getParent();  
        System.out.println(bootstrapClassLoader); // null (Bootstrap ClassLoader) 
    }  
}
```


##### BootStrap
`Bootstrap ClassLoader`는 모든 클래스 로더 계층의 최상위에 위치하는 클래스 로더이며, JVM이 시작될 때 가장 먼저 동작하는 클래스 로더입니다. 다른 클래스 로더들과 달리 네이티브 코드(C/C++)로 작성되어 있기 때문에 자바 코드에서 직접 다룰 수 없습니다.

- 애플리케이션에서 사용하는 일반적인 자바 클래스를 로딩하지 않으며, `java.lang.*`, `java.util.*`, `java.io` 같이 JVM 실행에 반드시 필요한 핵심 클래스들만 로드합니다.
	- Java 8까지는 `jre/lib/rt.jar` 및 기타 핵심 JAR 에 포함된 클래스들이 로드됩니다.
	- Java 9부터는 `jre/lib/rt.jar`가 사라지고 JDK 클래스들이 모듈(.jmod) 단위로 나뉘면서, 부트스트랩 클래스 로더는 `jrt:/`라는 가상 파일 시스템에서 `jrt:/java.base` 모듈을 포함한 JVM 필수적인 모듈만 로드합니다.
- ClassLoader#getParent()을 호출했을 때 null이 반환되는데, 이는 실제 존재하지 않는다는 뜻이 아니라 `JVM 내부에 구현되어 외부에서 직접 접근할 수 없기 때문`입니다.

> [!note] jrt File System
> jrt 파일 시스템은 JDK 내부에 존재하는 .jmod 파일로 분리된 모듈들을 제공하는 가상 파일 시스템입니다. 실제로는 lib/modules 에 저장된 바이너리 모듈 파일들(.jmod)을 통해 클래스를 제공합니다.

```java
public class TestingClassLoader {  
  
    public static void main(String[] args) throws ClassNotFoundException {  
        Class<?> clazz = Class.forName("java.lang.String");  
        System.out.println(clazz.getClassLoader()); // null (Bootstrap ClassLoader)  
    }  
}
```


##### Platform
`Platform ClassLoader(구 Extension ClassLoader)`는 Bootstrap ClassLoader의 하위 클래스로더입니다.

- Java9이전
	- `Extension ClassLoader`라는 이름으로, `jre/lib/ext` 디렉토리나 `java.ext.dirs` 시스템 프로퍼티로 지정된 폴더에서 확장 클래스를 로드합니다.
	- 주로 JVM의 기본 코어는 아니지만, 자바 플랫폼의 확장 기능을 제공하는 클래스들을 로드합니다.
	- Java9부터 `jre/lib/ext` 폴더 및 `java.ext.dirs` 시스템 프로퍼티는 완전히 폐지되었기 때문에, 확장 JAR을 사용하려면 `CLASSPATH` 환경 변수 또는 Java 실행 시 `-classpath` (`-cp`) 옵션을 통해 명시적으로 classpath에 추가해야 합니다.
- Java9부터
	- `Platform ClassLoader`로 명칭이 변경되었으며, 역할도 일부 수정되었습니다.
	- `jrt:/` 파일시스템에서 JVM 필수는 아니지만 표준 Java API에 해당하는 모듈들(ex: java.sql, java.net.http, jdk.crypto.ec, jdk.zipfs 등)을 로드합니다.
	- 내부적으로는 `BuiltinClassLoader`를 상속한 static inner class로 구현되어 있습니다.

![](Language/Java/images/Pasted%20image%2020250616221428.png)

```java
public class TestingClassLoader {  
  
    public static void main(String[] args) throws ClassNotFoundException {  
        Class<?> clazz = Class.forName("java.sql.Connection");  
        System.out.println(clazz.getClassLoader()); // ClassLoaders$PlatformClassLoader@3b81a1bc  
    }  
}
```


##### Application
`Application ClassLoader`는 Plaform ClassLoader 하위 클래스로더로, 애플리케이션 수준의 모든 클래스들, 즉 사용자가 작성한 클래스를 로드합니다.

- `CLASSPATH` 환경 변수나, Java 실행 시 `-classpath` 또는 `-cp` 옵션으로 지정된 경로의 클래스 파일들을 로드합니다.
- Java8까지는 `System ClassLoader` 라는 이름이었습니다.
- Java9부터 `Application ClassLoader`로 명칭이 변경되었으며, 내부적으로 `BuiltinClassLoader`를 상속하고 있고, Inner static 클래스로 구현되어 있습니다.

![](Language/Java/images/Pasted%20image%2020250616223351.png)

```java
public class TestingClassLoader {  
  
    public static void main(String[] args) throws ClassNotFoundException {  
        Class<?> clazz = Class.forName("jdk.jshell.JShell");  
        System.out.println(clazz.getClassLoader()); // ClassLoaders$AppClassLoader@64b8f8f4  
    }  
}
```


##### Parent Delegation Model
자바에서 클래스를 메모리에 로딩할 때, `Parent Delegation Model`라는 Java 클래스 로딩의 기본 원칙을 따릅니다. 이 원칙은, 하위 클래스 로더가 클래스 로딩 요청을 받으면 우선 부모 클래스 로더에게 위임(delegate)하고, 부모가 해당 클래스를 찾지 못했을 때만 자신이 직접 로딩을 시도합니다.

Java9부터 모듈시스템을 도입하면서 각 클래스로더마다 `클래스 중복 로드를 방지`하고, 로딩하려는 클래스가 포함된 모듈을 찾습니다. 찾아진 `모듈이 있다면` 해당 모듈을 로딩할 수 있는 클래스로더에게 직접 위임하고, 찾아진 `모듈이 없다면` 바로 상위 클래스로더에게 위임하는 방식으로 동작합니다.

> AppClassLoader와 PlatformClassLoader 가 extends 하고 있는 BuiltinClassLoader#loadClassOrNull 를 분석해보면 됩니다.

각 클래스로더는 다음과 같은 순서로 클래스로딩을 시도합니다.

1. 중복 모듈 방지 (`ClassLoader#findLoadedClass(cn)`)
    - 모듈 시스템은 여러 JAR(또는 모듈)에 중복된 클래스를 포함하는 문제를 막기 위해, 클래스가 어떤 모듈에 속하는지를 먼저 찾습니다.
    - 이미 로드된 클래스라면 종료합니다.
2. 클래스가 포함된 모듈 탐색(`BuiltinClassLoader#findLoadedClass(cn)`)
    - 메모리에 로드할 클래스가 포함된 모듈을 찾습니다.
    - 만약 모듈이 없으면, 바로 위 부모 클래스 로더에 클래스 로딩을 위임합니다.(`parent.loadClassOrNull(cn))
3. 모듈을 처리하는 클래스로더 확인(`loadedModule.loader()`)
	- 모듈을 처리할 수 있는 클래스로더가 현재 클래스로더라면, (`if (loader == this)`)
		- 현재 클래스로더에서 클래스를 로드합니다. (`findClassInModuleOrNull(loadedModule, cn)`)
	- 모듈을 처리할 수 있는 클래스로더가 현재 클래스로더가 아니라면, (`else`)
		- 모듈을 처리할 수 있는 클래스로더에게 직접 위임합니다. (`loader.loadClassOrNull(cn)`)
		- 바로 위 부모 클래스에게 위임하는 것이 아닙니다.
4. 최종 처리
	- 부모 클래스로더들이 재귀적으로 클래스 로딩 시도 후, AppClassLoader 로 다시 돌아오게 됩니다. 
	- 이 때, 모든 부모 클래스로더들이 클래스 로딩에 실패하여 최종결과가 null 이면, AppClassLoader 는 `classpath` 에서 클래스 로딩을 시도합니다.
	- AppClassLoader 에서도 클래스 로딩을 실패하면 `ClassNotFoundException` 발생합니다.

![](Language/Java/images/Pasted%20image%2020250617211919.png)


`클래스 중복 로드를 방지` 하는 코드는 아래와 같이 작성할 수 있습니다. `findLoadedClass` 는 proteced 메서드이므로, `getDeclaredMethod` 로 메서드를 가져와 invoke 합니다.

> VM Options에 --add-opens java.base/java.lang=ALL-UNNAMED 를 추가하여 setAccessible 을 허용해야 합니다.

```java
public class TestingClassLoader {  
  
    static class TestClass {  
    }  
    
    public static void main(String[] args) throws Exception {  
        ClassLoader classLoader = TestingClassLoader.class.getClassLoader();  
        Method method = ClassLoader.class.getDeclaredMethod("findLoadedClass", String.class);  
        method.setAccessible(true);  
  
        new TestClass(); // JVM 메모리에 미리 로드 (주석쳐서 확인해볼 것)  
        Class<?> loadedClass = (Class<?>) method.invoke(classLoader, "datastructure.array.TestingClassLoader$TestClass");  
        System.out.println(loadedClass); // JVM 에 미리 로드하면, 클래스 리턴. 아니면 null 리턴
	}  
}
```


각 ClassLoader 들이 로드하는 클래스들은 아래 코드로 확인할 수 있습니다.

```java
public class TestingClassLoader {  
  
    public static void main(String[] args) {  
        ModuleLayer.boot().modules().stream()  
                .collect(Collectors.groupingBy(  
                        m -> Optional.ofNullable(m.getClassLoader()).map(ClassLoader::getName).orElse("boot"),  
                        Collectors.mapping(Module::getName, Collectors.toCollection(TreeSet::new))))  
                .entrySet().stream()  
                .sorted(Comparator.comparingInt(e -> List.of("boot", "platform", "app").indexOf(e.getKey())))  
                .map(e -> e.getKey() + "\n\t" + String.join("\n\t", e.getValue()))  
                .forEach(System.out::println);  
    }  
}
```


#### Linking
Linking은 Loading 단계에서 Method Area로 로드된 클래스를 검증하고, 필요한 메모리를 준비하며, 관련된 참조를 실제로 연결하는 과정입니다. Linking은 아래 3단계로 구성됩니다.

![](Language/Java/images/Pasted%20image%2020250616145556.png)

1. `Verifying` 
	- 메모리에 로딩된 클래스(메타데이터)가 JVM 명세에 맞는지, JDK 버전이 호환되는지, 메서드 호출이 유효한지, 필드 접근이 허용되는지 등을 검증합니다.
	- 검증에 실패하면 VerifyException 을 발생시킵니다.
2. `Preparing` 
	- 검증을 통과한 클래스의 정적(static) 변수들을 위한 메모리 공간을 확보하고, 그 변수들을 `기본값으로 초기화`합니다.
3. `Resolving`
	- 클래스가 사용하는 다른 클래스, 메서드, 필드 등의 참조를 실제 메모리 주소(Direct Reference)로 연결합니다.
	- 즉, 메모리에 로딩된 클래스의 Constant Pool에 저장된 Symbolic Reference를, JVM이 실행할 수 있는 Direct Reference로 변환합니다.

> [!note] Keyword
> - Constant Pool: 리터럴 상수와 클래스, 메서드에 대한 참조를 저장하는 메모리 공간
> - Symbolic Reference: 문자열 또는 이름으로 된 참조 (ex: java/lang/String)
> - Direct Reference: 런타임에 실제 사용 가능한 메모리 주소나 포인터로 된 참조


#### Initialization
Initialization(초기화)은 Class Loading의 마지막 단계로, 클래스의 정적(static) 변수에 명시된 실제 값을 할당하고, static 블록을 실행하여 `클래스를 초기화`하는 단계입니다.

- 클래스의 정적 변수 값 할당과 static 블록의 실행은 `<clinit>`(Class Initializer Method)를 통해 이루어집니다.

> [!note] clinit  
> `<clinit>`은 해당 클래스를 처음 사용할 때 자동으로 호출되는 메서드입니다. 이 메서드는 개발자가 직접 작성하지 않아도, 컴파일러가 필요시 자동으로 생성합니다.


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

