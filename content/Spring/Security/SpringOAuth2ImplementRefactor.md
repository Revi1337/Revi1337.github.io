---
title: OAuth2 인증 인가 프로세스 코드 리팩토링
tags: ['spring', 'oauth2', 'refactor']
---

## 들어가며
안녕하세요. [이전 포스팅](Spring/Security/SpringOAuth2Implement.md) 에서는 Client 가 Frontend 와 Backend 로 분리된 환경에서 Frontend 의 역할을 최소화함과 동시에 백엔드에서 맡아야 하는 `Authorization Code Grant` 방식의 OAuth2 인증 기능을 스파게티 코드로 구현한 내용을 다뤘습니다. 이번 포스팅에서는 이전 포스팅을 기반으로 코드를 리팩토링하는 시간을 갖어보려 합니다.

### 전제 조건
이번 포스팅에서도 이전 포스팅과 같은 상황을 가정합니다.

1. [이전 포스팅](Spring/Security/SpringOAuth2Implement.md) 을 읽어보았습니다.
2. 우리의 Application(Client) 이 `Frontend` 와 `Backend` 로 분리되어 있습니다.
3. OAuth2 인증 방식으로 `Authorization Code Grant` 를 사용합니다.
4. 인가 서버로부터 발급받은 Access Token 은 Application 을 인증하기 위한 용도 이외에는 사용되지 않습니다.
5. Application 은 인가 서버의 Access Token 및 Refresh Token 을 직접 사용하지 않고, 자체적인 Access Token 및 Refresh Token을 사용합니다.

## New Classes
### SupportOAuth2Platform
`SupportOAuth2Platform` 은 OAuth2 플랫폼을 지원하는 `enum` 클래스입니다. 이 클래스는 특정 OAuth2 플랫폼에 대한 정보를 `OAuth2Platform` 객체로 변환하는 역할을 합니다.

> 해당 클래스는 application.yml 에 매핑되는 OAuth2ClientProperties 에서 사용됩니다. 개발자는 SupportOAuth2Platform 에서 지원하는 OAuth2 플랫폼만 yml 에 작성할 수 있도록 합니다.


```java
public enum SupportOAuth2Platform {  
  
    KAKAO(OAuth2Platform.KAKAO),  
    GOOGLE(OAuth2Platform.GOOGLE);  
  
    private final OAuth2Platform platform;  
  
    SupportOAuth2Platform(OAuth2Platform platform) {  
        this.platform = platform;  
    }  
  
    public static OAuth2Platform getAvailableFromSpecific(String platform) {  
        try {  
            String ignoreCaseOAuthorizationPlatform = platform.toUpperCase();  
            SupportOAuth2Platform supportOAuth2Platform = valueOf(ignoreCaseOAuthorizationPlatform);  
            return supportOAuth2Platform.platform;  
        } catch (IllegalArgumentException e) {  
            throw new UnsupportedOperationException("unsupported authorization platform " + platform);  
        }  
    }  
}
```


### OAuth2Platform
`OAuth2Platform` 은 OAuth2 인증 프로세스에서 인가서버와의 상호작용을 통합적으로 관리하는 역할을 합니다. OAuth2Platform 클래스는 각 OAuth2 플랫폼에 맞는 `Authorization URI`를 제공하고, `AccessToken`을 발급받으며, 사용자의 프로필 정보를 가져오는 등의 역할을 담당합니다.

각 인가서버 플랫폼마다 이를 위한 구체적인 처리 로직을 `KakaoOAuth2EndpointBuilder`, `KakaoOAuth2AccessTokenFetcher`, `KakaoOAuth2UserProfileFetcher` 와 같은 플랫폼별 구현체를 사용하여 처리합니다.

여기서 `"OAuth2Platform 가 너무 많은 책임을 갖고 있는 것 아니냐?"` 라고 생각할  수 있습니다. 

