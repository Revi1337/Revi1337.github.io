---
title: Backend S3 생성 및 설정
tags: ['aws', 's3']
---
## 들어가며
이번 포스팅에서는 Backend Application 을 위한 S3 생성 및 설정하는 법을 다뤄보고자 합니다.

- 모든 사용자에게는 업로드 된 파일을 확인(GetObject)할 수 있게 합니다.
- 그리고 특정 IAM 사용자에게는 파일 확장자 기반 화이트리스트를 만들어, 업로드하려는 파일을 제한시킵니다.


## 버킷 생성
AWS 콘솔에서 S3 서비스에 들어온 후, `버킷 만들기` 를 선택합니다. 이 때, 본인의 Region 을 `ap-northeast-2` 인지 확인합니다.

> Bucket 은 데이터를 저장할 수 있는 저장소를 의미합니다. Region 은 자신과 가까울수록 더 빠르기 때문에, 본인과 더 가까운 위치를 선택해줍니다. 

![](AWS/images/Pasted%20image%2020250329012613.png)


`Bucket` 이름은 마음에 드는 이름을 기입합니다. Bucket 이름은 전세계적으로 유일해야 합니다.

![](AWS/images/Pasted%20image%2020250329012757.png)


객체 소유권 섹션에서는 `ACL 비활성화됨` 을 선택합니다.

![](AWS/images/Pasted%20image%2020250329012807.png)


버킷의 퍼블릿 액세스 차단 설정에는 `모든 퍼블릭 액세스 차단` 을 해제해주신 후, `현재 설정으로 인해 이 버킷과 그 안에 포함된 객체가 퍼블릭 상태가 될 수 있을 알고 있습니다.` 라는 체크박스를 체크합니다. 만약 모든 퍼블릭 액세스 차단을 해제하지 않으면, AccessDenied 가 발생하게 됩니다.

AWS 에서는 해당설정에 해단 디폴트 값을 `모든 퍼블릿 액세스 차단` 으로 설정해두고 있습니다. 이는 `S3` 는 기본적으로 `정적 Resource` 들을 저장하고 `특정 IP` 만 그 리소스에 접근할 수 있도록 제한하는 것이 더 안전하기 때문입니다.

> 모든 Public IP 가 Bucket 안의 모든 객체(파일) 에 접근할 수 있는 가능성을 얻게 된 것이지, 객체에 접근할 수 있는 상태가 됬다는 것이 아닙니다. (완벽한 Public Access 상태가 아님). 이는 후에 S3정책 설정에서 s3:GetObject로 Public Access 상태로 만들어줄 수 있습니다.

![](AWS/images/Pasted%20image%2020250329012830.png)


이후 다른 옵션들은 건드리지 마시고, `버킷 생성 혹은 버킷 만들기` 를 눌러 S3 를 만들어주시면 됩니다.

![](AWS/images/Pasted%20image%2020250329013154.png)


## 사용자 생성 및 AccessKey 발급
백엔드 애플리케이션에서는 `AccessKey & Secret Key` 를 이용하여 S3 와 통신합니다. 그래서 S3 에 접근할 수 있도록 AWS 의 사용자를 만들고 `AccessKey & Secret Key` 를 발급받아야 합니다.

AWS 콘솔에서 IAM 서비스로 들어와 `IAM > 액세스 관리 > 사용자` 탭에서 `사용자를 생성` 을 선택합니다.

![](AWS/images/Pasted%20image%2020250329014020.png)


`사용자 이름` 은 원하는대로 설정하고 다음으로 넘어갑니다.

![](AWS/images/Pasted%20image%2020250329014118.png)


권한 설정에는 `직접 정책 연결` 을 선택합니다.

![](AWS/images/Pasted%20image%2020250329014353.png)


앞서 설정한 이름의 사용자가 S3 에 대해 모든 행동이 가능하도록 `AmazonS3FullAccess` 를 추가하고 사용자를 생성합니다.

![](AWS/images/Pasted%20image%2020250329014429.png)


> [!note] 생성한 사용자의 ARN 을 기억합니다.
> 생성한 사용자의 ARN 은 후에 S3 정책 설정에서 사용됩니다.


### IAM 에서 사용자 AccessKey 생성
이제 생성한 사용자의 `AccessKey 및 Secret Key` 를 발급받아야 합니다. `IAM > 액세스 관리 > 사용자` 에서 방금 생성한 사용자를 선택합니다.

![](AWS/images/Pasted%20image%2020250329014552.png)


`보안 자격 증명` 탭으로 이동하여 `액세스 키 만들기` 선택합니다.

![](AWS/images/Pasted%20image%2020250329014737.png)


