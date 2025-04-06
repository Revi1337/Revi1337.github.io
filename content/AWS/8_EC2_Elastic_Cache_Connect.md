---
title: EC2 & ElastiCache 연결
tags: ['aws', 'elasticache', 'redis']
---


## 들어가며
안녕하세요. 이번 시간에는 ElastiCache 를 생성하고 EC2와 연동하는 과정에 대해 알아보고자 합니다. 해당 포스팅은 아래 포스팅을 읽었다고 가정하고 작성되었습니다.

- [EC2 생성과 탄력적 IP설정](AWS/6_EC2.md)


## ElastiCache
Amazon ElastiCache는 인메모리(In-Memory) 데이터 캐싱 시스템을 제공하는 `클라우드 기반 서비스`입니다. 이를 통해 애플리케이션은 더 빠른 속도로 데이터를 조회할 수 있으며, 성능 향상, 지연 시간 감소, DB 부하 감소 등의 효과를 얻을 수 있습니다. ElastiCache 는 두가직 오픈 소스 In-Memory Engine 을 지원합니다.

1. Memcached
	- 단순하고 가벼운 키-값(Key-Value) 캐시 저장소입니다.
	- 멀티 스레드를 지원하여 수평 확장(Scale-out)이 쉽습니다.
	- 상태 비저장(stateless) 구조로 노드 간 복제나 영속성이 존재하지 않습니다.
	- 주로 간단한 캐싱 용도에 사용됩니다.
2. Redis
	- 키-값 저장소뿐 아니라 리스트, 셋, 정렬된 셋, 해시 등 다양한 자료구조를 지원합니다.
	- 데이터 복제, 자동 장애 조치, 지속성(persistence) 기능을 제공합니다.
	- Pub/Sub, Lua 스크립팅, 트랜잭션 등 고급 기능을 지원합니다.
	- 세션 저장소, 순위 시스템, 실시간 데이터 처리 등에 활용됩니다.


## ElastiCache 생성
`ElastiCache > Redis OSS 캐시` 를 선택하고 `Redis OSS 캐시 생성`을 선택합니다.

> Valkey를 생성할 것이냐 묻게 되는데, Redis OSS로 계속하기를 선택합니다.

![](AWS/images/Pasted%20image%2020250406193524.png)


