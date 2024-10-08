---
title: Whitelist 기반 MagicByte 필터링 구현
tags: ['spring', 'magic-byte', 'secure-coding']
---

## 들어가며
어떤 프로젝트라도 보통은 이미지를 업로드하는 로직이 꼭 들어가곤 합니다. 물론 제가 지금 진행하고 있는 프로젝트도 마찬가지구요. 이번 포스팅에서는 파일의 `Magic Byte` 를 검증하여 특정 파일만 `Whitelist` 기반으로 허용하는 방법을 다뤄보고자 합니다.

물론 S3 를 이용한다면, `버킷 정책` 에서 업로드할 수 있는 파일들만 `WhiteList` 기반으로 제한시킬 수 있습니다. 또한, 스프링을 사용한다면 아래와 같은 코드로 MIME 타입을 판단할 수도 있습니다. 하지만 아래의 코드는 `이름을 포함한 경로를 기반으로 파일의 MIME 타입을 추론` 하기 때문에 신뢰성이 떨어집니다.

```java
MediaType mediaType = MediaType.parseMediaType(Files.probeContentType(Paths.get(imageName)));
```

이러한 생각을 하게 된 이유는 진로를 개발로 전향하기 전, Web 관련 CTF 에서 파일 업로드 문제를 여럿 풀어본적 있었고, 이런 경험으로 통해 `파일 확장자`와 `MIME 타입을 통해 파일을 검증`하는건 `의미가 별로 없다`고 생각되었기 때문입니다.

## File Signature & Magic Byte
Magic Byte와 File Signature는 파일 업로드 시 허용된 형식만을 받기 위한 `Whitelist` 기반의 파일 검증에 중요한 역할을 합니다. 해당 방식은 파일 확장자만을 검증하는 것보다 보안성이 높아, 악의적인 파일 업로드를 방지하는 데 유용합니다.

### File Signature
File Signature는 파일 형식을 식별하기 위해 `파일의 헤더 부분에 저장된 고유한 값`입니다. 파일 형식은 `파일 확장자만으로는 신뢰할 수 없기 때문`에, 이 `File Signature`를 통해 실제 파일의 형식을 판별하는 것이 바람직합니다.

### Magic Byte
`Magic Byte` 는 파일의 가장 앞부분에 위치한 `특정 Byte Pattern` 의미하며, `파일 시그니처의 일부` 라고 할 수 있습니다. 예를 들어, PNG 파일은 `\x89\x50\x4e\x47\x0d\x0a\x1a\x0a`라는 Magic Byte를 가지고 있으며, 이를 통해 해당 파일이 PNG 형식임을 알 수 있습니다.

