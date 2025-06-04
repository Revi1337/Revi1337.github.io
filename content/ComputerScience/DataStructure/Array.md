---
title: Array
tags: ["datastructure"]
---

## Array
배열(Array)는 메모리 상에서 데이터가 연속적으로 연결되어있는 `선형 자료구조`입니다.

- 배열의 크기는 한번 초기화하면 고정되며, 변경할 수 없습니다. 즉, `데이터의 삽입 & 삭제는 불가능`합니다.
- 배열의 `i 번째 데이터에 접근 & 변경에 O(1)의 시간복잡도`를 갖습니다. (Random Access)
- 배열에  `X 라는 데이터가 있는지 확인하는데 O(N) 의 시간복잡도`를 갖습니다. (Sequential Access)


## Dynamic Array
동적 배열(Dynamic Array)은 일반 배열과 마찬가지로, 메모리 상에서 데이터가 연속적으로 저장되는 `선형 자료구조`입니다.   대표적인 예로는 Python의 `List`, C++의 `Vector`, Java의 `ArrayList`가 있습니다.

동적 배열은 일반 배열과 달리 `크기를 동적으로 조절할 수 있다는 특징`이 있습니다. 근본적으로는 `고정 크기 배열을 기반으로 구현`되며, 동적 배열에 원소를 Insert 시 더 이상 데이터를 저장할 공간이 없을 경우 `일정 크기만큼 배열을 확장하는 Resizing 과정`을 통해 용량을 늘립니다. 확장하는 크기는 언어나 구현에 따라 다르지만, 일반적으로는 기존 크기의 `2배` 혹은 `1.5배` 정도입니다. 하지만 늘린 사이즈만큼 저장공간을 모두 사용하지 않을 수 있기 때문에 어느정도 메모리 낭비가 있을 수 있습니다.

- 동적 배열의 `i 번째 데이터에 접근 & 변경에 O(1)`의 시간복잡도를 갖습니다. (Random Access)
- 동적 배열에  `X 라는 데이터가 있는지 확인하는데 O(N)` 의 시간복잡도를 갖습니다. (Sequential Access)
- 동적 배열에 `끝에 데이터의 삽입 & 삭제에는 Amortized O(1)` 의 시간복잡도를 갖습니다.
- 동적 배열의 `끝을 제외한 데이터의 삽입 & 삭제에는 O(N)`의 시간복잡도를 갖습니다.

> [!note] Resizing 과정
> Resizing 과정은 새로운 메모리를 할당하고, 기존 데이터를 복사한 뒤 이어서 저장하는 과정으로 수행됩니다. 이러한 구조 덕분에 평균적으로 O(1) 라는 빠른 삽입 성능을 유지할 수 있습니다.

### Resizing
1. 동적 배열의 초기 크기는 `4` 로 지정합니다. Java 동적 배열(ArrayList) 초기 크기는 `10` 입니다.
2. 동적 배열의 초기 크기가 모두 차도록 원소를 add 합니다.
3. `add(6)` 을 하게 되면 동적 배열의 초기 사이즈가 넘게 됩니다. 따라서 배열을 확장하는 Resizing 과정이 수행됩니다. 기존동적 배열의 크기를 N 이라고 가정한다면
	1. `N + (N / 2)`  크기만큼 새로운 메모리를 할당하고(Java 기준 Resize 크기는 1.5 배입니다) 기존 데이터를 복사 및 저장합니다.
	2. Resizing 자주 발생하지 않으므로  평균적으로는 `O(1)` 의 빠른 삽입 성능을 유지할 수 있습니다. 하지만 Resizing 이 발생한다면 `O(N)` 만큼의 시간복잡도가 소요됩니다.
 
![](ComputerScience/DataStructure/images/Pasted%20image%2020250604153741.png)


### Insertion
#### Insert First or Middle
동적 배열에서 `끝을 제외한 위치에 데이터를 삽입`하는 경우, `Resizing 여부와 관계없이 O(N)`의 시간복잡도를 가집니다. 예를 들어, Index 1에 `10`이라는 원소를 삽입하고자 할 때 다음과 같은 절차로 동작합니다

1. 삽입 위치(Index 1)부터 끝까지의 모든 요소를 `오른쪽으로 한 칸씩 이동`시킵니다.
2. 삽입 위치(Index 1)에 `10`을 저장합니다.

이 과정에서 요소들을 이동시키는 비용 때문에 `O(N)`의 시간복잡도가 발생합니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250604175352.png)


이제 위 상태에서 동일하게 Index 1에 `11`이라는 원소를 삽입하면, 배열의 크기가 가득 차 있기 때문에 `Resizing`이 발생합니다.

