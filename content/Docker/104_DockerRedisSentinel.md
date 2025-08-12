---
title: Docker Redis Sentinel 
tags: ['docker', 'docker-compose']
---

### Docker Compose 구성
```yml
version: '3.8'  
  
services:  
  redis-master:  
    image: bitnami/redis  
    container_name: redis-master  
    ports:  
      - 6382:6379  
    environment:  
      - REDIS_REPLICATION_MODE=master  
      - REDIS_PASSWORD=dummy_password  
      - REDIS_MASTER_PASSWORD=dummy_password  
      - REDIS_TIMEOUT=0  
      - REDIS_AOF_ENABLED=no  
      - TZ=Asia/Seoul  
    deploy:  
      placement:  
        constraints: [ node.labels.redis1 == true ]  
  
  
  redis-slave-1:  
    image: bitnami/redis  
    container_name: redis-slave-1  
    ports:  
      - 6383:6379  
    environment:  
      - REDIS_REPLICATION_MODE=slave  
      - REDIS_MASTER_HOST=redis-master # 마스터 서비스 이름 (컨테이너 이름이나 네트워크 이름 사용)  
      - REDIS_PASSWORD=dummy_password  
      - REDIS_MASTER_PASSWORD=dummy_password  
      - REDIS_TIMEOUT=0  
      - REDIS_AOF_ENABLED=no  
      - TZ=Asia/Seoul  
    deploy:  
      placement:  
        constraints: [ node.labels.redis2 == true ]  
  
  
  redis-slave-2:  
    image: bitnami/redis  
    container_name: redis-slave-2  
    ports:  
      - 6384:6379  
    environment:  
      - REDIS_REPLICATION_MODE=slave  
      - REDIS_MASTER_HOST=redis-master # 마스터 서비스 이름 (컨테이너 이름이나 네트워크 이름 사용)  
      - REDIS_PASSWORD=dummy_password  
      - REDIS_MASTER_PASSWORD=dummy_password  
      - REDIS_TIMEOUT=0  
      - REDIS_AOF_ENABLED=no  
      - TZ=Asia/Seoul  
    deploy:  
      placement:  
        constraints: [ node.labels.redis3 == true ]  
  
  
  sentinel-master:  
    image: bitnami/redis-sentinel  
    container_name: sentinel-master  
    ports:  
      - 26379:26379  
    environment:  
      - REDIS_MASTER_SET=redis-master  
      - REDIS_MASTER_HOST=redis-master  
      - REDIS_MASTER_PASSWORD=dummy_password  
      - REDIS_SENTINEL_QUORUM=2  
      - REDIS_SENTINEL_PASSWORD=dummy_password  
      - REDIS_SENTINEL_DOWN_AFTER_MILLISECONDS=3000  
      - TZ=Asia/Seoul  
    depends_on:  
      - redis-master  
      - redis-slave-1  
      - redis-slave-2  
    deploy:  
      placement:  
        constraints: [ node.labels.sentinel == true ]  
  
  
  sentinel-slave-1:  
    image: bitnami/redis-sentinel  
    container_name: sentinel-slave-1  
    ports:  
      - 26380:26379  
    environment:  
      - REDIS_MASTER_SET=redis-master  
      - REDIS_MASTER_HOST=redis-master  
      - REDIS_MASTER_PASSWORD=dummy_password  
      - REDIS_SENTINEL_QUORUM=2  
      - REDIS_SENTINEL_PASSWORD=dummy_password  
      - REDIS_SENTINEL_DOWN_AFTER_MILLISECONDS=3000  
      - TZ=Asia/Seoul  
    depends_on:  
      - redis-master  
      - redis-slave-1  
      - redis-slave-2  
    deploy:  
      placement:  
        constraints: [ node.labels.sentinel == true ]  
  
  
  sentinel-slave-2:  
    image: bitnami/redis-sentinel  
    container_name: sentinel-slave-2  
    ports:  
      - 26381:26379  
    environment:  
      - REDIS_MASTER_SET=redis-master  
      - REDIS_MASTER_HOST=redis-master  
      - REDIS_MASTER_PASSWORD=dummy_password  
      - REDIS_SENTINEL_QUORUM=2  
      - REDIS_SENTINEL_PASSWORD=dummy_password  
      - REDIS_SENTINEL_DOWN_AFTER_MILLISECONDS=3000  
      - TZ=Asia/Seoul  
    depends_on:  
      - redis-master  
      - redis-slave-1  
      - redis-slave-2  
    deploy:  
      placement:  
        constraints: [ node.labels.sentinel == true ]
```



## Slave Nodes 확인
Slave 노드들은 Master 노드에 접속하여 확인할 수 있습니다.

```bash
docker exec -it redis-master redis-cli
127.0.0.1:6379> auth dummy_password
OK
127.0.0.1:6379> info replication
# Replication
role:master
connected_slaves:2
slave0:ip=172.21.0.4,port=6379,state=online,offset=14725,lag=1
slave1:ip=172.21.0.2,port=6379,state=online,offset=14739,lag=0
master_failover_state:no-failover
master_replid:d5e21a4e7332c9e302c91a8fc6588fe6613bb47d
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:14739
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:1
repl_backlog_histlen:14739
```


## Master Node 확인
Master Node 는 Sentinel 에 접속하여 확인할 수 있습니다.

```bash
docker exec -it sentinel-1 bash
I have no name!@7d17a5935e30:/$ redis-cli -p 26379
127.0.0.1:26379> auth dummy_password
OK
127.0.0.1:26379> sentinel get-master-addr-by-name redis-master
1) "172.21.0.3"
2) "6379"
```


