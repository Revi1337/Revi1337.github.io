---
title: 프론트와 백엔드는 OAuth2 인증을 어디까지 처리해야할까?
tags:
  - oauth2
date: 2025-03-14
---

## 들어가며
이전 포스팅에서는 `Authorization Code Grant` 방식을 이용한 기본적인 OAuth2 인증 및 인가 프로세스에 대해 알아보았습니다. 이번 포스팅에서는 우리의 애플리케이션, 즉 Client 가 Frontend 와 Backend 로 분리된 환경에서 `Authorization Code Grant` 방식의 OAuth2 인증 및 인가 과정이 어떻게 이루어지는지 살펴보겠습니다.

특히,

- Frontend 와 Backend 가 각각 어떤 역할을 수행해야 하는지
- 이 방식이 가지는 장점과 단점은 무엇인지

에 대해 자세히 알아보고자 합니다.

### 전제 조건
이번 포스팅에서는 다음과 같은 상황을 가정합니다.

1. 우리의 Application(Client) 이 `Frontend` 와 `Backend` 로 분리되어 있습니다.
2. OAuth2 인증 방식으로 `Authorization Code Grant` 를 사용합니다.
3. 인가 서버로부터 발급받은 Access Token 은 Application 을 인증하기 위한 용도 이외에는 사용되지 않습니다.
4. Application 은 인가 서버의 Access Token 및 Refresh Token 을 직접 사용하지 않고, 자체적인 Access Token 및 Refresh Token을 사용합니다.

이제, 이러한 환경에서 OAuth2 인증 및 인가 프로세스가 어떻게 진행되는지 단계별로 살펴보겠습니다.


## OAuth2 인증 흐름과 역할
React 와 Spring 으로 나누어진 환경에서의 OAuth2 인증 인가 프로세스를 그림으로 그려보면 다음과 같습니다.

![](Spring/Security/images/Pasted%20image%2020250311163533.png)


이 과정중 Frontend 와 Backend 의 역할을 구분하면 다음과 같이 분리할 수 있습니다.
### Frontend
Frontend 는 인가서버로부터 Authorization Code 를 발급받고, Backend 에 Authorization Code 를 전달하는 역할을 수행합니다.

![](Spring/Security/images/Pasted%20image%2020250311163603.png)

- 사용자(Resource Owner)는 React의 `OAuth2 로그인 버튼` 을 클릭합니다.
- React는 `client_id`, `redirect_uri`, `scope` 등의 정보를 포함하여 인가 서버의 `authorization_uri` 로 페이지를 이동시킵니다.
- 사용자가 인가 서버의 로그인 UI를 통해 인증을 진행한 후, 동의 화면에서 권한을 승인하면 인가 서버는 `Authorization Code` 를 발급합니다.
- 발급된 Authorization Code는 `redirect_uri`를 통해 Frontend 로 전달됩니다.

### Backend
Backend 는 Frontend 로부터 전달받은 Authorization Code 를 이용하여 AccessToken 을 발급받습니다. 그리고 AccessToken 을 이용하여 사용자를 대신해 Resource Server 로부터 사용자의 정보를 조회해옵니다. 또한, 죄회해온 사용자의 정보를 토대로 애플리케이션 자체적으로 사용하는 AccessToken & RefreshToken 을 발급하여 Frontend 에게 응답합니다.

![](Spring/Security/images/Pasted%20image%2020250311163626.png)
- Frontend 는 인가 서버로부터 받은 `Authorization Code` 를 Backend 의 특정 Endpoint로 전달합니다.
- Backend 는 전달받은 `Authorization Code` 를 이용하여 `인가 서버에서 Access Token을 발급`받습니다.
- Backend는 발급받은 Access Token 을 사용하여 `Resource Server 에서 사용자 정보를 조회` 합니다.
- 사용자 정보를 기반으로
    - `신규 사용자` 라면 자동 회원가입을 진행하고,
    - `기존 사용자` 라면 로그인 처리를 수행합니다.
