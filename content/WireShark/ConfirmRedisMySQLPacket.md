---
title: Redis & MySQL 패킷 확인
tags: ['network', 'wireshark', 'spring', 'redis', 'mysql', 'ssl/tls']
---


## 들어가며
여러분은 MySQL 과 Redis 의 패킷이 어떻게 생겨먹었나 궁금한적이 없으셨나요? 그래서 이번 포스팅에서는 MySQL 과 Redis 패킷을 간단하게 확인해보는 시간을 가져보려합니다. (졸업 후, 보안에서 개발로 진로를 변경하고 처음 Wireshark 를 켜보는데 익숙치가 않네요. )

> [!note] 해당 포스팅은 Spring & Docker(MySQL & Redis) 환경에서 진행하였습니다.


## 설정 확인
먼저, `Datasource`와 `Data Redis` 설정을 확인합니다. (Redis는 기본 설정을 사용하므로 별도의 설정이 필요하지 않습니다.)

```yml
spring:  
  datasource:  
    url: jdbc:mysql://127.0.0.1:3306/onsquad
    username: root  
    password: 1234  
    driver-class-name: com.mysql.cj.jdbc.Driver
```


## Wireshark 확인
이제 다음과 같은 curl 요청을 통해 MySQL 쿼리와 Redis 쿼리가 함께 나가는 API 를 찔러줍니다.

```bash
curl -H 'Authorization: Bearer <TOKEN>' 'http://localhost:8087/api/crews/1/announces/1'
```


요청을 찌르고 나면, Wireshark 에 `초록색` 과 같은 패킷이 보입니다. 해당 패킷에서 `dst port` 가 3306 인것을 보면, DB 에 쿼리를 날리는 쿼리라고 의심을 해볼 수 있습니다.

![](WireShark/images/Pasted%20image%2020250324175626.png)


### TLS 1.2
근데 뭔가 좀 이상합니다. dst port 가 `3306` 이어서 DB 쿼리와 관련된 패킷이라고 의심했는데, 막상 `Hex & ASCII dump` 창을 보니 어떠한 쿼리가 보이지 않는 것을 볼 수 있습니다. 마치 `패킷 내용이 암호화되어서 난독화` 된 것처럼 보입니다. 그 근거는 다음과 같습니다.

TLS 패킷은 `Content Type(TLS 레코드 타입), Version(TLS 버전), Length(암호화된 데이터의 길이), Payload(암호화된 데이터)` 로 이루어져 있습니다. 또한 각 필드는 다음과 같은 offset 과 크기를 갖습니다.

- Content Type : `offset 0 (1 Byte)` 
	- 20 (0x14): ChangeCipherSpec
	- 21 (0x15): Alert
	- 22 (0x16): Handshake
	- 23 (0x17): Application Data
- Version : `offset 1 ~ 2 (2 Byte)`
- Length : `offset 3 ~ 4 (2 Byte)`
- Payload : `offset 5 ~ n`

![](WireShark/images/Pasted%20image%2020250324181612.png)


따라서 실제 Data(Payload) 를 제외하고, 총 `5 Byte`  를 찾으면 패킷의 암호화된 내용이 어떤 레코드 타입인지, TLS 버전이 몇인지, 암호화된 데이터의 길이가 총 몇인지에 대한 정보를 알아낼 수 있습니다.

앞서 확인한 패킷의 `Hex & ASCII Dump` 를 확인해보면 `17 03 03 00 26 실제 데이터...` 형태를 갖고있는 것을 볼 수 있었습니다. 즉. 그 5Byte 가 의미하는것은 다음과 같습니다.

- Content Type : 0x17 (Application Data)
- Version : 0x03 0x03 (TLS 1.2)
- Length : 0x00 0x26 (38 Byte)

![](WireShark/images/Pasted%20image%2020250324184056.png)

>  TLS 프로토콜은 매우 중요하기 때문에 해당 내용은 따로 포스팅할 예정입니다.


