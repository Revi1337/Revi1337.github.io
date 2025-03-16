---
title: JSON 의 특정 필드의 따로 역직렬화
tags: ['spring', 'jackson', 'deserialize']
---

## 들어가며
Restful API 에서는 JSON 으로 Client 와 통신하게 됩니다. Spring 에서는 Request 로 들어온 JSON 을 역직렬화(Deserialize)하여 객체로 변환하고, 객체는 직렬화(Serialize)되어 Response 로 나가게 됩니다.

- Deserialize(역직렬화) : 클라이언트에서 전달된 **JSON 데이터를 Java 객체로 변환**하는 과정.
- Serialize(직렬화) : 서버에서 처리된 **Java 객체를 JSON 데이터로 변환**하여 클라이언트로 응답하는 과정.

이번 포스팅에서는 Client 에서 전달된 `JSON 의 특정 필드` 를 입맛대로 역직렬화하는 여러가지 방법들을 소개하고자 합니다.

## @JsonCreator
`@JsonCreator` 는 역직렬화하려는 Class 의 새로운 `Instance` 생성하는데 사용되는 `생성자 혹은 팩토리 메서드를 지정`해주기 위해 사용하는 어노테이션입니다. 생성자 혹은 팩토리 메서드에 해당 어노테이션을 적용할 경우, 해당 메서드는 아래 조건 중 하나를 만족해야 합니다.

### 첫번째 조건
`생성자/팩토리 메서드` 의 매개변수가 하나이어야 합니다. 해당 경우는 `Delegate Creator(위임 생성자)` 로 간주됩니다. Jackson 에서는 `JSON` 을 생성자 혹은 팩토리 메서드에 사용된 `매개변수 타입` 으로 바인딩 한 뒤, 생성자를 호출하게 됩니다.

```java {30,31}
@Getter  
@RequiredArgsConstructor  
public enum HashtagType {  
  
    ACTIVE("활발한", 1L),  
    TRENDY("트랜디한", 2L),
    ... // 기타 생략
    ;
  
    private final String text;  
    private final Long pk;  
  
    private static final Map<String, HashtagType> hashtagTypeStorage = Collections.unmodifiableMap(new HashMap<>() {  
        {  
            unmodifiableList().forEach(hashtag -> put(hashtag.getText(), hashtag));  
        }  
    });  
  
    public static List<HashtagType> unmodifiableList() {  
        return List.of(HashtagType.values());  
    }  
  
    public static List<HashtagType> fromTexts(List<String> hashtagTexts) {  
        return new LinkedHashSet<>(hashtagTexts).stream()  
                .map(HashtagType::fromText)  
                .toList()
    }  
  
	@JsonCreator(mode = Mode.DELEGATING)  
    public static HashtagType fromText(String hashtagText) {  
        return hashtagTypeStorage.get(hashtagText.toUpperCase());  
    }  
}
```


아래 RequestDTO 에 맞는 JSON 을 작성하고 요청을 찔러보면
 
```java
public record CrewCreateRequest(  
        @NotEmpty String name,  
        @NotEmpty String introduce,  
        @NotEmpty String detail,  
        @NotNull List<HashtagType> hashtags,  
        String kakaoLink  
) {  
}

"""
{
  "name": "크루 21",
  "introduce": "크루 소개",
  "detail": "크루 디테일",
  "hashtags": [
    "활발한",
    "트랜디한"
  ],
  "kakaoLink": "카카오링크"
}
"""
```


아래 로그와 같이 hastags 필드가 역직렬화되어 Enum(`ACTIVE, TRENDY`) 으로 매핑된 것을 확인할 수 있습니다.

```text
CrewCreateRequest[name=크루 21, introduce=크루 소개, detail=크루 디테일, hashtags=[ACTIVE, TRENDY], kakaoLink=카카오링크]
```

### 두번째 조건
`첫번째 조건` 을 만족하지 못한다면, 생성자/팩토리 메서드의 모든 매개변수에 `@JsonProperty` 혹은 `@JsonInject` 를 지정해서 각 매개변수가 JSON 필드에 바인딩될 속성의 이름을 명시해주어야 합니다. (JDK 8 이상이라면 @JsonProperty 는 선택사항입니다.)