하지만 앞서 언급한 `포스팅의 전제조건` 에서처럼, 인가서버로부터 가져온 `AccessToken`은 오직 우리의 애플리케이션을 인증하는 용도로만 사용됩니다. 따라서 OAuth2Platform 이 인가서버의 `authorization_uri` 를 만드는 역할, `AccessToken` 을 가져오는 역할, 그리고 사용자의 프로필을 가져오는 역할을 모두 맡는 것이 논리적으로 맞다고 생각했습니다. 이렇게 통합하여 관리하는 방식이 코드의 일관성을 유지하고, 각 플랫폼에 대해 별도로 처리하는 번거로움을 줄이는 데 유리하다고 판단했습니다.

```java
public enum OAuth2Platform implements AuthorizationEndPointProvider, AuthorizationAccessTokenProvider,  
        AuthorizationUserProfileProvider {  
  
    KAKAO(  
            new KakaoOAuth2EndpointBuilder(),  
            new KakaoOAuth2AccessTokenFetcher(),  
            new KakaoOAuth2UserProfileFetcher()  
    ),  
    GOOGLE(  
            new GoogleOAuth2EndpointBuilder(),  
            new GoogleOAuth2AccessTokenFetcher(),  
            new GoogleOAuth2UserProfileFetcher()  
    );  
  
    private final PlatformOAuth2EndpointBuilder endpointBuilder;  
    private final PlatformOAuth2AccessTokenFetcher tokenEvaluator;  
    private final PlatformOAuth2UserProfileFetcher userProfileEvaluator;  
  
    OAuth2Platform(PlatformOAuth2EndpointBuilder endpointBuilder,  
                   PlatformOAuth2AccessTokenFetcher tokenFetcher,  
                   PlatformOAuth2UserProfileFetcher userProfileFetcher) {  
        this.endpointBuilder = endpointBuilder;  
        this.tokenEvaluator = tokenFetcher;  
        this.userProfileEvaluator = userProfileFetcher;  
    }  
  
    @Override  
    public AccessToken provideAccessToken(String baseUrl, String authorizationCode,  
                                          OAuth2ClientProperties oAuth2ClientProperties) {  
        OAuth2Properties oAuth2Properties = getPropertyFrom(oAuth2ClientProperties);  
        return tokenEvaluator.fetchAccessToken(baseUrl, authorizationCode, oAuth2Properties);  
    }  
  
    @Override  
    public URI provideUsing(String baseUrl, OAuth2ClientProperties oAuth2ClientProperties) {  
        OAuth2Properties oAuth2Properties = getPropertyFrom(oAuth2ClientProperties);  
        return endpointBuilder.provideUsing(baseUrl, oAuth2Properties);  
    }  
  
    @Override  
    public PlatformUserProfile provideUserProfile(AccessToken accessToken,  
                                                  OAuth2ClientProperties oAuth2ClientProperties) {  
        OAuth2Properties oAuth2Properties = getPropertyFrom(oAuth2ClientProperties);  
        return userProfileEvaluator.fetchUserProfile(accessToken, oAuth2Properties);  
    }  
  
    public OAuth2Properties getPropertyFrom(OAuth2ClientProperties oAuth2ClientProperties) {  
        SupportOAuth2Platform platformKey = SupportOAuth2Platform.valueOf(this.name());  
        return oAuth2ClientProperties.clients().get(platformKey);  
    }  
}
```

#### AuthorizationEndPointProvider
`AuthorizationEndPointProvider` 는 `OAuth2Platform` 이 각 플랫폼별 인가서버의 `authorization_uri` 를 제공할 수 있도록 하는 인터페이스입니다. 이를 통해 각 인가서버 플랫폼은 자신에 맞는 `authorization_uri` 를 생성하여 반환합니다.

`OAuth2Platform` 은 `PlatformOAuth2EndpointBuilder` 의 구현체를 통해, 각 인가서버의 `authorization_uri` 를 동적으로 생성합니다.

```java
public interface AuthorizationEndPointProvider {  
  
    URI provideUsing(String baseUrl, OAuth2ClientProperties oAuth2ClientProperties);  
  
}
```

#### AuthorizationAccessTokenProvider
`AuthorizationAccessTokenProvider` 는 `OAuth2Platform` 이 각 플랫폼별 인가서버에서 `Access Token` 을 제공할 수 있도록 하는 인터페이스입니다. 이를 통해 각 인가서버 플랫폼은 자신에 맞는 방식으로 `Access Token` 을 생성하여 반환합니다.

