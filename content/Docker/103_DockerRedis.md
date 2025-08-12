---
title: Docker Redis
tags: ['docker', 'docker-compose']
---

## Pull
```bash
docker pull redis:latest
```


## Run Default Container
```bash
docker run -d --name test-redis -p 6379:6379 redis:latest
```


## Run Custom Container
```text
# redis.conf
bind 0.0.0.0
port 6379

dbfilename backup.rdb
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error no

appendonly yes
appendfilename appendonly.aof
appendfsync everysec
```

```bash
docker run -d --name test-redis -p 6379:6379 -v $(pwd)/redis.conf:/etc/redis/redis.conf -v $(pwd)/redis_data:/data redis:latest redis-server /etc/redis/redis.conf
```

```text
./redis-test
├── redis.conf
└── redis_data
    ├── appendonlydir
    │   ├── appendonly.aof.1.base.rdb
    │   ├── appendonly.aof.1.incr.aof
    │   └── appendonly.aof.manifest
    └── dump.rdb
```


## Execute Container Command
```bash
docker exec -it test-redis redis-cli
```


## Reference
[DockerHub Redis](https://hub.docker.com/_/redis)

[Docker로 Redis 실행하기](https://devbksheen.tistory.com/entry/2-Docker%EB%A1%9C-Redis-%EC%8B%A4%ED%96%89%ED%95%98%EA%B8%B0#5.%20Docker%20Container%20%EC%8B%A4%ED%96%89-1)