1. `7 + (7 / 2) = 10`  크기만큼 새로운 메모리를 할당하고, 기존 데이터를 복사 및 저장합니다.
2. 삽입 위치(Index 1)부터 끝까지의 모든 요소를 `오른쪽으로 한 칸씩 이동`시킵니다.
3. 삽입 위치(Index 1)에 11을 저장합니다.

이 과정에서는 배열을 확장하면서 새로운 배열을 생성하고 데이터를 복사하는 데 N, 그리고 요소들을 이동시키는 데도 N 의 비용이 발생합니다. 즉, 총 `2N` 만큼의 연산이 필요하지만, 시간복잡도 표기법에서는 결국 `O(N)`으로 표현됩니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250604175623.png)


#### Insert Last
동적 배열의 `끝에 데이터의 삽입` 하는 경우, 평균적으로 O(1)의 시간복잡도를 가집니다. 구체적으로 `Resizing 이 발생하지 않으면 O(1), Resizing 이 발생하면 O(N)`의 시간복잡도를 갖습니다. 

예를 들어, Resizing 이 일어나지 않는다는 것을 가정하고 동적 배열의 끝에 `10`이라는 원소를 삽입하고자 할 때 다음과 같은 절차로 동작합니다.

1. 동적 배열의 맨 마지막에 `10`을 저장합니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250604172454.png)


이제 배열이 가득 찬 상태에서 끝에 `11`이라는 원소를 삽입하고자 한다면, 배열의 크기가 다 차 Resizing 이 발생하게 됩니다.

1. `7 + (7 / 2) = 10`  크기만큼 새로운 메모리를 할당하고, 기존 데이터를 복사 및 저장합니다.
2. 새로운 배열의 끝에 `11`을 저장합니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250604182132.png)


### Removal
#### Remove First or Middle
동적 배열에서 `끝을 제외한 위치에 데이터를 삭제`하는 경우, `O(N)`의 시간복잡도를 가집니다. 예를 들어, Index 1에 해당하는 원소를 지우고할 때 다음과 같은 절차로 동작합니다.

1. Index 1 에 위치한 원소를 제거합니다.
2. Index 2 부터 끝까지의 요소를 한 칸씩 왼쪽으로 이동시킵니다.
3. 배열의 마지막 요소는 중복되므로 제거합니다.

이 과정에서 요소들을 이동시키는 비용 때문에 `O(N)`의 시간복잡도가 발생합니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250604222923.png)


#### Remove Last
동적 배열의 `끝의 원소를 삭제` 하는 경우, `O(1)`의 시간복잡도를 가집니다. 이는 다음과 같은 절차로 동작합니다.

1. 배열의 끝 원소를 제거합니다.

> 삭제한 뒤에도 다른 요소를 이동시킬 필요가 없습니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250604224234.png)


%% 
# 배열
배열 또는 순차 리스트는 `Index`  와 `Value` 의 쌍으로 구현된 데이터 타입이다.  이러한 배열은 `연속적인 메모리 공간` 을 차지하기 때문에 저장 공간의 낭비가 발생할 수 있는 단점이 있다.

##  일차원 배열 구조

우리가 일반적으로 자주 사용하는 `일차원 배열` 의 구조를 우리눈에 보기 쉽게 그려보자면 아래와 같이 그릴 수 있다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112214752.png)


위에 사진은 우리눈에 보기 쉽게 나타낸 그림이지만 실제 메모리에서는 `일차원 배열` 은  아래와 같이 저장되어 있다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112220201.png)

## 이차원 배열 구조

`lst = [[val1, val2, val3], [val4, val5, val6]]`  와 같은 이차원배열을 우리눈에 보기 쉽게 그려보자면 아래와 같이 그릴 수 있다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112223546.png)


또한 이 이차원배열이 저장된 메모리구조를 보면 아래와 같이 나타낼 수 있다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112223935.png)

# 배열의 시간복잡도

배열 데이터에 접근할 때는 `임의 접근 방법` 으로 배열의 모든 위치에 있는 데이터를 한번에 접근할 수 있다. 따라서 데이터에 접근하기 위한 시간 복잡도는 `O(1)` 이다.

## 맨 뒤에 값을 삽입 

배열의 맨 뒤에 값을 넣는 방법은 기존 데이터들의 위치가 변경되지 않기 때문에 `O(1)` 의 시간 복잡도를 갖는다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112225019.png)

## 맨 앞에 값을 삽입

그렇다면 배열의 `맨 앞에 값을 넣을떄`의 시간복잡도는 어떻게 될까?  결과적으로 `O(N)` 의 시간복잡도가 걸리게 된다. 왜냐하면 배열은 `연속된 메모리구조` 를 갖고있기 때문에 배열의 맨앞에 값이 추가되면 기존의 `index` 들이 하나씩 뒤로 밀리기 때문이다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112225515.png)