`OAuth2Platform` 은 `PlatformOAuth2AccessTokenFetcher` 의 구현체를 통해, 각 인가서버에서 요구하는 방식으로 `Access Token`을 동적으로 가져옵니다.

```java
public interface AuthorizationAccessTokenProvider {  
  
    AccessToken provideAccessToken(String baseUrl, String authorizationCode,  
                                   OAuth2ClientProperties oAuth2ClientProperties);  
  
}
```


#### AuthorizationUserProfileProvider
`AuthorizationUserProfileProvider` 는 `OAuth2Platform` 이 각 플랫폼별 인가서버에서 사용자 프로필 정보를 제공할 수 있도록 하는 인터페이스입니다. 이를 통해 각 인가서버 플랫폼은 사용자 프로필 정보를 `AccessToken` 을 이용해 가져오고, 이를 애플리케이션에서 활용할 수 있도록 반환합니다.

`OAuth2Platform` 은 `PlatformOAuth2UserProfileFetcher` 의 구현체를 통해 각 플랫폼에서 요구하는 방식으로 사용자 프로필을 동적으로 가져옵니다.

```java
public interface AuthorizationUserProfileProvider {  
  
    PlatformUserProfile provideUserProfile(AccessToken accessToken, OAuth2ClientProperties oAuth2ClientProperties);  
  
}
```


#### PlatformOAuth2EndpointBuilder
`PlatformOAuth2EndpointBuilder`  는 각 OAuth2 플랫폼에 맞는 인가서버의 `authorization endpoint` 즉, `authorization_uri`  를 동적으로 생성하는 인터페이스입니다. 이 구현체는 `AuthorizationEndPointProvider` 에게 제공되어, OAuth2Platform 이 해당 플랫폼의 인가서버에 맞는 인가 URL을 생성할 수 있도록 합니다. 

`OAuth2Platform` 은 `AuthorizationEndPointProvider` 의 메서드를 호출하면, OAuth2 플랫폼에 적합한 `PlatformOAuth2EndpointBuilder` 의 구현체가 `authorization_uri`를 생성하여 `AuthorizationEndPointProvider` 에게 반환합니다.

```java
public interface PlatformOAuth2EndpointBuilder {  
  
    URI provideUsing(String baseUrl, OAuth2Properties oAuth2Properties);  
  
}
```


##### GoogleOAuth2EndpointBuilder
`GoogleOAuth2EndpointBuilder` 는 PlatformOAuth2EndpointBuilder 의 구현체입니다. Google 의 인가서버 authorization_uri 를 생성하는 역할을 수행합니다.

```java
public class GoogleOAuth2EndpointBuilder implements PlatformOAuth2EndpointBuilder {  
  
    public static final String WHITESPACE = " ";  
  
    @Override  
    public URI provideUsing(String baseUrl, OAuth2Properties oAuth2Properties) {  
        return ServletUriComponentsBuilder  
                .fromHttpUrl(oAuth2Properties.authorizationUri())  
                .queryParam("client_id", oAuth2Properties.clientId())  
                .queryParam("redirect_uri", baseUrl + oAuth2Properties.redirectUri()) 
                .queryParam("response_type", oAuth2Properties.responseType())  
                .queryParam("scope", String.join(WHITESPACE, oAuth2Properties.scope().values()))  
                .build()  
                .toUri();  
    }  
}
```


##### KakaoOAuth2EndpointBuilder
`KakaoOAuth2EndpointBuilder` 는 PlatformOAuth2EndpointBuilder 의 구현체입니다. Kakao 의 인가서버 authorization_uri 를 생성하는 역할을 수행합니다.

```java
public class KakaoOAuth2EndpointBuilder implements PlatformOAuth2EndpointBuilder {  
  
    @Override  
    public URI provideUsing(String baseUrl, OAuth2Properties oAuth2Properties) {  
        return ServletUriComponentsBuilder  
                .fromHttpUrl(oAuth2Properties.authorizationUri())  
                .queryParam("client_id", oAuth2Properties.clientId())  
                .queryParam("redirect_uri", baseUrl + oAuth2Properties.redirectUri()) 
                .queryParam("response_type", oAuth2Properties.responseType())  
                .build()  
                .toUri();  
    }  
}
```