> 파일 유형별 File Signature 에 대한 정보는 [wiki](https://en.wikipedia.org/wiki/List_of_file_signatures) 에서 확인할 수 있습니다.

## Magic Byte 관련 구현
이제 Java 로 파일업로드에 허용하고 싶은 파일에 대한 `Magic Byte (Byte Pattern)` 을 명시해주고 코드를 작성해주면 됩니다.

```java
@RequiredArgsConstructor  
public enum SupportAttachmentType {  
  
    JPG_JPEG(  
            new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF},  
            new int[][]{}  
    ),  
    JPEG_JFIF(  
            new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, (byte) 0x00, (byte) 0x10, (byte) 0x4A, (byte) 0x46, (byte) 0x49, (byte) 0x46, (byte) 0x00, (byte) 0x01},  
            new int[][]{}  
    ),  
    JPEG_EXIF(  
            new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE1, (byte) 0x90, (byte) 0x90, (byte) 0x45, (byte) 0x78, (byte) 0x69, (byte) 0x66, (byte) 0x00, (byte) 0x00},  
            new int[][]{{4, 6}}  
    ),  
    PNG(  
            new byte[]{(byte) 0x89, (byte) 0x50, (byte) 0x4E, (byte) 0x47, (byte) 0x0D, (byte) 0x0A, (byte) 0x1A, (byte) 0x0A},  
            new int[][]{}  
    ),  
    SVG(  
            new byte[]{(byte) 0x3C, (byte) 0x3F, (byte) 0x78, (byte) 0x6D, (byte) 0x6C, (byte) 0x20, (byte) 0x76, (byte) 0x65, (byte) 0x72, (byte) 0x73, (byte) 0x69, (byte) 0x6F, (byte) 0x6E, (byte) 0x3D},  
            new int[][]{}  
    ),  
    WEBP(  
            new byte[]{(byte) 0x52, (byte) 0x49, (byte) 0x46, (byte) 0x46, (byte) 0x90, (byte) 0x90, (byte) 0x90, (byte) 0x90, (byte) 0x57, (byte) 0x45, (byte) 0x42, (byte) 0x50},  
            new int[][]{{4, 8}}  
    )  
    ;  
  
    private final byte[] magicByte;  
    private final int[][] partialOffsets;  
  
    public byte[] getMagicByte() {  
        return magicByte.clone();  
    }  
  
    public int[][] partialOffsets() {  
        return Arrays.stream(partialOffsets)  
                .map(int[]::clone)  
                .toArray(int[][]::new);  
    }  
  
    public static EnumSet<SupportAttachmentType> defaultEnumSet() {  
        return EnumSet.allOf(SupportAttachmentType.class);  
    }  
  
    public boolean matches(byte[] binary) {  
        byte[] magicByte = getMagicByte();  
        int[][] partialOffsets = partialOffsets();  
  
        if (partialOffsets.length == 0) {  
            return Arrays.equals(Arrays.copyOfRange(binary, 0, magicByte.length), magicByte);  
        }  
        for (int[] partialOffset : partialOffsets) {  
            int start = partialOffset[0];  
            int end = partialOffset[1];  
            for (int i = 0; i < magicByte.length; i++) {  
                if (i < start || i >= end) {  
                    if (binary.length <= i || binary[i] != magicByte[i]) {  
                        return false;  
                    }  
                }  
            }  
        }  
  
        return true;  
    }  
  
    public static String convertSupportedTypeString() {  
        return defaultEnumSet().stream()  
                .map(type -> type.toString().toLowerCase())  
                .collect(Collectors.joining(", "));  
    }  
}
```

### 고려한 부분
제가 개인적으로 고려한 부분들은 다음과 같습니다. 

**Enum 으로 구현**

- 허용 가능한 파일 타입들은 매번 새로운 인스턴스로 생성하지 않아도 됩니다. 그 이유는 각 `파일에 대한 Magic Byte 는 Immutable` 하기 때문입니다. 따라서 `Enum` 으로 정의해주는게 바랍직하다고 판단했습니다.

**Skip Index 설정**

- 필드변수에는 `partialOffsets` 이 있습니다. 해당 정보는 검증하지 않아도 되는 Index 들을 `from, to` 형태로 나타낸 것입니다. 예를 들어 JPEG(EXIF) 의 Magic Byte 인 `FF D8 FF E1 ?? ?? 45 78 69 66 00 00` 가 있다면 ?? 가 검증하지 않아도 되는 값을 말하며 `{4,6}` 로 설정해줄 수 있습니다. 하지만 아래 코드에서는 ?? 가 `\x90`  로 대입된것을 볼 수 있습니다. Byte Array 에서는 ?? 를 사용할 수 없기 때문에 `x86 Assembly` 에서 아무 작업도 하지 않고 다른 명령어로 넘어가는 `NOP(No Operation)` 명령어를 나타내는 `\x90` 을 명시해주었습니다.

**Immutable ByteArray**

- 필드변수인 magicByte, partialOffsets 값을 외부로부터 변경될 수 있도록 깊은복사를 사용하였습니다.

## 검증 Util 클래스 작성
이제 `SupportAttachmentType` 를 검증해줄 수 있는 Util 성 클래스를 작성해줍니다. 검증 클래스를 분리한 이유는 SRP 때문입니다.

- **SupportAttachmentType** : File 의 MagicByte 와 Offset 을 정의하고, File 이 해당 타입인지 검사하는 역할을 합니다. 
- **AttachmentMagicByteValidator** :  SupportAttachmentType 을 사용하여 실제로 File 의 Magic Byte 를 검증하는 유틸리티 클래스입니다.

```java
public abstract class AttachmentMagicByteValidator {  
  
    public static void validateMagicByte(byte[] binary) {  
        boolean isValid = SupportAttachmentType.defaultEnumSet().stream()  
                .anyMatch(support -> support.matches(binary));  
  
        if (!isValid) {  
            throw new IllegalStateException(SupportAttachmentType.convertSupportedTypeString());  
        }  
    }  
}
```

## Dummy 이미지 생성
본격적인 테스트에 앞서, 검사하고 싶은 파일 유형들을 Dummy 로 생성해주어야 합니다. 이는 아래 Bash  문으로 만들어줄 수 있습니다. 테스트를 위해 `허용하지 않는 타입인 GIF 도 Dummy 로 만들어준 것`을 확인할 수 있습니다.

> FileSystem 은 File Signature 혹은 Magic Number 를 기반으로 기반으로 파일 유형을 검사하기 때문에 가능합니다.

```bash
echo '\xFF\xD8\xFF' > test.jpg # jpg & jpeg
echo '\xFF\xD8\xFF\xE0\x00\x10\x4A\x46\x49\x46\x00\x01' > test_jpeg_jfif.jpeg # jpeg (jfif)
echo '\xff\xd8\xff\xe1\x00\x22\x45\x78\x69\x66\x00\x00' > test_jpeg_exif.jpeg # jpeg (exif)
echo '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a\x00\x00\x00\x0d\x49\x48\x44\x52' > test.png # png
echo '\x3C\x3F\x78\x6D\x6C\x20\x76\x65\x72\x73\x69\x6F\x6E\x3D' > test.svg # svg (xml)
echo '\x52\x49\x46\x46\x00\x00\x00\x00\x57\x45\x42\x50' > test.webp # webp
echo '\x47\x49\x46\x38\x37\x61' > test.gif # gif
```

![](Spring/images/Pasted%20image%2020241009034324.png)

## 테스트 작성
### 성공하는 테스트
테스트 코드는 아래와 같이 작성할 수 있습니다. `DefaultResourceLoader` 를 통해 classpath 에 존재하는 파일 Resource 들을 가져올 수 있습니다.

```java
@DisplayName("AttachmentMagicByteValidator 테스트")  
class AttachmentMagicByteValidatorTest {  
  
    private final DefaultResourceLoader defaultResourceLoader = new DefaultResourceLoader();  
  
    @Test  
    @DisplayName("jpeg 및 jpg 파일은 검증에 성공한다.")  
    void validateJpgOrJpegMagicByte() throws IOException {  
        // given  
        Resource resource = defaultResourceLoader.getResource("classpath:" + "images/test.jpg");  
        byte[] binaryData = FileCopyUtils.copyToByteArray(resource.getInputStream());  
  
        // when & then  
        AttachmentMagicByteValidator.validateMagicByte(binaryData);  
    }  
  
    @Test  
    @DisplayName("jpeg(JFIF) 파일은 검증에 성공한다.")  
    void validateJpeg_JfifMagicByte() throws IOException {  
        // given  
        Resource resource = defaultResourceLoader.getResource("classpath:" + "images/test_jpeg_jfif.jpeg");  
        byte[] binaryData = FileCopyUtils.copyToByteArray(resource.getInputStream());  
  
        // when & then  
        AttachmentMagicByteValidator.validateMagicByte(binaryData);  
    }  
  
    @Test  
    @DisplayName("jpeg(EXIF) 파일은 검증에 성공한다.")  
    void validateJpeg_EXIFMagicByte() throws IOException {  
        // given  
        Resource resource = defaultResourceLoader.getResource("classpath:" + "images/test_jpeg_exif.jpeg");  
        byte[] binaryData = FileCopyUtils.copyToByteArray(resource.getInputStream());  
  
        // when & then  
        AttachmentMagicByteValidator.validateMagicByte(binaryData);  
    }  
  
    @Test  
    @DisplayName("png 파일은 검증에 성공한다.")  
    void validatePngMagicByte() throws IOException {  
        // given  
        Resource resource = defaultResourceLoader.getResource("classpath:" + "images/test.png");  
        byte[] binaryData = FileCopyUtils.copyToByteArray(resource.getInputStream());  
  
        // when & then  
        AttachmentMagicByteValidator.validateMagicByte(binaryData);  
    }  
  
    @Test  
    @DisplayName("webp 파일은 검증에 성공한다.")  
    void validateWebpMagicByte() throws IOException {  
        // given  
        Resource resource = defaultResourceLoader.getResource("classpath:" + "images/test.webp");  
        byte[] binaryData = FileCopyUtils.copyToByteArray(resource.getInputStream());  
  
        // when & then  
        AttachmentMagicByteValidator.validateMagicByte(binaryData);  
    }  
  
    @Test  
    @DisplayName("svg 파일은 검증에 성공한다.")  
    void validateSvgMagicByte() throws IOException {  
        // given  
        Resource resource = defaultResourceLoader.getResource("classpath:" + "images/test.svg");  
        byte[] binaryData = FileCopyUtils.copyToByteArray(resource.getInputStream());  
  
        // when & then  
        AttachmentMagicByteValidator.validateMagicByte(binaryData);  
    }
}
```

### 실패하는 테스트
허용하지 않는 타입은 GIF 에 대해 테스트를 해보면 검증에 실패하는것을 확인할 수 있습니다.

```java
@DisplayName("AttachmentMagicByteValidator 테스트")  
class AttachmentMagicByteValidatorTest {  
  
    private final DefaultResourceLoader defaultResourceLoader = new DefaultResourceLoader();  
    
    @Test  
    @DisplayName("gif 파일은 검증에 실패한다.")  
    void validateGifMagicByte() throws IOException {  
        // given  
        Resource resource = defaultResourceLoader.getResource("classpath:" + "images/test.gif");  
        byte[] binaryData = FileCopyUtils.copyToByteArray(resource.getInputStream());  
  
        // when & then  
        assertThatThrownBy(() -> AttachmentMagicByteValidator.validateMagicByte(binaryData))  
                .hasMessage("jpg_jpeg, jpeg_jfif, jpeg_exif, png, svg, webp");  
    }  
}
```

### 테스트 결과
모든 테스트가 정상적으로 통과하는 것을 확인할 수 있습니다.

![](Spring/images/Pasted%20image%2020241009034530.png)

## 마치며
직접 MagicByte 를 검증하는 로직을 작성해보니 매우 어려웠습니다. 특히나 검증하지 않아도되는 부분들을 직접 구현해야한다는게 좀 어려웠습니다. 이래서 라이브러리를 쓰는건가..? 라는 생각이 들었습니다. 그래도 공격자입장에서만 생각하다가 방어하는 입장에서 생각해보고 이를 구현해보니 매우 좋았던 경험이었습니다.