> [!note]
> 새로운 값을 배열의 가운데에 넣어도 똑같다.

## 배열 정리

1. `Index` 로 배열의 값에 접근하는 것은 `O(1)` 의 시간 복잡도.
2. 배열의 맨 뒤에 새로운 값을 삽입하는 경우에는 `O(1)` 의 시간 복잡도.
3. 배열의 맨 앞이나 중간에 새로운 값을 삽입하는 경우엔는 `O(N)` 의 시간 복잡도.
4. 데이터에 자주 접근하거나 값을 읽어야하는 경우에 배열을 사용하면 좋은 성능을 낼 수 있다.
5. 하지만 배려의 마지막 데이터가 아닌 `배열 사이의 데이터를 뻇다 추가`하는 등의 연산이 많은 경우에는 적합하지 않으며 `연결 리스트` 가 권장 된다.
6. 연속적인 메모리 공간을 차지하기 때문에 저장공간의 낭비가 발생할 수 있다.

# 배열 관련 테크닉
## 1차원 배열
### Duplicate 제거
입력값이 `모두 숫자인 경우` 에는 빈도수를 나타내는 배열을 만들어 중복을 제거할 수 있다.

> [!note]
>  해당 방법은 배열의 크기를 입력값의 최대값만큼 초기화해야하기 때문에 메모리 낭비가 심하다.


```python {2,3}
def solution(datas):  
    length = max(datas) + 1  
    frequency = [0] * length  
    for integer in datas:  
        frequency[integer] += 1  
  
    answer = []  
    for integer in range(length):  
        if frequency[integer]:  
            answer.append(integer)  
    return answer  
  
# input : [123, 78, 234, 567, 6786, 19, 789, 123, 234, 456, 6786, 78]
# output : [19, 78, 123, 234, 456, 567, 789, 6786]
```

입력값이 `모두 문자` 혹은 `모두 숫자` 인 경우에는 입력값을 먼저 정렬해준 후, 이전 index 값과 비교해가며 중복값을 제거할 수 있다.

```python {2}
def solution(datas):  
    datas.sort()  
    answer = [datas[0]]  
    for idx in range(1, len(datas)):  
        if datas[idx] != datas[idx - 1]:  
            answer.append(datas[idx])  
    return answer  
  
# input : ['dummy4', 'dummy2', 'dummy2', 'dummy1', 'dummy4', 'dummy1', 'dummy3']  
# output : [19, 78, 123, 234, 456, 567, 789, 6786]
```

하지만 `입력값의 타입에 상관없이` 중복을 제거하는 가장 간단한 방법은 set 를 사용하는 것이다.

```python
def solution(datas):  
    return list(set(datas))  
  
# input : [123, 'dummy2', 123, 'dummy2', 'dummy1', 'dummy4', 456, 'dummy1', 'dummy3']  
# output : ['dummy2', 'dummy4', 456, 'dummy3', 'dummy1', 123]
```

