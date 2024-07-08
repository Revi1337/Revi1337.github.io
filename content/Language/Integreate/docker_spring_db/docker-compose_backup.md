------------------------------------ 백업 ---------------------------------
```yml
version: "3.8"  
  
services:  
  local-db:  
    image: mysql:8-oracle  
    environment:  
      MYSQL_DATABASE: docker_build  
      MYSQL_ROOT_PASSWORD: 1234  
    ports:  
      - "9908:3306"
```


```yml
# ./docker-compose.yml
version: "3.8"  
  
services:  
  database:  
    image: mysql:8-oracle  
    container_name: spring_database  
    restart: always  
    expose:  
      - 3306  
    ports:  
      - "9908:3306"  
    command:  
      - '--character-set-server=utf8mb4'  
      - '--collation-server=utf8mb4_unicode_ci'  
    environment:  
      MYSQL_USER: revi1337  
      MYSQL_PASSWORD: 1337  
      MYSQL_ROOT_PASSWORD: 1234  
      MYSQL_DATABASE: docker_build  
  
  backend:  
    depends_on:  
      - database  
    build: .  
    container_name: spring_web  
    restart: always  
    expose:  
      - 8080  
    ports:  
      - "8080:8080"
```


```yml
# ./docker/docker-compose.yml
version: "3.8"  
  
services:  
  database:  
    image: mysql:8-oracle  
    container_name: spring_database  
    restart: always  
    expose:  
      - 3306  
    ports:  
      - "9908:3306"  
    command:  
      - --character-set-server=utf8mb4  
      - --collation-server=utf8mb4_unicode_ci  
    environment:  
      MYSQL_USER: revi1337  
      MYSQL_PASSWORD: 1337  
      MYSQL_ROOT_PASSWORD: 1234  
      MYSQL_DATABASE: docker_build  
  
  backend:  
    depends_on:  
      - database  
    build:  
      context: ../  
      dockerfile: ./docker/Dockerfile  
    container_name: spring_web  
    restart: always  
    expose:  
      - 8080  
    ports:  
      - "8080:8080"
```


------------------------------------ 메모 ---------------------------------


```yaml
# docker-compose.yml

services:
  mysql:
    image: mysql:8.0.33
    ports:
      - 43306:3306
    volumes:
      - ./db/mysql/data:/var/lib/mysql
      - ./db/mysql/init:/docker-entrypoint-initdb.d
    command:
      - '--character-set-server=utf8mb4'
      - '--collation-server=utf8mb4_unicode_ci'
    environment:
      MYSQL_ROOT_PASSWORD: password		# 구성활 MySQL의 root 비밀번호
      MYSQL_DATABASE: test				# 기본으로 생성할 database명
```


https://velog.io/@skynet/Dockerfile%EC%97%90-%EB%B6%80%EB%AA%A8-%EB%94%94%EB%A0%89%ED%86%A0%EB%A6%AC%EC%9D%98-%ED%8C%8C%EC%9D%BC%EC%9D%84-%EB%B3%B5%EC%82%AC-%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95#%ED%95%B4%EA%B2%B0-%EB%B0%A9%EB%B2%95

