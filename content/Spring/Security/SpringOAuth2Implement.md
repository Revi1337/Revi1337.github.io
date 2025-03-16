---
title: OAuth2 인증 인가 프로세스 구현
tags: ['spring', 'oauth2']
---

## 들어가며
안녕하세요. [이전 포스팅](Spring/Security/WhyNotAuthCodeReceiveInFrontend.md) 에서는 Client 가 Frontend 와 Backend 로 분리된 환경에서 `Authorization Code Grant` 방식의 OAuth2 인증 인가프로세스를 알아보았습니다. 또한, Frontend 의 역할을 최소화하여 Frontend 와 Backend 의 역할을 분리하는 것도 알아보았습니다.

이번 포스팅에서는 이전 포스팅을 기반으로 한 `Backend` 의 역할을 Spring OAuth2 Client 모듈을 사용하지 않고, 일단 `스파게티 코드로 직접 구현`해보자 합니다. 그리고 나서 다음 포스팅에서는 이번 포스팅에서 작성한 스파게티 코드를 리팩토링하는 과정까지 알아보고자 합니다.


### 전제 조건
이번 포스팅에서도 이전 포스팅과 같은 상황을 가정합니다.

1. [이전 포스팅](Spring/Security/WhyNotAuthCodeReceiveInFrontend.md) 을 읽어보았습니다. (이번 포스팅에서는 OAuth2 인증 인가 프로세스를 자세하게 살펴보진 않습니다.)
2. 우리의 Application(Client) 이 `Frontend` 와 `Backend` 로 분리되어 있습니다.
3. OAuth2 인증 방식으로 `Authorization Code Grant` 를 사용합니다.
4. 인가 서버로부터 발급받은 Access Token 은 Application 을 인증하기 위한 용도 이외에는 사용되지 않습니다.
5. Application 은 인가 서버의 Access Token 및 Refresh Token 을 직접 사용하지 않고, 자체적인 Access Token 및 Refresh Token을 사용합니다.

이제, 이러한 환경에서 Backend 가 해야하는 기능을 일단 스파게티 코드로 구현해보겠습니다.

## Kakao OAuth2 설정
가장 먼저, OAuth2 인증을 위해 필요한 클라이언트 정보 (`clientId`, `clientSecret`, `redirectUri` 등)를 설정 파일에서 읽어와 객체로 관리할 수 있도록 하는 `OAuth2ClientProperties` 클래스를 작성합니다.

> Map 을 통해 여러 OAuth2 인증 제공자(Provider) 를 동적으로 등록할 수 있기 때문에 유지보수가 편리해집니다.

```java
@ConfigurationProperties("onsquad.oauth2")  
public record OAuth2ClientProperties(  
        Map<String, OAuth2Properties> clients  
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
    }
}
```


`OAuth2ClientProperties` 를 작성한 후, YAML 에 `OAuth2Properties` 의 스펙에 맞춰 인가서버의 메타데이터 정보들을 작성합니다.

```yml
onsquad:  
  oauth2:  
    clients:  
      kakao:  
        client-name: ${spring.application.name}  
        client-id: <Client ID>  
        client-secret: <Client SECRET>  
        issuer-uri: https://kauth.kakao.com  
        authorization-uri: https://kauth.kakao.com/oauth/authorize  
        response_type: code  
        redirect-uri: /login/oauth2/code/kakao  
        token-uri: https://kauth.kakao.com/oauth/token  
        grant-type: authorization_code  
        account-uri: https://kapi.kakao.com/v2/user/me  
        user-info-uri: https://kapi.kakao.com/v1/oidc/userinfo  
  
      google:  
        client-name: ${spring.application.name}  
        client-id: <Client ID>  
        client-secret: client-secret: <Client SECRET>  
        issuer-uri: https://accounts.google.com  
        authorization-uri: https://accounts.google.com/o/oauth2/v2/auth  
        response_type: code  
        redirect-uri: /login/oauth2/code/google  
        token-uri: https://oauth2.googleapis.com/token  
        grant-type: authorization_code  
        account-uri: https://www.googleapis.com/oauth2/v1/userinfo  
        scope:  
          - email: https://www.googleapis.com/auth/userinfo.email  
          - profile: https://www.googleapis.com/auth/userinfo.profile
```

