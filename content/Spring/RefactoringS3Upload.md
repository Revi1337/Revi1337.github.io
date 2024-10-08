---
title: S3 파일 업로드의 객체지향적 리팩토링
tags: ['spring', 'refactor', 'oop']
---

## 들어가며
현재 진행 중인 프로젝트에서는 `도메인별로 이미지를 분류해 각각 다른 S3 폴더에 저장하는 구조`를 사용하고 있습니다. 당시 빠르게 개발을 진행해야 했던 탓에, S3 업로드를 담당하는 하나의 클래스에 과도한 책임이 집중된 상태였고, 이를 개선해야 한다는 TODO 주석을 남겨두었던 기억이 있습니다. 이후, 객체지향 설계를 적용해 책임을 분산시키고 클래스를 역할별로 분리하는 방식으로 리팩토링을 진행했던 경험을 공유하고자 합니다.

## 기존 코드의 문제
리팩토링을 진행하기 전 코드는 아래와 같습니다. 로직에서는 전혀 문제가 없지만 아래와 같은 단점이 있습니다.

1. **OCP(Open-Closed Principle) 위반**
Crew 와 Squad 에 대한 업로드 디렉토리를 각각 하드코딩하고 있어, 새로운 도메인(예: 팀, 이벤트 등)이 추가되면 해당 클래스에 직접 수정을 해야 했습니다. 즉, 확장에는 열려있지 않고 수정에 열려있는 구조였기 때문에, OCP를 위반하고 있었습니다. 이는 향후 도메인이 추가될 때마다 클래스의 변경을 유발하여 코드의 안정성을 떨어뜨릴 수 있습니다.

2. **코드 중복**
`uploadCrew`와 `uploadSquad` 메서드에서 업로드 경로만 다르고 나머지 로직이 동일했기 때문에, 코드 중복이 발생했습니다.

3. **확장성 부족**
도메인별로 확장할 여지가 있을 때 이를 객체지향적으로 처리하지 않고 직접적으로 하드코딩한 방식은 새로운 요구 사항이나 도메인 추가 시 확장성 부족 문제를 야기할 수 있습니다. 예를 들어, 새로운 업로드 대상(팀, 이벤트 등)이 생기면 해당 클래스를 수정해야 하는데, 이는 높은 결합도를 초래할 수 있습니다.

```java
@Slf4j  
@RequiredArgsConstructor  
@Service  
public class S3BucketUploader {  
  
    private static final String PATH_DELIMITER = "/";  
    private static final String FILE_EXTENSION_DELIMITER = ".";  
    private static final String S3_LINK_FORMAT = "https://%s.s3.%s.amazonaws.com/%s"; // https://{bucketName}.s3.{region}.amazonaws.com/{path}  
  
    private final S3BucketProperties s3BucketProperties;  
    private final S3Client s3Client;  
  
    public String uploadCrew(byte[] content, String originalFileName) { // TODO 확장할 여지가 있을 때 객체지향적으로 해결하여 OCP 를 지켜야 한다.
        Directories directories = s3BucketProperties.s3().directory().directories();  
        return uploadImage(directories.crewDirectory(), content, originalFileName);  
    }  
  
    public String uploadSquad(byte[] content, String originalFileName) { // TODO 확장할 여지가 있을 때 객체지향적으로 해결하여 OCP 를 지켜야 한다.  
        Directories directories = s3BucketProperties.s3().directory().directories();  
        return uploadImage(directories.squadDirectory(), content, originalFileName);  
    }  
  
    public String uploadImage(String directoryPath, byte[] content, String originalFileName) {  
        AttachmentMagicByteValidator.validateMagicByte(content);  
        try (InputStream inputStream = new ByteArrayInputStream(content)) {  
            RequestBody requestBody = RequestBody.fromInputStream(inputStream, content.length);  
            MediaType mediaType = MediaType.parseMediaType(Files.probeContentType(Paths.get(originalFileName)));  
            return uploadFile(directoryPath, originalFileName, requestBody, mediaType);  
        } catch (IOException e) {  
            log.error("{} s3 업로드 실패", directoryPath, e);  
            throw new IllegalArgumentException("byte array s3업로드 예외", e); // TODO 커스텀 익셉션 필요  
        }  
    }  
  
    private String uploadFile(String directoryPath, String originalFileName, RequestBody requestBody, MediaType mediaType) {  
        S3 s3 = s3BucketProperties.s3();  
        String rootDirectory = s3.directory().root();  
        String randomFileName = generateFileNameUsingOriginal(originalFileName);  
        String fileNameWithFullPath = buildPath(PATH_DELIMITER, rootDirectory, directoryPath, randomFileName);  
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()  
                .key(fileNameWithFullPath)  
                .contentType(mediaType.toString())  
                .bucket(s3.bucket())  
                .build();  
  
        s3Client.putObject(putObjectRequest, requestBody);  
  
        String uploadRemoteAddress = String.format(S3_LINK_FORMAT, s3.bucket(), s3.region(), fileNameWithFullPath);  
        log.info("file uploaded : {}", uploadRemoteAddress);  
        return uploadRemoteAddress;  
    }  
  
    public void updateImage(String remoteAddress, byte[] imageData, String imageName) {  
        AttachmentMagicByteValidator.validateMagicByte(imageData);  
        try (InputStream inputStream = new ByteArrayInputStream(imageData)) {  
            S3 s3 = s3BucketProperties.s3();  
            RequestBody requestBody = RequestBody.fromInputStream(inputStream, imageData.length);  
            MediaType mediaType = MediaType.parseMediaType(Files.probeContentType(Paths.get(imageName)));  
            String uri = parseUriFromUrl(remoteAddress);  
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()  
                    .key(uri)  
                    .contentType(mediaType.toString())  
                    .bucket(s3.bucket())  
                    .build();  
  
            s3Client.putObject(putObjectRequest, requestBody);  
        } catch (IOException e) {  
            throw new IllegalArgumentException("byte array s3업로드 예외", e); // TODO 커스텀 익셉션 필요  
        }  
    }  
  
    private String generateFileNameUsingOriginal(String originalFileName) {  
        int delimeterIndex = originalFileName.lastIndexOf(FILE_EXTENSION_DELIMITER) + 1;  
        String extension = originalFileName.substring(delimeterIndex);  
        return UUID.randomUUID() + FILE_EXTENSION_DELIMITER + extension;  
    }  
  
    private String buildPath(String delimeter, String... paths) {  
        return String.join(delimeter, new ArrayList<>() {  
            {  
                addAll(Arrays.asList(paths));  
            }  
        });  
    }  
  
    private String parseUriFromUrl(String remoteAddress) {  
        try {  
            URL url = new URL(remoteAddress);  
            String path = url.getPath();  
            if (path != null && path.length() > 1) {  
                return path.substring(1);  
            }  
            return path;  
        } catch (MalformedURLException e) {  
            throw new IllegalArgumentException("Invalid URL", e);  
        }  
    }  
}
```

