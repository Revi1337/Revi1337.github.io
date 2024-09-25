---
title: Grafana
tags: ['spring-boot', 'prometheus', 'actuator', 'micrometer', 'grafana']
---

## Grafana
Grafana는 주로 `모니터링 및 시각화를 위한 오픈 소스 도구`이다. 다양한 데이터 소스를 연결하여 실시간 대시보드를 만들고, 데이터를 시각화할 수 있다. Grafana는 서버, 애플리케이션, 네트워크 등 시스템 상태를 모니터링하는 데 많이 사용되며, 다양한 형태의 그래프, 차트, 경고 설정 등을 지원한다.

> 그라파나는 프로메테우스를 통해서 데이터를 시각화해서 보여주는 역할을 한다.

## Docker Grafana
해당 글에서는 보다 쉬운 배포와 유연성을 위해 Docker 의 docker-compose 를 사용한다. 참고로 그라파나 디폴트 포트는 `3000` 이다. docker-compose 스크립트는 아래와 같다.

> [!note]
> Grafana 는 프로메테우스에서 데이터를 조회해오기 때문에, 프로메테우스가 꼭 껴져있어야 한다.

```yml
version: "3.7"  
  
networks:  
  monitor-network:  
    driver: bridge  
  
services:  
  prometheus: # 프로메테우스
    image: prom/prometheus  
    container_name: prometheus  
    volumes:  
      - ./prometheus/config:/etc/prometheus  
      - ./prometheus/prometheus-volume:/prometheus  
    ports:  
      - "9090:9090"  
    command:  
      - '--storage.tsdb.path=/prometheus'  
      - '--config.file=/etc/prometheus/prometheus.yml'  
    restart: always  
    networks:  
      - monitor-network  
  
  grafana: # 그라파나
    image: grafana/grafana  
    container_name: grafana  
    ports:  
      - "3000:3000"  
    volumes:  
      - ./grafana:/var/lib/grafana  
      - ./grafana/provisioning/:/etc/grafana/provisioning/  
    restart: always  
    depends_on:  
      - prometheus  
    networks:  
      - monitor-network
```

## Prometheus 연동
localhost:3000 으로 접속하면 그라파나 로그인 페이지가 나온다. 특별한 설정을 하지 않았으면 초기 크리덴셜은 `admin:admin` 이다.

![](Spring/Boot/images/Pasted%20image%2020240925012532.png)


`Connections > Data sources` 로 들어가 Add data source 버튼이 있는데 그 버튼을 클릭해준다. 그럼 프로메테우스와 연동할 수 있는 버튼이 있을텐데 그 버튼을 눌러준다.

![](Spring/Boot/images/Pasted%20image%2020240925013002.png)


Connection 정보에 프로메테우스 주소(Docker Network 사용시 host.docker.internal)를 명시해주고 맨 밑에 하단 `Save & Test` 를 눌러서 프로메테우스와 연결되는지 확인한다. 성공적으로 연결되면 `Successfully queried the Prometheus API.` 가 뜨게 된다.

![](Spring/Boot/images/Pasted%20image%2020240925013245.png)


테스트 후, `Data sources` 창으로 넘어오면 프로메테우스가 추가되있는것을 확인할 수 있다.

![](Spring/Boot/images/Pasted%20image%2020240925013537.png)
