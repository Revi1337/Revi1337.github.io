---
title: Spring MVC 아키텍쳐
---
## Spring MVC Architecture
Spring MVC 의 아키텍쳐는 아래와 같이 나타낼 수 있다.

![](Framework/Spring/MVC/Analyze/images/img.png)

### Request Life Cycle
Spring MVC 아키텍쳐에서 Request 의 생명주기 및 흐름은 크게 아래와 같이 나눌 수 있다

1. HTTP Request
2. WAS
3. Filter
4. Servlet (DispatcherServlet)
5. Interceptor
6. Controller (Handler)