#### PlatformOAuth2AccessTokenFetcher
`PlatformOAuth2AccessTokenFetcher` 는 각 OAuth2 플랫폼에 맞는 인가서버에서 `Access Token` 을 동적으로 가져오는 역할을 하는 인터페이스입니다. 이 구현체는 `AuthorizationAccessTokenProvider` 에게 제공되어, `OAuth2Platform`이 해당 플랫폼에 맞는 방식으로 `Access Token` 을 fetch 할 수 있도록 합니다.

`OAuth2Platform`은 `AuthorizationAccessTokenProvider` 의 메서드를 호출하면, OAuth2 플랫폼에 적합한 `PlatformOAuth2AccessTokenFetcher` 의 구현체가 `Access Token`을 가져와서 `AuthorizationAccessTokenProvider` 에게 반환합니다.

```java
public interface PlatformOAuth2AccessTokenFetcher {  
  
    AccessToken fetchAccessToken(String baseUrl, String authorizationCode, OAuth2Properties oAuth2Properties);  
  
}
```


##### GoogleOAuth2AccessTokenFetcher
`GoogleOAuth2AccessTokenFetcher` 는 PlatformOAuth2AccessTokenFetcher 의 구현체입니다. Google 의 인가서버로부터 AccessToken 을 요청하고 가져오는 역할을 합니다.

```java
public class GoogleOAuth2AccessTokenFetcher implements PlatformOAuth2AccessTokenFetcher {  
  
    @Override  
    public AccessToken fetchAccessToken(String baseUrl, String authorizationCode, OAuth2Properties oAuth2Properties) {  
        return fetchToken(baseUrl, authorizationCode, oAuth2Properties);  
    }  
  
    private AccessToken fetchToken(String baseUrl, String authorizationCode, OAuth2Properties oAuth2Properties) {  
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>() {{  
            add("client_id", oAuth2Properties.clientId());  
            add("client_secret", oAuth2Properties.clientSecret());  
            add("redirect_uri", baseUrl + oAuth2Properties.redirectUri());  
            add("grant_type", oAuth2Properties.grantType());  
            add("code", authorizationCode);  
        }};  
  
        HttpHeaders headers = new HttpHeaders();  
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);  
        ResponseEntity<Map<String, String>> tokenAttributeResponse = new RestTemplate().exchange(  
                oAuth2Properties.tokenUri(),  
                HttpMethod.POST,  
                new HttpEntity<>(params, headers),  
                new ParameterizedTypeReference<>() {  
                }        );  
  
        return AccessToken.of(tokenAttributeResponse.getBody().get("access_token"));  
    }  
}
```

##### KakaoOAuth2AccessTokenFetcher
`KakaoOAuth2AccessTokenFetcher` 는 PlatformOAuth2AccessTokenFetcher 의 구현체입니다. Kakao 의 인가서버로부터 AccessToken 을 요청하고 가져오는 역할을 합니다.

```java
public class KakaoOAuth2AccessTokenFetcher implements PlatformOAuth2AccessTokenFetcher {  
  
    @Override  
    public AccessToken fetchAccessToken(String baseUrl, String authorizationCode, OAuth2Properties oAuth2Properties) {  
        return fetchToken(baseUrl, authorizationCode, oAuth2Properties);  
    }  
  
    private AccessToken fetchToken(String baseUrl, String authorizationCode, OAuth2Properties oAuth2Properties) {  
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>() {{  
            add("client_id", oAuth2Properties.clientId());  
            add("client_secret", oAuth2Properties.clientSecret());  
            add("redirect_uri", baseUrl + oAuth2Properties.redirectUri());  
            add("grant_type", oAuth2Properties.grantType());  
            add("code", authorizationCode);  
        }};  
  
        HttpHeaders headers = new HttpHeaders();  
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);  
        ResponseEntity<Map<String, String>> tokenAttributeResponse = new RestTemplate().exchange(  
                oAuth2Properties.tokenUri(),  
                HttpMethod.POST,  
                new HttpEntity<>(params, headers),  
                new ParameterizedTypeReference<>() {  
                }        );  
  
        return AccessToken.of(tokenAttributeResponse.getBody().get("access_token"));  
    }  
}
```


