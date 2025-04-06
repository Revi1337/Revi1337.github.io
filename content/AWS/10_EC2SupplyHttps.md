---
title: EC2 개인 도메인에 HTTPS적용
tags: ['aws', ec2', 'route_53', 'load_balancer', 'acm', 'https']
---


## 들어가며
안녕하세요. 이번 시간에는 ACM, Load Balancer를 통해 개인 도메인을 입한 EC2에 HTTPS 를 적용하는 시간을 가져보려합니다.

> 해당 포스팅은 AWS에서 개인 도메인을 구입했고, 이미 EC2에 개인 도메인을 입힌 상황을 가정합니다. AWS 도메인 구입과 스팅 영역 설정은 [AWS 도메인 구매와 호스팅 영역 기본 설정](AWS/20_AwsDomainBuy.md) 에서 볼 수 있고, EC2 에 도메인을 다는 것은 [EC2에 도메인 적용](AWS/9_EC2ConnectDomain.md) 에서 볼 수 있습니다.


## ACM 인증서 요청
HTTPS 를 적용하기 위해서는 인증서를 발급받아야 합니다. 이를 위해 AWS Certificate Manager(ACM) 을 이용합니다. AWS Console 에서 `Certificate Manager` 를 검색하고 `인증서 요청을 선택`합니다.

![img.png](AWS/images/ec2_supply_https.png)


인증서 유형에는 `퍼블릭 인증서 요청`을 선택하고 다음을 누릅니다.

![img_1.png](AWS/images/ec2_supply_https_1.png)


HTTPS를 적용하려는 도메인 주소를 입력합니다. 필자는 모든 서브 도메인에 대해 HTTPS를 적용하려하기 때문에 `*.revi1337.com` 을 기입하였습니다.

> 여러 도메인을 추가할 수 있기 때문에, 원하는 도메인 명을 적어주시면 됩니다. 특정한 도메인만 적용하고 싶다면 www.revi1337.com 과 같은 주소를 입력해주시면 됩니다.

![img_2.png](AWS/images/ec2_supply_https_2.png)


`검증 방법`과 `키 알고리즘`은 디폴트(DNS 검증 & RSA 2048)로 둡니다.

![img_3.png](AWS/images/ec2_supply_https_3.png)
![img_4.png](AWS/images/ec2_supply_https_4.png)


태그는 생략하고, `요청` 을 눌러 인증서 요청을 완료합니다.

![img_5.png](AWS/images/ec2_supply_https_5.png)


인증서 요청이 완료하고 `Certificate Manager > 인증서` 에 가보면 앞서 입력한 도메인주소가 검증 대기중인 상태로 표시되게 됩니다.

![img_6.png](AWS/images/ec2_supply_https_6.png)


상단 사진에서 네모박스로 가려진 `인증서ID 를 클릭`해주고 `Route 53에서 레코드 생성`을 눌러주면

![img_7.png](AWS/images/ec2_supply_https_7.png)


`Certificate Manager > 인증서 나열` 에 대기중인 인증서가 발급됨으로 바뀌는것을 볼 수 있습니다.

![img_8.png](AWS/images/ec2_supply_https_8.png)


## LoadBalancer 생성
LoadBalancer는 하나의 도메인으로 들어오는 요청을 여러 서버(EC2 인스턴스)로 적절히 분산시켜주는 역할을 합니다. 도메인에 HTTPS를 적용하면 클라이언트의 요청은 443포트를 통해 로드 밸런서로 들어오고, 로드 밸런서는 해당 요청을 내부 EC2 인스턴스의 포트(Ex: 80번)로 전달합니다. 이때, HTTPS 통신은 로드 밸런서에서 종료되며, 이후 EC2와는 일반 HTTP로 통신하게 됩니다.(일반적인 구조)


### Target Group 생성
`EC2 > 대상 그룹` 에서 `대상 그룹 생성`을 선택합니다.

![img_9.png](AWS/images/ec2_supply_https_9.png)


기본 구성은 인스턴스를 선택합니다.

![img_10.png](AWS/images/ec2_supply_https_10.png)


- 대상 그룹 이름은 원하는 이름을 기입합니다.
- IP 주소 유형에는 IPv4를 선택합니다.
- VPC는 EC2가 존재하는 VPC 를 선택합니다.

> 프토토콜:포트는 자신이 실행할 서비스의 포트를 의미합니다. 자신이 8080포트를 사용한다면 80이 아닌 8080을 입력해야 합니다.

![img_11.png](AWS/images/ec2_supply_https_11.png)


상태 검사(Health Checks)는 서버가 정상작동하는지 확인하는 부분이기때문에 생략해주고 `다음` 을 누릅니다.

![img_12.png](AWS/images/ec2_supply_https_12.png)


이제 적용할 EC2 인스턴스를 선택해주고 `대상 그룹 생성` 을 누릅니다.

![img_13.png](AWS/images/ec2_supply_https_13.png)


### ALB 생성
이제 EC2 왼쪽 하단 `EC2 > 로드 밸런서` 탭으로 넘어온 후, `로드 밸런서 생성` 버튼을 누르고 `Application Load Balancer` 를 선택합니다.

![img_15.png](AWS/images/ec2_supply_https_15.png)


- 로드 밸런서 이름은 원하는 이름으로 기입합니다. 단 Unique 해야 합니다.
- 체계는 인터넷 경계를 선택합니다.
- IP 주소 유형에는 IPV4를 선택합니다.

![img_16.png](AWS/images/ec2_supply_https_16.png)


매핑에는 체크란에는 선택한 인스턴스가 포함된 가용영역을 선택해주어야 합니다. 최소 2개 이상 선택해주어야 하고 선택한 가용 영역에 EC2 가 위치해 있어야 합니다.

![img_17.png](AWS/images/ec2_supply_https_17.png)


보안 그룹에는 EC2 인스턴스가 속한 보안그룹을 선택합니다.

> 꼭 443 포트가 열려있어야 합니다.

![img_18.png](AWS/images/ec2_supply_https_18.png)


리스너 및 라우팅에는 `HTTP 80` 그리고 `HTTPS 443` 에 대한 리스너를 등록합니다. 대상 그룹에는 이전에 만들어둔 Target Group을 선택합니다. 

> http://도메인 혹은 https://도메인 입력하면, ALB가 요청을 받아 필요하면 SSL을 해제하고(https 입력시) Target Group(EC2 집합) 에 전달하게 됩니다.

![img_19.png](AWS/images/ec2_supply_https_19.png)


마지막으로 `보안 리스너 설정`에서 `앞서 만든 인증서를 선택`해주고 로드밸런서를 생성하면 됩니다.

![img_20.png](AWS/images/ec2_supply_https_20.png)

### Redirect 설정
`http:://도메인` 을 입력하여도 `https://도메인`로 리다이렉션되도록 설정해야 합니다. `EC2 > 로드밸런서 > 만든 로드밸런서` 를 선택하여 리스너 및 규칙탭에 가면 이전에 설정한 리스너들이 나열되어있는 것을 확인할 수 있습니다. 여기서 `HTTP:80` 을 선택하고 `리스너 관리 > 리스너 편집`을 선택합니다.

![img_21.png](AWS/images/ec2_supply_https_21.png)


80포트로 들어와도 443으로 리다이렉션될 수 있도록 

- 라우팅 액션에 `URL 리디렉션` 을 선택
- `HTTPS, 443` 포트로 설정
- `상태코드 301` 을 선택하고 저장합니다.

![img_22.png](AWS/images/ec2_supply_https_22.png)


## Route 53 레코드 변경
필자처럼 HTTPS를 달기전에 이미 도메인이 달려있는 경우에는 기존 레코드를 변경해주어야 합니다. 이를 위해 `Route 53 > 호스팅 영역 > 본인의 도메인` 에서 기존 도메인의 A레코드를 삭제합니다. 

![img_23.png](AWS/images/ec2_supply_https_23.png)


이제 A레코드를 다시 만들어주어야 합니다. 

- S3에 도메인을 달았던 것처럼 `별칭` 을 활성화시킵니다.
- 레코드 이름은 삭제했던 레코드 이름과 동일한 이름으로 설정합니다.
- 레코드 유형에는 동일하게 `A-IPv4` 를 선택합니다.
- 트래픽 라우팅 대상에는 `Application/Classic Load Balancer 에 대한 별칭` 을 선택해주고 `생성한 로드밸런서를 선택`합니다.
- 마지막으로 Region 은 서울로 선택해주고 레코드를 생성해주면 됩니다.

![img_24.png](AWS/images/ec2_supply_https_24.png)


## HTTPS 동작 확인
레코드가 생성된 후 조금만 기다리고 HTTPS로 도메인에 접근하면 정상적으로 HTTPS가 잘 입혀진 것을 확인할 수 있습니다.

![img_25.png](AWS/images/ec2_supply_https_25.png)


## 단점
AWS Load Balancer를 통해 EC2에 HTTPS를 적용하는 방식은 `"비용이 발생한다"` 는 단점이 있습니다. Load Balancer는 일반적으로 여러 개의 EC2 인스턴스를 운영할 때 그 진가를 발휘하지만, 단일 EC2 인스턴스에 HTTPS를 적용하기 위해 Load Balancer를 사용하는 것은 비용 대비 효율이 떨어질 수 있습니다.

> 따라서 이러한 문제를 해결하기 위해서는 Let's Encrypt를 이용해 무료 인증서를 발급받고, EC2 내부에서 Nginx를 직접 설정하여 HTTPS를 적용하는 방식도 고려할 수 있습니다.


## 마치며
지금까지 EC2에 개인 도메인이 입혀져있는 것을 가정한 상태에서 ACM과 Load Balancer 를 통해 HTTPS를 적용하는 과정에 대해 알아보았습니다. 감사합니다.

