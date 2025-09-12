---
title: Docker Redis
tags: ['docker', 'docker-compose']
---

## Basic Container
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

```yml  
services:  
  redis:  
    container_name: redis  
    image: redis:latest  
    ports:  
      - '6379:6379'  
    restart: always
```


## Custom Container
### File Structure
```text
infrastructure
└── redis
	├── docker.compose.yml
	├── redis.conf
	└── data
	    ├── appendonlydir
	    │   ├── appendonly.aof.1.base.rdb
	    │   ├── appendonly.aof.1.incr.aof
	    │   └── appendonly.aof.manifest
	    └── dump.rdb
```


### redis.conf
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


### Run
```bash
docker run -d --name redis -p 6379:6379 -v ./redis.conf:/etc/redis/redis.conf -v ./data:/data redis:latest redis-server /etc/redis/redis.conf
```

```yml
networks:  
  redis-net:  
    name: redis-net  
    driver: bridge  
  
services:  
  redis:  
    container_name: redis  
    image: redis:latest  
    ports:  
      - '6379:6379'  
    command: redis-server /etc/redis/redis.conf
    volumes:  
      - ./redis.conf:/etc/redis/redis.conf
      - ./data:/data  
    networks:  
      - redis-net  
    restart: always
```


## Reference
[Dockerhub Redis](https://hub.docker.com/_/redis)

[Docker로 Redis 실행하기](https://devbksheen.tistory.com/entry/2-Docker%EB%A1%9C-Redis-%EC%8B%A4%ED%96%89%ED%95%98%EA%B8%B0#5.%20Docker%20Container%20%EC%8B%A4%ED%96%89-1)