[프리티어에서는 클러스터 모드를 사용할 수 없습니다](https://repost.aws/ko/questions/QUPlUKafnkRUCz3FsdmrdzLw/%ED%94%84%EB%A6%AC%ED%8B%B0%EC%96%B4-12-%EA%B0%9C%EC%9B%94-%EB%AC%B4%EB%A3%8C%EC%97%90%EC%84%9C-elasti-cache-%EC%9A%94%EA%B8%88-%EB%B6%80%EA%B3%BC-%EB%AC%B8%EC%9D%98). 따라서 클러스터 모드를 비활성화하기 위해 `자체 캐시 설계`를 선택하고, `클러스터 캐시`를 선택합니다.

> [!note] Redis Cluster Mode
> Redis Cluster 모드는 데이터를 여러 노드에 분산해서 저장하고 처리할 수 있도록 해주는 Redis 의 기능입니다. 즉, 수평확장(Scale Out)을 가능하게 만들어서 더 많은 데이터 처리, 더 높은 안정성을 제공합니다. 또한, 노드 하나가 죽어도 다른 노드가 백업 역할(고가용성)을 수행하기 때문에 확장성이 필요할 때 사용됩니다.

![](AWS/images/Pasted%20image%2020250406193604.png)


`클러스터 모드`를 비활성화합니다.

![](AWS/images/Pasted%20image%2020250406193615.png)


ElastiCache의 이름을 기입합니다.

![](AWS/images/Pasted%20image%2020250406193640.png)


- ElastiCache 가 호스팅될 위치는 `AWS 클라우드를 선택합니다`. `ElastcCache는 로컬 PC에서는 사용할 수 없고, 오직 EC2 위에서만 실행이 가능`합니다. 
- 다중 AZ, 자동 장애 조치 모두 비활성화시킵니다. 비활성화 하는 이유는 뒤에서 설명하도록 하겠습니다. (다중 AZ를 활성화하면 자동 장애조치도 자동으로 활성화됩니다.)

> [!note] 다중 AZ & 자동 장애 조치
> 다중 AZ는 다중 Available Zone. 즉, 다중 가용 영역을 의미합니다. 말 그대로 Redis 노드들을 서로 다른 가용 영역에 분산 배치하는 방식입니다. 이 구성을 사용하면, Primary 노드에 장애가 발생하더라도, 다른 가용 영역에 있는 Replica 노드가 자동으로 Primary로 승격되어 장애 상황에 빠르게 대응할 수 있습니다. 결과적으로 고가용성을 확보하고, 서비스 중단을 최소화할 수 있는 장애 대비 수단입니다.

![](AWS/images/Pasted%20image%2020250406194453.png)


- 엔진버전은 원하는 버전을 선택합니다.
- 파라미터 그룹은 그대로 냅니다. (클러스터를 비활성화 했다면 default.redis.N 이 기본값일겁니다)
- 노드 유형에는 꼭 `cache.t2.micro` 를 선택합니다. (프리티어 기준 해당 노드는 매달 750시간이 무료입니다.)
- Mutli AZ를 비활성화 했기 때문에 복제본 개수는 0개로 변경합니다. (복제본 개수를 0으로 설정하면 멀티 AZ와 자동 장애조치가 자동으로 비활성화 됩니다.)

![](AWS/images/Pasted%20image%2020250406200330.png)


- 기존 서브넷 그룹이 없다면 `새 서브넷 그룹 생성`을 선택합니다.
- 이름과 VPC를 지정할 때는 EC2와 동일한 VPC를 선택합니다.
- 다중 AZ와 자동 장애 조치를 비활성화했기 때문에 하나의 서브넷만 선택할 수 있습니다. 가능하면 `ap-northeast-2b`처럼 서울 리전에 해당하는 서브넷을 선택하는 것이 좋습니다.
    - `만약 다중 AZ 또는 자동 장애 조치 기능을 활성화했다면, 최소 2개 이상의 서브넷을 선택`해야 합니다. 이는 Redis의 각 노드를 서로 다른 가용 영역(AZ)에 분산 배치하기 위함입니다.
    - 프리 티어의 경우, `t2.micro` 인스턴스를 한 달 최대 750시간까지 무료로 사용할 수 있습니다. 하지만 다중 AZ나 장애 조치를 활성화하고 2개 이상의 서브넷을 선택하면, Primary 노드 1개 + Replica 노드 2개로 총 3개의 인스턴스가 동시에 실행되기 때문에, 한 달을 채우기 전에 750시간이 소진되어 추가 요금이 발생할 수 있습니다.
    - 우리는 다중 AZ와 자동 장애 조치를 비활성화했기 때문에 서브넷 하나만 선택하고 넘어갈 수 있습니다.

![](AWS/images/Pasted%20image%2020250406200255.png)


- 중요한 데이터를 저장하지 않을것이기 때문에, 저장 중 암호화와 전송 중 암호화는 모두 비활성화합니다.
- 이제 보안 그룹을 생성해주어야 합니다.

![](AWS/images/Pasted%20image%2020250406201308.png)


새로운 탭을 열어 `EC2 > 보안 그룹` 에서 `보안 그룹 생성`을 누릅니다. 그룹 이름, 설명을 기입하고 `VPC는 연결할 EC2와 동일한 VPC`를 선택합니다.

![](AWS/images/Pasted%20image%2020250406202028.png)


인바운드 규칙에는 `기존 EC2 보안 그룹`을 선택하고 규칙을 저장합니다.

> 기존 EC2 보안 그룹(sg-09fba2de43aa0ae94)에서 오는 트래픽을 허용시키기 때문에 EC2 인스턴스에서 ElastiCache 에 접속이 가능해집니다.

![](AWS/images/Pasted%20image%2020250406213133.png)


다시 ElastiCache 보안 그룹 관리 탭으로 돌아와 방금 만든 보안그룹을 선택합니다.

![](AWS/images/Pasted%20image%2020250406202136.png)


혹시모를 요금을 방지하기 위해 백업은 비활성화합니다. 

![](AWS/images/Pasted%20image%2020250406202208.png)


## EC2 설정
기본적으로 EC2에서는 redis 가 깔려있지 않습니다. 그래서 EC2에 redis 를 설치해주어야 합니다. 아래 커맨드를 입력하여 redis 를 설치합니다.

> redis는 크게 redis에 접속할 수 있게하는 redis-client, redis 서버를 띄우는 redis-server로 구분할 수 있습니다. redis-server 를 설치하면 두개 모두 설치되게 됩니다. redis-client 만 설치하고 싶다면 apt install redis-tools 를 설치하시면 됩니다.

```bash
sudo apt update && sudo apt install redis-server
```


EC2에서 redis-client CLI도구로 ElastiCache와 통신이 가능한 것을 확인할 수 있습니다.

![](AWS/images/Pasted%20image%2020250407032520.png)


반면 Local 에서는 ElastiCache와 통신이 가능하지 않은 것을 확인할 수 있습니다.

![](AWS/images/Pasted%20image%2020250407032114.png)


## 마치며
지금까지 ElastiCache 를 생성하고 EC2와 연동하는 과정에 대해 알아보았습니다. 특히 아래 내용들을 꼭 숙지해야합니다.

- 프리티어일 경우 Cluster Mode 를 비활성화 시킵니다.
- 프리티어일 경우 되도록 Mutli AZ 와 자동 장애 조치를 비활성화해야 추가 과금을 방지할 수 있습니다.
- 인스턴스 유형은 반드시 `t2.micro`를 선택해야 프리 티어 혜택을 정상적으로 받을 수 있습니다.


## Reference
https://loosie.tistory.com/814

https://youngyin.tistory.com/391

