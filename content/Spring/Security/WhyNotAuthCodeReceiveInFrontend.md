---
title: OAuth2 인가코드를 꼭 Frontend가 받아야할까?
tags: ['spring', 'oauth2']
---

## 들어가며
안녕하세요. [이전 포스팅](Spring/Security/RestOAuth2FrontendBackendRole.md) 에서는 Client 가 Frontend 와 Backend 로 분리된 환경에서 `Authorization Code Grant` 방식의 OAuth2 인증 및 인가 과정이 어떻게 이루어지는지 살펴보고 Frontend 와 Backend 가 각각 어떤 역할을 수행해야 하는지, 해당 방식이 갖는 단점에 대해 다뤄보았습니다.

 그 결과로 `client_id` 가 외부에 노출될 가능성과 `Frontend 가 OAuth2 인증 방식에 종속` 된다는 문제가 있었습니다.

따라서 해당 포스팅에서는 `client_id` 가 외부에 노출될 가능성을 없애고 `Frontend 가 OAuth2 인증 방식에 종속` 되지 않게 OAuth2 인증 인가 프로세스를 수행하는 방법에 대해 다뤄보고자 합니다.


### 전제 조건
이번 포스팅에서도 이전 포스팅과 같은 상황을 가정합니다.

1. 우리의 Application(Client) 이 `Frontend` 와 `Backend` 로 분리되어 있습니다.
2. OAuth2 인증 방식으로 `Authorization Code Grant` 를 사용합니다.
3. 인가 서버로부터 발급받은 Access Token 은 Application 을 인증하기 위한 용도 이외에는 사용되지 않습니다.
4. Application 은 인가 서버의 Access Token 및 Refresh Token 을 직접 사용하지 않고, 자체적인 Access Token 및 Refresh Token을 사용합니다.

이제, 이러한 환경에서 OAuth2 인증 및 인가 프로세스가 어떻게 진행되는지 단계별로 살펴보겠습니다.


## OAuth2 인증 흐름과 역할
`client_id` 가 외부에 노출될 가능성을 없애고 `Frontend 가 OAuth2 인증 방식에 종속` 되지 않게 OAuth2 인증 인가를 진행하는 프로세스는 다음과 같습니다.

![](Spring/Security/images/Pasted%20image%2020250311230601.png)


이 과정들을 Frontend 와 Backend 의 역할로 구분하면 다음과 같이 분리할 수 있습니다.


### Frontend
Frontend 가 해야할 일은 매우 적습니다.

- Frontend 는 Backend 에게 인가서버의 로그인 주소인 `Authorization URI` 를 요청합니다. 
- Backend 는 `Authorization URI` 주소를 Location 헤더에 담아 전송하는데, Frontend 는 이 Location 헤더 값을 참조하여 인가서버의 Authorization URI 주소로 직접 Redirection 시킵니다.
- 백엔드가 애플리케이션 자체적으로 사용되는 AccessToken & RefershToken 을 포함한 Frontend 의 특정 주소로 리다이렉션시키면, Frontend 는 `accessToken` 과 `refreshToken` 쿼리파람을 추출하여 이를 관리합니다.

![](Spring/Security/images/Pasted%20image%2020250311231104.png)


### Backend
Backend OAuth2 인증 인가의 모든 프로세스를 담당합니다.

- 유효한 인가서버의 Authorization URI 를 만들어서 Frontend 에게 내려줍니다. Location 헤더에 담아 Frontend 에게 내려줍니다.
- 인가서버가 반환하는 Authorization Code(인가코드) 를 전달받습니다.
- Authorization Code(인가코드) 로 인가서버에 AccessToken 을 요청하고 응답받습니다.
- 인가서버의 AccessToken 으로 Resource Owner 를 대신하여 Resource Server 에서 사용자 데이터를 조회합니다.
- 조회한 사용자 데이터로 회원가입 및 로그인 처리를 진행합니다.
- 애플리케이션 자체적으로 사용하는 AccessToken & Refresh Token 을 생성합니다.
- `302 FOUND / Location: FrontendURL?accessToken={token}&refreshToken={token}` 주소로 리다이렉션 시킵니다.

![](Spring/Security/images/Pasted%20image%2020250311231542.png)


##  상세 프로세스
### Frontend: Request Authorization URI
가장 먼저, 사용자(Resource Owner) 는 React의 `OAuth2 로그인 버튼을 클릭` 합니다. 버튼을 누르면 React 는 `인가서버의 Authorization URI 를 반환해주는 Backend 의 Endpoint` 에 요청을 보냅니다.

![](Spring/Security/images/Pasted%20image%2020250311235328.png)

