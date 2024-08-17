---
title: Transaction & Isolation
---
## 트랜잭션
트랜잭션(Transaction)은 하나의 작업을 수행하기 위해 필요한 데이터베이스의 연산(SQL 쿼리)들을 모아놓은 것으로 데이터베이스에서 논리적인 작업의 단위이다.

- 장애가 발생했을 때 데이터를 복구하는 작업의 단위이기도 하다.
- 일반적으로 데이터베이스 연산은 SQL문으로 표현되므로, 트랜잭션은 작업 수행에 필요한 SQL문들의 모임이라고 보면 이해하기 쉽다.

## 트랜잭션 특성
트랜잭션은 아래 4가지의 특성을 만족해야 한다. 트랜잭션의 아래 4가지의 특성을 만족해야 한다.

**Atomic (원자성)**

- Transaction 에 반영된 SQL 이 모두 반영되거나 `(100% Commit)`, 혹은 모두 반영되지 않아야`(100% Rollback)` 한다.

**Consistency (일관성)**

- 트랜잭션이 성공적으로 완료된 후 데이터베이스가 일관된 상태를 유지해야 한다.
	- 여기서 말하는 일관된 상태는 `트랜잭션 전 후로 데이터베이스의 상태가 정의된 Constraint(제약 조건 : 무결성 제약 조건, 비즈니스 규칙 등)에 어긋나지 않도록` 해야함을 의미한다.
	- 다시말해 Constraint(제약 조건) 에 위배되지 않으면서 데이터가 변경되어야 한다.

**Isolation (고립성 : 격립성)**

- 여러 Transaction 들이 동시에 실행될 때 서로 간섭없이 독립적으로 수행되어야 한다.
	- 서로 다른 Transaction 이 동시에 병렬적으로 수행되고 있을 때, 서로 영향이 가지 않도록 격리되어 수행되어야 한다. 만약 서로 영향이 가면 Lock 을 활용한다.
- 동시성 제어 (Concurrency Controll) 의 주된 목표가 Isolation 이다.


**Durability (지속성)**

- Transaction 이 성공적으로 반영되었으면, 결과는 시스템이 고장나더라도 데이터베이스에 영구적으로 반영되어야 한다.

## 트랜잭션 사용 주의점
Transaction 의 범위를 최대한 줄여야 한다. 일반적으로 DB Connection 의 개수는 제한적이다. 그런데 각 단위 프로그램이 Connection 을 소유하는 시간이 길어진다면 사용 가능한 Idle Connection 개수는 줄어들게 된다. 그러다 어느 순간에는 각 단위 프로그램에서 Connection 을 가져가기 위해 기다려야 하는 상황이 발생할 수 있다.

## 트랜잭션 격리 수준
`트랜잭션 격리 수준(Trsanaction Isolation Level)`은 트랜잭션의 특성들 중 하나인 Isolation (각각의 트랜잭션은 서로 간섭없이 독립적으로 수행되어야 한다) 과 관련된 내용이다.

트랜잭션 격리 수준은 여러 Transaction 이 동시에 처리될 때, 특정 Transaction 이 다른 Transaction 에서 변경하거나 조회하는 데이터를 보거나 수정할 수 있게 허용할지 말지 결정하는 것을 말한다. 

### 발생할 수 있는 현상
트랜잭션 격리 수준마다 발생하는 안좋은 현상들이 있다. 크게 `DIRTY-READ`, `NON-REPEATABLE-READ`,` PHANTOM-READ` 가 있으며, 이 3가지 현상들은 나타나지 않을수록 좋다.

**DIRTY-READ**

- DIRTY-READ 는 `Commit 되지 않는 데이터를 다른 Transaction 이 읽는것을 허용하는 것`을 의미한다.
- 하나의 Transaction 에서 데이터가 변경되었지만 아직 Commit되지 않은 상태에서, 다른 Transaction 이 변경된 데이터를 읽을 수 있다.
- 만약, `첫 번째 트랜잭션이 Rollback` 을 실행하면, `두 번째 Transaction 이 읽은 데이터는 실제로 존재하지 않거나 무효한 데이터가 일관성 없는 데이터`를 처리하게 되어, 시스템의 데이터 무결성을 해칠 수 있다.

**NON-REPEATABLE READ**

- NON-REPEATABLE READ 는 `하나의 Transaction 에서 동일한 SELECT 문의 결과가 다른 것`을 의미한다.
- 처리되고 있는 Transaction 이 아닌, `다른 Transaction 의한 데이터 변경(수정 및 삭제) 때문에 발생`하게 된다.
- 때문에 데이터의 일관성이 보장되지 않는다.

> [!note]
> 자신의 트랜잭션에서 발생하는 UPDATE 로 인해 동일한 SELECT 문의 결과가 다른것은 NON-REPEATABLE-READ 로 간주되지 않는다.

**PHANTOM-READ**

- PHANTOM-READ 는 `다른 Transaction 에 의해 삽입/변경/삭제된 Row` 가 `기존 Transaction 내에서 보였다 안보였다하는 현상`을 의미한다. 또한 `하나의 Transaction 안에서 일정 범위(Range Scan)를 두번 이상 SELECT` 할때, `첫번째 SELECT 문에서 없던 Row 가 두번째 SELECT 문에서 나타나는 현상` 마찬가지이다.

