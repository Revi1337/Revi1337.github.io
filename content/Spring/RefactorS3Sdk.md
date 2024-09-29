---
title: 중복되는 코드를 객체지향적으로 해결하기
---

```java
public interface FileUploadManager {  
  
    String PATH_DELIMITER = "/";  
    String FILE_EXTENSION_DELIMITER = ".";  
  
    String uploadFile(byte[] imageData, String imageName);  
  
    String updateFile(String uploadUrl, byte[] imageData, String imageName);  
  
    void deleteFile(String uploadUrl);  
  
}
```


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
  
    private String generateUuidFileName(String originalFileName) {  
        int delimeterIndex = originalFileName.lastIndexOf(FILE_EXTENSION_DELIMITER) + 1;  
        String extension = originalFileName.substring(delimeterIndex);  
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


![](Spring/images/Pasted%20image%2020240923001856.png)