### Backend: Response Authorization URI
Frontend 에게 인가서버의 Authorization URI 를 달라는 요청을 받은 Backend 는 `client_id`, `redirect_uri`, `scope` 등의 정보를 이용하여 유효한 authorization_uri 주소를 생성합니다. 그리고 `200 OK / Location: {authorization_uri}` 형태로 Frontend 에게 반환합니다.

```http
HTTP/1.1 200
Location: {authorization_uri}?client_id={id}&redirect_uri={uri}&scope={scope}...
```

> [!note] 왜 302 FOUND 가 아니라 200 OK 인가요?
> 기본적으로, JavaScript 의 axios 나 fetch 는 Redirection 을 자동으로 처리합니다. 즉, 서버가 302 응답을 보내면, axios 나 fetch 는 Location 에 명시된 URL로 자동으로 요청을 다시 보내고 그 결과를 반환합니다. 만약 Backend 에서 302 FOUND / Location: {authorization_uri} 형태로 응답을 하게 되면 Frontend 가 Location 헤더에 명시된 주소를 추출할 수 없게 됩니다.
^why-not-302

> [!note] Backend 는 Access-Control-Expose-Headers 에 Location 을 추가해주어야 합니다.
> 기본적으로, 웹 브라우저에서는 Access-Control-Allow-Headers 에 명시된 Header 만 Frontend 쪽 JavaScript 코드에서 접근할 수 있습니다. Location 헤더는 Redirection 응답에서 사용되기 때문에, 이를 Frontend 에서 접근하려면 Backend 에서 Access-Control-Expose-Headers 에 Location 헤더를 추가시켜주어야 합니다. 
^why-add-access-control-expose-headers-location

![](Spring/Security/images/Pasted%20image%2020250311235845.png)


### Frontend: Redirect Resource Owner To Authorization URI
Backend 가 `Location: {authrozation_uri}` 로 응답을 내려주면 Frontend 는 Location Header 를 참조하여 authrozation_uri 를 추출한 후, `Resource Owner 를 authrozation_uri 주소로 직접 수동으로 Redirect` 시킵니다.

![](Spring/Security/images/Pasted%20image%2020250312000612.png)


### Resource Owner: Login & Consent
React 에서 직접 Resource Owner 의 User Agent(Chrome Browser) 를 인가 서버의 authrozation_uri 주소로 이동시키면, `Resource Owner` 는 다음과 같은 행동을 취하게 됩니다.

1. 사용자(Resource Owner) 는 이동된 authorization_uri 의 Login UI 에 로그인하여 자신임을 인증합니다.
2. 인증을 거치면 동의화면으로 넘어가게 됩니다. 이 동의화면은 `"Application 필요로 하는 정보들(예를 들어 프로필 정보)을 사용자(Resource Owner)를 대신해 Resource Server 로부터 가져올 건데, 이것에 동의하겠습니까?"` 라는 의미입니다. 


여기서 Resource Owner. 즉, 사용자가 `"동의 및 승인"` 을 선택하면,

- Application 은 Resource Owner 를 대신하여 `Resource Server` 에서 필요한 자원을 가져올 수 있는 권한을 부여 및 승인받게 됩니다.
- 인가서버는 `Authorization Code(인가코드)` 를 발급하고 authrozation_uri 의 Query String 에 존재하는 `redirect_uri` Query Param  주소로 `인가코드를` 붙여 아래와 같이 Redirection 시키게 됩니다.

```http
HTTP/1.1 302
Location: {redirect_uri(인가코드를 받고자하는 Backend 의 Endpoint)}?code={code}
```

> [!note] 사전에 인가서버의 Redirect URI 를 Backend 가 Code 를 받고자하는 Endpoint 로 설정해놓아야 합니다.
> Backend 가 Authorization Code 를 받기 위해서는, 인가 서버의  redirect_uri 를 Backend 의 특정 Endpoint 로 등록시켜야 합니다(여러개 설정 가능합니다). 인가 서버는 등록된 redirect_uri 와 요청에 포함된 redirect_uri 를 비교하여 일치하는 경우에만 Authorization Code 를 발급하게 됩니다. 이는 허용되지 않은 URL 로 Authorization Code 가 전달되는 것을 방지하기 위한 인가서버의 보안조치입니다.

![](Spring/Security/images/Pasted%20image%2020250312002740.png)


### Backend: Receive Authorization Code & Fetch Access Token
인가 서버가 `Authorization Code(인가 코드)` 를 `authorization_uri` 의 쿼리스트링에 포함된 `redirect_uri`로 반환하면, Backend는 사전에 등록한 `"인가 코드를 받을 Endpoint"`에서 인가 코드를 전달받습니다.

코드를 전달받고 나면, Backend 는 인가코드를 이용해 `인가서버의 Token URI(Token Endpoint)` 에  Access Token 을 발급해달라고 요청을 보내고, 인가서버로부터 Access Token 을 전달받습니다.