```java
@JsonCreator  
public static HashtagType fromText(@JsonProperty("property_1") String text, @JsonProperty("property_2") Long pk) {  
    return unmodifiableList().stream()  
            .filter(enumerate -> enumerate.text.equals(text))  
            .filter(enumerate -> enumerate.pk.equals(pk))  
            .findFirst()  
            .orElse(null);  
}
```


아래 RequestDTO 에 맞는 JSON 을 작성하고 요청을 찔러보면

```java
public record CrewCreateRequest(  
        @NotEmpty String testField,  
        @NotNull List<HashtagType> hashtags  
) {  
}

"""
{
  "name": "크루 21",
  "introduce": "크루 소개",
  "detail": "크루 디테일",
  "hashtags": [
    {
      "property_1": "활발한",
      "property_2": "1"
    },
    {
      "property_1": "트랜디한",
      "property_2": "2"
    }
  ],
  "kakaoLink": "카카오링크"
}
"""
```


아래 로그와 같이 hastags 필드가 역직렬화되어 Enum(`ACTIVE, TRENDY`) 으로 매핑된 것을 확인할 수 있습니다.

```text
CrewCreateRequest[testField=테스트_필드, hashtags=[ACTIVE, TRENDY]]
```

### 장단점
**장점
- POJO 에 Jackson 어노테이션을 달아준것만으로도 역직렬화가 가능해집니다.
-  만약 특정 클래스의 팩토리 메서드 혹은 생성자에 `@JsonCreator` 를 명시해주었으면, `해당 클래스` 그리고 `Collection` 도 자동으로 역직렬화가 됩니다.
- 해당 타입에 대한 역직렬화가 `전역적으로 자동화`됩니다. 만약 RequestDTO 의 필드에 역직렬화 하려는 타입이 발견되면, 해당 클래스의 `@JsonCreator`  를 호출하여 역직렬화를 수행하게 됩니다.

**단점**
- 당연하게도 POJO 에 Jackson 라이브러리에 대한 의존성을 갖게 됩니다. 이는 곧 특정 라이브러리에 종속적인 설계를 유발할 수 있습니다.

## JsonDeserializer & StdDeserializer
### JsonDeserializer\<T>
`JsonDeserializer`는 Jackson 라이브러리에서 `JSON을 자바 객체로 역직렬화(Deserialize)하기 위한 추상 클래스`입니다. JsonDeserializer 는 `JSON` 형식의 데이터를 `자바 객체로 변환하는 로직을 정의`하는 역할을 합니다. JsonDeserializer 에서는 `JsonParser`  로 JSON 을 읽어들일 수 있습니다.

```java
public class HashtagTypeDeserializer extends JsonDeserializer<HashtagType> {  
  
    @Override  
    public HashtagType deserialize(JsonParser p, DeserializationContext ctxt) throws IOException, JacksonException {  
        TextNode textNode = p.getCodec().readTree(p);  
        String hashtag = textNode.asText();  
        return HashtagType.fromText(hashtag);  
    }  
}
```

### StdDeserializer\<T>
`StdDeserializer` 는 JsonDeserializer 를 extends 한 추상 클래스입니다. Comment 에 따르면 `JsonDeserializer` 을 직접 구현하는 것은 권장사항이 아니며 `StdDeserializer` 를 구현하라고 나와있습니다. 

```java
/**  
 * Abstract class that defines API used by {@link ObjectMapper} (and  
 * other chained {@link JsonDeserializer}s too) to deserialize Objects of  
 * arbitrary types from JSON, using provided {@link JsonParser}.  
 *<p> * Custom deserializers should usually not directly extend this class, 
 * but instead extend {@link com.fasterxml.jackson.databind.deser.std.StdDeserializer}  
 * (or its subtypes like {@link com.fasterxml.jackson.databind.deser.std.StdScalarDeserializer}).  
 *<p>
```


하지만 기능적으로는 `JsonDeserializer` 와 `StdDeserializer` 는 차이가 없습니다.