## 개선 코드
### 공통 로직 분리
개선 전 코드를 보면 Crew 와 Squad 와 같은 도메인에 따른 업로드 폴더를 제외한, 파일을 업로드하는 로직은 동일한 것을 볼 수 있습니다. 따라서 파일에 대한 업로드, 수정, 삭제 로직을 Interface 로 분리시켜줄 수 있습니다. 파일에 대한 로직을 Interface 로 분리해준 것 만으로도, 파일을 업로드하는 플랫폼(S3 등) 을 쉽게 변경할 수 있습니다.

```java
public interface FileUploadManager {  
  
    String PATH_DELIMITER = "/";  
    String FILE_EXTENSION_DELIMITER = ".";  
  
    String uploadFile(byte[] imageData, String imageName);  
  
    String updateFile(String uploadUrl, byte[] imageData, String imageName);  
  
    void deleteFile(String uploadUrl);  
  
}
```


이제 앞서 만든 `FileUploadManager` 인터페이스를 구현하는 S3 전용 구현체를 만들어줍니다. 개선 전의 코드를 보면 제일 문제가 되는 것은 `Crew 와 Squad 대한 업로드 디렉토리를 하드코딩` 한 것입니다. 따라서 `업로드 폴더를 지정하는 부분을 추상 메서드로 분리` 시켜줍니다.

