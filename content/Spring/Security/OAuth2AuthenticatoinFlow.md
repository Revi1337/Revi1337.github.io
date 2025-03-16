---
title: 기본적인 OAuth2 인증 인가 프로세스
tags:
  - oauth2
date: 2025-03-15
---

## 들어가며
OAuth2 인증을 직접 구현하기 전에, 먼저 OAuth2 인증의 전체적인 흐름을 이해하는 것이 중요합니다. 이번 포스팅에서는 `Authorization Code Grant` 방식을 이용한 OAuth2 인증을 보다 쉽게 설명하여 독자들이 그 개념을 명확하게 파악할 수 있도록 하는 것을 목표로 합니다.


## OAuth2 인증 흐름
OAuth2 인증의 흐름은 아래의 프로세스대로 흘러갑니다. `A, B, C, D, E, F, G` 순서대로 흘러갑니다. (이미지 팝업은 제공되지 않아서.. 새탭으로 이미지 띄우기로 보시는게 편할겁니다.)

![](Spring/Security/images/Pasted%20image%2020250311170536.png)


### Redirect Authorization Uri
가장 먼저 `사용자(Resource Owner)`는 자기 자신을 대신 인증해달라는 요청을 이용중인 Client(애플리케이션) 에게 보냅니다.  

요청을 받은 `Client(애플리케이션)` 는 Authorization Server 의 로그인 주소인 `authorization uri 주소` 와 `client id`, `scope`, `redirection uri` 를 결합한 주소를 `Location Header` 헤더에 담고 `302 Found` Status 코드로 User Agent(Browser) 에게 응답합니다. 

User Agent(Browser)는 응답으로 온 Location Header 에 의해 authorization uri 주소로 Redirect 되게 됩니다. 후에, 로그인 과정과 동의화면을 통해 인증 인가 과정을 거치게 됩니다.

> (A) 클라이언트는 리소스 소유자의 User Agent(Broswer)를 Authorization URI 주소로 Redirection합니다. 

![](Spring/Security/images/Pasted%20image%2020250311170549.png)


### Authenticate & Consent
Authorization Server(인가 서버) 의 로그인 주소(Authorization URI) 로 리다이렉트된 사용자(Resource Owner) 는 로그인을 하여 인가 서버에게 `"Client가 나를 대신해 Resource Server의 자원에 접근할 건데, 그 주체가 바로 나다"` 라는 것을 인증합니다.

인증을 완료한 사용자(Resource Owner)는 일종의 동의화면으로 넘어가게됩니다. 이 동의화면은 `"Client 가 필요로 하는 정보들(예를 들어 프로필 정보)을 사용자(Resource Owner)를 대신해 Resource Server 로부터 가져올 건데, 이것에 동의하겠습니까?"` 라는 의미입니다. 

> (B) 인증 서버는 리소스 소유자(사용자)를 User Agent(Browser) 를 통해 인증하고, 리소스 소유자가 클라이언트의 액세스 요청을 승인하거나 거부합니다.

![](Spring/Security/images/Pasted%20image%2020250311171557.png)


### Client Authorization Grant
"동의 및 승인" 을 선택하게 되면 `Client 가 필요로하는 자원을 사용자를 대신해 Resource Server 로부터 가져올 수 있는 권한을 승인받게 됩니다.` 승인을 받게 되면, 인가서버는 권한을 승인받았다는 의미를 담은 `Authorization Code` 발급하게 됩니다.

 > 이 때, 인가서버는 Authorization URI 의 QueryParameter 에 있는 redirect uri 가 인가서버에 등록되어 있는 주소인지 유효성을 판단하게 됩니다. 유효하면 Authorization Code redirect_uri 로 발급하게 됩니다
 

인가서버는 Authorization Code 를 `302 Found` 상태 코드와 함께 `Location` 헤더를 사용하여 `{redirect_uri}?code={authorization_code}&state=abc` 형태로 User Agent(Browser) 에게 반환하게 됩니다. 결국 브라우저는 Location 헤더로 인해 `{redirect_uri}?code={authorization_code}&state=abc` 주소로 Redirection 됩니다.

> (C) 리소스 소유자가 액세스를 승인하면, 인증 서버는 User Agent(Browser) 를 Redirection 하여 Redirection URI 를 반환합니다. 이 URI 에는 인증 코드(Authorization Code) 와 state(CSRF 공격 방지를 위함) 가 포함됩니다.

![](Spring/Security/images/Pasted%20image%2020250311171617.png)