#### PlatformOAuth2UserProfileFetcher
`PlatformOAuth2UserProfileFetcher` 는 각 OAuth2 플랫폼에 맞는 인가서버에서 사용자의 프로필 정보를 동적으로 가져오는 역할을 하는 인터페이스입니다. 이 구현체는 `AuthorizationUserProfileProvider` 에게 제공되어, `OAuth2Platform` 이 해당 플랫폼에 맞는 방식으로 사용자의 프로필 정보를 fetch 할 수 있도록 합니다.

`OAuth2Platform` 은 `AuthorizationUserProfileProvider` 의 메서드를 호출하면, OAuth2 플랫폼에 적합한 `PlatformOAuth2UserProfileFetcher` 의 구현체가 사용자의 프로필을 가져와서 `AuthorizationUserProfileProvider` 에게 반환합니다.

```java
public interface PlatformOAuth2UserProfileFetcher {  
  
    PlatformUserProfile fetchUserProfile(AccessToken accessToken, OAuth2Properties oAuth2Properties);  
  
}
```


##### GoogleOAuth2UserProfileFetcher
`GoogleOAuth2UserProfileFetcher` 는 PlatformOAuth2UserProfileFetcher 의 구현체입니다. Google 의 AccessToken 을 가지고 Google Resource Server 로부터 Resource Owner 의 프로필 정보를 fetch 해오는 역할을 합니다.

```java
public class GoogleOAuth2UserProfileFetcher implements PlatformOAuth2UserProfileFetcher {  
  
    @Override  
    public PlatformUserProfile fetchUserProfile(AccessToken accessToken, OAuth2Properties oAuth2Properties) {  
        GoogleUserInfoResponse googleUserInfoResponse = fetchUserInfoResponse(accessToken, oAuth2Properties);  
        return GoogleUserProfile.from(googleUserInfoResponse);  
    }  
  
    private GoogleUserInfoResponse fetchUserInfoResponse(AccessToken accessToken,  
                                                         OAuth2Properties oAuth2Properties) {  
        HttpHeaders httpHeaders = new HttpHeaders();  
        httpHeaders.setBearerAuth(accessToken.value());  
        ResponseEntity<GoogleUserInfoResponse> googleProfileResponse = new RestTemplate().exchange(  
                oAuth2Properties.accountUri(),  
                HttpMethod.GET,  
                new HttpEntity<>(httpHeaders),  
                GoogleUserInfoResponse.class  
        );  
  
        return googleProfileResponse.getBody();  
    }  
}
```


##### KakaoOAuth2UserProfileFetcher
`KakaoOAuth2UserProfileFetcher` 는 PlatformOAuth2UserProfileFetcher 의 구현체입니다. Kakao 의 AccessToken 을 가지고 Kakao Resource Server 로부터 Resource Owner 의 프로필 정보를 fetch 해오는 역할을 합니다.

```java
public class KakaoOAuth2UserProfileFetcher implements PlatformOAuth2UserProfileFetcher {  
  
    @Override  
    public PlatformUserProfile fetchUserProfile(AccessToken accessToken, OAuth2Properties oAuth2Properties) {  
        KakaoUserInfoResponse kakaoUserInfoResponse = fetchUserInfoResponse(accessToken, oAuth2Properties);  
        return KakaoUserProfile.from(kakaoUserInfoResponse);  
    }  
  
    private KakaoUserInfoResponse fetchUserInfoResponse(AccessToken accessToken,  
                                                        OAuth2Properties oAuth2Properties) {  
        MultiValueMap<String, String> userInfoHeaders = new LinkedMultiValueMap<>() {{  
            add(HttpHeaders.AUTHORIZATION, String.format("Bearer %s", accessToken.value()));  
            add(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded;");  
            add(HttpHeaders.CONTENT_TYPE, "charset=utf-8");  
        }};  
        ResponseEntity<KakaoUserInfoResponse> kakaoProfileResponse = new RestTemplate().exchange(  
                oAuth2Properties.accountUri(),  
                HttpMethod.GET,  
                new HttpEntity<>(userInfoHeaders),  
                KakaoUserInfoResponse.class  
        );  
  
        return kakaoProfileResponse.getBody();  
    }  
}
```


