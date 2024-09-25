---
title: Prometheus
tags: ['spring-boot', 'prometheus', 'actuator', 'micrometer']
---

## Prometheus
프로메테우스는 `Metric 정보를 저장하고 관리하는 도구 중 하나` 이며 `Metric 을 수집하고 보관하는 DB` 이다. 오픈소스로 운영되며 애플리케이션의 성능 및 상태 모니터링을 제공한다.

1. 프로메테우스를 사용하려면 애플리케이션의 `Metric 정보를 수집할 수 있도록 연동`해야한다.
2. 프로메테우스를 설치하고 설정해야 한다.

### 구성요소
프로메테우스는 크게 5 가지 구성요소로 이루어져 있다. 이중 `대부분은 선택사항`이다.

1. **Prometheus 서버**
	- Prometheus 시스템의 핵심이며, 주로 Metric 데이터의 수집, 저장, 쿼리를 담당한다.
    - Metric 데이터를 `Pull 방식`으로 다양한 타겟에서 주기적으로 가져온다.
    - 데이터를 `시계열 데이터베이스`(TSDB)에 저장한다.
    - `PromQL(Prometheus Query Language)`을 사용해 쿼리할 수 있으며, 대시보드나 시각화 도구에 데이터를 제공한다.
2. **Node Exporter**
	- 각 서버나 노드의 시스템 Metric 을 수집하여 Prometheus 서버에 제공한다.
	- CPU, 메모리, 디스크 사용량 등 하드웨어 및 OS Metric 을 노출한다.
	-  `node-exporter` 가 대표적인 예시이고 여러 유형의 Exporter가 존재한다.
3. **Alertmanager**
	- Prometheus 에서 수집된 Metric 기반으로 `경고(Alert)를 관리`한다.
	- 특정 조건이 충족되었을 때 경고를 발생시킨다.
	- Email, Slack, PagerDuty 등으로 경고 알림을 전송할 수 있다.
	- 여러 알림을 그룹화하거나, 지연시키는 등의 제어를 할 수 있다.
4. **Pushgateway**
	- `Push 방식`으로 Metric 데이터를 Prometheus 서버에 전달한다.
	- 주로 배치작업(Batch Jobs)이나 단기 작업에서 Metric 을 전송할 때 사용한다.
	- Pull 방식이 아닌 Push 방식이 필요할 때 유용하다.
5. **Client Libraries**
	- 애플리케이션 자체에서 Metric 을 생성하고 노출하기 위한 라이브러리이다.
	- Prometheus 서버가 애플리케이션의 성능 Metric 을 수집할 수 있도록 도와준다.
	- Go, Java, Python, Ruby 등 다양한 프로그래밍 언어를 지원한다.

## 애플리케이션 설정
프로메테우스가 애플리케이션의 Metric 정보들을 가져가려면 프로메테우스가 사용하는 Format 에 맞추어 Metric 을 만들어야 한다. 하지만 프로메테우스는 JSON 포맷을 이해하지 못하기 때문에 아래의 `마이크로미터 프로메테우스` 의존성을 설치해주어야 한다. 해당 의존성을 설치해주면 `마이크로미터` 의 구현체인 `마이크로미터 프로메테우스` 구현체가 프로메테우스가 사용하는 Metric 포맷으로 해석해준다.

```groovy
implementation 'io.micrometer:micrometer-registry-prometheus'
```

### 마이크로미터란
마이크로미터(Micrometer)는 다양한 모니터링 시스템과 애플리케이션 성능 메트릭을 통합할 수 있는 `애플리케이션 계측 라이브러리` 이다. 마이크로미터는 애플리케이션의 성능을 추적하고 메트릭을 기록하는데 중요한 역할을 한다.  스프링부트 엑츄에이터는 마이크로미터를 기본으로 내장해서 사용하고있다.

마이크로미터는 애플리케이션의 Metric 정보 수집 방법을 추상화시켜 제공한다. 따라서 마이크로미터의 구현체만 바꿔주면, 기존 모니터링 툴이 프로메테우스가 아닌 JMX 로 바뀌어도 기존 코드의 변경 없이 모니터링 툴을 바꿀 수 있다.

![](Spring/Boot/images/Pasted%20image%2020240911233656.png)


해당 의존성을 추가해주고 애플리케이션을 재시작해주면 엑츄에이터에  `/actuator/prometheus` 라는 새로운 endpoint 가 추가된 것을 알 수 있다. 해당 엔드포인트에서 노출되는 정보가 프로메테우스가 알아먹을 수 있는 포맷이다.