### 격리 수준 종류
SQL 표준에서 지원하는 트랜잭션의 격리 수준(Isolation Leve)에는 `READ UNCOMMITED`, `READ COMMITED`, `REPEATABLE READ`, `SERIALIZABLE` 이 있다.

|      ISOLATION LEVEL      | DIRTY READ | NON REPEATABLE READ | PHANTOM READ |
| :-----------------------: | :--------: | :-----------------: | :----------: |
| READ UNCOMMITED (Level 0) |     O      |          O          |      O       |
|  READ COMMITED (Level 1)  |     X      |          O          |      O       |
| REPEATABLE READ (Level 2) |     X      |          X          |      O       |
|  SERIALIZABLE (Level 3)   |     X      |          X          |      X       |

**READ UNCOMMITED**

- 하나의 Transaction 에서 `변경된 데이터가 아직 Commit 되지 않았음에도 불구`하고, `다른 Transaction 에서 변경된 데이터를 읽는 것을 허용`한다. **(DIRTY READ)**
- 하나의 Transaction 에서 `동일한 SELECT 문을 두 번 수행할 때`, 다른 Transaction 이 값을 변경(수정 및 삭제)함으로서 `두 SELECT 문의 결과가 상이하게 나타나는 비일관성 현상`이 나타날 수 있다. **(NON REPEATABLE READ)**
- **PHANTOM READ** 가 발생한다.
- 데이터의 일관성이 보장되지 않는다.

**READ COMMITED**

- READ COMMITTED 는 기본적으로 `커밋된 데이터를 읽도록 보장`하지만, NON REPEATABLE READ 문제를 해결하지 못한다.
- 예를 들어 `Transaction 1 에서 동일한 SELECT 문을 두 번 실행했을 때`, 그 사이에 다른 `Transaction 2 가 데이터를 변경(수정 및 삭제)하고 Commit` 하면 Transaction 1 에서 실행되는 두 번째 SELECT 문은 다른 트랜잭션에서 Commit 한 데이터를 읽게 되므로, 첫 번째 SELECT 문의 결과가 달라 `비일관성 현상` 이 나타날 수 있다. **(NON REPEATABLE READ)**
- **PHANTOM READ** 가 발생한다.
- 어느 정도 데이터의 일관성을 보장한다. 

**REPEATABLE READ**

- `Transaction 이 끝날때까지` SELECT 문으로 `조회된 모든 Row 에 Shared Lock이 걸리는 Level` 이다.
- Transaction 범위 내에서 조회한 데이터 내용이 항상 동일함을 보장한다.
- 다른 사용자는 처리중인 Transaction 영역에 해당되는 데이터에 대한 수정이 불가능하다.
- **PHANTOM READ** 가 발생한다.
- MySQL 의 Default 격리 수준이다.

**SERIALIZABLE**

- `Transaction 이 끝날때까지` SELECT 문으로 `조회된 모든 Row 에 Shared Lock이 걸리는 Level` 이다.
- 다른 사용자는 처리중인 Transaction 영역에 해당되는 데이터에 대한 수정이 불가능하다.
- 데이터의 일관성이 완벽하게 보장된다.

### 고려사항
트랜잭션의 격리 수준에 대한 조정은 동시성과 데이터 무결성에 연관되어있다.

- 격리 수준을 높이면 동시성(동시에 처리할 수 있는 양)이 줄어들어 DB 성능이 저하될 수 있지만, 데이터 일관성(Consistency)이 더 잘 보장된다.
	- **동시성 관점** : 트랜잭션 격리 수준이 높아질수록, 트랜잭션 간의 충돌을 방지하기 위해 더 많은 락(lock)이 필요하게 된다. 이는 동시성, 즉 동시에 처리할 수 있는 트랜잭션의 수를 줄일 수 있어 데이터베이스의 성능은 저하될 수 있다.
	- **데이터 일관성 관점** : 격리 수준이 높아질수록 데이터베이스는 더 높은 수준의 일관성을 보장한다. 예를 들어, SERIALIZABLE 격리 수준에서는 모든 트랜잭션이 독립적으로 실행되도록 보장하여, 데이터의 일관성을 최상으로 유지한다.
- 격리 수준을 낮추면 동시성(동시에 처리할 수 있는 양)이 높아져 DB 성능은 향상될 수 있지만, 데이터 일관성(Consistency)이 보장되지 않을 수 있다.
	- **동시성 관점** : 트랜잭션 격리 수준이 낮을수록, 트랜잭션 간의 충돌을 피하기 위해 필요한 락(lock)이 줄어든다. 이는 동시성, 즉 동시에 처리할 수 있는 트랜잭션의 수를 늘려 데이터베이스의 성능이 더 잘 나올 수 있다.
	- **데이터 일관성 관점** : 낮은 격리 수준에서는 DIRTY-READ, NON-REPEATABLE-Read, PHANTOM-READ 와 같은 일관성 문제가 발생할 수 있다.

따라서 개발자나 설계자가 비지니스 로직에 맞게 트랜잭션의 격리 수준을 적당하게 잘 선택하여야 한다.