### PlatformUserTypeConverter
`PlatformUserTypeConverter` 는 `PlatformUserProfile(각 리소스 서버로부터 받은 사용자 포로필 응답을 기반으로 공통 필드를 추출하여 캡슐화화한 인터페이스)` 를 UserType 으로 Convert 하는 역할을 수행하는 인터페이스입니니다.

```java
public interface PlatformUserTypeConverter {  
  
    UserType convert(PlatformUserProfile platformUserProfile);  
  
}
```


#### GoogleUserProfileConverter
`GoogleUserProfileConverter` 는 `PlatformUserTypeConverter` 인터페이스를 구현한 클래스입니다. 이 클래스는 `PlatformUserProfile` 타입의 객체를 `UserType`으로 변환하는 역할을 합니다. 

구체적으로, `GoogleUserProfile` 인스턴스일 경우 `UserType.GOOGLE`을 반환하며, 그렇지 않으면 `null`을 반환합니다. 이를 통해, Google OAuth2 인증을 통해 받은 사용자 프로필을 `UserType.GOOGLE`이라는 구체적인 타입으로 변환할 수 있게 됩니다.

해당 컨버터는 Spring Bean 으로 관리합니다.

```java
@Component  
public class GoogleUserProfileConverter implements PlatformUserTypeConverter {  
  
    @Override  
    public UserType convert(PlatformUserProfile platformUserProfile) {  
        return platformUserProfile instanceof GoogleUserProfile ? UserType.GOOGLE : null;  
    }  
}
```


#### KakaoUserProfileConverter
`KakaoUserProfileConverter` 는 `PlatformUserTypeConverter` 인터페이스를 구현한 클래스입니다. 이 클래스는 `PlatformUserProfile`  타입의 객체를 `UserType` 으로 변환하는 역할을 합니다. 

구체적으로, `KakaoUserProfile` 인스턴스일 경우 `UserType.KAKAO`을 반환하며, 그렇지 않으면 `null`을 반환합니다. 이를 통해, Kakao OAuth2 인증을 통해 받은 사용자 프로필을 `UserType.KAKAO`이라는 구체적인 타입으로 변환할 수 있게 됩니다.

마찬가지로 해당 컨버터도 Spring Bean 으로 관리합니다.

```java
@Component  
public class KakaoUserProfileConverter implements PlatformUserTypeConverter {  
  
    @Override  
    public UserType convert(PlatformUserProfile platformUserProfile) {  
        return platformUserProfile instanceof KakaoUserProfile ? UserType.KAKAO : null;  
    }  
}
```


### PlatformUserTypeResolver
`PlatformUserTypeResolver` 는 `PlatformUserProfile` 을 받아 적절한 `UserType` 으로 변환하는 역할을 하는 클래스입니다. 이 클래스는 여러 `PlatformUserTypeConverter` 구현체들을 주입받아, 입력된 `platformUserProfile` 에 대해 변환을 시도합니다.

구체적으로, 이 클래스는 `converters` 리스트에서 각 `PlatformUserTypeConverter` 를 사용해 `platformUserProfile` 을 변환하며, 변환된 `UserType`을 반환합니다. 만약 모든 Converter 가 `null`을 반환하거나 변환을 처리할 수 없으면, `UnsupportedOperationException`을 던져 예외처리합니다.

```java
@RequiredArgsConstructor  
@Component  
public class PlatformUserTypeResolver {  
  
    private final List<PlatformUserTypeConverter> converters;  
  
    public UserType resolveUserType(PlatformUserProfile platformUserProfile) {  
        return converters.stream()  
                .map(converter -> converter.convert(platformUserProfile))  
                .filter(Objects::nonNull)  
                .findFirst()  
                .orElseThrow(() -> new UnsupportedOperationException("cannot convert"));  
    }  
}
```


## OAuth2ClientProperties 설정 리팩토링
OAuth2ClientProperties 는 개발자가 사용할 수 있는 OAuth2 플랫폼을 yml 혹은 properties 에 설정할 수 있도록 도와주는 Property 클래스입니다. `SupportOAuth2Platform` 를 사용해서 개발자가 애플리케이션에서 허용하는 OAuth2 인가 플랫폼만을 설정할 수 있게 제한합니다.