```bash
revi1337@B3-B35T SpringBoot % curl -s 'localhost:8081/actuator/prometheus' | head -10 
# HELP application_ready_time_seconds Time taken for the application to be ready to service requests
# TYPE application_ready_time_seconds gauge
application_ready_time_seconds{main_application_class="revi1337.springboot.Application"} 1.463
# HELP application_started_time_seconds Time taken to start the application
# TYPE application_started_time_seconds gauge
application_started_time_seconds{main_application_class="revi1337.springboot.Application"} 1.458
# HELP disk_free_bytes Usable space for path
# TYPE disk_free_bytes gauge
disk_free_bytes{path="/Users/revi1337/Desktop/workspace/SpringBoot/."} 9.0128226304E11
# HELP disk_total_bytes Total space for path
... 생략
```


## Docker Prometheus
이제 프로메테우스가 `/actuator/prometheus` 에 노출되는 정보들을 수집해가도록 해야한다. 하지만 그러려면 프로메테우스를 [설치](https://prometheus.io/download/) 해야 한다. 해당 글에서는 보다 쉬운 배포와 유연성을 위해 Docker 의 docker-compose 를 사용한다. 참고로 프로메테우스의 디폴트 포트는 `9090` 이다

### docker-compose.yml 작성
프로젝트의 루트에 docker-compose.yml 을 아래와 같이 작성해준다. 후에 작성할 `prometheus.yml` 을 위해 로컬의 `./prometheus/config` 와 컨테이너 내부의 `/etc/prometheus`, 그리고 로컬의 `./prometheus/prometheus-volume` 와 컨테이너 내부의 `/probetheus` 주소를 마운트시켜 파일들을 동기화시켜준다.

> [!note]
> docker-compose.yml 이 있는 경로가 기준이다. ./prometheus/config 와 ./prometheus/prometheus-volume 디렉터리는 미리 만들어놔야하며, 이 폴더들에 쓰기 권한이 있는지 학인해야 한다.

```yml
version: "3.7"  
  
networks:  
  monitor-network:  
    driver: bridge  
  
services:  
  prometheus:  
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
```

### prometheus.yml 작성
이제  로컬의 `prometheus/config` 위치에 `prometheus.yml` 파일을 아래와 같이 작성해준다.

```yml
global:  
  scrape_interval: 10s  
  scrape_timeout: 10s  
  evaluation_interval: 2m  
  external_labels:  
    monitor: 'spring performance monitor'  
  query_log_file: query-log.log  
  
rule_files:                                   # 규칙을 로딩하고 'evaluation_interval' 설정에 따라 정기적으로 평가  
  - "rule1.yml"                               # 파일위치는 prometheus.yml 이 있는 곳과 동일 위치  
  - "rule2.yml"                               # 여러개 가능  
  
alerting:  
  alertmanagers:  
    - static_configs:  
        - targets:  
#            - alertmanager:9093  
  
scrape_configs:  
  - job_name: 'prometheus'  
    static_configs:  
      - targets: [ 'localhost:9090' ]         # Optional : Prometheus 서버 자체의 상태와 성능을 모니터링하기 위해 자기 자신의 주소기입 (안해도 되지만 모니터링 서버 자체의 상태 체크를 위해 하는것이 남)
  
  - job_name: 'spring-actuator'               # 수집하는 이름. (마음대로 설정)  
    metrics_path: '/actuator/prometheus'      # Metric 정보를 수집할 경로를 작성  
    scrape_interval: 1s                       # Metric 정보를 수집할 주기를 설정  
    scrape_timeout: 1s                        # 수집할떄 응답을 기다리는 최대 시간 설정  
    honor_labels: false                       # Optional : 라벨 충돌이 있을경우 라벨을 변경할지 설정 (default = false)    honor_timestamps: false                   # Optional : honor_labels 이 true 일 경우, metrics timestamp 가 노출됨 (true 일경우), (default = false)  
    scheme: 'http'                            # Optional : request 를 보낼 scheme 설정 (default = http)    params:                                   # Optional : request 요청 보낼 때 같이 보낼 param      test-param: [ 'first-param' ]  
    static_configs:                           # 실제 scrap 하는 타겟에 관한 설정  
      - targets: [ 'host.docker.internal:8081' ]         # scrap 하는 타겟에 대한 baseURL 들을 설정  
        labels:                                          # Optional : scrap 해서 가져올 metrics 들 전부에게 붙여줄 라벨  
          service: 'monitor-1'
```

### 연동 확인
이제 `docker-compose up -d` 를 실행해 프로메테우스를 백그라운드에서 실행해준 후, `localhost:9090/config` 에 들어가보면 yml 에서 작성한 설정들이 그대로 나와있는 것을 확인할 수 있다.

![](Spring/Boot/images/Pasted%20image%2020240912012040.png)


또한 `localhost:9090/targets` 에 노출되는 `job_name` 들이 모두 UP 이면, 정상적으로 프로메테우스가 애플리케이션에서 내보내는 Metric 정보들을 잘 수집하고있다는 것이다.

![](Spring/Boot/images/Pasted%20image%2020240912012801.png)

### Metric 검색
#### JVM 메트릭
프로메테우스 메인페이지에서 `/actuator/metrics` 에 노출된 Metric 이름을 검색해보면, `/actuator/prometheus` 에 노출되었던  프로메테우스 포멧의 Metric 정보가 노출되는 것을 확인할 수 있다.

> [!note]
> 원래 /actuator/metrics 에서 노출되는 jvm 정보는 jvm.info 이다. 프로메테우스 포맷으로 변경될때, . 가 _ 로 변환되기 때문에 프로메테우스에서 Metric 을 검색할때는 jvm_info 로 검색해야 한다.

![](Spring/Boot/images/Pasted%20image%2020240912013028.png)

#### Request 메트릭
`http_server_requests_seconds_count` 를 검색하면 HTTP 서버에서 받은 요청의 수를 초 단위로 카운트한 정보를 볼 수 있다.  오른쪽에 보이는 숫자가 해당 요청이 몇번 왔는지 카운트된 숫자이다. (Metric 값)

> [!note]
> error, exception, instance, job 등을 Label(레이블) 이라 부른다. 마이크로미터에서는 이것을 Tag 라 부르는데 레이블, 태그 둘다 Metric 정보를 구분하기 위해 사용되는 용어이다.

![](Spring/Boot/images/Pasted%20image%2020240913235048.png)

## 기본기능
### 그래프
기본적으로 그래프를 확인할 수 있다. 맨 밑에 Metric 을 클릭하면 해당 Metric 에 대한 그래프를 볼 수 있다. 아래사진은 `최근 15분` 동안 `/log` 요청에 대한 그래프를 확인한 것이다.

![](Spring/Boot/images/Pasted%20image%2020240914000725.png)


신기한것은 현재시간 뿐만 아니라 과거로 돌아간 시점의 값도 확인 가능하다. 아래 사진은 현재시간을 기준으로 한 `log` 요청 그래프이다.

![](Spring/Boot/images/Pasted%20image%2020240914001338.png)


5분전으로만 되돌려도 `log` 요청에 대한 그래프가 변동이 오지않은 것을 볼 수 있다.

![](Spring/Boot/images/Pasted%20image%2020240914001802.png)

### 필터
프로메테우스에서는 Label 을 기준으로 필터를 사용수 있다. 필터는 `{}` 문법을 사용한다.

#### = 연산자
`=` 는 제공된 문자열과 정확히 동일한 레이블 선택한다.
- http_server_requests_seconds_count{uri="/log", method="GET"}
- URI 가 /log 이고, Http Method 가 GET 인 조건으로 필터링

![](Spring/Boot/images/Pasted%20image%2020240914003222.png)

#### != 연산자
`!=` 는 제공된 문자열과 같지 않은 레이블 선택한다.
- http_server_requests_seconds_count{uri!="/actuator/prometheus"}
- URI 가 /actuator/prometheus 가 아닌 조건으로 필터링

![](Spring/Boot/images/Pasted%20image%2020240914003241.png)

#### =~ 연산자
`=~` 는 제공된 문자열과 정규식 일치하는 레이블 선택한다.
- http_server_requests_seconds_count{method=~"GET|POST"}
- Http Method 가 GET 혹은(정규식) POST 인 경우를 조건으로 필터링

고의적으로 허용되지 않는 DELETE 메서드를 사용해 405 를 내면 아래와 같이 프로메테우스에 `DELETE`  메서드에 대한 로그가 남게 된다.

```bash
revi1337@B3-B35T SpringBoot % curl -X DELETE localhost:8081/log -s      
{"timestamp":"2024-09-13T15:36:52.099+00:00","status":405,"error":"Method Not Allowed","path":"/log"}
```

![](Spring/Boot/images/Pasted%20image%2020240914003756.png)


method 레이블에 대해 필터링을 걸면 DELETE 요청이 필터링되어 사라지게 된다.

![](Spring/Boot/images/Pasted%20image%2020240914003923.png)

#### !~ 연산자
`!~` 는 제공된 문자열과 정규식 일치하지 않는 레이블 선택한다.
- http_server_requests_seconds_count{uri!~"/actuator.*"}
- /actuator 로 시작하는 URI 를 제외한 조건으로 필터링

![](Spring/Boot/images/Pasted%20image%2020240914003344.png)

### 연산자 쿼리와 함수
#### sum
`sum` 은 노출된 Value 들을 모두 합하는 것이다. 각 정보들에 대한 개수가 아래와 같이 51,  2, 1 이라면

![](Spring/Boot/images/Pasted%20image%2020240914005823.png)


이들을 sum() 한것은 54 가 된다.

![](Spring/Boot/images/Pasted%20image%2020240914005857.png)

#### sum by
`sum by` 는 SQL 의 Group By 와 비슷하다. `method, status` 를 하나로 그룹지어 통계를 낼 수 있다.

![](Spring/Boot/images/Pasted%20image%2020240914010013.png)
#### count
`count` 는 Value 와 관련있는 것이 아니라, `row 가 몇개 존재`하는지 나타내는 함수이다. count 를 실행하기 전 결과가 아래와 같다면 

![](Spring/Boot/images/Pasted%20image%2020240914010221.png)


row 가 3 개 존재하기 때문에 결과는 3 이 나오게 된다.

![](Spring/Boot/images/Pasted%20image%2020240914010252.png)
#### topk
`topk` 는 SQL 의 `Order by COLUMN DESC LIMIT N` 과 비슷하다. 한마디로 상위 N 개를 볼 수 있다. 아래 예시는 Top 2개를 가져온 것이다.

![](Spring/Boot/images/Pasted%20image%2020240914010432.png)

#### 오프셋
`offset (N)s,m,h`  은 현재를 기준으로 특정 과거 시점의 데이터를 반환하는 함수이다. 현재 시간을 기준으로 한 데이터가 아래와 같다면

![](Spring/Boot/images/Pasted%20image%2020240914010806.png)


30 분 전의 데이터는 아래와 같이 Value 가 많이 줄어드는 것을 볼 수 있다.

![](Spring/Boot/images/Pasted%20image%2020240914010848.png)

#### 범위 벡터 선택
`http_server_requests_seconds_count[1m]` 마지막에 `[1m]` , `[60s]` 와 같이 표현한다. 지난 1분간의 모든 기록값을 풀어서 보여준다. **참고로 범위 벡터 선택기는 데이터로는 확인할 수 있지만 차트에 바로 표현할 수 없다.**  범위 벡터 선택의 결과를 차트에 표 현하기 위해서는 `약간의 가공(게이지와 카운터)이 필요`하다. (사실 아직까진 이게 무슨용도인지 잘 모르겠다..)

![](Spring/Boot/images/Pasted%20image%2020240914011532.png)


## 게이지와 카운터
Metric 은 크게 `게이지` 와 `카운터` 2가지로 분류할 수 있다.

### 게이지
게이지(Guage)는 임의로 `오르내릴 수 있는 값`을 의미한다. 예를 들어 CPU 사용량, 메모리 사용량, 사용중인 커넥션 등이 있다.

**CPU 사용량**
![](Spring/Boot/images/Pasted%20image%2020240914013703.png)

### 카운터
카운터 (Counter)는 `단순하게 증가하는 단일 누적 값`을 의미한다. 예를 들어 HTTP 요청 수, 로그 발생 수 등이 있다.

**누적 HTTP 요청 수**
![](Spring/Boot/images/Pasted%20image%2020240914013817.png)

#### 카운터의 문제
`http_server_requests_seconds_count` 와 같은 카운터는 `계속 증가하는 그래프만` 보게 된다. 따라서 특정 시간에 얼마나 고객의 요청이 들어왔는지 한눈에 알기 매우 어렵다. 아래와 같이 일정 시간 텀을 두고 100 개의 요청을 보내보면

```bash
revi1337@B3-B35T SpringBoot % for i in $(seq 1 100); do curl -s localhost:8081/log; done 
revi1337@B3-B35T SpringBoot % for i in $(seq 1 100); do curl -s localhost:8081/log; done
revi1337@B3-B35T SpringBoot % for i in $(seq 1 100); do curl -s localhost:8081/log; done
revi1337@B3-B35T SpringBoot % for i in $(seq 1 100); do curl -s localhost:8081/log; done
```


아래와 같이 증가하는 그래프만 보게 된다. 프로메테우스에서는 이를 해결하기 위해 `increase()` 와 `rate()` 와 같은 함수를 제공한다.

![](Spring/Boot/images/Pasted%20image%2020240924234517.png)

#### increase()
increase 함수는 `지정한 시간 단위별`로 증가를 확인할 수 있다. 마지막에 `[시간]` 을 기입해서 `범위 벡터` 를 선택해야 한다. 아래 사진은 /log 엔드포인트에 대한 `분당 요청수`를 확인한 것이다. 잘 보면 특정한 시간대에 요청이 발생하지 않은 것을 확인할 수 있다.

> increase() 를 통해 누적된 값들만 볼 수 있었던 기존 카운터의 단점을 해결할 수 있다. increase 를 제외하고도 rate, irate 와 같은 함수가 있지만 이는 공식 문서를 참고하자.

![](Spring/Boot/images/Pasted%20image%2020240924235609.png)


## 공식문서
모르는게 있으면 공식문서를 참고하자.

- https://prometheus.io/docs/prometheus/latest/querying/basics/
- https://prometheus.io/docs/prometheus/latest/querying/operators/
- https://prometheus.io/docs/prometheus/latest/querying/functions/
