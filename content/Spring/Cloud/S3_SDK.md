---
title: Java AWS SDK 를 이용한 S3 파일업로드
---

## S3 SDK 의존성추가

![](Spring/Cloud/images/Pasted%20image%2020240622181830.png)


```groovy
implementation platform('software.amazon.awssdk:bom:2.17.230')  
implementation 'software.amazon.awssdk:s3'
```

## S3 환경변수 작성

```java
@ConfigurationProperties("onsquad.aws")  
public record S3BucketProperties(  
        @NestedConfigurationProperty S3 s3  
) {  
    @ConfigurationProperties("s3")  
    public record S3(  
            String bucket,  
            String region,  
            String accessKey,  
            String secretKey,  
            @NestedConfigurationProperty DirectoryProperties directory  
    ) {}  
  
    @ConfigurationProperties("directory")  
    public record DirectoryProperties(  
            String root,  
            @NestedConfigurationProperty Directories directories  
    ) {  
    }  
    
    @ConfigurationProperties("directories")  
    public record Directories(  
            String crewDirectory,  
            String squadDirectory  
    ) {  
    }
}
```

## S3 YML 작성

```yml
onsquad:  
  aws:  
    s3:  
      access-key: <액세스 키>  
      secret-key: <시크릿 키>
      bucket: <버킷 이름>  
      region: <리전>
      directory:  
        root: <루트 디렉터리 without slash> # ex. root not /root
        directories:  
          crew-directory: <경로 1>        # ex. sub1/sub2 not /sub1/sub2
          squad-directory: <경로 2>       # ex. sub1/sub2 not /sub1/sub2
```

## S3 설정파일 작성

```java
@RequiredArgsConstructor  
@Configuration  
public class S3ClientConfig {  
  
    private final S3BucketProperties s3BucketProperties;  
  
    @Bean  
    public S3Client amazonS3(){  
        AwsBasicCredentials credentials = AwsBasicCredentials.create(  
                s3BucketProperties.s3().accessKey(), s3BucketProperties.s3().secretKey()  
        );  
  
        return S3Client.builder()  
                .region(Region.of(s3BucketProperties.s3().region()))  
                .credentialsProvider(StaticCredentialsProvider.create(credentials))  
                .build();  
    }  
}
```

## S3 Manager 코드 작성

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
  
    private String generateFileNameUsingOriginal(String originalFileName) {  
        String extension = originalFileName.substring(originalFileName.lastIndexOf(FILE_EXTENSION_DELIMITER) + 1);  
        return UUID.randomUUID() + FILE_EXTENSION_DELIMITER + extension;  
    }  
  
    private String buildPath(String delimeter, String... paths) {  
        return String.join(delimeter, new ArrayList<>() {  
            {  
                addAll(Arrays.asList(paths));  
            }  
        });  
    }  
}
```





```json
{
	"Version": "2012-10-17",
	"Id": "Policy1464968545158",
	"Statement": [
		{
			"Sid": "PublicReadGetObject",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::onsquad-s3/*"
		},
		{
			"Sid": "DenyOtherAccess",
			"Effect": "Deny",
			"Principal": "*",
			"Action": "s3:PutObject",
			"NotResource": [
				"arn:aws:s3:::onsquad-s3/*.jpg",
				"arn:aws:s3:::onsquad-s3/*.png",
				"arn:aws:s3:::onsquad-s3/*.jpeg",
				"arn:aws:s3:::onsquad-s3/*.svg"
			]
		}
	]
}
```

```json
{
    "Version": "2012-10-17",
    "Id": "Policy1464968545158",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow", // 허용
            "Principal": "*",
            "Action": "s3:GetObject", // 객체 읽기 권한
            "Resource": "arn:aws:s3:::<버킷명>/*"
        },
        {
            "Sid": "DenyOtherAccess",
            "Effect": "Deny", // 차단
            "Principal": "*",
            "Action": "s3:PutObject", // 객체 업로드 권한
            "NotResource": [
                "arn:aws:s3:::<버킷명>/*.jpg",
                "arn:aws:s3:::<버킷명>/*.png",
                "arn:aws:s3:::<버킷명>/*.jpeg",
                "arn:aws:s3:::<버킷명>/*.gif"
            ] // 해당 확장자를 가지지 않은 객체
        }
    ]
}
```


https://docs.aws.amazon.com/ko_kr/sdk-for-java/latest/developer-guide/java_s3_code_examples.html

https://one-armed-boy.tistory.com/entry/Swagger-RequestPart%EB%A5%BC-%ED%86%B5%ED%95%B4-%ED%8C%8C%EC%9D%BC-Dto-%EB%8F%99%EC%8B%9C-%EC%9A%94%EC%B2%AD-%EC%8B%9C-%EB%B0%9C%EC%83%9D-%EC%97%90%EB%9F%AC