- 이후, Backend는 애플리케이션 자체적으로 관리하는 `Access Token & Refresh Token 을 생성하여 Frontend 에 반환` 합니다.

## Frontend 
### Authorization Code
![](Spring/Security/images/Pasted%20image%2020250311163652.png)

가장 먼저, 사용자(Resource Owner) 는 React의 `OAuth2 로그인 버튼을 클릭`합니다.React 는 사용자를 다음과 같은 정보를 포함하여` Authorization Server 의 인증 페이지(authorization_uri) 로 이동`시킵니다. 최종적으로 이동되는 페이지의 URL 은 아래와 같은 형식을 갖습니다.

```http
/authorization_uri?redirect_uri={redirect_uri(인가코드를 받고자하는 Front Endpoint)}&client_id={id}&scope={scope}
```

- `client_id`: 클라이언트 애플리케이션을 식별하는 ID
- `redirect_uri`: 인증 후 Authorization Code를 전달받을 URI
- `scope`: 애플리케이션이 요청하는 권한 범위


그 후, 

1. 사용자(Resource Owner) 는 이동된 authorization_uri 의 Login UI 에 로그인하여 자신임을 인증합니다.
2. 인증을 거치면 동의화면으로 넘어가게 됩니다. 이 동의화면은 `"Application 필요로 하는 정보들(예를 들어 프로필 정보)을 사용자(Resource Owner)를 대신해 Resource Server 로부터 가져올 건데, 이것에 동의하겠습니까?"` 라는 의미입니다. 


사용자가 `"동의 및 승인"` 을 선택하면,

- Application 은 Resource Owner 를 대신하여 `Resource Server` 에서 필요한 자원을 가져올 수 있는 권한을 부여 및 승인받게 됩니다.
- 인가서버는 `Authorization Code(인가코드)` 를 발급하고 authrozation_uri 의 Query String 에 존재하는 `redirect_uri` Query Param  주소로 `인가코드를` 붙여 아래와 같이 Redirection 시키게 됩니다.

```http
HTTP/1.1 302
Location: {redirect_uri(인가코드를 받고자하는 Front 의 Endpoint)}?code={code}
```


> [!note] 사전에 인가서버의 Redirect URI 를 Frontend 가 Code 를 받고자하는 Endpoint 로 설정해놓아야 합니다.
> Frontend 에서 Authorization Code 를 받기 위해서는, 인가 서버의 redirect_uri 를 Frontend 의 특정 Endpoint 로 등록시켜야 합니다(여러개 설정 가능합니다.). 인가 서버는 등록된 redirect_uri 와 요청에 포함된 redirect_uri 를 비교하여 일치하는 경우에만 Authorization Code 를 발급하게 됩니다. 이는 허용되지 않은 URL 로 Authorization Code 가 전달되는 것을 방지하기 위한 인가서버의 보안조치입니다.


마지막으로 Frontend 는 Authorization Code 를 Backend 의 특정 Endpoint 에 전달합니다.

## Backend
### AccessToken
Backend 는 Frontend 에서 전달한 `Authorization Code` 특정 Endpoint 에서 인가코드를 전달받습니다. 그 후, Backend 는 `client_id, client_secret, backend redirect_uri, grant_type, 전달받은 code(Authroziation Code)` 를 사용해서 인가서버의 AccessToken 발급 주소인 `token_uri` 주소에 AccessToken 을 요청합니다. 

이때, `/token_uri` 요청은 다음과 같은 형태로 보내게 됩니다.

```http
POST /token_uri
Content-Type: application/x-www-form-urlencoded

client_id={id}&client_secret={secret}&redirect_uri={redirect uri(인가코드를 받고자하는 Front Endpoint)}&grant_type={type}&code={authorization code}
```


인가서버는 token_uri 에 전달된 Query Paramter 를 검증하고 AccessToken 를 `Backend Redirect URI` 로 응답을 하게 되는데, Backend 는 이를 전달받으면 됩니다.