### Request Access Token
Client 는 인가서버로부터 전달받은 Authrozation Code 을 이용하여 `Authorization Token Endpoint` 주소로 AccessToken 을 발급해달라고 `POST` 요청을 보내게 됩니다. `Access Token 은 Resource Server 에 대해 Client 가 특정 리소스에 접근할 수 있는 권한을 가졌음을 증명하는 역할` 을 합니다.

`Authorization Token Endpoint` 요청을 보낼 때  `POST Method`, Body 에는 `client_id={id}&client_secret={secret}&redirect_uri={redirect uri}&grant_type={type}&code={authorization code}`, Header 는 `Content-Type: application/x-www-form-urlencoded` 형태로 요청을 보냅니다.

> (D) 클라이언트는 인증 서버의 Token Endpoint 에 Authorization Code 를 달아 Access Token을 요청합니다. 
> (E) 인증 서버는 클라이언트를 인증하고, Authorization Code 를 검증하며, Redirect URI 가 (C) 단계(인가코드를 요청할)에서 사용된 Redirect URI 와 일치하는지 확인하고, 인가서버에 등록되어있는 redirect uri 인지 유효성을 검사합니다. 유효한 경우, 인증 서버는 AccessToken 과 선택적으로 Refresh Token 을 응답으로 반환합니다.

![](Spring/Security/images/Pasted%20image%2020250311171702.png)


### Request Protected Resource
Client는 Authorization Server 로부터 발급받은 Access Token 을 이용하여  `Resource Server` 에 접근해 Resource Owner 의 Resource 를 요청합니다. Resource Server는 Access Token을 검증한 후, 유효한 경우에만 요청된 Resource 를 응답으로 내려주게 됩니다.

> 일반적으로 리소스 서버에 Access Token 을 Authrozation: Bearer Token {access_token} 를 명시하고 리소스를 요청하지만, 드물게 Query Param 에 달아서 전송해달라는 리소스 서버도 존재합니다.

> (F) 클라이언트는 Access Token 을 이용하여 리소스 서버에 위치한 리소스 소유자의 리소스를 요청합니다.
> (G) 리소스 서버는 Access Token 을 검증한 후, 유효한 경우에만 Resource 를 내려주게 됩니다.

![](Spring/Security/images/Pasted%20image%2020250311171716.png)

### End
지금까지 OAuth2 인증 및 인가 프로세스를 자세히 알아보았습니다. 이제 Client 는 Access Token 을 가지고 사용자의 리소스를 Resource Server 로부터 가져올 수 있습니다. 하지만 Access Token은 일정 시간이 지나면 만료됩니다. 이때 새로운 `Access Token`을 발급받기 위해 Refresh Token 이 사용될 수 있습니다. Refresh Token 은 `Authorization Server 에서 함께 발급되며, 만료된 Access Token을 갱신하는 데 사용`됩니다. 이를 통해 사용자가 다시 로그인하지 않아도 지속적으로 서비스를 이용할 수 있습니다. Refresh Token 을 이용한 Token ReIssue 과정은 이번 글의 범위를 벗어나므로, 이후 포스팅에서 더 자세히 다뤄보도록 하겠습니다.

## 마치며
지금까지 `Authorization Code Grant` 방식을 이용한 OAuth2 인증 인가 프로세스를 알아보았습니다. OAuth2 의 핵심은 `Resource Owner(사용자)가 직접 Resource Server 에 접근하는 게 아니라, Client(애플리케이션)가 Resource Owner(사용자)를 대신해서 사용자 데이터에 접근할 수 있도록 인가` 하는 것을 잊지 말아야 합니다.

다음 포스팅에서는 프론트엔드와 백엔드가 분리된 환경에서 OAuth2 인증 및 인가 프로세스가 어떻게 이루어지는지 살펴보겠습니다. 특히, 프론트엔드와 백엔드가 각각 어떤 역할을 맡아야 하는지에 대해 알아보도록 하겠습니다.

[다음 포스팅 : OAuth2 인증에서 프론트와 백엔드의 역할은 어디까지일까](Spring/Security/RestOAuth2FrontendBackendRole.md)


## Reference
[RFC6749 Protocol Flow](https://datatracker.ietf.org/doc/html/rfc6749#section-1.2)

[RFC6749 Authorization Code Grant](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1)

[RFC6749 Refreshing an Expired Access Token](https://datatracker.ietf.org/doc/html/rfc6749#section-1.5)

