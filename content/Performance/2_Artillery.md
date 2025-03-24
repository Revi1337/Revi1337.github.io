---
title: Artillery
tags: ['performance', 'artillery']
---

## 들어가며
[Artillery](https://www.artillery.io/docs/get-started/get-artillery) 는 간단하게 서버의 스트레스 테스트를 해볼 수 있는 간단한 도구입니다. 해당 도구를 통해 애플리케이션에 부하를 주어 어디서 병목이 발생하는지. 혹은 서버가 어디까지 버틸 수 있는지 확인해볼 수 있습니다.


## Artillery 설치
Artillery설치를 위해서는 node가 깔려있어야 합니다. node를 받은 후, 설치하고자하는 Artillery버전을 `npm i -g` 로 받습니다. 저는 가장 최근 버전을 설치하였습니다.

```bash
$npm i -g artillery@latest
```


## YAML 작성
기본적인 스트레스 테스트를 위해 `YAML`에 테스트해보려는 API에 대한 정보를 작성해주어야 합니다. 각 필드에 대한 정보는 아래 스크립트에 명시하겠습니다. 뿐만 아니라 scenarios 섹션에서 `weights` 옵션을 통해 시나리오별 요청 비율을 조절할 수 있습니다. 자세한 내용은 [Scenario Weights](https://www.artillery.io/docs/reference/test-script#scenario-weights) 를 참고하시면 됩니다.


```yaml
config:  
  target: 'http://localhost:8080'               # (Required) Stress Test 를 진행할 host 정보를 기입  
  phases:                                       # (Required) 가상 사용자를 만드는 방법을 정의한다.  
    - name: Warm up                             # (Optional) 가상 사용자의 이름을 명시.  
      duration: 30                              # (Required) 30초 동안 매초마다  
      arrivalRate: 3                            # (Required) 3개의 요청을 보낸다.  
  
    - name: Ramp up load                        # (Optional) 부하를 점점 올려간다는 이름  
      duration: 30  
      arrivalRate: 3  
      rampTo: 30                                # (Optional) 매초마다 3개의 요청을 보내다가 보내는 요청을 수를 최대 30 까지 늘려간다.  
  
    - name: Sustained load                      # (Optional) 부하를 유지한다는 이름  
      duration: 60  
      arrivalRate: 30  
  
    - name: End of load                         # (Optional) 부하를 점점 줄여간다는 이름  
      duration: 30  
      arrivalRate: 30  
      rampTo: 10                                # (Optional) 매초마다 보내는 요청을 수를 30 에서 10 까지 줄여간다.  
  
scenarios:                                      # (Required) 한 가상 사용자가 어떤 순서대로 요청을 해나갈건지에 대한 시나리오들을 정의  
  - name: "login and use some functions"        # (Optional) 시나리오 1의 이름  
    flow:                                       # (Required) 시나리오의 흐름을 정의  
      - post:                                   # 1. (Required) POST 로  
          url: "/login"                         #    (Required) /login 에 요청을 날리고  
      - get:                                    # 2. GET 으로 /some-function-one 에 요청을 날리고  
          url: "/some-function-one"  
      - get:                                    # 3. GET 으로 /some-function-two 에 요청을 날리고  
          url: "/some-function-two"  
  
  - name: "just login"                          # 여러개의 시나리오를 설정할 수 있다.  
    flow:  
      - post:  
          url: "/login"
```


## CSV 파일 데이터 사용
[Loading Data From CSV Files](https://www.artillery.io/docs/reference/test-script#payload---loading-data-from-csv-files) 

### URL 에 QueryString
Artillery에서는 CSV파일로부터 데이터를 읽어와 YAML에 값을 넣어줄 수 있습니다.  읽어온 CSV데이터를 통해서 일반적인 `QueryString` 을 만들어서 요청을 보낼 수 있습니다.

> 템플릿 문자인 {{ }} 를 사용합니다.

```yaml
config:  
  target: 'http://localhost:8080'  
  phases:  
    - name: Warm up  
      duration: 30  
      arrivalRate: 3  
  payload:                                          # (Optional) CSV 데이터를 읽어올 수 있게 하는 설정.  
    path: "id-password.csv"                         # (Required) 현재 YAML 스크립트가 존재하는 경로에서 id-password.csv 파일을 읽어온다.  
    delimiter: ","                                  # (Optional) csv 파일에서 필드를 쪼갤 구분자를 명시한다. (default 는 ,)    
    fields:                                         # (Required) 구분자로 쪼개진 필드들의 이름을 설정한다.  
      - "id"  
      - "password"  
  
scenarios:  
  - name: "just login"  
    flow:  
      - get:  
          url: "/login-with-id-password-parameter?id={{ id }}&password={{ password }}"
```


### Http Body 에 JSON
또는 읽어온 CSV데이터를 `HTTP Body` 에 `JSON` 을 실어서 요청을 보내줄수도 있습니다. 

```yaml
config:  
  target: 'http://localhost:8080'  
  phases:  
    - name: Warm up  
      duration: 30  
      arrivalRate: 3  
  payload:                                          # (Optional) CSV 데이터를 읽어올 수 있게 하는 설정.  
    path: "id-password.csv"                         # (Required) 현재 YAML 스크립트가 존재하는 경로에서 id-password.csv 파일을 읽어온다.  
    delimiter: ","                                  # (Optional) csv 파일에서 필드를 쪼갤 구분자를 명시한다. (default 는 ,)    fields:                                         # (Required) 구분자로 쪼개진 필드들의 이름을 설정한다.  
      - "id"  
      - "password"  
  
scenarios:  
  - name: "just login"  
    flow:  
      - post:  
          url: "/login-with-id-password"  
          json:  
            id: "{{ id }}"                          # id 필드를 이용하여 JSON 필드를 추가한다. ({{}} 사용)  
            password: "{{ password }}"              # password 필드를 이용하여 JSON 필드를 추가한다. ({{}} 사용)
```


## Response 정보 캡처
 이전 요청에 대한 응답의 특정 정보를 capture 해서 사용할 수 있습니다. 대표적으로 `JSON` 과 `Header` 를 캡처하여 다음 요청에 재사용할 수 있습니다. 보다 자세한 내용은 [Response Request Chaining](https://www.artillery.io/docs/reference/engines/http#extracting-and-re-using-parts-of-a-response-request-chaining) 을 보시기 바랍니다.

```yml
# 위의 내용은 생략
scenarios:  
  - name: 'Fetch Cached Collection Announces'  
    flow:  
      - post:  
          url: '/api/auth/login'  
          json:  
            email: "andong@fuck.com"  
            password: "12345!@asa"  
          capture:  
            json: '$.accessToken.value' # JSON Path 중 accessToken.value 를 캡쳐해서  
            as: 'accessToken'  
      - get:  
          url: '/api/crews/1/announces'  
          headers:  
            Authorization: 'Bearer {{ accessToken }}' # 여기서 재활용 가능        
```


## 테스트 시작
기본적인 스트레스 테스트는 다음과 같은 커맨드로 실행할 수 있습니다.

```bash
artillery run test-config.yaml
```


테스트를 모두 마치면, 프롬프트에 다음과 같은 결과가 출력되게 됩니다.

> 버전이 낮으면 해당 결과와 다르고, 더 짧게 출력됩니다.

```
http.codes.200: ................................................................ 10000
http.downloaded_bytes: ......................................................... 23390000
http.request_rate: ............................................................. 609/sec
http.requests: ................................................................. 10000
http.response_time:
  min: ......................................................................... 3
  max: ......................................................................... 994
  mean: ........................................................................ 86
  median: ...................................................................... 49.9
  p95: ......................................................................... 284.3
  p99: ......................................................................... 441.5
http.response_time.2xx:
  min: ......................................................................... 3
  max: ......................................................................... 994
  mean: ........................................................................ 86
  median: ...................................................................... 49.9
  p95: ......................................................................... 284.3
  p99: ......................................................................... 441.5
http.responses: ................................................................ 10000
vusers.completed: .............................................................. 10000
vusers.created: ................................................................ 10000
vusers.created_by_name.Fetch Crew Main: ........................................ 10000
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 3.8
  max: ......................................................................... 997.2
  mean: ........................................................................ 94.4
  median: ...................................................................... 59.7
  p95: ......................................................................... 295.9
  p99: ......................................................................... 450.4

```


###  결과 의미
출력된 결과에서 각 필드가 의미하는 내용은 다음과 같습니다.

#### 전체 결과 요약
`http.requests: 10000`
- 전체 테스트 동안 10000개의 HTTP 요청이 발생한것을 의미합니다.

`http.codes.200: 10000`
- HTTP 응답 코드 중 200 OK 응답이 10,000번 발생한것을 의미합니다. 
- http.requests 에서 10000개의 요청이 발생헀으므로 모든 요청이 정상 처리되었음을 의미합니다.

`http.request_rate: 1005/sec`
- 초당 평균 약 1005개의 요청을 처리했다는 뜻입니다. 해당 수치가 높을수록 서버의 처리량(Throughput) 이 좋다는 것을 의미합니다.

`http.downloaded_bytes: 23390000`
- 전체 요청. 즉 10000개의 요청을 통해 총 `23390000 바이트(약 23MB)` 가 다운로드된 것을 의미합니다.
- 보통 API 에서 반환하는 JSON, 이미지 등과 같은 총 용량을 합친것을 말합니다.


#### 응답에 걸린 시간 요약
`http.response_time` 하위 필드들은 `서버로부터 응답이 오기까지 걸린 시간에 대한 통계`를 보여줍니다.

| 필드           | 의미                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| `min: 2`     | 가장 빠른 응답 시간                                                                                          |
| `max: 828`   | 가장 느린 응답 시간                                                                                          |
| `mean: 24.3` | 전체 평균 응답 시간 (모든 응답시간을 더한 뒤, 개수로 나눈 값 == 하나의 응답이 극단적으로 느리면 평균이 확 올라감)                                 |
| `median: 7`  | 응답 시간의 `중앙값` --> 절반은 7ms 이내에 처리됨 (응답 시간시간들을 크기순으로 정렬했을 때 가운데 있는 값 == 하나의 응답이 극단적으로 느려도 영향을 크게 받지 않음) |
| `p95: 127.8` | 95%의 요청이 127.8ms 이내에 처리됨                                                                             |
| `p99: 368.8` | 99%의 요청이 368.8ms 이내에 처리됨.                                                                            |

#### 상태코드 별 요약
`http.response_time.2xx` 하위 필드는 `200` 번대 상태코드들에 대한 통계를 보여줍니다. 서버로부터 `200`, `500` 번대 응답이 모두 왔다면, 두개의 `http.response_time.5xx` 통계도 보여주게 됩니다.

> http.response_time 와 동일한 필드들이 제공됩니다. 따라서 넘기도록 하겠습니다.


#### 가상 사용자 요약
`vusers.created: 10000`
- 전체 테스트에서 생성된 가상 유저의 수를 의미합니다.
- 여기선 10000명의 유저가 요청을 보낸 것처럼 시뮬레이션한 것과 동일한 효과입니다.

`vusers.completed: 10000`
- 가상 유저(virtual user)가 성공적으로 작업을 완료한 횟수를 의미합니다.
- 테스트 중 실패 없이 모두 완료된 것을 보여줍니다.

`vusers.created_by_name.Fetch Crew Main: 10000`
- yml 에 작성한 `Fetch Crew Main`이라는 scenarios.name 로부터 만들어진 요청이라는 것을 의미합니다.
- 시나리오 별로 통계가 따로 나올 수 있습니다.

`vusers.failed: 0`
- 실패한 가상 유저가 없다는 것을 의미합니다.

`vusers.session_length:` 하위 필드는 각 가상 유저의 전체 세션 처리 시간에 대한 통계를 보여줍니다.

| 필드            | 의미                    |
| ------------- | --------------------- |
| `min: 3`      | 가장 짧은 세션 시간 (ms)      |
| `max: 838.8`  | 가장 긴 세션 시간            |
| `mean: 28`    | 평균 세션 시간              |
| `median: 8.9` | 세션 시간의 중앙값            |
| `p95: 149.9`  | 95%의 세션이 이 시간 이내에 완료됨 |
| `p99: 383.8`  | 99%의 세션이 이 시간 이내에 완료됨 |


## 결과를 JSON 으로 변환
아래의 커맨드로 성능 테스트를 실행함과 동시에 테스트 결과를 JSON형태의 Report로 만들어줄 수 있습니다.

```bash
artillery run --output report.json test.yaml
```


> 원래 JSON파일을 이용하여 HTML형태의 그래프로 만들어줄 수 있었습니다. 하지만 Artillery 버전이 올라가면서 Deprecated 되었고, 현재는 Artillery Cloud 를 이용하여 테스트에 대한 그래프를 확인할 수 있습니다. Artillery Cloud 에 대한 사용법은 [Create API KEY & Configure the CLI to send data to Artillery Cloud](https://www.artillery.io/docs/get-started/artillery-cloud#configure-the-cli-to-send-data-to-artillery-cloud) 에서 확인할 수 있습니다.


## 마치며
지금까지 Artillery 에서 자주 사용되는 것들만 적어보았는데, 많은 도움이 됬으면 하는 바램입니다.