편의를 위해 [리팩토링 전](Spring/Security/SpringOAuth2Implement.md#Kakao%20OAuth2%20설정) 코드를 제공하겠습니다.

```java
@ConfigurationProperties("onsquad.oauth2")  
public record OAuth2ClientProperties(  
        Map<SupportOAuth2Platform, OAuth2Properties> clients  
) {  
    public record OAuth2Properties(  
            String clientName,  
            String clientId,  
            String clientSecret,  
            String redirectUri,  
            String issuerUri,  
            String authorizationUri,  
            @DefaultValue("code") String responseType,  
            String tokenUri,  
            @DefaultValue("authorization_code") String grantType,  
            String userInfoUri,  
            String accountUri,  
            Map<String, String> scope  
    ) {  
    }}
```


## OAuth2RedirectController 리팩토링
`OAuth2RedirectController` 는 Frontend 에게 OAuth2 인가서버의 유효한 authorization_uri 를 반환하는 역할을 수행합니다.  [리팩토링 전](Spring/Security/SpringOAuth2Implement.md#OAuth2RedirectController) 코드와 비교해보면 platform 별로 분기처리하는 로직이 단순해진 것을 확인할 수 있습니다.

```java
@RequiredArgsConstructor  
@RestController  
public class OAuth2RedirectionController {  
  
    private final OAuth2ClientProperties oAuth2ClientProperties;  
  
    @GetMapping("/api/v1/login/oauth2/{platform}")  
    public ResponseEntity<String> handlePlatformOAuth2Login(@PathVariable String platform) {  
        OAuth2Platform oAuth2Platform = SupportOAuth2Platform.getAvailableFromSpecific(platform);  
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();  
        URI compositeAuthorizationEndpoint = oAuth2Platform.provideUsing(baseUrl, oAuth2ClientProperties);  
  
        return ResponseEntity.status(HttpStatus.FOUND).location(compositeAuthorizationEndpoint).build();  
    }  
}
```


## PlatformOAuth2CodeGrantController 리팩토링
`PlatformOAuth2CodeGrantController` 는 OAuth2 인가 서버로부터 반환되는 Redirect URI 의 Authorization Code 를 처리하고, Authorization Code 로 인가서버와 통신하여 AccessToken 을 받아오고, 그 Access Token 을 사용하여 사용자의 정보를 얻어오는 역할을 합니다.

[리팩토링 전](Spring/Security/SpringOAuth2Implement.md#OAuth2CodeGrantController) 코드와 비교해보면 요청으로 들어온 platform 을 기준으로 분기처리하여 platform 별로 AccessToken 을 받아오고 사용자 프로필을 조회하는 로직이 단순하게 리팩토링된 것을 확인할 수 있습니다.

```java
@RequiredArgsConstructor  
@RestController  
public class PlatformOAuth2CodeGrantController {  
  
    private final OnsquadProperties onsquadProperties;  
    private final OAuth2ClientProperties oAuth2ClientProperties;  
    private final OAuth2LoginService oAuth2LoginService;  
  
    @GetMapping("/login/oauth2/code/{platform}")  
    public ResponseEntity<Void> receivePlatformAuthorizationCode(@PathVariable String platform,  
                                                                 @RequestParam String code) {  
        OAuth2Platform oAuth2Platform = SupportOAuth2Platform.getAvailableFromSpecific(platform);  
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();  
        AccessToken accessToken = oAuth2Platform.provideAccessToken(baseUrl, code, oAuth2ClientProperties);  
        PlatformUserProfile userProfile = oAuth2Platform.provideUserProfile(accessToken, oAuth2ClientProperties);  
  
        JsonWebToken jsonWebToken = oAuth2LoginService.loginOAuth2User(userProfile);  
        URI redirectUri = buildRedirectUri(jsonWebToken);  
  
        return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();  
    }  
  
    private URI buildRedirectUri(JsonWebToken jsonWebToken) {  
        return ServletUriComponentsBuilder.fromHttpUrl(onsquadProperties.getFrontendBaseUrl())  
                .queryParam("accessToken", jsonWebToken.accessToken().value())  
                .queryParam("refreshToken", jsonWebToken.refreshToken().value())  
                .build()  
                .toUri();  
    }  
}
```


## OAuth2LoginService 리팩토링
`OAuth2LoginService` 는 Resource Server 로부터 fetch 해온 `PlatformUserProfile` 를 기반으로 사용자가 기존에 가입된 사용자인지, 새로운 사용자인지 판단합니다.

만약
- 이미 가입된 사용자라면 로그인처리를 진행합니다.
- 새로운 사용자라면 `PlatformUserTypeResolver` 로 UserType 을 resolve 해오고, 회원가입 처리 후 로그인처리를 진행합니다.

마지막으로 애플리케이션 자체에서 사용하는 `AccessToken & RefreshToken` 을 만들어 반환합니다. [리팩토링 전](Spring/Security/SpringOAuth2Implement.md#Process%20Appliation%20Logic) 코드와 비교해보면 `PlatformUserProfile` 별로 UserType 을 Guess 해오는 분기처리 로직이 단순해진 것을 확인할 수 있습니다.

```java
@RequiredArgsConstructor  
@Service  
public class OAuth2LoginService {  
  
    private final MemberRepository memberRepository;  
    private final PasswordEncoder passwordEncoder;  
    private final JsonWebTokenService jsonWebTokenService;  
    private final PlatformUserTypeResolver platformUserTypeResolver;  
  
    public JsonWebToken loginOAuth2User(PlatformUserProfile platformUserProfile) {  
        return memberRepository.findByEmail(new Email(platformUserProfile.getEmail()))  
                .map(member -> jsonWebTokenService.generateTokenPair(MemberDto.from(member)))  
                .orElseGet(() -> forceParticipant(platformUserProfile));  
    }  
  
    private JsonWebToken forceParticipant(PlatformUserProfile platformUserProfile) {  
        String encryptedPassword = passwordEncoder.encode(UUID.randomUUID().toString());  
        UserType userType = platformUserTypeResolver.resolveUserType(platformUserProfile);  
        Member member = Member.createOAuth2User(platformUserProfile.getEmail(), platformUserProfile.getNickname(),  
                platformUserProfile.getProfileImage(), encryptedPassword, userType);  
        memberRepository.save(member);  
  
        JsonWebToken jsonWebToken = jsonWebTokenService.generateTokenPair(MemberDto.from(member));  
        jsonWebTokenService.storeTemporaryTokenInMemory(jsonWebToken.refreshToken(), member.getId());  
        return jsonWebToken;  
    }  
}
```


## 마치며
지금까지 [이전 포스팅](Spring/Security/SpringOAuth2Implement.md) 에서 구현하였던 `스파게티 코드` 를 리팩토링 해보았습니다. 이번 리팩토링을 통해 OAuth2 인증 및 로그인 처리 과정에서 발생할 수 있는 인가서버별 `분기처리 로직` 과 `중복된 코드` 를 제거하였으며, 각 인가서버 플랫폼에 대한 관리가 용이하도록 `구조를 개선`하였습니다. 

구체적으로는

1. 인가서버별 유효한 authorization_uri 를 만드는 역할, 인가서버별 AccessToken 을 fetch 해오는 역할, 인가서버별 UserProfile 을 조회해오는 역할을  `PlatformOAuth2EndpointBuilder`, `PlatformOAuth2AccessTokenFetcher`, `PlatformOAuth2UserProfileFetcher` 인터페이스로 분리하여 각 책임을 분리함으로써 코드의 `유연성과 확장성` 을 확보했습니다.
2. 또한, 인가서버마다의 인증 프로세스 메서드를 `OAuth2Platform` 이라는 `Enum` 에서 하나로 관리하여, 각 인가서버에 맞는 인증 프로세스를 효율적으로 관리하고 `중복을 최소화` 하며 `유지보수성` 을 높였습니다. 해당  접근 방식으로 인가서버 플랫폼이 하나 더 늘어도, 각 Interface 의 구현체들을 생성하여 Enum 필드에 추가만 시키면 됩니다.