```http
POST /token_uri
Content-Type: application/x-www-form-urlencoded

client_id={id}&client_secret={secret}&redirect_uri={redirect uri}&grant_type={type}&code={authorization code}
```


![](Spring/Security/images/Pasted%20image%2020250312003941.png)


### Backend: Fetch Resource Owner's Resource
인가서버로부터 `Access Token` 를 전달받으면, Backend 는 `Access Token` 을 이용하여 Resource Server 와 통신하여 `Resource Owner` 의 Resource 를 조회합니다. 이 때  `Resource Owner` 의 데이터를 조회할 수 있는 Endpoint 는 인가서버 및 리소스 서버마다 상이합니다.

```http
GET /user-profile
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer {access_token}
```


![](Spring/Security/images/Pasted%20image%2020250312004700.png)

### Backend: Build AccessToken & RefreshToken & Redirect Frontend
인가서버가 발급해준 AccessToken 를 이용하여 Resource Server 에서 Resource Owner 의 Resource(가령 프로필 정보) 를 얻어왔다면 Backend 는 해당 정보를 기반으로 

- `신규 사용자` 라면 자동 회원가입을 진행하고,
- `기존 사용자` 라면 로그인 처리를 수행합니다.

로그인 처리를 진행하고나면, 애플리케이션에서 자체적으로 사용하는 Access Token 과 Refresh Token 을 발급합니다. 마지막으로 `{FrontendURL}?accessToken={token}&refreshToken={token}` 주소로 리다이렉트시킬 수 있도록 응답합니다.

```http
HTTP/1.1 302 
Location: {FrontendURL}?accessToken={token}&refreshToken={token}
```

> [!question] 왜 꼭 302 Found / Location 을 사용해서 Frontend 로 Redirection 시키나요?
> 지금까지의 과정을 살펴보면 AccessToken 발급, 사용자 프로필을 조회, 애플리케이션 자체적인 AccessToken & RefreshToken 발급하는 모든 과정은 인가서버가 **302/Found Location: redirect_uri?code={인가코드}**. 즉, 인가코드를 포함한 Backend 주소로 리다이렉션 되고 시작됩니다. 
> <br>
> 하지만 만약, Backend 가 **302/Found {FrontendURL}?accessToken={token}&refreshToken={token}** 로 리다이렉트 시키지 않고, 200 이나 201 혹은 다른 다른 상태코드와 함께 JSON Body 를 내려주면 사용자의 User Agent(브라우저) 는 이 응답을 직접 받을 수 없기 때문에 애플리케이션 자체적인 AccessToken 과 RefreshToken 을 전달받을 수 없게 됩니다. 


![](Spring/Security/images/Pasted%20image%2020250312005322.png)

### Frontend: Receive AccessToken & RefreshToken
Frontend 는 Backend 가 리다이렉션한 `302 Found / Location` 응답을 받아서, URL Query Parameter 에 포함된 `AccessToken & RefreshToken` 을 추출합니다. 후에 이 토큰들을 프론트엔드에서 로컬스토리지에 넣든 다른곳에 넣든 관리하면 됩니다.


## 단점 해결
[이전 포스팅](Spring/Security/RestOAuth2FrontendBackendRole.md) 에서는 `client_id` 가 외부에 노출될 가능성과 `Frontend 가 OAuth2 인증 방식에 종속` 된다는 문제가 있었습니다. 하지만 이번 OAuth2 인증 인가 프로세스에서는

- `client_id` 가 외부로 전혀 노출될 일이 없습니다.
- Frontend 가 `client_id` 를 직접 다루지 않기 때문에, 인증 방식이 변경되어도 경우 Frontend 코드를 수정할 필요가 없습니다.
- OAuth2 Provider 여러 개(카카오, 구글 등) 추가되어도, Frontend 가 `client_id` 를 다룰 필요가 없기 때문에. 복잡성이 증가하지 않습니다.

이로서 Frontend 는 OAuth2 인증 방식으로부터 `독립성` 을 갖게 됩니다.


## 마치며
지금까지 Frontend 와 Backend 로 분리된 환경에서 Frontend 의 개입을 최소화하여 `Authorization Code Grant` 방식의 OAuth2 인증 및 인가 과정이 어떻게 이루어지는지 상세하게 살펴보았습니다. 다음 포스팅에서는 `Spring` 에서 일단 스파게티 코드로 OAuth2 인증을 구현하는 방법에 대해 알아보도록 하겠습니다.

[다음 포스팅 : 스파게티 코드로 구현해보는 OAuth2 인증 인가 프로세스](Spring/Security/SpringOAuth2Implement.md)

