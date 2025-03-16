---
title: 통합환경에서의 OAuth2 인증 인가 프로세스
tags: ['spring', 'oauth2']
---

## 들어가며
OAuth2 인증을 직접 구현하기 전에, 먼저 OAuth2 인증의 전체적인 흐름을 이해하는 것이 중요합니다. 이번 포스팅에서는 OAuth2 인증을 보다 쉽게 설명하여 독자들이 그 개념을 명확하게 파악할 수 있도록 하는 것을 목표로 합니다.

## OAuth2 인증 흐름
OAuth2 인증의 흐름은 아래의 프로세스대로 흘러갑니다. `빨간색 은 Request`, `파란색은 Response`, `초록색은 Redirect` 를 의미합니다.

![](Spring/Security/images/Pasted%20image%2020250304210659.png)

### Delegating Authentication
가장 먼저 사용자(Resource Owner)는 자기 자신을 대신 인증해달라는 요청을 이용중인 Client(애플리케이션) 에게 보냅니다. 요청을 받은 Client(애플리케이션) 은 사용자를 Authrozation Server 의 로그인 주소(Authorization URI) 로 리다이렉트 시키게 됩니다.

![](Spring/Security/images/Pasted%20image%2020250304211241.png)

### Client Authorization Grant
Authorization Server(인가 서버) 의 로그인 주소(Authorization URI) 로 리다이렉트된 사용자(Resource Owner) 는 로그인을 하여 인가 서버에게 `"Client가 나를 대신해 Resource Server의 자원에 접근할 건데, 그 주체가 바로 나다"` 라는 것을 인증합니다.

인증을 완료한 사용자(Resource Owner)는 일종의 동의화면으로 넘어가게됩니다. 이 동의화면은 `"Client 가 필요로 하는 정보들(예를 들어 프로필 정보)을 사용자(Resource Owner)를 대신해 Resource Server로부터 가져올 건데, 이것에 동의하겠습니까?"` 라는 의미입니다. 

"동의" 를 선택하게 되면 `Client 가 필요로하는 자원을 사용자를 대신해 Resource Server 로부터 가져올 수 있는 권한을 승인받게 됩니다.` 승인을 받게 되면, 인가서버는 권한을 승인받았다는 의미를 담은 `Authroziation Code` 를 사전에 등록했던 `Redirect URI` 주소로 반환하게 됩니다.

> 물론 Redirect URI 주소는 Client 의 주소로 설정해놔야 합니다.

![](Spring/Security/images/Pasted%20image%2020250304211322.png)


### AccessToken 
Client 는 인가서버로부터 전달받은 Authrozation Code 을 이용하여 `Authorization Token URI` 주소로 AccessToken 을 발급해달라고 요청을 보내게 됩니다. `Access Token 은 Resource Server 에 대해 Client 가 특정 리소스에 접근할 수 있는 권한을 가졌음을 증명하는 역할` 을 합니다.

![](Spring/Security/images/Pasted%20image%2020250304211206.png)

### Request Resource Server
Client는 발급받은 Authorization Server 의 Access Token 을 이용하여  `Resource Server` 에 접근합니다. Resource Server는 이 Access Token 을 검증한 후, 유효한 경우에만 요청된 Resource 를 응답으로 내려주게 됩니다.

![](Spring/Security/images/Pasted%20image%2020250304211425.png)

### End
여기까지가 OAuth2 인증 및 인가 프로세스의 전부입니다. 그림에서 직접 그리지는 않았지만 인증 및 인가를 마치면, Client는 Resource Server로부터 가져온 Resource를 이용하여 다음과 같은 흐름을 따르게 됩니다.

- `이미 등록된 회원이 존재하는 경우`
	- Resource Server에서 제공한 사용자 정보를 기반으로 기존 회원과 매칭되는지 확인합니다.  
	- 만약 동일한 계정이 이미 존재한다면, 해당 사용자의 세션을 생성하고 로그인 처리를 진행합니다.
    
- `등록된 회원이 존재하지 않는 경우`
	- OAuth2를 통해 제공받은 사용자 정보를 바탕으로 새로운 회원을 등록합니다.      
	- 등록한 계정의 세션을 생성하고 로그인 처리를 진행합니다.
	- 이 과정에서 추가적인 정보 입력이 필요할 수도 있으며, 기본적인 프로필 데이터를 활용하여 회원 계정을 생성할 수도 있습니다. 

## 마치며
지금까지 OAuth2 인증 인가 프로세스를 알아보았습니다. OAuth2 의 핵심은 `Resource Owner(사용자)가 직접 Resource Server 에 접근하는 게 아니라, Client(애플리케이션)가 Resource Owner(사용자)를 대신해서 접근할 수 있도록 인가` 하는 것입니다. 

다음 포스팅에서는 Frontend(SPA) 와 Backend 로 나누어진 REST API  환경에서의 OAuth2 인증 인가 프로세스 흐름에 대해 알아보도록 하겠습니다.