### Uniq 값 추출
 입력값이 `모두 숫자`일때 앞서 소개한 [Duplicate 제거](ComputerScience/DataStructure/Array.md#Duplicate%20제거) 와 비슷한 방법으로 유일값을 추출할 수 있다.

```python {9}
def solution(datas):  
    length = max(datas) + 1  
    frequency = [0] * length  
    for integer in datas:  
        frequency[integer] += 1  
  
    answer = []  
    for integer in range(length):  
        if frequency[integer] == 1:  
            answer.append(integer)  
    return answer  
  
# input : [123, 78, 234, 567, 6786, 19, 789, 123, 234, 456, 6786, 78]  
# output : [19, 78, 123, 234, 456, 567, 789, 6786]
```

입력값이 `모두 문자` 혹은 `숫자 + 문자` 이면 배열을 사용하지 않고 `Dictionary` 를 사용하면 된다. 혹은 collections 의 Counter 를 사용할 수 있다.

```python
def solution(datas):  
    frequency = {}  
    for data in datas:  
        frequency[data] = frequency.get(data, 0) + 1  
    answer = []  
    for key, counter in frequency.items():  
        if counter == 1:  
            answer.append(key)  
    return answer  
  
# input : ['dummy4', 'dummy2', 'dummy2', 'dummy1', 'dummy4', 'dummy1', 'dummy3']  
# output : ['dummy3']  
  
# input : [123, 'dummy2', 123, 'dummy2', 'dummy1', 'dummy4', 456, 'dummy1', 'dummy3']  
# output : ['dummy4', 456, 'dummy3']
```

## 2차원 배열
### 각 row 만 순회
정사각형, 직사각형 모두 가능

![](ComputerScience/DataStructure/images/Pasted%20image%2020240517145820.png)

```python
def solution(board):  
    answer = []  
    for row in board:  
        answer.append(row)  
    return answer
```

### 각 col 만 순회
정사각형, 직사각형 모두 가능

![](ComputerScience/DataStructure/images/Pasted%20image%2020240517145947.png)

```python {5}
def solution(board):  
    size = 5
    answer = []  
    for col in range(size):  
        answer.append([row[col] for row in board])  
    return answer
```

### 좌에서 우 대각선
정사각형만 가능

![](ComputerScience/DataStructure/images/Pasted%20image%2020240517150027.png)

```python
def solution(board):  
    size = 5  
    answer = []  
    for idx in range(size):  
        answer.append(board[idx][idx])  
    return answer
```

### 우에서 좌 대각선
정사각형만 가능

![](ComputerScience/DataStructure/images/Pasted%20image%2020240517174441.png)

```python
def solution(board):  
    size = 5  
    answer = []  
    for idx in range(size):  
        answer.append(board[idx][size - idx - 1])  
    return answer
```

### 90 도 회전
정사각형만 가능

![](ComputerScience/DataStructure/images/Pasted%20image%2020240517192733.png)

![](ComputerScience/DataStructure/images/Pasted%20image%2020240517193131.png)

```python {6}
def solution(board):  
    N = 5  
    answer = [[0] * N for _ in range(N)]  
    for row in range(N):  
        for col in range(N):  
            answer[col][N - row - 1] = board[row][col]  
    return answer
```

### 180 도 회전
정사각형만 가능

![](ComputerScience/DataStructure/images/Pasted%20image%2020240517195205.png)

![](ComputerScience/DataStructure/images/Pasted%20image%2020240517195237.png)

```python {6}
def solution(board):  
    N = 5  
    answer = [[0] * N for _ in range(N)]  
    for row in range(N):  
        for col in range(N):  
            answer[N - row - 1][N - col - 1] = board[row][col]  
    return answer
```

### 270 도 회전
정사각형만 가능

![](ComputerScience/DataStructure/images/Pasted%20image%2020240517200223.png)

![](ComputerScience/DataStructure/images/Pasted%20image%2020240517200237.png)

```python {6}
def solution(board):  
    N = 5  
    answer = [[0] * N for _ in range(N)]  
    for row in range(N):  
        for col in range(N):  
            answer[N - col - 1][row] = board[row][col]  
    return answer
```

### 마름모 순회
정사각형만 가능
#### version 1
가운데 row 의 합을 초기값으로 세팅하고, 해당 row 를 기준으로 위, 아래를 나누지 않고 한번에 처리할 수 있다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240520185011.png)

```python {7-8}
def solution(board):  
    size = 5  
    step = int(size // 2)  
    init = [*board[step]]  
    i = 0  
    while step > i:  
        init.extend(board[i][step - i:step + i + 1])  
        init.extend(board[size - i - 1][step - i:step + i + 1])  
        i += 1 
    return init
```

#### version 2
정사각형에서 마름모 모양에 포함된 원소들의 인덱스 row, col 은 아래와 같이 나타낼 수 있다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240520204657.png)

`3 번`의 그림은 인덱스 row 와 col 을 `row - (전체 row 길이 // 2), col - (전체 col 길이 // 2)` 로 나타낸 것이다. 또한, `4번` 그림을 통해 마름모 모양에 포함된 원소들의 인덱스 row, col 이 모두 `|row| + |col| <= (전체 row 길이 // 2)` 를 만족하는 것을 알 수 있다.



![](ComputerScience/DataStructure/images/Pasted%20image%2020240520211106.png)

```python {7}
def solution(board):  
    rows, cols = len(board), len(board[0])  
    row_center, col_center = rows // 2, cols // 2  
    answer = []  
    for row in range(rows):  
        for col in range(cols):  
            if abs(row - row_center) + abs(col - col_center) <= row_center:  
                answer.append(board[row][col])  
    return answer
```

### 알아채기 힘든 규칙들
2차원 배열이 정사각형일때 `현재 자신이 위치한` 인덱스 row, col 의 합과 `자신을 왼쪽하단에서 오른쪽상단`으로 가로지르는 원소들의 `row, col 의 합`이 모두 일정하다. 해당 규칙은 백트래킹 대표 문제 `NQueen` 에서 사용된다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240520224141.png)

2차원 배열이 정사각형일때 `현재 자신이 위치한` 인덱스 row, col 의 차와 `자신을 왼쪽상단에서 오른쪽하단`으로 가로지르는 원소들의 `row, col 의 차`가 모두 일정하다. 해당 규칙도 백트래킹 대표 문제 `NQueen` 에서 사용된다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240520224541.png)

%%