```java
public class HashtagTypeDeserializer extends StdDeserializer<HashtagType> {  
  
    public HashtagTypeDeserializer() {  
        super(HashtagType.class);  
    }  
  
    @Override  
    public HashtagType deserialize(JsonParser p, DeserializationContext ctxt) throws IOException, JacksonException {  
        TextNode textNode = p.getCodec().readTree(p);  
        String hashtag = textNode.asText();  
        return HashtagType.fromText(hashtag);  
    }  
}
```

```java
public class ListableHashtagTypeDeserializer extends StdDeserializer<List<HashtagType>> {  
  
    public ListableHashtagTypeDeserializer() {  
        super(List.class);  
    }  
  
    @Override  
    public List<HashtagType> deserialize(JsonParser p, DeserializationContext ctxt)  
            throws IOException, JacksonException {  
        JsonNode node = p.getCodec().readTree(p);  
        if (!node.isArray()) {  
            return new ArrayList<>();  
        }  
  
        return HashtagTypeUtil.extractPossible(StreamSupport.stream(node.spliterator(), false)  
                .map(JsonNode::asText)  
                .map(HashtagType::fromText)  
                .toList());  
    }  
}
```

### Deserializer 사용법
구현한 `JsonDeserializer` 와 `StdDeserializer` 를 등록하는 방법에는 크게 3가지가 있습니다. 

- @JsonDeserializer(using = 구현한 Deserializer.class)
- ObjectMapper 의 Module 등록
- @JsonComponent 으로 @Bean 등록

#### @JsonDeserialize
`@JsonDeserialize` 는 사용하고자하는 JsonDeserializer 혹은 StdDeserializer 를 직접 지정할 때 사용합니다.  해당 어노테이션은 `메서드, 필드, 클래스, 매개변수` 에 모두 명시할 수 있습니다.  

따라서 아래 코드는 `List<HashtagType> hashtags` 필드를 역직렬화할 때, `ListableHashtagTypeDeserializer` 를 사용하겠다는 의미가 됩니다.

```java
public record CrewCreateRequest(  
        @NotEmpty String name,  
        @NotEmpty String introduce,  
        @NotEmpty String detail,  
        @NotNull @JsonDeserialize(using = ListableHashtagTypeDeserializer.class) List<HashtagType> hashtags,  
        String kakaoLink  
) {  
}
```

> [!note] @JsonDeserialize 은 꼭 Type 이 일치해야합니다.
> 만약 매개변수에 @JsonDeserialize 를 명시해주었다면, 해당 매개변수는 사용하고자하는 Deserializer 에서 구현한 제네릭타입과 꼭 일치해야합니다. 만약 제네릭 타입이 List\<HashtagType> 였다면 매개변수 타입도 List\<HashtagType> 여야합니다. 단일 HashtagType 이면 런타임 예외가 발생하게 됩니다.

#### ObjectMapper Module 등록
구현한 JsonDeserializer 혹은 StdDeserializer 는 `ObjectMapper` 의 `Module` 에 등록하여 사용할 수도 있습니다.  해당 방법은 아래와 같은 장점이 있습니다.

1. `단일 타입에 대한 역직렬화에 대한 로직만 정상적으로 작성`해준다면 `List 와 같은 Collection` 도 자동으로 역직렬화시켜줍니다.
2. 등록한 Deserializer 혹은 Serializer 는 전역으로 사용됩니다.
3. 해당 타입에 대한 역직렬화가 `전역적으로 자동화`됩니다. 만약 RequestDTO 의 필드에 역직렬화 하려는 타입이 발견되면, 등록한 Deserializer 가 사용되게 됩니다.


애플리케이션에서 전반적으로 사용되는 ObjectMapper 에 구현한 `HashtagTypeDeserializer` 를 모듈로 등록시켜주면

```java
@Configuration  
public class ObjectMapperConfig {  
  
    @Primary  
    @Bean    
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {  
        return builder.createXmlMapper(false)  
                .build()  
                .registerModule(new JavaTimeModule())  
                .registerModule(new SimpleModule().addDeserializer(HashtagType.class, new HashtagTypeDeserializer()))  
                .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);  
    }  
}
```


별도의 선언없이 Collection\<T> 과 같은 타입도 자동으로 역직렬화됩니다.

