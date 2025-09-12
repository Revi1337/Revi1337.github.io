---
title: Docker MySQL
tags: ['docker', 'docker-compose']
---


## File Structure
```text
infrastructure
└── mysql
    ├── data
    └── docker-compose.yml
```


## Docker Command Line
```bash
docker run -d --name mysql -p 3306:3306 -e MYSQL_DATABASE=test-database -e MYSQL_USER=revi1337 -e MYSQL_PASSWORD=1337 -e MYSQL_ROOT_PASSWORD=1234 -v ./data:/var/lib/mysql mysql:8-oracle --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```


## Docker Compose
```yml
networks:  
  mysql-net:  
    name: mysql-net  
  
services:  
  mysql:  
    image: mysql:8-oracle  
    container_name: mysql  
    ports:  
      - '3306:3306'  
    command:  
      - --character-set-server=utf8mb4  
      - --collation-server=utf8mb4_unicode_ci  
    environment:  
      MYSQL_DATABASE: test-database  
      MYSQL_USER: revi1337  
      MYSQL_PASSWORD: 1337  
      MYSQL_ROOT_PASSWORD: 1234  
    volumes:  
      - ./data:/var/lib/mysql  
    networks:  
      - mysql-net  
    healthcheck:  
      test: [ "CMD", "mysqladmin", "ping", "-h", "localhost" ]  
      timeout: 20s  
      retries: 10  
    restart: always
```

```bash
docker-compose up -d
```


## Connect MySQL
```bash
mysql -h 127.0.0.1 -P 3306 -urevi1337 -p
```


## Reference
[DockerHub MySQL](https://hub.docker.com/_/mysql)

