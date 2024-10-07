---
title: Profiling
tags: ['database', 'profiling']
---

## 들어가며
SQL 성능 테스트를 위해서는 Query 에 몇초가 걸리는지, 메모리를 얼마나 먹는지 등의 정보가 필요합니다. MySQL 에서는 Profiling 을 통해 쿼리 성능 지표 및 통계를 확인할 수 있습니다. 그래서 해당 포스팅에서 Profiling 정보를 확인할 수 있는 방법에 대해 소개하고자 합니다.

## Profiling 활성화 및 비활성화
MySQL 에서는 `SHOW PROFILING` 예약어를 통해 쿼리 성능 지표를 확인할 수 있습니다. 하지만, 기본적으로 MySQL 에서는 Profiling 이 비활성화되어있기 때문에 이를 활성화시켜주어야 합니다. Profiling 을 활성화시키는 쿼리는 다음과 같습니다.

```sql
SET PROFILING = 1;
```


이와 반대로 Profiling 비활성화는 PROFILING 을 0 으로 설정해주면 됩니다. 프로파일 기능을 모두 사용하면 꼭 해당 기능을 꺼놔야 합니다. 그렇지 않으면 불필요한 리소스 낭비가 있을 수 있습니다.

```sql
SET PROFILING = 0;
```

## History 크기 설정
MySQL 에서 Profiling 를 활성화시켜주면 Profile 정보에 쿼리 정보가 History 에 최대 `100` 개가 저장되게 됩니다. 이 Profile 에 저장되는 History Size 의 크기는 다음과 같이 설정할 수 있습니다.

> 참고로 Profile History Size 의 기본 크기는 15 입니다.

```sql
SHOW VARIABLES LIKE '%profiling_history_size%';  
SET profiling_history_size = 2;
```

## Profiling 결과
Profiling 결과는 `SHOW PROFILES` 예약어로 확인할 수 있습니다. 프로파일링 결과로는 `profiling_history_size` 의 크기만큼 출력되며, 각 쿼리당 걸린 시간이 출력되게 됩니다.

```sql
SHOW PROFILES;
```


profiling_history_size 를 2로 설정하고 2개의 쿼리를 수행해보면 다음과 같이 출력됩니다.

```sql
SHOW VARIABLES LIKE '%profiling_history_size%';  
SET profiling_history_size = 2;  
SET PROFILING = 1;  
SELECT * FROM crew_participant WHERE crew_id = 1700 AND member_id = 300;  
SELECT * from new_crew_participant WHERE crew_id = 1700 AND member_id = 300;  
SET PROFILING = 0;  
SHOW PROFILES;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007163208.png)

> [!note]
> 확인하고 싶은 쿼리의 개수만큼 profiling_history_size 를 설정하고, 쿼리 실행 후 곧바로 프로파일링을 비활성화시켜주는 것이 좋습니다. 그렇지 않으면 다른 쿼리를 실행할때마다 프로파일링 History 에 남게되므로 확인하고 싶은 Query_ID  가 하나씩 밀리게 됩니다.

### 특정 쿼리 결과 출력
또한, 특정 쿼리에 대한 결과만 확인할 수 있습니다. 아래의 쿼리처럼 `Query_ID` 번호를 명시해주면 특정 Query 에 대한 상세 정보를 볼 수 있습니다.

```sql
SHOW PROFILE FOR QUERY 13;
```

![](ComputerScience/Database/images/Pasted%20image%2020241007163322.png)

### 각 Field 의 의미
각 Field 에 대한 정보는 아래와 같습니다. 해당 정보는 GPT 를 이용했습니다. 정확하지 않을 수 있음을 주의바랍니다.

|             Field             |                                                         의미                                                         |
| :---------------------------: | :----------------------------------------------------------------------------------------------------------------: |
|           starting            |                                            MySQL이 쿼리 실행의 초기 설정을 수행합니다.                                             |
| Executing hook on transaction | Transaction Hook 을 실행하는 단계입니다. MySQL은 트랜잭션 처리 중에 여러 훅(hook) 작업을 실행할 수 있으며, 주로 플러그인 또는 트랜잭션 관련 처리를 위한 추가 작업이 수행됩니다. |
|           starting            |                  쿼리 실행의 또 다른 초기화 단계입니다. 이 경우 두 번째 시작을 나타내며, 실제로 쿼리 실행 전에 추가적인 초기화 작업이 포함될 수 있습니다.                  |
|     checking permissions      |                              MySQL이 쿼리를 실행할 때 사용자가 해당 테이블에 대한 접근 권한이 있는지 확인하는 단계입니다.                               |
|        Opening tables         |                               필요한 테이블을 여는 단계입니다. 이 과정에서는 테이블 파일을 열고 필요한 리소스를 할당합니다.                                |
|             init              |                                 쿼리를 준비하는 단계로, 내부적으로 필요한 변수를 초기화하고 메모리를 할당하는 과정입니다.                                 |
|          System lock          |                          테이블에 대한 잠금을 설정하는 단계입니다. 데이터 일관성을 위해 쿼리가 실행되는 동안 잠금이 필요할 수 있습니다.                           |
|          optimizing           |                                    쿼리를 최적화하는 단계로, MySQL이 쿼리 실행 계획을 선택하고 최적화합니다.                                    |
|          statistics           |                                MySQL이 테이블과 인덱스의 통계 정보를 수집하여 최적화된 실행 계획을 생성하는 단계입니다.                                |
|           preparing           |                                쿼리를 실제로 실행하기 위한 준비 단계로, 필요한 리소스를 할당하고 실행 계획을 준비합니다.                                 |
|           executing           |                            쿼리를 실제로 실행하는 단계입니다. 이 단계에서 MySQL은 데이터를 조회하고 필요한 계산을 수행합니다.                              |
|              end              |                                       쿼리가 완료된 단계로, 실행된 쿼리의 후처리를 수행하는 과정입니다.                                        |
|           query end           |                                  쿼리가 끝나고 MySQL 서버가 내부적으로 쿼리의 마무리 작업을 수행하는 단계입니다.                                   |
|  waiting for handler commit   |                           트랜잭션 커밋을 기다리는 단계입니다. 데이터베이스 핸들러가 작업을 완료하고 커밋하는 과정을 기다리는 상태입니다.                           |
|        closing tables         |                                            쿼리가 끝난 후 사용한 테이블을 닫는 단계입니다.                                             |
|         freeing items         |                                        쿼리 실행에 사용된 메모리와 기타 리소스를 해제하는 단계입니다.                                         |
|          cleaning up          |                                마지막으로 남아있는 자원과 정보를 정리하고, 쿼리 실행의 모든 작업을 마무리하는 단계입니다.                                 |

### 추가적인 정보
추가적으로 `SHOW PROFILE [KEYWORD] FOR QUERY 13;` 으로 각 쿼리의 `CPU, MEMORY, BLOCK ID, SOURCE` 정보를 볼 수 있습니다. 해당 부분은 저도 정확히는 모르니 언급만 하고 넘어가도록 하겠습니다. 사용할 일이 있게 되면 마저 적도록 해보겠습니다.

```sql
show profile cpu for query 13;
show profile mem for query 13;
```

## 마치며
성능 테스트에 있어 항상 Profiling 의 duration 정보만 봐왔었는데, 다른 Keyword 로 다른 정보를 볼 수 있다는것이 무척 신기했습니다. Keyword 에 대한 상세정보는 알아보지 못했지만, 필요할 경우 다시 작성해야겠습니다.

