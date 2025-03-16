---
title: OAuth2 기본 개념
tags: ['spring', 'oauth2']
---

## 들어가며
OAuth2 의 인증 인가 프로세를 알아보기 전에. OAuth2 가 무엇인지, OAuth2 가 왜 등장했는지, OAuth2 의 구성요소와 각 요소의 역할을 알아보고자 합니다.

## OAuth2
OAuth2(Open Authorization 2.0)는 `외부 애플리케이션(Client) 이 사용자(Resource Owner)를 대신해 안전하게 API(Resource Server)에 접근할 수 있도록 하는 인증 및 인가 프레임워크`입니다. 쉽게 말해, `비밀번호를 직접 제공하지 않고도 타사 애플리케이션이 사용자의 데이터를 특정 범위 내에서 접근할 수 있도록 허용하는 방식` 입니다.

## OAuth2 Protocol
OAuth2 프로토콜이란 `OAuth2(Open Authorization 2.0)의 규칙과 동작 방식(흐름)을 정의한 표준(Protocol) 을 의미` 합니다. 개발자가 직접 `OAuth2를 구현할 때는 OAuth2 프로토콜에서 정의한 규칙을 따라야 하고, 이를 따르는 시스템을 만들면 OAuth2를 지원하는 서비스가 되는 것`입니다.

## OAuth2 의 등장 배경
OAuth2 는 

## Keyword
### Client
- Resource Owner(사용자) 를 대신해,
- 


### Resource Owner
- Resource Server 로부터 가져오려하는 자원의 소유자를 의미합니다. 즉, `자원 소유자(사용자)`를 말합니다.

- Client 가 Resource Owner 를 대신해 Resource Server 에서 자원을 가져오려면, Resource Owner(사용자) 의 허가(Authorization) 가 필요합니다.

- `Resource Owner` 는 `Authorization Server` 를 통해 권한을 위임하고, `Client` 는 `Access Token` 을 받아 Resource Server 에게 자원을 요청할 수 있습니다.

### Client
- `Resource Owner(사용자)` 를 대신해 `Resource Server` 의 자원에 접근하려는 `Application` 을 의미합니다.
- 직접 Resource Server 의 자원에 접근할 권한이 없으며, `Authorization Server` 를 통해 `Access Token` 을 받아 인증을 거친 후 `Resource Server` 에 자원 요청을 보냅니다.

### Authorization Server
`Authorization Server(인가서버)` 는 `Client` 가 `Resource Owner(사용자)` 를 대신해 `Resource Server` 의 자원에 접근할 권한을 받을 수 있도록 중개하는 역할을 합니다. 핵심 기능은 다음과 같습니다.

1. `사용자 인증 (Authentication)`
    - 사용자가 실제로 `Resource Owner` 가 맞는지 확인합니다.
2. `권한 위임 및 승인 (Authorization)`
    - 사용자가 `Client` 에게 `Resource Server` 에 위치한 자신의 `일부 자원(scope)` 에 접근할 권한을 승인할지 결정합니다.
    - 여기서 `scope` 는 접근할 자원의 범위를 의미하며, 로그인 후 제공되는 동의 화면에서 요청한 자원에 대한 접근 권한을 승인하거나 거부할 수 있습니다.
3. `Access Token 발급`
    - 사용자가 권한을 승인한 경우(동의 화면에서 동의한 경우), `Authorization Server` 는 `Client` 에게 `Access Token` 을 발급합니다.
    - 발급된 `Access Token` 을 받은 `Client` 는 `Resource Server` 로부터 `Resource Owner` 의 일부 자원에 접근할 수 있게 됩니다.


Client 가 Resource Owner 를 대신해 Resource Server 의 자원에 접근할 권한을 받을 수 있도록 하는 자세한 과정은 다음과 같습니다.

1. Client 는 Resource Owner(사용자) 에게 특정 자원에 접근할 수 있는 권한을 요청합니다.
2. Authorization Server(인가서버) 는 Resource Owner(사용자) 를 `Authorization Server`의 로그인 페이지로 Redirect 하게 됩니다.
	- 사용자는 로그인을 하여 "Resource Server 에 접근하려는 주체가 나다" 라는 것을 인증합니다.
3. Authorization Server(인가서버) 는 Resource Owner(사용자) 를 해당 권한을 승인 및 위임하는 페이지를 제공합니다. (동의화면)
	- 해당 페이지에서 `Resource Owner(사용자)` 는 Client 가 요청한 자원에 대한 접근 권한을 승인하거나 거부할 수 있습니다.
4. Resource Owner 가 권한을 승인하면, Authorization Server 는 Client 에게 Access Token 을 발급합니다.
5. Client 는 이 Access Token 을 이용해 Resource Server 에 자원 접근을 요청할 수 있게 됩니다.

### Resource Server