### 암호화는 어디서..?
저희는 단순히 curl로 API를 호출하고, 그 과정에서 발생한 MySQL 쿼리의 패킷을 확인했을 뿐이었습니다. 그런데 놀랍게도, 해당 패킷의 내용이 암호화되어 있었죠. 그렇다면, 도대체 어디서 이 암호화가 이루어졌을까요?

정답은 Spring 에서 사용하는 SQL Driver 에 있습니다. `driver-class-name` 으로 명시한 MySQL Driver 는`datasource.url` 에 SSL 관련 설정이 따로 없어도 `기본적으로 SSL을 사용하도록 동작` 하게끔 설계되어 있습니다. 그래서 Spring 에서 SQL 과 통신 내용을 암호화하여 보내게 되는 원리이죠.

> 이번 포스팅은 Spring 을 중점적으로 다루진 않기 때문에 일단 넘어가겠습니다.

```yml
spring:  
  datasource:  
    url: jdbc:mysql://127.0.0.1:3306/onsquad
    username: root  
    password: 1234  
    driver-class-name: com.mysql.cj.jdbc.Driver
```


###  그래서 뭐 어떻게 해결하는데?
해결방법은 간단합니다. DataSource URL 에 SSL 관련 설정을 해제해주도록 작성해주면됩니다. 그러면 Spring 에서 사용하는 MySQL Driver 가 SQL 과 통신내용을 암호화하지 않고 평문으로 보내게 됩니다.

```yml
spring:  
  datasource:  
    url: jdbc:mysql://127.0.0.1:3306/onsquad?useSSL=false&enabledSSLCipherSuites=&requireSSL=false
    username: root  
    password: 1234  
    driver-class-name: com.mysql.cj.jdbc.Driver
```


## MySQL 쿼리 확인
이제 Wireshark 에서 다시 Packet Capture 를 해보면 패킷 내용. 즉 쿼리가 암호화 되지 않고, 평문으로 전송되는 것을 볼 수 있습니다. 여기서 중요한 것은 Query 를 보낼 때, `Request Query` 로 보낸다는 것입니다.

![](WireShark/images/Pasted%20image%2020250325003154.png)


그렇다면 MySQL 로부터 오는 Response 도 간단하게 확인해보겠습니다. `TABULAR Response` 는 결과 집합이 있는 쿼리 (주로 `SELECT`) 에 대한 응답을 의미합니다.

Hex & ASCII Dump 에 있는 여러개의 `def` 는 응답으로 내려온 각 Column 의 이름과 타입에 대한 정보를 나타냅니다. 즉, 응답으로 총 5개의 필드가 내려진것을 유추할 수 있습니다.

![](WireShark/images/Pasted%20image%2020250325005611.png)

> MySQL 프로토콜은 다음에 좀 깊게 다뤄보겠습니다.


## Redis 패킷 확인
이제 Redis 와 통신하는 패킷을 살펴보겠습니다. Redis는 `RESP(Redis Serialization Protocol)`을 사용하여 데이터를 주고받습니다. 예를 들어, `GET` 명령을 사용하여 데이터를 가져오는 경우, `GET` 타입이 사용된 패킷을 확인할 수 있습니다.

![](WireShark/images/Pasted%20image%2020250325010920.png)


이때, Response 는 `BulkString` 형식으로 반환됩니다. `BulkString` 은 Redis에서 사용하는 응답 형식 중 하나로, 요청한 서버에서 다양한 데이터 타입으로 응답할 수 있습니다. 그 중 하나가 바로 `BulkString` 입니다.

여기서 중요한 점은 데이터의 길이를 나타내는 `$`가 접두사로 붙고, 그 뒤에 실제 Redis에 저장된 데이터가 오는 구조라는 것입니다. 예를 들어, 데이터의 길이가 473바이트라면, 응답은 `$473`와 같은 형식으로 시작됩니다. 만약 데이터가 없다면, `$-1` 로 반환되어 값이 없음을 알립니다.

![](WireShark/images/Pasted%20image%2020250325011615.png)

> RESP 프로토콜도 다음에 좀 깊게 다뤄보겠습니다.


## 마치며
지금까지 Wireshark 에서 MySQL 쿼리와 Redis 요청이 어떻게 나가는지 간단하게 살펴보았습니다. 감사합니다.
