---
title: RDS 생성과 기본 설정
tags: ['aws', 'rds']
---

## 들어가며
안녕하세요. 이번 시간에는 RDS 인스터스 생성, Timezone & Charset 변경, Spring 과 연동하는 방법을 알아보겠습니다.


## RDS 생성
AWS 콘솔에서 Aurora RDS 를 검색하여 들어온 다음, `데이터베이스 생성` 을 눌러줍니다.

> 시작하기 전에 본인의 Region 이 현재 자기 자신과 가까운 지역인지 확인합니다. 필자의 Region은 서울입니다.

![](AWS/images/Pasted%20image%2020250406030856.png)


`표준 생성`을 선택하고 `엔진 옵션`에는 자신이 사용하고자하는 DB를 선택합니다. 그리고 사용하고자하는 버전을 `엔진 버전`에서 선택합니다.

> 필자는 MySQL을 선택하였습니다.

![](AWS/images/Pasted%20image%2020250406031109.png)


템플릿에는 프리티어를 선택합니다. 프리티어이기 때문에 하위 `가용성 및 내구성` 을 수정할 권한이 없습니다.

![](AWS/images/Pasted%20image%2020250406031224.png)


RDS 인스턴스의 이름을 설정합니다. 본인이 원하는 이름을 기입하면 됩니다.

![](AWS/images/Pasted%20image%2020250406031422.png)


- 마스터 사용자 이름을 설정합니다. 이는 MySQL Root 사용자를 의미설정하는 것입니다. 
- 자격증명 관리는 자체 관리를 선택합니다.
- 마스터 암호와 마스터 암호 확인을 기입합니다. Root 사용자의 Password를 설정하는 것입니다.

![](AWS/images/Pasted%20image%2020250406031718.png)


필자는 프리티어이기때문에 `버스터블 클래스` 만 사용가능합니다. t4 가 버스터블 클래스들 중 하나이며, 상황에 따라 CPU 의 성능을 Bust 시킬수 있다는 것을 의미합니다.

![](AWS/images/Pasted%20image%2020250406031851.png)


- 스토리지 유형은 `범용 SSD(gp2)`를 선택합니다.
- `할당된 스토리지 크기`는 최소값인 `20` 으로 맞춰줍니다. 
- 스토리지 자동 조정은 `자동 조정 활성화` 가 디폴트일텐데, 비활성화시킵니다. 활성화되면 스토리지 공간이 부족하면 자동으로 `auto scaling` 되어 추가비용이 나올 수 있기 때문입니다.

![](AWS/images/Pasted%20image%2020250406032530.png)


연결 설정에서는 생성할 RDS 를 생성함과 동시에 `EC2` 인스턴스와 연결할 수 있습니다. 하지만 필자는 따로 연결할 것이기 때문에, `EC2 컴퓨팅 리소스에 연결 안함`을 선택했습니다.

- 네트워크 유형은  IPV4 를 선택합니다.
- VPC도 디폴트 VPC를 사용합니다.

![](AWS/images/Pasted%20image%2020250406032847.png)


DB 서브넷 그룹은 기본값으로 설정합니다. 그리고 퍼블릭 액세스를 `예`로 변경합니다.

> 퍼블릿 액세스를 허용하지 않으면,  VPC 내부 인스턴스들을 제외한 다른 Public IP들은 RDS 에 접근할 수 없습니다. 퍼블릭 액세스를 허용해준 이유는, 팀원도 접근가능하게 하기위함입니다.

![](AWS/images/Pasted%20image%2020250406033053.png)


이어서 VPC 보안 그룹을 생성합니다. 보안그룹 이름을 기입하고 `가용영역` 은 4개 중 한개 아무거나 선택하시면 됩니다.

> VPC 보안 그룹을 기존항목 선택하여 기존 보안그룹을 사용해도 됩니다. 하지만 필자는 현재 프로젝트에서 사용하는 RDS만의 보안 그룹을 별도로 만들고싶어서 새로 생성한 것입니다.

![](AWS/images/Pasted%20image%2020250406034004.png)


나머지 설정들은 모두 디폴트값으로 두고, `추가 설정`으로 넘어옵니다. 추가설정에서는 초기 데이터베이스를 만들어줄 수 있습니다.

![](AWS/images/Pasted%20image%2020250406035030.png)


자동 백앱은 활성화합니다. 백업 보존 기간은 3일정도 설정합니다. 이 설정으로 RDS에 뭔가 문제가 발생해도 3일 전 ~ 현재의 아무 시점으로 롤백할 수 있습니다.

 > 프리티어 경우 20GB의 자동 백업 스토리지 및 사용자가 시작한 모든 DB 스냅샷들이 무료입니다. 프리티어가 아니면 다시한번 생각해볼 필요가 있습니다. 선택은 본인 몫입니다.

