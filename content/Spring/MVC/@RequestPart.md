---
title: RequestPart 를 이용한 JSON 과 첨부파일 동시처리
---

```java
@PostMapping( value = "/crew/new", consumes = {MULTIPART_FORM_DATA_VALUE, APPLICATION_JSON_VALUE})  
public ResponseEntity<Void> createNewCrew(  
        @Valid @RequestPart CrewCreateRequest crewCreateRequest,  
        @RequestPart MultipartFile file,  
        @Authenticate AuthenticatedMember authenticatedMember  
) throws IOException {  
    crewService.createNewCrew(crewCreateRequest.toDto(), authenticatedMember.toDto().getId(), file.getBytes());  
	  
    return ResponseEntity.status(CREATED).build();  
}
```

```http {14, 19}
POST /api/v1/crew/new HTTP/1.1

Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJpZGVudGlmaWVyIjoxLCJzdWIiOiJhY2Nlc3NfdG9rZW4iLCJpc3MiOiJPTlNRVUFEIiwiaWF0IjoxNzE5MTQ0NzEyLCJleHAiOjE3MTkxNDQ3MjJ9.Km2PD4Z074Ve1nC7S8bfIOOkDG12AZ7e3dSvCEQe8kYHryQlUhszyD4I4PtI_IcgJon6l-eLr2_0UzoH50heiQ
User-Agent: PostmanRuntime/7.39.0
Accept: */*
Host: localhost:8083
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Content-Type: multipart/form-data; boundary=--------------------------670482681274220236635126
Content-Length: 120287

----------------------------670482681274220236635126
Content-Disposition: form-data; name="crewCreateRequest"
Content-Type: application/json

{"name": "크루 1","introduce": "크루 소개","detail": "크루 디테일","hashTags":["해시태그 1","해시태그 2"],"kakaoLink": "카카오링크"}
----------------------------670482681274220236635126
Content-Disposition: form-data; name="file"; filename="cat.jpg"
Content-Type: multipart/form-data

<cat.jpg>
----------------------------670482681274220236635126--
```