외부 백앤드 애플리케이션을 통해 S3 에 접근할 것이기 때문에, `AWS 외부에서 실행되는 애플리케이션` 을 선택하고 다음으로 넘어갑니다.

![](AWS/images/Pasted%20image%2020250329015006.png)


`설명 태그 값` 은 생략하고 `액세스 키 만들기`를 발급받습니다. 

> AccessKey 는 다시 확인할 수 있지만, Secret Key 는 다시 확인할 수 없기 때문에 잘 보관해야 합니다.

![](AWS/images/Pasted%20image%2020250329163554.png)


## S3 정책 설정
S3 정책은 현재 S3 에 대한 접근제어를 가능하도록 하는 설정입니다. 해당 설정으로 `S3 에 업로드하려는 리소스를 제한시킬 수 있고, 사용자에 대한 접근제어 설정도 가능` 합니다. 

> IAM 에서 만든 사용자가 AmazonS3FullAccess 권한을 갖고 있더라도, S3 정책으로 더 세밀한 접근제어가 가능합니다.

생성한 S3 Bucket 을 선택하여 `권한 > 버킷 정책 > 편집` 을 선택합니다.  그리고 `IAM 사용자의 ARN` 과 `S3 의 ARN` 을 사용하여 아래 JSON 을 입력합니다. 

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
			"Resource": "arn:aws:s3:::<bucket-name>/*"
		},
		{
			"Sid": "DenyOtherAccess",
			"Effect": "Deny",
			"Principal": {
				"AWS": "arn:aws:iam::<user-id>:user/<user-name>"
			},
			"Action": "s3:PutObject",
			"NotResource": [
				"arn:aws:s3:::<bucket-name>/*.jpg",
				"arn:aws:s3:::<bucket-name>/*.png",
				"arn:aws:s3:::<bucket-name>/*.jpeg",
				"arn:aws:s3:::<bucket-name>/*.svg",
				"arn:aws:s3:::<bucket-name>/*.webp",
				"arn:aws:s3:::<bucket-name>*/" // 폴더도 가능하도록
			]
		}
	]
}
```


각 `key` 들은 다음과 같은 의미를 갖습니다.

- `Version` : 버킷 정책을 설정할 때 사용하는 `Syntax` 버전을 명시합니다. (2012-10-17 이 최신버전)
- `Statement` : 정책들의 집합을 의미하며, 배열안에 들어오는 각각의 `JSON` 이 하나의 정책을 의미합니다.
- `Statement.Sid` : 하나의 정책을 나타내는 id 를 의미하며 `정책을 구분하는 id` 로 사용됩니다. (아무값 가능)
- `Statement.Effect` : 해당 정책을 허용할지 거부할지 결정합니다. (`Allow`, `Deny`)
- `Statement.Principal` : 정책을 적용할 사용자 주체를 의미합니다. (ARN 형태로 나타내며 `*` 는 모두를 의미)
- `Statement.Action` : 수행할 작업을 의미합니다. Action 들의 이름은 사전에 정해져있으며, 원하는 Action 을 명시하면 구조입니다.
- `Statement.Resource` : 어떤 객체(파일)을 대상으로 지정할지를 의미합니다. (ARN 형태로 나타냄)

> Statement 배열의 각 JSON 객체는 위에서 아래로 순차적으로 평가됩니다. 단, 정책 간 우선순위는 Deny > Allow 순이므로, 아래에 Allow 가 있어도 위의 Deny 에 해당된다면 접근은 거부됩니다.


즉, 위 정책 설정은 다음과 같은 의미를 갖습니다.

1. S3 에 저장된 객체(파일) 은 `모두(*)`가 볼 수 있습니다. (모든 객체가 Public Access 상태가 되어 모두가 확인 가능해집니다. 해당 정책을 기입하지 않으면 Forbidden 이 발생하게 됩니다)
2. IAM 사용자는 `허용한 파일들만 업로드 가능`합니다.

![](AWS/images/Pasted%20image%2020250329020327.png)


## 정리
- 모든 퍼블릭 액세스 차단(Block Public Access) 설정을 꼭 해제해야 합니다. (안하면 Access Denied)
- S3 정책 설정을 통해 모든 객체를 Public Access 상태로 변경해주어야 합니다. (안하면 Access Denied)
	- 모든 퍼블릭 액세스 차단을 하지 않으면 정책 설정을 안하면 Access Denied 발생.
	- 모든 퍼블릭 액세스 차단이 해제되어있는지 확인하고, 정책 설정을 따른다는 의미

## 마치며
지금까지 Backend Application 을 위한 S3 생성과 설정을 알아보았습니다. 감사합니다.

