---
title: Redis Sentinel
tags: ['redis']
---


## Redis Sentinel
// 여기 개념적어야함.


redis-cli -h 192.168.45.126 -p 26379 -a 1234qwer SENTINEL get-master-addr-by-name master
redis-cli -h 192.168.45.126 -p 26380 -a 1234qwer SENTINEL get-master-addr-by-name master
redis-cli -h 192.168.45.126 -p 26381 -a 1234qwer SENTINEL get-master-addr-by-name master


nc -zv localhost 5002


## Master 다운시 로그 확인
Redis Sentinel 에서 Master 노드에서 장애 발생 시, 다른 노드로의 FailOver 로그를 한번 살펴보겠습니다. 이를 확인하기 위해 Master 노드를 종료시킵니다.

```bash
docker compose down redis-master -v
```

> Sentinel 구성은 [Docker RedisSentinel 구성](Docker/DockerRedisSentinel.md) 에서 확인할 수 있습니다. 


### Master 종료
SIGNTERM 종료 시그널을 통해 Master 노드가 정상 종료됩니다. 

![](ComputerScience/Database/Redis/images/Pasted%20image%2020250412162500.png)


### Sentinel 이 Master 다운 감지
Master 노드가 종료되었기 때문에 Slave 1, 2 노드가 Master 와의 연결에 실패하는 것을 볼 수 있습니다. Master 가 종료되고 몇초 후, 각 Sentinel 들이 Master 의 다운을 감지하게 되고 Master 를 `sdown(subjectively down)` 상태로 판단합니다. 3개의 Sentinel 중 2개 이상이 `sdown` 상태로 판단하였기 때문에, `odown(objectively down)` 상태로 판단합니다. 이는 `Master 노드의 장애` 를 공식 인정하는 것입니다.

> 이제 Slave 노드 중 하나를 Master 노드로 승격하는 Failover 과정을 진행하게 됩니다.

![](ComputerScience/Database/Redis/images/Pasted%20image%2020250412165931.png)


### Sentinel 리더 선출 및 failover 시작
`Master 노드의 장애` 를 공식 인정되면 Slave 노드 중 하나를 Master 노드로 승격하는 Failover 과정을 진행하게 됩니다. 이 과정은 다음과 같은 순서로 이루어지게 됩니다.

1. 각 Sentinel 들이 Failover 절차를 시작하기 위해 새 epoch(버전 개념)를 생성합니다. `(+new-epoch 1)`
2. 각 Sentinel 들 중 Leader(대표) Sentinel 을 뽑습니다. `(+vote-for-leader & ~ voted for)`
3. Sentinel 대표(sentinel-2)는 Slave 노드 중 하나의 노드를 Master 후보로 고르고, Master 로 승격시킵니다.
	- Sentinel 대표는 새로운 Master 승격시킬 Slave 를 고릅니다. `(+failover-state-select-slave ...)`
	- Master 승격시킬 Slave 가 정해집니다. (가장 최신의 복제본) `(+selected-slave ...)`
	- 후보 노드에게 "너 Slave 그만하고 Master 해라" 라는 명령을 내리게 됩니다. `(+failover-state-send-slaveof-noone ..)`

![](ComputerScience/Database/Redis/images/Pasted%20image%2020250412170011.png)


### 새로운 Master 로 전환
Sentinel 대표로부터 "Master 로 전환해라" 라는 명령을 받은 Slave 노드는 MASTER MODE 를 활성화시켜, Master 노드의 역할을 수행하게 됩니다. 그 후 다음과 같은 프로세스를 수행하게 됩니다

1. Sentinel 대표가 어떤 Slave 노드를 Master 로 승격했는지 알립니다. (`+promoted-slave slave ...`)
2. Sentinel 대표는 Master 를 바꾼 소식을 다른 Slave 노드들에게 전파합니다. (`#failover-state-reconf-slaves`)
3. Sentinel 대표는 각 Slave 노드들에게 새로운 Master 를 알려주는 명령을 전송합니다. (`#slave-reconf-sent slave ...)
4. 각 Sentinel 들은 Master 변경이 완료되었음을 네트워크 전체에 알립니다. (`+switch-master ...`)
	- 다른 Sentinel 들은 해당 메시지를 보고 자신이 바라보고있던 Master 를 수정하고 네트워크 전체에 알리게 됩니다.

![](ComputerScience/Database/Redis/images/Pasted%20image%2020250412170057.png)


### 전체 노드 정상화
Sentinel 대표가 새로운 Master 를 지정하고 나면, 다른 Slave 노드들이 그 Master 와 동기화(sync)를 시작하게 됩니다.

1. redis-slave-2 가 새 마스터(172.21.0.2:6379) 와 복제 동기화(SYNC) 를 시작합니다. (`MASTER <-> REPLICA`)
2. redis-slave-2 가 172.21.0.2(새로운 마스터)를 마스터로 인식합니다. (`REPLICAOF ...`)
3. redis-slave-2 는 172.21.0.2(새로운 마스터)와의 연결을 통해 PING/PONG 응답 확인 후, 부분 복제(partial resynchronization)를 수행합니다. 이 동기화는 새로운 Master와 이전에 연결되어 있던 replication state를 기준으로 수행되며, `redis-slave-2` 가 요청을 보내고, `redis-master (172.21.0.2)` 가 그 요청을 수락하면서 sync 절차가 시작됩니다.

![](ComputerScience/Database/Redis/images/Pasted%20image%2020250412184545.png)



## 변화 확인
Master 노드가 `172.21.0.2` 로 변화된 것을 확인할 수 있습니다.

```bash
docker exec -it sentinel-1 bash 
I have no name!@d48323859680:/$ redis-cli -p 26379
127.0.0.1:26379> auth dummy_password
OK
127.0.0.1:26379> sentinel get-master-addr-by-name redis-master
1) "172.21.0.2"
2) "6379"
```




## Reference 
https://duddal.tistory.com/68

https://coding-review.tistory.com/533

https://velog.io/@greentea/docker%EB%A1%9C-redis-sentinel-%EB%9D%84%EC%9B%8C%EB%B3%B4%EA%B8%B0

https://crazy-horse.tistory.com/entry/%EB%A0%88%EB%94%94%EC%8A%A4-%EB%A0%88%EB%94%94%EC%8A%A4-Master-Slave%EB%A5%BC-%EB%8F%84%EC%BB%A4%EC%97%90-%EC%98%AC%EB%A0%A4%EB%B3%B4%EC%9E%90


https://tweety1121.tistory.com/entry/Redis-master-slave-sentinel-%EB%8F%84%EC%BB%A4%EB%A1%9C-%EC%98%AC%EB%A6%AC%EA%B8%B0