> [!note] AccessToken 요청에 쓰이는 Redirect URI 주소는 인가코드를 발급받을 때 사용한 Frontend Endpoint 주소와 동일해야 합니다. 
> AccessToken 을 요청을 받게 되면, 인가서버는 AccessToken 요청에 함께 전송된 redirect_uri 와 Authorization Code 를 요청할 때 사용되었던 redirect_uri 가 일치하는지 확인합니다. 이를 통해 Authorization Code 가 정확한 출처에서 온 것인지 검증합니다.

![](Spring/Security/images/Pasted%20image%2020250311163717.png)


### Resource Owner 의 Resource
Backend 는 전달받은 `AccessToken` 을 이용하여 사용자를 대신해 Resource Server 로부터 Resource Owner 의 Resource(사용자의 프로필 정보) 를 조회하여 전달받습니다.

이 때, `사용자의 Resource 를 조회하는 Endpoint`, `AccessToken 은 Authoriation Header 에 붙일지, QueryParamter 로 붙여서 보낼지에 대한 여부` 는 인가서버 혹은 리소스서버마다 상이합니다. 이는 플랫폼마다 공식문서에서 확인하는 거나 `platformURL/.well-known/configuration` 주소에서 확인해야 합니다.

```http
GET /user-profile
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer {access_token}
```


![](Spring/Security/images/Pasted%20image%2020250311163816.png)


### 자체 AccessToken & RefreshToken
사용자. 즉 Resource Owner 의 Resource(가령 프로필정보) 를 얻어온 Backend 는 이 정보를 토대로 Application 자체적으로 사용하는 `AccessToken & RefreshToken` 을 발급합니다.

하지만 토큰을 발급하기 전, 사용자 정보를 기반으로
- `신규 사용자` 라면 자동 회원가입을 진행하고,
- `기존 사용자` 라면 로그인 처리를 수행합니다.

그 후, `AccessToken & RefreshToken` 을 발급하여 Frontend 에게 토큰을 전달합니다.

![](Spring/Security/images/Pasted%20image%2020250311163829.png)


## 단점
지금까지 Frontend 와 Backend 로 분리된 Application 환경에서 `Authorization Code Grant` 방식의 OAuth2 인증 및 인가 프로세스를 알아보았습니다. 하지만 이 방식에는 한가지 단점이 있습니다.

그 단점은 바로 `Frontend에서 OAuth2 인증에 필요한 client_id 를 알고 있어야 한다는 점` 입니다.

Frontend는 OAuth2 인증 및 인가 프로세스의 첫 단계에서 `사용자(Resource Owner) 를 인가서버의 authorization_uri` 로 이동시키는 역할을 수행하는것을 확인했습니다. 하지만 이를 위해서는 `client_id`를 포함한 인증 URL 을 Frontend 에서 직접 생성해야 하며, 이는 두 가지 문제점을 초래할 수 있습니다.

1. `client_id` 가 외부에 노출될 가능성
    - Frontend 코드에서 `client_id` 를 직접 사용되므로, 악의적인 사용자가 이를 획득하여 임의로 OAuth2 인증 요청을 조작할 수 있습니다.
2. `Frontend 가 OAuth2 인증 방식에 종속`
    - Frontend 가 `client_id` 를 직접 다루는 구조이므로, 인증 방식이 변경될 경우 Frontend 코드도 수정해야 합니다.
    - 또한, OAuth2 Provider 여러 개(카카오, 구글 등)일 경우, 각각의 `client_id` 를 Frontend가 관리해야 하므로 복잡성이 증가합니다.

## 마치며
지금까지 Frontend 와 Backend 로 분리된 Application 환경에서 `Authorization Code Grant` 방식의 OAuth2 인증 및 인가 프로세스, `Frontend 와 Backend 의 역할`, `단점` 에 대해서 알아봤습니다. 다음 포스팅에서는 해당 방식에서의 단점을 해결하는 OAuth 인증 Flow 에 대해 자세히 서술해보겠습니다.

[다음 포스팅 : OAuth2 인가코드를 꼭 프론트가 받아야할까?](Spring/Security/WhyNotAuthCodeReceiveInFrontend.md)