```java
public record CrewCreateRequest(  
        @NotEmpty String name,  
        @NotEmpty String introduce,  
        @NotEmpty String detail,  
        @NotNull List<HashtagType> hashtags,  
        String kakaoLink  
) {  
}

"""
{
  "name": "크루 21",
  "introduce": "크루 소개",
  "detail": "크루 디테일",
  "hashtags": [
    "활발한",
    "트랜디한"
  ],
  "kakaoLink": "카카오링크"
}
"""
```

```text
CrewCreateRequest[name=크루 21, introduce=크루 소개, detail=크루 디테일, hashtags=[ACTIVE, TRENDY], kakaoLink=카카오링크]
```

#### @JsonComponent
`@JsonComponent`는 Spring 에서 제공하는 어노테이션이며, 구현한 `Deserializer` 혹은 `Serializer` Component 를 `자동 으로 등록` 하는 기능을 제공합니다. 당연히 ComponentScan 대상이므로 해당 Bean 은 스프링에서 관리하게 됩니다. (해당 어노테이션 안에 @Component 가 선언되어 있습니다.)

해당 방법은 아래와 같은 장점을 같습니다.

1. ObjectMapper 에 모듈로 등록하는 등의 불필요한 과정이 없습니다.
2. `단일 타입에 대한 역직렬화에 대한 로직만 정상적으로 작성`해준다면 `List 와 같은 Collection` 도 자동으로 역직렬화시켜줍니다.
3. 등록한 Deserializer 혹은 Serializer 는 전역으로 사용됩니다.
4. 해당 타입에 대한 역직렬화가 `전역적으로 자동화`됩니다. 만약 RequestDTO 의 필드에 역직렬화 하려는 타입이 발견되면, 등록한 Deserializer 가 사용되게 됩니다.

아래 예시에서는 Deserializer 를 inner class 로 만들고 이를 감싸는 Factory 라는 Wrapper 클래스에 @JsonComponent 를 달아주었지만, 모두 분리해서 `@JsonComponent` 를 달아줘도 됩니다.

```java
@JsonComponent  
public class JsonComponentFactory {  
  
    public static class HashtagTypeDeserializer extends StdDeserializer<HashtagType> {  
  
        public HashtagTypeDeserializer() {  
            super(HashtagType.class);  
        }  
  
        @Override  
        public HashtagType deserialize(JsonParser p, DeserializationContext ctxt) throws IOException, JacksonException {  
            TextNode textNode = p.getCodec().readTree(p);  
            String hashtag = textNode.asText();  
            return HashtagType.fromText(hashtag);  
        }  
    }  
	// 여러개 등록 가능
}
```

## Reference
https://velog.io/@tin9oo/JsonCreate

https://velog.io/@kny8092/ObjectMapper-%EC%A7%9A%EA%B3%A0-%EB%84%98%EC%96%B4%EA%B0%80%EA%B8%B0#generic-type%EC%97%90%EC%84%9C-custom-deserializer-%EC%A0%95%EC%9D%98%ED%95%98%EA%B8%B0

https://joon2974.tistory.com/entry/Java-%EA%B3%B5%ED%86%B5-%EC%A0%81%EC%9A%A9-JsonDeserializer-%EB%A7%8C%EB%93%A4%EC%96%B4-%EB%B3%B4%EA%B8%B0#%ED%8A%B9%EC%A0%95-enum%EC%97%90%EB%A7%8C-%EC%A0%81%EC%9A%A9%EB%90%98%EB%8A%94-deserializer

https://www.baeldung.com/jackson-serialize-dates

https://www.baeldung.com/spring-boot-jsoncomponent

https://docs.spring.io/spring-boot/reference/features/json.html#features.json.jackson.custom-serializers-and-deserializers

https://velog.io/@wlgns3855/JAVA-JsonCreator%EB%A1%9C-enum-%ED%81%B4%EB%9E%98%EC%8A%A4-%EA%B4%80%EB%A6%AC%ED%95%98%EA%B8%B0

https://kimsup10.wordpress.com/2019/04/02/jsoncreator%EB%8A%94-%EC%99%9C-%EC%93%B0%EB%8A%94%EA%B1%B8%EA%B9%8C/

https://jaime-note.tistory.com/15

https://siyoon210.tistory.com/185
