---
title: Docker Grafana
tags: ['docker', 'docker-compose']
---


## Basic Grafana
```text
infrastructure
└── monitor
    ├── docker-compose.yml
    └── grafana (Directory)
```

```yml
networks:  
  monitor-net:  
    name: monitor-net  
    driver: bridge  
  
services:  
  grafana:  
    image: grafana/grafana  
    container_name: grafana  
    ports:  
      - '3000:3000'  
    environment:  
      GF_SECURITY_ADMIN_USER: 'default-user'  
      GF_SECURITY_ADMIN_PASSWORD: 'default-password'  
    volumes:  
      - ./grafana:/var/lib/grafana  
      - ./grafana/provisioning:/etc/grafana/provisioning  
    networks:  
      - monitor-net  
    restart: always
```


## +Prometheus
```text 
infrastructure
└── monitor
    ├── docker-compose.yml
    ├── grafana (Directory)
    └── prometheus
        ├── config
        │   ├── prometheus.yml
        │   └── query-log.log
        └── prometheus-volume (Directory)
```


그라파나에 프로메테우스 & Redis Exporter & MySQL Exporter를 연결합니다. ([Docker Prometheus](Docker/108_DockerPrometheus.md))

```yml
networks:  
  mysql-net:  
    external: true  
  redis-net:  
    external: true  
  monitor-net:  
    name: monitor-net  
    driver: bridge  
  
services:  
  prometheus:  
    image: prom/prometheus  
    container_name: prometheus  
    ports:  
      - '9090:9090'  
    command:  
      - '--storage.tsdb.path=/prometheus'  
      - '--config.file=/etc/prometheus/prometheus.yml'  
    volumes:  
      - ./prometheus/config:/etc/prometheus  
      - ./prometheus/prometheus-volume:/prometheus  
    restart: always  
    networks:  
      - monitor-net  
  
  mysql-exporter:  
    image: prom/mysqld-exporter  
    container_name: mysql-exporter  
    ports:  
      - '9104:9104'  
    command:  
      - '--mysqld.address=onsquad-mysql:3306'  
      - '--mysqld.username=exporter:password'  
    restart: always  
    networks:  
      - mysql-net  
      - monitor-net  
    depends_on:  
      - prometheus  
  
  redis-exporter:  
    image: oliver006/redis_exporter  
    container_name: redis-exporter  
    ports:  
      - '9121:9121'  
    environment:  
      REDIS_ADDR: redis://sentinel1:26379  
      REDIS_SENTINEL_MASTER: mymaster  
    restart: always  
    networks:  
      - redis-net  
      - monitor-net  
    depends_on:  
      - prometheus  
  
  grafana:  
    image: grafana/grafana  
    container_name: grafana  
    ports:  
      - '3000:3000'  
    environment:  
      GF_SECURITY_ADMIN_USER: 'default-user'  
      GF_SECURITY_ADMIN_PASSWORD: 'default-password'  
    volumes:  
      - ./grafana:/var/lib/grafana  
      - ./grafana/provisioning:/etc/grafana/provisioning  
    networks:  
      - monitor-net  
    depends_on:  
      - prometheus  
      - mysql-exporter  
      - redis-exporter  
    restart: always
```


## Reference
[Dockerhub Prometheus](https://hub.docker.com/r/prom/prometheus)

[Github MySQL Exporter](https://github.com/prometheus/mysqld_exporter)

[Dockerhub MySQL Exporter](https://hub.docker.com/r/prom/mysqld-exporter/)

[Github Redis Exporter](https://github.com/oliver006/redis_exporter?tab=readme-ov-file)

[Dockerhub Redis Exporter](https://hub.docker.com/r/oliver006/redis_exporter)

[Redis-Exporter를 통한 모니터링](https://kkang-joo.tistory.com/126)

[Prometheus, Grafana 오픈소스로 Redis 모니터링하기](https://lsdiary.tistory.com/97)
