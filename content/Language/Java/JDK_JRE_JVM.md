---
title: JDK & JRE & JVM
tags: ['language', 'java']
---

> [!question] JDK 은 무엇인가요?
> - JDK 는 Java Development Kit 약어로 말 그대로 Java 개발을 위해 필요한 도구들의 집합을 의미합니다.
> - 작성한 소스코드를 ByteCode(.class 파일) 로 번역해주는 Compiler(javac). ByteCode 를 하나의 jar 파일로 압축해주는 (jar 도구), 소스코드에 명시된 주석을 바탕으로 Java Docs 를 만들 수 있게 하는 (javadoc), ByteCode 를 JAR 파일로 압축해주는 JAR 도구, 성능을 모니터링 할 수 있는 Profiler(jconsole), ByteCode 를 실행하기 위해 필요한 환경을 제공하는 JRE 를 포함합니다.
> - 즉, JDK 는 JRE + 개발도구(컴파일러, 디버거, 프로파일러) 로 구성되어 있으며, 개발자들은 이를 이용해 Java 애플리케이션을 작성하고, 컴파일하고 실행할 수 있습니다.

^what-is-jdk


> [!question] JRE 은 무엇인가요?
> - JDK 를 설치하면 자동으로 같이 설치되는 프로그램 중 하나입니다.
> - Java Runtime Environment 의 약어이며 Java 애플리케이션이 실행되는 데 필요한 환경을 제공하는 소프트웨어입니다.
> - JVM, Java 에서 제공하는 표준 라이브러리, 기타 런타임 유틸리티(Configuration Files, Security Policy) 가 포함되어있어, 애플리케이션을 실행하는데 문제가 없도록 도와줍니다.

^what-is-jre


> [!question] JVM 은 무엇인가요?
> - JRE 를 설치하면 자동으로 같이 설치되는 프로그램입니다.
> - JVM 은 Java Virtual Machine 의 약어이며 Java 로 만들어진 프로그램을 실행하기 위한 가상 머신입니다.
> - JVM 의 가장 큰 기능은 컴파일된 ByteCode(.class) 를 해석하고 실행하는 것입니다.
> - 이는 Java 가 OS 와 독립적으로 Java 프로그램을 실행할 수 있도록 하는 역할을 합니다.

^what-is-jvm


> [!question] JDK 와 JRE 차이는 무엇인가요?
> - "Java 애플리케이션을 개발할 것인지 실행만 할 것인지" 가 JDK와 JRE의 가장 큰 차이점입니다.
> - JDK 는 Java 애플리케이션을 개발하는데 필요한 필수적인 도구들을 포함한 프로그램입니다.
> - JRE 는 Java 애플리케이션을 실행하는데 필요한 환경을 제공하는 프로그램입니다.
> - 누군가 만들어놓은 Java 애플리케이션을 실행만 할거면 JRE 만 있으면 되고, 개발까지 하려면 JDK 가 필요합니다.

^diff-bet-jdk-jre

