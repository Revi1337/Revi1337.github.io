---
title: Google OAuth2 설정
tags: ['web', 'security', 'oauth2']
---

## 들어가며
안녕하세요. 이번 포스팅에서는 Google 에서 지원하는 OAuth2 애플리케이션 등록 및 설정을 하는 법에 대해 포스팅해보고자 합니다. 

## Regist Google Application
가장 먼저 Google 에 로그인하고 [Google Console](https://console.cloud.google.com) 에 들어갑니다. 그리고 다음과 같이 Hover 되어있는 버튼을 눌러 `새 프로젝트` 버튼을 누릅니다.

![](Web/images/Pasted%20image%2020250306211317.png)


프로젝트 이름을 명시하고 `만들기` 를 누르면 새로운 프로젝트 생성이 완료됩니다. 생성하는데 시간이 약간 걸립니다.

![](Web/images/Pasted%20image%2020250306211425.png)

### 인증 플랫폼 생성

왼쪽 Navigation Bar 에 있는 햄버거 버튼을 눌러 `API 및 서비스 > OAuth2 동의 화면` 을 선택합니다.

![](Web/images/Pasted%20image%2020250306212125.png)


`개요` 탭에 가서 `시작하기 버튼을` 누릅니다.

![](Web/images/Pasted%20image%2020250306212309.png)


애플리케이션 이름과 사용자 이메일을 등록합니다.

![](Web/images/Pasted%20image%2020250306212404.png)


구글 계정이 있는 모든 사용자가 OAuth2 를 테스트할 수 있도록 `외부` 를 선택합니다.

![](Web/images/Pasted%20image%2020250306212418.png)


`연락처 정보` 를 기입 후 인증 플랫폼을 생성합니다.

![](Web/images/Pasted%20image%2020250306212441.png)

## Client 생성
Client 생성은 사용자를 대신하여 인증할 애플리케이션(Client) 를 Authroziation Server(Google) 에  미리 등록하는 과정입니다.

`클라이언트 > CREATE CLIENT` 버튼을 누릅니다.

![](Web/images/Pasted%20image%2020250306213222.png)


`애플리케이션 유형` 에는 웹 애플리케이션. 그리고 이름은 본인이 원하는 이름을 입력합니다.

![](Web/images/Pasted%20image%2020250306213312.png)

### Redirect URI 설정

Redirection URI 주소를 입력합니다. Redirect URI는 Authorization Server(인가 서버)가 Authorization Code(인가코드) 를 Client(애플리케이션) 에 전달할 때 사용하는 Callback 주소를 의미합니다. 이는 사용자가 인증을 완료한 후, 클라이언트 애플리케이션이 인증 결과를 받을 수 있도록 지정된 경로입니다.

> 꼭 Redirect URI 주소의 Path 정보가 /login/oauth2/code/kakao 일 필요는 없습니다. 단지 Spring OAuth2 Client 에서는 내부적으로 해당 Path 에서 인가 코드를 기다리기 때문에, 이와 같이 명시해준 것입니다.

![](Web/images/Pasted%20image%2020250306213716.png)

`만들기` 를 눌러 Client 를 생성해줍니다.

## Application 설정
애플리케이션을 등록했으면 이제 설정해주어야 합니다. `카카오 설정 > 활성화 설정` 상태를 `On` 으로 바꿔줍니다. 

> 바로 밑에 OpenID Connect 활성화 설정란이 있는데, 굳이 필요 없으므로 해당 설정은 활성화시키지 않습니다.

![](Web/images/Pasted%20image%2020250306183751.png)


## Client ID 및 Client Secret 확인
이제 Client ID 와 Client Secret 정보를 확인해야합니다. 

- Client ID 는 인가서버가 우리의 애플리케이션(Client) 에 제공하는 고유한 ID 입니다. Authorization Server 가 Client 를 인증할 때 사용되며, `Authorization Server` 로부터 `Authrozation Code(인가 코드)` 를 발급받을 때 사용됩니다.
- Client Secret 는 우리의 `애플리케이션(Client) 를 인증하는 Secret Key` 를 말하며 외부에 `절대 노출되면 안되는 Key` 입니다. `Authorization Code & Client ID & Client Secret` 를 함께 사용하여 인가서버에 AccessToken 을 요청할 때 사용됩니다.

클라이언트를 생성하였으니 `클라이언트` 탭에서 금방 생성한 Client 를 선택합니다.

![](Web/images/Pasted%20image%2020250306214244.png)


`Additional information` 에서 Client ID 와 Secret 을 확인할 수 있습니다.

![](Web/images/Pasted%20image%2020250306214519.png)

## Scope 설정
Scope는 Client (애플리케이션) 가 Resource Server 에 저장된 Resource Owner 의 정보를 어떤 범위 안에서 가져올 수 있는지 정의하는 권한의 범위를 의미합니다. 해당 설정을 통해 `개인정보 동의항목에 필요한 것을 커스텀하여 설정`할 수 있습니다.

`데이터 액세스` 탭으로 이동하여 `범위 추가 또는 삭제` 를 누릅니다.

![](Web/images/Pasted%20image%2020250306215808.png)


`userinfo.email` 그리고 `user.profile` 을 선택합니다.

![](Web/images/Pasted%20image%2020250306215838.png)


## 인가코드 & 액세스토큰 요청 주소
OAuth2 인증을 수행할때마다 공식문서를 직접 찾아보는게 너무나도 번거로워서 올립니다.

- [Google 에 인증요청 보내기](https://developers.google.com/identity/openid-connect/openid-connect?hl=ko#sendauthrequest)
- [액세스 토큰 받기](https://developers.google.com/identity/openid-connect/openid-connect?hl=ko#exchangecode)
- [사용자 프로필 정보 가져오기](https://developers.google.com/identity/openid-connect/openid-connect?hl=ko#obtainuserinfo)

인가서버마다 Endpoint 들을 찾아보기 귀찮다면, 인가서버마다 지원하는 OpenID Connect 메타데이터 URL 주소 `issuer주소/.well-known/openid-configuration` 에서 직접 확인할 수 있습니다. Google OpenID Connect(OIDC) 메타데이터 주소에 요청을 찔러보면 다음과 같은 JSON 이 출력됩니다.

> issuer 주소는 인가 서버의 기본 주소를 의미합니다.

```bash
revi1337@B3-B35T onsquad-server % curl -s https://accounts.google.com/.well-known/openid-configuration | jq
{
  "issuer": "https://accounts.google.com", # 인가서버 기본주소/.well-known/openid-configuration
  "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
  "device_authorization_endpoint": "https://oauth2.googleapis.com/device/code",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
  "revocation_endpoint": "https://oauth2.googleapis.com/revoke",
  "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
  "response_types_supported": [
    "code",
    "token",
    "id_token",
    "code token",

...
...
```


OIDC 주소에서 알 수 있는 Endpoint 정보들은 다음과 같이 있습니다. 

| 필드                       | 설명                                                         |
| ------------------------ | ---------------------------------------------------------- |
| issuer                   | 인가 서버의 기본 주소                                               |
| authorization_endpoint   | OAuth 2.0 인증 요청 URL                                        |
| token_endpoint           | Access Token 및 Refresh Token을 발급하는 URL                     |
| userinfo_endpoint        | 인증된 사용자의 정보를 가져오는 URL                                      |
| jwks_uri                 | JWT 서명을 검증하는 공개 키(JWK)를 제공하는 URL                           |
| response_types_supported | 지원하는 응답 유형 (code, token, id_token 등)                       |
| grant_types_supported    | 지원하는 Grant Type (authorization_code, client_credentials 등) |

> 실제로 OIDC 주소만 있으면 인가서버에서 제공하는 대부분의 Endpoint 들을 알 수 있기 때문에, Client 애플리케이션이 별도의 설정 없이도 인가 서버의 정보를 동적으로 가져와서 인증 및 토큰 발급을 진행할 수 있습니다.


## 마치며
사실 바로 전에 `Kakao OAuth2 설정` 에 대해 포스팅해서 거의 복붙 형태로 작성해 양심에 찔리긴 하지만.. 앞으로는 OAuth2 인증할때마다 공식문서 찾으러 다닐 필요없이.. 꼭 작성한 글에서만 해결했으면 좋겠습니다.