![](AWS/images/Pasted%20image%2020250406035332.png)


이제`데이터베이스 생성` 버튼을 눌러 RDS 인스턴스를 생성합니다. 생성하는데 약간의 시간이 걸립니다. 


## 보안그룹 편집
생성이 완료되었으면, `Aurora and RDS > 데이터베이스 > 본인인스턴스` 를 선택하고 `VPC 보안그룹` 을 선택합니다.

![](AWS/images/Pasted%20image%2020250406040217.png)


`보안 그룹ID` 를 선택합니다.

![](AWS/images/Pasted%20image%2020250406040500.png)


`인바운드 규칙 편집` 를 선택합니다.

![](AWS/images/Pasted%20image%2020250406040515.png)


`3306` 포트에 대해 `IPV4` `IPV6` 주소를 모두 허용해주고 저장합니다.

![](AWS/images/Pasted%20image%2020250406040702.png)


## Charset & Timezone 변경
`MySQL 8` 디폴트 Charset 이 `utf8mb4` 입니다. 따라서 이것을 `utf-8` 으로 바꿔주어야 합니다. `Aurora and RDS > 파라미터 그룹` 에서 `파라미터 그룹 생성` 을 클릭합니다.

![](AWS/images/Pasted%20image%2020250406041113.png)


- 파라미터 그룹 & 설명은 본인이 원하는 이름으로 기입합니다.
- 엔진 유형은 RDS 를 생성할 당시, `에디션`을 선택합니다.
- 유형은 DB Paramter Group 을 선택 & 파라미터 그룹 패밀리는 DB 버전에 해당하는 것을 선택하고 생성을 누릅니다.

![](AWS/images/Pasted%20image%2020250406041731.png)


생성한 `파라미터 그룹` 을 선택합니다. (이름 하이퍼링크 클릭)

![](AWS/images/Pasted%20image%2020250406041811.png)


오른쪽 상단 `편집`버튼을 누릅니다.

![](AWS/images/Pasted%20image%2020250406041924.png)


아래 코드블럭 안의 `파라미터`들을 검색해서 각 항목들을 `편집`해주어야 합니다. 우선 아래 파라미터를 `Asia/Seoul` 로 변경하여 `시간대를 서울`로 변경합니다.

```text
time_zone 
```


또한, 아래의 파라미터들을 `utf8` 과 `utf8_general_ci` 로 변경합니다. 

```
// utf8 로 변경
character_set_client
character_set_database
character_set_connection
character_set_server
character_set_results
character_set_filesystem

// utf8_general_ci 로 변경
collation_connection
collation_server
```


각 항목들을 편집해주었으면, 다시 `Aurora and RDS > 데이터베이스` 로 돌아가 생성한 인스턴스를 체크하고 `수정` 버튼을 누릅니다.

![](AWS/images/Pasted%20image%2020250406042340.png)


아래로 내리다보면 `추가 구성` 탭이 나오게 됩니다. 여기서 `DB 파라미터 그룹` 을 방금 생성한 파라미터 그룹으로 변경하고 저장합니다.

![](AWS/images/Pasted%20image%2020250406042542.png)


이제 Intellij 에서 DB 를 연결하기 위해 `Amazon RDS > 데이터베이스` 에서 `본인의 RDS 인스턴스를 재시작`합니다.


## Spring 연결
이제 Intellij 에서 DB 를 연결하기 위해 `Amazon RDS > 데이터베이스 > 본인의 RDS 선택` 하여 엔드포인트 확인줍니다.

![](AWS/images/Pasted%20image%2020250406042751.png)


이제 IntelliJ 에 가서 `Database` 설정을 해보면 정상적으로 연결에 성공하는 것을 볼 수 있습니다.

* `Host`: rds endpoint 설정
* `User`: 마스터 사용자 기입(Root)
* `Password`: 마스터 사용자 암호 기입 (Root Password)
* `Database`: 추가 구성에 사용했던 초기 DB 이름 기입

![](AWS/images/Pasted%20image%2020250406044847.png)


이제 `SQL Console` 에서 `select now();` 를 날려주면 Timezone 이 현재 Desktop 과 동일한것을 볼 수 있습니다.

![](AWS/images/Pasted%20image%2020250406124740.png)


## 마치며 
지금까지 RDS 인스터스 생성, Timezone & Charset 변경, Spring 과 연동하는 방법을 알아보았습니다. 감사합니다.

