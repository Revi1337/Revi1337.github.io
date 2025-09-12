---
title: Docker Prometheus
tags: ['docker', 'docker-compose']
---


## File Structure
```text
infrastructure
└── monitor
    ├── docker-compose.yml
    └── prometheus
        ├── config
        │   ├── prometheus.yml
        │   └── query-log.log
        └── prometheus-volume (Directory)
```


## Basic Prometheus
```yml
networks:  
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
```


## +MySQL Exporter
MySQL에 데이터 수집용 계정 생성 및 권한 추가합니다. 사전에 MySQL 컨테이너를 띄워져있어야 합니다.([Docker MySQL](Docker/100_DockerMySQL.md))

```sql
CREATE USER 'exporter'@'%' IDENTIFIED BY 'password';  
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';  
FLUSH PRIVILEGES;
```

```yml {2-3,24-37}
networks:  
  mysql-net:  
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
```


## +Redis Exporter
[Docker Redis Sentinel](Docker/104_DockerRedisSentinel.md)

```yml {4-5,41-54}
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
```


## prometheus.yml
```yml
global:  
  scrape_interval: 5s  
  scrape_timeout: 2s  
  evaluation_interval: 2m  
  external_labels:  
    monitor: 'performance monitor'  
  query_log_file: query-log.log  
  
scrape_configs:  
  - job_name: 'prometheus'  
    static_configs:  
      - targets: [ 'localhost:9090' ]  
        labels:  
          service: 'prometheus'  
    metrics_path: '/metrics'  
    honor_labels: false  
    scheme: 'http'  
  
  - job_name: 'mysql'  
    static_configs:  
      - targets: [ 'mysql-exporter:9104' ]  
        labels:  
          service: 'mysql'  
    metrics_path: '/metrics'  
    honor_labels: false  
    scheme: 'http'  
  
  - job_name: 'redis'  
    static_configs:  
      - targets:  
          - redis://sentinel1:26379  
          - redis://sentinel2:26379  
          - redis://sentinel3:26379  
          - redis://redis-master:6379  
          - redis://redis-slave1:6379  
          - redis://redis-slave2:6379  
    metrics_path: /scrape  
    relabel_configs:  
      - source_labels: [ __address__ ]  
        target_label: __param_target  
      - source_labels: [ __param_target ]  
        target_label: instance  
      - target_label: __address__  
        replacement: redis-exporter:9121  
  
  - job_name: 'redis-exporter'  
    static_configs:  
      - targets:  
          - redis-exporter:9121
```


## Reference
[Dockerhub Prometheus](https://hub.docker.com/r/prom/prometheus)

[Github MySQL Exporter](https://github.com/prometheus/mysqld_exporter)

[Dockerhub MySQL Exporter](https://hub.docker.com/r/prom/mysqld-exporter/)

[Github Redis Exporter](https://github.com/oliver006/redis_exporter?tab=readme-ov-file)

[Dockerhub Redis Exporter](https://hub.docker.com/r/oliver006/redis_exporter)

[Redis-Exporter를 통한 모니터링](https://kkang-joo.tistory.com/126)

[Prometheus, Grafana 오픈소스로 Redis 모니터링하기](https://lsdiary.tistory.com/97)
