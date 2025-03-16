---
title: Kakao OAuth2 설정
tags: ['web', 'security', 'oauth2']
---

## 들어가며
안녕하세요. 이번 포스팅에서는 Kakao 에서 지원하는 OAuth2 애플리케이션 등록 및 설정을 하는 법에 대해 포스팅해보고자 합니다. 

## Regist Kakao Application
우선 Kakao 에 로그인하고 [내 애플리케이션](https://developers.kakao.com/console/app) 에 들어갑니다. 그리고 `애플리케이션 추가하기` 를 선택해줍니다.

![](Web/images/Pasted%20image%2020250306182935.png)


`애플리케이션 추가하기` 폼이 올라오게 되는데, 등록하고자 하는 애플리케이션에 대한 정보를 본인 마음대로 작성해주시면 됩니다.

> 이미지 등록은 Biz 애플리케이션으로 전환해주어야 할때 필요합니다. 이메일 정보 수집을 필수로 설정하려면 Biz 애플리케이션이어야만 합니다.

![](Web/images/Pasted%20image%2020250306183128.png)


## Platform 설정
`플랫폼 > Web` 에서 Web 플랫폼 등록을 해줍니다. Client 에서 사용할 BaseURL 을 설정하는것입니다.

> Client. 즉 애플리케이션에서 사용하는 도메인 주소를 입력하면 됩니다.

![](Web/images/Pasted%20image%2020250306210624.png)

![](Web/images/Pasted%20image%2020250306210729.png)


## Application 설정
플랫폼을 설정했으니 애플리케이션을 설정해야합니다. `카카오 설정 > 활성화 설정` 의 상태를 `On` 으로 바꿔줍니다. 

> 바로 밑에 OpenID Connect(OIDC) 활성화 설정란이 있는데, 굳이 필요 없으므로 해당 설정은 활성화시키지 않습니다.

![](Web/images/Pasted%20image%2020250306183751.png)


### Redirect URI 설정
`카카오 설정 > 활성화 설정` 을 누른 후, `Redirect URI` 정보를 기입해줍니다.

> Redirect URI는 Authorization Server(인가 서버)가 Authorization Code(인가코드) 를 Client(애플리케이션) 에 전달할 때 사용하는 Callback 주소를 의미합니다. 이는 사용자가 인증을 완료한 후, 클라이언트 애플리케이션이 인증 결과를 받을 수 있도록 지정된 경로입니다.

![](Web/images/Pasted%20image%2020250306183901.png)


이와 같이 설정하면 Authorization Server 는 `http://localhost:8080/login/oauth2/code/kakao` 라는 URI 로 Authorization Code(인가 코드)를 넘겨주게됩니다.

> 꼭 Redirect URI 주소의 Path 정보가 /login/oauth2/code/kakao 일 필요는 없습니다. 단지 Spring OAuth2 Client 에서는 내부적으로 해당 Path 에서 인가 코드를 기다리기 때문에, 이와 같이 명시해준 것입니다.

![](Web/images/Pasted%20image%2020250306184542.png)


## Scope 설정
Scope는 Client (애플리케이션) 가 Resource Server 에 저장된 Resource Owner 의 정보를 어떤 범위 안에서 가져올 수 있는지 정의하는 권한의 범위를 의미합니다. 해당 설정을 통해 `개인정보 동의항목에 필요한 것을 커스텀하여 설정`할 수 있습니다.

> 카카오계정(이메일) 정보는 Biz App 으로 전환해야 설정 가능합니다. [이메일 권한 받는 방법](https://31daylee.tistory.com/entry/spring-OAuth2-%EC%B9%B4%EC%B9%B4%EC%98%A4-%EC%9D%B8%EC%A6%9D%ED%95%98%EA%B8%B0-kakao-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EC%9D%B8%EC%A6%9D-%EA%B6%8C%ED%95%9C-%EB%B0%9B%EB%8A%94-%EB%B2%95)


![](Web/images/Pasted%20image%2020250306190558.png)

### Biz App 전환
카카오계정(이메일) 정보는 Biz App 으로 전환해야 설정 가능합니다. `비지니스 > 앱 아이콘 등록` 에서 애플리케이션에서 사용할 아이콘을 등록해줍니다.

![](Web/images/Pasted%20image%2020250306191308.png)


다시 `비지니스` 탭으로 돌아오면 `개인 개발자 비즈 앱 전환` 이라는 버튼이 생기게 됩니다. 해당 버튼 눌러주고 `비즈 앱 전환 목적을 '이메일 필수 동의'` 로 선택해주고 전환시킵니다.

![](Web/images/Pasted%20image%2020250306191439.png)


이제 다시 `카카오 로그인 > 동의항목` 탭으로 돌아오게 되면, `카카오 계정(이메일)` 을 수집한다는 동의항목 설정이 활성화됩니다. 이제 이메일을 필수 동의 항목으로 설정해주시면 됩니다.

![](Web/images/Pasted%20image%2020250306191651.png)

## Client ID 및 Client Secret 확인
이제 Client ID 와 Client Secret 정보를 확인해야합니다. 

- Client ID 는 인가서버가 우리의 애플리케이션(Client) 에 제공하는 고유한 ID 입니다. Authorization Server 가 Client 를 인증할 때 사용되며, `Authorization Server` 로부터 `Authrozation Code(인가 코드)` 를 발급받을 때 사용됩니다.
- Client Secret 는 우리의 `애플리케이션(Client) 를 인증하는 Secret Key` 를 말하며 외부에 `절대 노출되면 안되는 Key` 입니다. `Authorization Code & Client ID & Client Secret` 를 함께 사용하여 인가서버에 AccessToken 을 요청할 때 사용됩니다.


Client ID 는 `앱 키` 탭에서 확인할 수 있습니다.

![](Web/images/Pasted%20image%2020250306194029.png)


Client Secret Key 는 `보안` 탭에서 `코드 생성` 을 통해 발급받을 수 있습니다. 절대 노출되선 안됩니다. (물론 재발급 받으면 됩니다.)

![](Web/images/Pasted%20image%2020250306194114.png)


## 인가코드 & 액세스토큰 요청 주소
OAuth2 인증을 수행할때마다 공식문서를 직접 찾아보는게 너무나도 번거로워서 올립니다.

- [인가 코드 받기](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-code)
- [액세스 토큰 받기](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-token)
- [사용자 정보 가져오기](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#req-user-info)

인가서버마다 Endpoint 들을 찾아보기 귀찮다면, 인가서버마다 지원하는 OpenID Connect 메타데이터 URL 주소 `issuer주소/.well-known/openid-configuration` 에서 직접 확인할 수 있습니다. Kakao OpenID Connect(OIDC) 메타데이터 주소에 요청을 찔러보면 다음과 같은 JSON 이 출력됩니다.

> issuer 주소는 인가 서버의 기본 주소를 의미합니다.

```bash
revi1337@B3-B35T onsquad-server % curl -s https://kauth.kakao.com/.well-known/openid-configuration | jq 
{
  "issuer": "https://kauth.kakao.com",
  "authorization_endpoint": "https://kauth.kakao.com/oauth/authorize",
  "token_endpoint": "https://kauth.kakao.com/oauth/token",
  "userinfo_endpoint": "https://kapi.kakao.com/v1/oidc/userinfo",
  "jwks_uri": "https://kauth.kakao.com/.well-known/jwks.json",
  "token_endpoint_auth_methods_supported": [
    "client_secret_post"
  ],
  "subject_types_supported": [
    "public"
  ],
  "id_token_signing_alg_values_supported": [
    "RS256"
  ],

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
평소 OAuth2 인증을 진행할 때마다 로컬 적어놨던.. 나 자신만 알아볼 수 있는 형태로 대충 문서화시킨 가이드라인을 참고하며 작업해왔습니다. 하지만 이번 기회에 이를 깔끔하게 정리하여 포스팅하니, 마치 묵은 때가 벗겨진 듯한 개운함이 느껴집니다. 다음엔 Google 도 정리해보겠습니다.