## OAuth2RedirectController
본격적으로 OAuth2 인증을 시작하는 컨트롤러입니다. 더 자세한 역할은 다음과 같습니다.

- Frontend 로 부터 특정 인가서버 Platform(카카오, 구글) 로그인 요청을 받습니다.
- 해당 OAuth2 플랫폼에 맞는 Property 를 사용하여 Authorization URL 을 생성합니다.
- Authorization URL 을 `200 OK` 와 `Location:` 헤더를 사용하여 Frontend 에게 응답해줍니다.

> [!note] 왜 Frontend 에서 직접 Authorization URI 로 리다이렉트 시키는 방법을 사용하지 않았나요?
> - Frontend 가 OAuth2 인증에 필요한 데이터 자체를 모르게 하기 위해서입니다.
> - Authorization URL 는 Client ID, Redirect URI, Scope 들을 파라미터로 연결해서 만들게됩니다. 하지만 만약, 이 Authorization URL 의 생성을 Frontend 에게 책임을 맡긴다면 프론트엔드에서 OAuth2 의 정보를 꼭 알아야하는 단점이 발생합니다.
> - Spring 에서 200 Found / Location: {authorization_uri} 응답을 받은 Frontend(SPA: fetch 혹은 axios) 에서는 Location 헤더를 참조하여 authorization_uri 로 직접 리다이렉트시키면 됩니다.
> - 왜 302 FOUND 가 아니고 200 OK 인 이유는 [302 FOUND가 아니고 200 OK인 이유](Spring/Security/WhyNotAuthCodeReceiveInFrontend.md#^why-not-302) 를 참고하시면 됩니다.

```java
@RestController  
public class OAuth2RedirectionController {  
  
    private final Map<String, OAuth2Properties> oauth2Properties;  
  
    public OAuth2RedirectionController(OAuth2ClientProperties oAuth2ClientProperties) {  
        this.oauth2Properties = oAuth2ClientProperties.clients();  
    }  
  
    @GetMapping("/api/v1/login/oauth2/{platform}")  
	public ResponseEntity<Void> handlePlatformOAuth2Login(@PathVariable String platform) {  
	    if (platform.equals("kakao")) {  
	        OAuth2Properties oAuth2Properties = oauth2Properties.get("kakao");  
	        URI compositeAuthorizationEndPoint = buildCompositeKakaoAuthorizationEndPoint(oAuth2Properties);  
	  
	        return ResponseEntity.ok().location(compositeAuthorizationEndPoint).build();  
	    }  
	    if (platform.equals("google")) {  
	        OAuth2Properties oAuth2Properties = oauth2Properties.get("google");  
	        URI compositeAuthorizationEndPoint = buildCompositeGoogleAuthorizationEndPoint(oAuth2Properties);  
	  
	        return ResponseEntity.ok().location(compositeAuthorizationEndPoint).build();  
	    }  
	    throw new UnsupportedOperationException("unsupported authorization server");  
	} 

  // 로직은 뒤에서 설명
}
```

### Kakao Authorization URI
`OAuth2RedirectionController` 에서 Kakao 인가서버의 Authorization URI 를 만드는 메서드입니다. Kakao Authorization URI 생성에 필요한 정보는 [인가 코드 받기](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-code) 를 참고하시면 됩니다.

- 요청 Context 로부터 Path 를 제외한 baseUrl 를 추출합니다.
- YML 에 작성했던 설정정보를 기반으로 Authorization URI 를 생성하고 리턴합니다.

```java
private URI buildCompositeKakaoAuthorizationEndPoint(OAuth2Properties oAuth2Properties) {  
    String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();  
    return ServletUriComponentsBuilder  
            .fromHttpUrl(oAuth2Properties.authorizationUri())  
            .queryParam("client_id", oAuth2Properties.clientId())  
            .queryParam("redirect_uri", baseUrl + oAuth2Properties.redirectUri())  
            .queryParam("response_type", oAuth2Properties.responseType())  
            .build()  
            .toUri();  
}
```

### Google Authorization URI
마찬가지로 `OAuth2RedirectionController` 에서 Google 인가서버의 Authorization URI 를 만드는 메서드입니다. Google Authorization URI 생성에 필요한 정보는 [Google 에 인증요청 보내기](https://developers.google.com/identity/openid-connect/openid-connect?hl=k) 를 참고하시면 됩니다.

- 요청 Context 로부터 Path 를 제외한 baseUrl 를 추출합니다.
- YML 에 작성했던 설정정보를 기반으로 Authorization URI 를 생성하고 리턴합니다.

```java
private URI buildCompositeGoogleAuthorizationEndPoint(OAuth2Properties oAuth2Properties) {  
    String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();  
    return ServletUriComponentsBuilder  
            .fromHttpUrl(oAuth2Properties.authorizationUri())  
            .queryParam("client_id", oAuth2Properties.clientId())  
            .queryParam("redirect_uri", baseUrl + oAuth2Properties.redirectUri())  
            .queryParam("response_type", oAuth2Properties.responseType())  
            .queryParam("scope", String.join(" ", oAuth2Properties.scope().values()))  
            .build()  
            .toUri();  
}
```


### Access-Control-Expose-Headers
이제 Frontend 가 Backend 가 내려주는 Location 헤더를 참조할 수 있도록 Access-Control-Expose-Headers 에 Location 헤더를 추가해주어야 합니다. 그 이유는 [Access-Control-Expose-Headers 에 Location 을 추가해줘야 하는 이유](Spring/Security/WhyNotAuthCodeReceiveInFrontend.md#^why-add-access-control-expose-headers-location) 를 참고하시면 됩니다.

Spring Security 를 사용하지 않는다면, WebMvcConfigurer 를 impl 을 하여 addCorsMappings 를 오버라이딩해주시면 됩니다.

```java
@RequiredArgsConstructor  
@Configuration  
public class WebMvcConfig implements WebMvcConfigurer {  
  
    @Override  
    public void addCorsMappings(CorsRegistry registry) {  
        registry.addMapping("/**")  
                .allowedOriginPatterns("*") // TODO 나중에 Front BaseURL 만으로 변경해야 한다.  
                .allowedMethods("*")  
                .allowedHeaders("*")  
                .exposedHeaders(HttpHeaders.AUTHORIZATION, HttpHeaders.LOCATION)  
                .allowCredentials(true);  
    }  
}
```


Spring Security 를 사용중이라면, CorsConfigurationSource 를 Bean 으로 등록해주고, SecurityFIlterChain 에 등록시키면 됩니다.

```java
@RequiredArgsConstructor  
@Configuration  
@EnableWebSecurity  
public class SecurityConfig {  
  
    @Bean  
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {  
        return httpSecurity  
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))  
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  
                .csrf(AbstractHttpConfigurer::disable)  
                .formLogin(AbstractHttpConfigurer::disable)  
                .httpBasic(AbstractHttpConfigurer::disable)  
                .authorizeHttpRequests(request -> request.anyRequest().permitAll())  
                .addFilterAfter(loginFilter(), LogoutFilter.class)  
                .build();  
    }  

	// 관련 없는 코드 생략

    @Bean  
    public CorsConfigurationSource corsConfigurationSource() {  
        CorsConfiguration corsConfiguration = new CorsConfiguration();  
        corsConfiguration.addAllowedOriginPattern("*"); // TODO 나중에 Front BaseURL 만으로 변경해야 한다.  
        corsConfiguration.addAllowedMethod("*");  
        corsConfiguration.addAllowedHeader("*");  
        corsConfiguration.setExposedHeaders(List.of(HttpHeaders.AUTHORIZATION, HttpHeaders.LOCATION));  
        corsConfiguration.setAllowCredentials(true);  
  
        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();  
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);  
        return urlBasedCorsConfigurationSource;  
    }  
}
```

## OAuth2CodeGrantController
해당 컨트롤러는 OAuth2 인가 서버로부터 반환되는 Redirect URI 의 Authorization Code 를 처리하고, Authorization Code 로 인가서버와 통신하여 AccessToken 을 받아오고, 그 Access Token 을 사용하여 사용자의 정보를 얻어오는 역할을 합니다. 보다 정확한 프로세스는 다음과 같습니다.

- OAuth2 인가 서버(Kakao, Google) 로부터 Authorization Code를 전달받습니다. (인가서버는 Authorization Code를 Redirect URI 의 쿼리 파라미터에 붙여 함께 전송합니다.)
- 전달받은 Authorization Code를 사용하여 Token EndPoint 에 Access Token 을 요청합니다.
- Access Token을 이용하여 User EndPoint 에 요청을 보내 해당 플랫폼의 사용자 정보를 조회합니다.
- 조회한 사용자 정보를 기반으로 OAuth2 회원 로그인 및 가입을 처리합니다. (애플리케이션에서 사용되는 AccessToken 과 RefreshToken 을 만들어서 JsonWebToken 이라는 클래스에서 한번 래핑하여 반환합니다.)
- 반환한 JsonWebToken(Access Token, Refresh Token)을 Frontend 주소로 302 로 리다이렉트합니다.

> 애플리케이션 자체적으로 사용하는 AccessToken 과 RefreshToken 을 발급하는 코드는 첨부하지 않습니다.

```java
@RestController  
public class PlatformOAuth2CodeGrantController {  
  
    private final Map<String, OAuth2Properties> oauth2Properties;  
    private final OnsquadProperties onsquadProperties;  
    private final OAuth2LoginService oAuth2LoginService;  
  
    public PlatformOAuth2CodeGrantController(OAuth2ClientProperties oAuth2ClientProperties,  
                                             OnsquadProperties onsquadProperties,  
                                             OAuth2LoginService oAuth2LoginService) {  
        this.oauth2Properties = oAuth2ClientProperties.clients();  
        this.onsquadProperties = onsquadProperties;  
        this.oAuth2LoginService = oAuth2LoginService;  
    }  
  
    @GetMapping("/login/oauth2/code/{platform}")  
    public ResponseEntity<Void> receivePlatformAuthorizationCode(@PathVariable String platform,  
                                                                 @RequestParam String code) {  
        if (platform.equals("kakao")) {  
            OAuth2Properties oAuth2Properties = oauth2Properties.get("kakao");  
            AccessToken accessToken = fetchKakaoAccessToken(code, oAuth2Properties);  
            KakaoUserInfoResponse kakaoUserInfoResponse = fetchKakaoUserInfoResponse(accessToken, oAuth2Properties);  
            PlatformUserProfile kakaoUserProfile = KakaoUserProfile.from(kakaoUserInfoResponse);  
  
            JsonWebToken jsonWebToken = oAuth2LoginService.loginOAuth2User(kakaoUserProfile);  
            URI redirectUri = buildRedirectUri(jsonWebToken);  
  
            return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();  
        }  
        if (platform.equals("google")) {  
            OAuth2Properties oAuth2Properties = oauth2Properties.get("google");  
            AccessToken accessToken = fetchGoogleAccessToken(code, oAuth2Properties);  
            GoogleUserInfoResponse googleUserInfoResponse = fetchGoogleUserInfoResponse(accessToken, oAuth2Properties);  
            PlatformUserProfile googleUserProfile = GoogleUserProfile.from(googleUserInfoResponse);  
  
            JsonWebToken jsonWebToken = oAuth2LoginService.loginOAuth2User(googleUserProfile);  
            URI redirectUri = buildRedirectUri(jsonWebToken);  
  
            return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();  
        }  
  
        throw new IllegalArgumentException("unsupported platform: " + platform);  
    }  

    // 나머지 Access Token 및 User 정보 Fetch 해오는 코드  

	private URI buildRedirectUri(JsonWebToken jsonWebToken) {  
	    return ServletUriComponentsBuilder.fromHttpUrl(onsquadProperties.getFrontendBaseUrl())  
            .queryParam("accessToken", jsonWebToken.accessToken().value())  
            .queryParam("refreshToken", jsonWebToken.refreshToken().value())  
            .build()  
            .toUri();  
	}
}
```

### Kakao Access Token
`PlatformOAuth2CodeGrantController` 에서 Kakao 인가서버에 AccessToken 을 요청하고 가져오는 메서드입니다. 

- RestTemplate 과 Authorization Code 로 Kakao 인가서버의 Token URI 와 통신하여 Access Token 을 요청 및 응답 받습니다. 이 때, 응답을 `Map<String, String>` 타입으로 받습니다. (access token 을 제외하고 현재는 불필요하기 때문입니다.)
- 반환받은 `Map<String, String>` 에서 access_token 만을 추출해 AccessToken 이라는 객체로 한번 래핑하여 반환합니다.

> Kakao 인가서버에 AccessToken 을 요청할 수 있는 주소인 Token URI 에 필요한 Header 와 기타 정보들은 [액세스 토큰 가져오기](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-token) 에서 확인할 수 있습니다.

```java
private AccessToken fetchKakaoAccessToken(String code, OAuth2Properties oAuth2Properties) {  
    String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();  
    String compositeTokenEndPoint = ServletUriComponentsBuilder  
            .fromHttpUrl(oAuth2Properties.tokenUri())  
            .queryParam("client_id", oAuth2Properties.clientId())  
            .queryParam("grant_type", oAuth2Properties.grantType())  
            .queryParam("redirect_uri", baseUrl + oAuth2Properties.redirectUri())  
            .queryParam("code", code)  
            .toUriString();  
  
    MultiValueMap<String, String> tokenAttributeHeader = new LinkedMultiValueMap<>() {{  
        add(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded;");  
        add(HttpHeaders.CONTENT_TYPE, "charset=utf-8");  
    }};  
    ResponseEntity<Map<String, String>> tokenAttributeResponse = new RestTemplate().exchange(  
            compositeTokenEndPoint, HttpMethod.POST, new HttpEntity<>(tokenAttributeHeader),  
            new ParameterizedTypeReference<>() {  
            }    );  
  
    return AccessToken.of(tokenAttributeResponse.getBody().get("access_token"));  
}
```

### Google Access Token
마찬가지로 `PlatformOAuth2CodeGrantController` 에서 Google 인가서버에 AccessToken 을 요청하고 가져오는 메서드입니다. 

- RestTemplate 과 Authorization Code 로 Kakao 인가서버의 Token URI 와 통신하여 Access Token 을 요청 및 응답 받습니다. 이 때, 응답을 `Map<String, String>` 타입으로 받습니다. (access token 을 제외하고 현재는 불필요하기 때문입니다.)
- 반환받은 `Map<String, String>` 에서 access_token 만을 추출해 AccessToken 이라는 객체로 한번 래핑하여 반환합니다.

> Google 인가서버에 AccessToken 을 요청할 수 있는 주소인 Token URI 에 필요한 Header 와 기타 정보들은 [액세스 토큰 받기](https://developers.google.com/identity/openid-connect/openid-connect?hl=ko#exchangecode) 에서 확인할 수 있습니다.

```java
private AccessToken fetchGoogleAccessToken(String code, OAuth2Properties oAuth2Properties) {  
    String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();  
    MultiValueMap<String, String> params = new LinkedMultiValueMap<>() {{  
        add("client_id", oAuth2Properties.clientId());  
        add("client_secret", oAuth2Properties.clientSecret());  
        add("redirect_uri", baseUrl + oAuth2Properties.redirectUri());  
        add("grant_type", oAuth2Properties.grantType());  
        add("code", code);  
    }};  
  
    HttpHeaders headers = new HttpHeaders();  
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);  
    ResponseEntity<Map<String, String>> tokenAttributeResponse = new RestTemplate().exchange(  
            oAuth2Properties.tokenUri(),  
            HttpMethod.POST,  
            new HttpEntity<>(params, headers),  
            new ParameterizedTypeReference<>() {  
            }    );  
  
    return AccessToken.of(tokenAttributeResponse.getBody().get("access_token"));  
}
```

### Kakao User Response
`PlatformOAuth2CodeGrantController` 에서 인가서버로부터 AccessToken 을 가져온 후, 사용자 정보를 조회해오는 메서드입니다. 

- AccessToken 을 이용하기 때문에 Authorization Header 에 Bear 토큰을 달아서 User Endpoint 에 요청을 날려 사용자 정보를 `KakaoUserInfoResponse` 타입으로 받아옵니다.

> Kakao 리소스 서버에 사용자 정보를 요청할 수 있는 주소인 User Endpoint 에 필요한 Header 와 기타 정보들은 [사용자 정보 가져오기](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#req-user-info) 에서 확인할 수 있습니다.


```java
private KakaoUserInfoResponse fetchKakaoUserInfoResponse(AccessToken accessToken,  
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
```


아래 코드는 Kakao 에서 내려주는 사용자 정보에 대한 JSON 을 `KakaoUserInfoResponse` 에 매핑하는 클래스입니다. `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)` 을 이용하여 KakaoUserInfoResponse 객체의 필드명을 JSON 변환 시 자동으로 `snake_case` 형식으로 매핑할 수 있습니다.

```java
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)  
public record KakaoUserInfoResponse(  
        Long id,  
        String connectedAt,  
        Properties properties,  
        KakaoAccount kakaoAccount  
) {  
  
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)  
    public record Properties(  
            String nickname,  
            String profileImage,  
            String thumbnailImage  
    ) {  
    }  
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)  
    public record KakaoAccount(  
            boolean profileNicknameNeedsAgreement,  
            boolean profileImageNeedsAgreement,  
            Profile profile,  
            boolean hasEmail,  
            boolean emailNeedsAgreement,  
            boolean isEmailValid,  
            boolean isEmailVerified,  
            String email  
    ) {  
  
        @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)  
        public record Profile(  
                String nickname,  
                String thumbnailImageUrl,  
                String profileImageUrl,  
                boolean isDefaultImage,  
                boolean isDefaultNickname  
        ) {  
        }    
	}  
}
```

### Google User Response
마찬가지로 `PlatformOAuth2CodeGrantController` 에서 인가서버로부터 AccessToken 을 가져온 후, 사용자 정보를 조회해오는 메서드입니다. 

- AccessToken 을 이용하기 때문에 Authorization Header 에 Bear 토큰을 달아서 User Endpoint 에 요청을 날려 사용자 정보를 GoogleUserInfoResponse 타입으로 받아옵니다.

> Google 리소스 서버에 사용자 정보를 요청할 수 있는 주소인 User Endpoint 에 필요한 Header 와 기타 정보들은 [사용자 프로필 정보 가져오기](https://developers.google.com/identity/openid-connect/openid-connect?hl=ko#obtainuserinfo) 에서 확인할 수 있습니다.

```java
private GoogleUserInfoResponse fetchGoogleUserInfoResponse(AccessToken accessToken,  
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
```


아래 코드는 Google 에서 내려주는 사용자 정보에 대한 JSON 을 `GoogleUserInfoResponse` 에 매핑하는 클래스입니다. `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)` 을 이용하여 GoogleUserInfoResponse 객체의 필드명을 JSON 변환 시 자동으로 `snake_case` 형식으로 매핑할 수 있습니다.

```java
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)  
public record GoogleUserInfoResponse(  
        BigInteger id,  
        String email,  
        boolean verifiedEmail,  
        String name,  
        String givenName,  
        String familyName,  
        String picture  
) {  
}
```


### Convert to UserProfile 
`PlatformUserProfile` 은 사용자 프로필을 정의하는 Interface 입니다. OAuth2 인증 플랫폼마다 사용자 정보에 대한 응답을 주는 JSON 포맷이 다 다르기 때문에, `KakaoUserInfoResponse` 혹은 `GoogleUserInfoResponse` 로 일단 받고, 이를 아래 인터페이스에 맞게 정형화시키는 과정을 수행하는 역할을 합니다.

```java
public interface PlatformUserProfile {  
  
    String getName();  
  
    String getNickname();  
  
    String getEmail();  
  
    boolean isEmailVerified();  
  
    String getProfileImage();  
  
    String getThumbnailImage();  
  
}
```


PlatformUserProfile 을 impl 한 KakaoUserProfile 입니다. KakaoUserProfile 는 `KakaoUserInfoResponse` 로 부터 Profile 정보를 생성합니다.

```java
public record KakaoUserProfile(  
        String name,  
        String nickname,  
        String email,  
        boolean isEmailVerified,  
        String profileImage,  
        String thumbnailImage  
) implements PlatformUserProfile {  
  
    public static KakaoUserProfile from(KakaoUserInfoResponse response) {  
        return new KakaoUserProfile(  
                response.kakaoAccount().profile().nickname(),  
                response.kakaoAccount().profile().nickname(),  
                response.kakaoAccount().email(),  
                response.kakaoAccount().isEmailVerified(),  
                response.kakaoAccount().profile().profileImageUrl(),  
                response.kakaoAccount().profile().thumbnailImageUrl()  
        );  
    }  
  
    @Override  
    public String getName() {  
        return name;  
    }  
  
    @Override  
    public String getNickname() {  
        return nickname;  
    }  
  
    @Override  
    public String getEmail() {  
        return email;  
    }  
  
    @Override  
    public String getProfileImage() {  
        return profileImage;  
    }  
  
    @Override  
    public String getThumbnailImage() {  
        return thumbnailImage;  
    }  
}
```


PlatformUserProfile 을 impl 한 GoogleUserProfile 입니다. GoogleUserProfile 는 `GoogleUserInfoResponse` 로 부터 Profile 정보를 생성합니다.

```java
public record GoogleUserProfile(  
        String name,  
        String nickname,  
        String email,  
        boolean isEmailVerified,  
        String profileImage,  
        String thumbnailImage  
) implements PlatformUserProfile {  
  
    public static GoogleUserProfile from(GoogleUserInfoResponse response) {  
        return new GoogleUserProfile(  
                response.name(),  
                response.name(),  
                response.email(),  
                response.verifiedEmail(),  
                response.picture(),  
                response.picture()  
        );  
    }  
  
    @Override  
    public String getName() {  
        return name;  
    }  
  
    @Override  
    public String getNickname() {  
        return nickname;  
    }  
  
    @Override  
    public String getEmail() {  
        return email;  
    }  
  
    @Override  
    public String getProfileImage() {  
        return profileImage;  
    }  
  
    @Override  
    public String getThumbnailImage() {  
        return thumbnailImage;  
    }  
}
```

### Process Appliation Logic
PlatformUserProfile 타입으로 사용자 정보들을 모두 변환했다면.. 이제 얻어온 사용자 정보들을 이용하여 로그인 및 회원가입을 진행시키는 과정을 진행시키면 됩니다. 현재 진행하고 있는 프로젝트에서는 `이메일 존재 여부` 에 따라 로그인 및 회원가입 절차를 내부적으로 시키고, 애플리케이션 자체적으로 사용하는 AccessToken 과 RefreshToken 을 발급하여 Frontend 의 주소로 Redirect 시키게 됩니다.

```java
@RequiredArgsConstructor  
@Service  
public class OAuth2LoginService {  
  
    private final MemberRepository memberRepository;  
    private final PasswordEncoder passwordEncoder;  
    private final JsonWebTokenService jsonWebTokenService;  
  
    public JsonWebToken loginOAuth2User(PlatformUserProfile platformUserProfile) {  
        return memberRepository.findByEmail(new Email(platformUserProfile.getEmail()))  
                .map(member -> jsonWebTokenService.generateTokenPair(MemberDto.from(member)))  
                .orElseGet(() -> forceParticipant(platformUserProfile));  
    }  
  
    private JsonWebToken forceParticipant(PlatformUserProfile platformUserProfile) {  
        String encryptedPassword = passwordEncoder.encode(UUID.randomUUID().toString());  
        UserType userType = guessUserType(platformUserProfile);  
        Member member = Member.createOAuth2User(platformUserProfile.getEmail(), platformUserProfile.getNickname(),  
                platformUserProfile.getProfileImage(), encryptedPassword, userType);  
        memberRepository.save(member);  
  
        JsonWebToken jsonWebToken = jsonWebTokenService.generateTokenPair(MemberDto.from(member));  
        jsonWebTokenService.storeTemporaryTokenInMemory(jsonWebToken.refreshToken(), member.getId());  
        return jsonWebToken;  
    }  
  
    private UserType guessUserType(PlatformUserProfile platformUserProfile) {  
        UserType userType = UserType.GENERAL;  
        if (platformUserProfile instanceof GoogleUserProfile) {  
            userType = UserType.GOOGLE;  
        } else if (platformUserProfile instanceof KakaoUserProfile) {  
            userType = UserType.KAKAO;  
        }  
        return userType;  
    }  
}
```


## 마치며
지금까지 Kakao 와 Google OAuth2 인증 인가 프로세스를 구현해보았습니다. 다음 포스팅에서는 지금까지 작성한 코드를 리팩토링해보도록 하겠습니다.

[다음 포스팅 : OAuth2 인증 인가 프로세스 코드 리팩토링](Spring/Security/SpringOAuth2ImplementRefactor.md)