```java
@RequiredArgsConstructor  
public abstract class DefaultS3FileManager implements FileUploadManager, InitializingBean {  
  
    private static final String S3_LINK_FORMAT = "https://%s.s3.%s.amazonaws.com/%s"; // https://{bucketName}.s3.{region}.amazonaws.com/{path}  
  
    private final S3Client s3Client;  
    private final S3BucketProperties s3BucketProperties;  
  
    private String baseBucket;  
    private String rootDirectory;  
    private String region;  
  
    @Override  
    public void afterPropertiesSet() {  
        this.baseBucket = s3BucketProperties.s3().bucket();  
        this.rootDirectory = s3BucketProperties.s3().directory().root();  
        this.region = s3BucketProperties.s3().region();  
    }  
  
    @Override  
    public String uploadFile(byte[] imageData, String imageName) {  
        String uriPath = buildUriPath(imageName);  
        return uploadFile(imageData, imageName, uriPath);  
    }  
  
    @Override  
    public String updateFile(String uploadUrl, byte[] imageData, String imageName) {  
        String uriPath = parseUriFromUrl(uploadUrl);  
        return uploadFile(imageData, imageName, uriPath);  
    }  
  
    @Override  
    public void deleteFile(String uploadUrl) {  
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()  
                .bucket(baseBucket)  
                .key(parseUriFromUrl(uploadUrl))  
                .build();  
  
        s3Client.deleteObject(deleteObjectRequest);  
    }  
  
    private String uploadFile(byte[] imageData, String imageName, String uriPath) {  
        AttachmentMagicByteValidator.validateMagicByte(imageData);  
        try (InputStream inputStream = new ByteArrayInputStream(imageData)) {  
            RequestBody requestBody = RequestBody.fromInputStream(inputStream, imageData.length);  
            MediaType mediaType = MediaType.parseMediaType(Files.probeContentType(Paths.get(imageName)));  
            PutObjectRequest uploadRequest = buildUploadRequest(uriPath, mediaType);  
            s3Client.putObject(uploadRequest, requestBody);  
            return String.format(S3_LINK_FORMAT, baseBucket, region, uriPath);  
        } catch (Exception e) {  
            throw new IllegalArgumentException("byte array s3 업로드 예외", e);  
        }  
    }  
  
    private String buildUriPath(String imageName) {  
        String uploadDir = getUploadDir();  
        String uuidImageName = generateUuidFileName(imageName);  
        return String.join(PATH_DELIMITER, rootDirectory, uploadDir, uuidImageName);  
    }  
  
    abstract public String getUploadDir();  
  
    private PutObjectRequest buildUploadRequest(String uriPath, MediaType mediaType) {  
        return PutObjectRequest.builder()  
                .bucket(baseBucket)  
                .key(uriPath)  
                .contentType(mediaType.toString())  
                .build();  
    }  
  
    private String generateUuidFileName(String fileName) {  
        int delimeterIndex = fileName.lastIndexOf(FILE_EXTENSION_DELIMITER) + 1;  
        String extension = fileName.substring(delimeterIndex);  
        return UUID.randomUUID() + FILE_EXTENSION_DELIMITER + extension;  
    }  
  
    private String parseUriFromUrl(String remoteAddress) {  
        try {  
            URL url = new URL(remoteAddress);  
            String path = url.getPath();  
            if (path != null && path.length() > 1) {  
                return path.substring(1);  
            }  
  
            return path;  
        } catch (MalformedURLException e) {  
            throw new IllegalArgumentException("Invalid URL", e);  
        }  
    }  
}
```

### 변하는 부분을 추상화
이제 `도메인별로 S3 기본 구현체를 상속` 하여  도메인별로 파일을 지정할 수 있는 메서드를 Override 하고 이를 구현합니다. 아래 코드는 Crew 도메인에 대한 업로드 경로를 지정해준 것입니다.

```java
@Component  
public class CrewS3FileManager extends DefaultS3FileManager {  
  
    private final S3BucketProperties s3BucketProperties;  
  
    public CrewS3FileManager(S3Client s3Client, S3BucketProperties s3BucketProperties) {  
        super(s3Client, s3BucketProperties);  
        this.s3BucketProperties = s3BucketProperties;  
    }  
  
    @Override  
    public String getUploadDir() {  
        return s3BucketProperties.s3().directory().directories().crewDirectory();  
    }  
}
```


갑작스럽게 요구사항이 변경되어 Squad 대신 Member 도메인으로 대체되었지만, 이는 상관없습니다. 아래 코드는 Member 도메인에 대한 업로드 경로를 지정해준 것입니다.

```java
@Component  
public class MemberS3FileManager extends DefaultS3FileManager {  
  
    private final S3BucketProperties s3BucketProperties;  
  
    public MemberS3FileManager(S3Client s3Client, S3BucketProperties s3BucketProperties) {  
        super(s3Client, s3BucketProperties);  
        this.s3BucketProperties = s3BucketProperties;  
    }  
  
    @Override  
    public String getUploadDir() {  
        return s3BucketProperties.s3().directory().directories().memberDirectory();  
    }  
}
```

## Diagram
`개선 후` 와 `개선 전` 코드의 다이어그램은 아래와 같습니다. 

- 개선 전 : `S3BucketUploader` 라는 하나의 클래스에서 모든 도메인에 대한 파일 업로드 처리를 하고있는 것을 볼 수 있습니다. 
- 개선 후 : 파일 업로드를 수행하는 공통 로직을 `DefauS3FileManager` 로 분리시키고, 도메인별로 파일 업로드 경로를 지정하는 로직을 추상화시켜 OCP 를 지킨것을 확인할 수 있습니다.

![](Spring/images/Pasted%20image%2020240923001856.png)

## 마치며
사실 이게 좋은 코드인지는 잘 모르겠습니다. 리팩토링을 했음에도 불구하고 `URL 을 파싱하는 부분이 DefaultS3Manager` 에서 처리하고 있다는게 아직까지는 좀 찝찝합니다. 마음같아서 해당부분도 지금당장 처리하고 싶지만, 프로젝트 갈길이 멀기 때문에 이쯤에서 마치도록 하겠습니다.
