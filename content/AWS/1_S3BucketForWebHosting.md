---
title: S3를 이용한 정적 리소스 호스팅
tags: ['aws', 's3']
---

## 들어가며
이번 포스팅에서는 S3 로 정적 리소스들을 호스팅하는 방법을 다뤄보고자 합니다. 특히 그 과정 속에서 발생하는 `AccessDenied` & `Forbidden` 이 발생하는 이유도 알아보고자 합니다.

> 필자는 VueJS 로 만들어 빌드된 정적 리소스들을 AWS 의 S3 버킷으로 호스팅합니다.


## 버킷 생성
AWS 콘솔에서 S3 서비스에 들어온 후, `버킷 만들기` 를 선택합니다. Bucket 은 데이터를 저장할 수 있는 저장소를 의미합니다.

![img_2.png](AWS/images/hosting_img_2.png)


버킷 이름과 Region 을 기입 및 선택합니다.

> Bucket 이름은 세계적으로 유일해야 합니다. 또한, Region 은 자신과 가까울수록 더 빠르기 때문에, 본인과 더 가까운 위치를 선택해줍니다.

![img_4.png](AWS/images/hosting_img_4.png)


버킷의 퍼블릿 액세스 차단 설정에는 `모든 퍼블릭 액세스 차단` 을 해제해주신 후, `현재 설정으로 인해 이 버킷과 그 안에 포함된 객체가 퍼블릭 상태가 될 수 있을 알고 있습니다.` 라는 체크박스를 체크합니다.

AWS 에서는 해당설정에 해단 디폴트 값을 `모든 퍼블릿 액세스 차단` 으로 설정해두고 있습니다. 이는 `S3` 는 기본적으로 `정적 Resource` 들을 저장하고 `특정 IP` 만 그 리소스에 접근할 수 있도록 제한하는 것이 더 안전하기 때문입니다. 하지만 우리는 정적 웹 호스팅을 할 것이고, `다른 모든 사용자들에게 노출되는 것이 목적` 이기 때문에 `모든 퍼블릭 액세스 차단` 이라는 옵션을 `해제` 하는 것입니다.

> 모든 Public IP 가 Bucket 안의 모든 객체(파일) 에 접근할 수 있는 가능성을 얻게 된 것이지, 객체에 접근할 수 있는 상태가 됬다는 것이 아닙니다. (완벽한 Public Access 상태가 아님). 이는 후에 S3 정책 설정에서 GetObject 라는 Action 으로 Pubilc Access 상태로 만들어줄 수 있습니다.

![img_5.png](AWS/images/hosting_img_5.png)


## 직접 Build 파일 업로드
이제 생성된 Bucket 을 선택하면 `객체(파일)` 를 업로드시킬 수 있는 창이 나옵니다. 해당 창에서 `React` 나 `Vue` 의 `build` 된 파일들을 직접 업로드합니다.

![img_7.png](AWS/images/hosting_img_7.png)


업로드는 `Drag & Drop` 이 가능하며, 업로드가 완료되면 업로드된 `객체` 들을 확인할 수 있습니다.

![img_8.png](AWS/images/hosting_img_8.png)


## 정적 웹 사이트 호스팅 활성화
업로드된 객체 중 하나를 선택해보면, 해당 객체(파일)를 확인할 수 있는 URL 이 나오게 됩니다.

![img_9.png](AWS/images/hosting_img_9.png)


하지만, 이 URL 을 클릭하게되면 `Access Denied` 가 발생하게 됩니다. 이는 `정적 웹 사이트 호스팅 활성화` 설정을 해주지 않았기 때문입니다.

![img_10.png](AWS/images/hosting_img_10.png)


이를 해결하기 위해서는 생성한 `Bucket` 의 `속성` 탭을 선택합니다.

![img_11.png](AWS/images/hosting_img_11.png)


제일 아래를 보면 `정적 웹 사이트 호스팅` 을 설정할 수 있는 설정 탭이 나오게 되는데, `편집` 을 누릅니다.

![img_12.png](AWS/images/hosting_img_12.png)


여기서 `정적 웹 사이트 호스팅` 을 `활성화` 시킵니다. 그리고 `호스팅 유형` 을 `정적 웹 사이트 호스팅` 을 선택해주어 `Bucket 주소를 웹 주소로 사용하도록 변경`합니다.

곧바로 `인덱스 문서` 설정과 `오류 문서` 를 `index.html` 로 설정합니다. 두 설정은 아래의 역할을 하게 됩니다.
- **인덱스 문서** : `Bucket` 주소 자체를 웹주소로 사용할것이기 때문에 `웹 루트 에 접근했을 때 내려줄 페이지를 설정하는 옵션` 입니다.
- **오류문서** : `오류가 발생했을 때 내려줄 페이지를 설정하는 옵션` 입니다. 해당 설정은 Optional 이지만, SPA 를 호스팅하려면 필수적으로 명시해야 합니다. SPA 일때 해당 설정을 해주지 않으면 존재하지 않는 페이지를 요청했을 때, 404 Status Code 가 발생하게 됩니다.
- **리다이렉션 규칙** :  `Error Status Code` 에 맞는 리다이렉션 경로를 지정하는 옵션입니다. 해당 설정은 `Optional` 하기 때문에 명시하지 않아도 상관없습니다.

![img_13.png](AWS/images/hosting_img_13.png)


설정 완료 후, `속성` 탭으로 다시 이동해보면 업로드시켰던 `객체` 들에 접근할 수 있는 `웹 주소(Bucket 주소)` 가 나오게 됩니다. 

![img_14.png](AWS/images/hosting_img_14.png)


근데 이번에는 `Forbidden` 이 발생하게 됩니다. 이 이유는 접근하려는 `객체(파일) 이 완전한 Public 상태가 아니기 때문`입니다.

![img_15.png](AWS/images/hosting_img_15.png)


분명 `Bucket` 을 처음 생성할 당시 `모든 퍼블릭 액세스 차단(현재 버킷 > 권한)` 이라는 옵션을 `해제` 했는데, 왜 403 이 발생한 걸까요? 이는 S3 정책 설정을 해주지 않았기 때문입니다. 

`모든 퍼블릭 액세스 차단을 해제` 한 것은 모든 `Public Ip` 가 Bucket 안의 `객체(파일)` 에 접근할 수 있는 `가능성을 얻게 된 것` 이지, 객체에 접근할 수 있는 상태가 아니라는 의미입니다. (완벽한 Public Access 상태가 아님) 

> 후에 S3 정책 설정을 통해 완벽한 Public Access 상태로 만들어 줄 것입니다. 하지만 정책 설정을 해도 **모든 퍼블릭 액세스 차단** 해제하지 않으면, 똑같이 오류가 발생하게 됩니다.

![img_16.png](AWS/images/hosting_img_16.png)


## S3 정책 설정
Forbidden 문제는 `해당 버킷 > 권한` 탭에서 `정책 설정`을 통해 S3에 존재하는 모든 객체를 Public Access 상태로 변경하여 해결할 수 있습니다.

![img_17.png](AWS/images/hosting_img_17.png)


편집을 눌러 아래 `JSON` 을 기입합니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TestObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::revi1337/*"
    }
  ]
}
```

각 `key` 들은 다음과 같은 의미를 갖습니다.

> Statement 배열의 각 JSON 객체는 위에서 아래로 순차적으로 평가됩니다. 단, 정책 간 우선순위는 Deny > Allow 순이므로, 아래에 Allow 가 있어도 위의 Deny 에 해당된다면 접근은 거부됩니다.

- `Version` : 버킷 정책을 설정할 때 사용하는 `Syntax` 버전을 명시합니다. (2012-10-17 이 최신버전)
- `Statement` : 정책들의 집합을 의미하며, 배열안에 들어오는 각각의 `JSON` 이 하나의 정책을 의미합니다.
- `Statement.Sid` : 하나의 정책을 나타내는 id 를 의미하며 `정책을 구분하는 id` 로 사용됩니다. (아무값 가능)
- `Statement.Effect` : 해당 정책을 허용할지 거부할지 결정합니다. (`Allow`, `Deny`)
- `Statement.Principal` : 정책을 적용할 사용자 주체를 의미합니다. (ARN 형태로 나타내며 `*` 는 모두를 의미)
- `Statement.Action` : 수행할 작업을 의미합니다. Action 들의 이름은 사전에 정해져있으며, 원하는 Action 을 명시하면 구조입니다.
- `Statement.Resource` : 어떤 객체(파일)을 대상으로 지정할지를 의미합니다. (ARN 형태로 나타냄)


즉, 위 정책 설정은 `"모두에게 arn:aws:s3:::revi1337 버킷의 모든 객체(파일)를 읽을(s3:GetObject) 수 있게 허용하겠다"` 는 의미를 갖습니다. 

> 모든 **사용자 주체(Principal: \*)** 와 **s3:GetObject(Action)** 로 모든 객체들을 Public Access 상태로 변경한 것이 핵심입니다.

## 확인
이제 업로드된 객체(파일) 중 아무거나 접근하게되면, 어떠한 에러가 뜨지않고 호스팅된 정적 리소스를 확인할 수 있습니다.

![img_19.png](AWS/images/hosting_img_19.png)


## 정리
- 모든 퍼블릭 액세스 차단(Block Public Access) 설정을 꼭 해제해야 합니다. (안하면 Access Denied)
- S3 정책 설정을 통해 Public Access 상태로 변경해주어야 합니다. (안하면 Forbidden)
	- 모든 퍼블릭 액세스 차단을 하지 않으면 정책 설정을 안하면 Access Denied 발생.
	- 모든 퍼블릭 액세스 차단이 해제되어있는지 확인하고, 정책 설정을 따른다는 의미
- SPA 를 호스팅할 때는 `인덱스 페이지 & 오류 페이지` 설정을 꼭 해주어야 합니다.

## 마치며
지금까지 Frontend 프레임워크 중 하나인 Vue 빌드파일을 S3 를 이용해 호스팅해보았습니다. 감사합니다.

