---
title: Prefix sum (누적합)
---

## 누적합이란
누적합(Prefix Sum)이란 **나열된 수의 누적된 합**을 말한다. 다시 말해, 수열 A[n] 이 있을때 `A[0] ~ A[1]` 구간의 합, `A[0] ~ A[2]` 구간의 합, `A[0] ~ A[3]` 구간의 합, ... `A[0] ~ A[n - 1]` 구간의 합과 같이, index 0 부터 각 index 까지의 합을 `누적합` 이라고 한다. 따라서 누적합의 각 요소는 해당 index 까지의 `부분합`(Partial Sum) 을 의미한다.

## 1차원 배열 누적합
1차원 배열의 `누적합` 을 구하는 방법에는 2가지가 있다. 문제마다 상황이 다르겠지만. `version2` 과 같이 구현하면 index out of range 와 같은 예외를 생각하지 않아도 되어 더 좋은것 같다.
### version 1
첫번째 방법은 매우 간단하다. prefix_sum 배열을 arr 크기만큼 만들어 누적합을 구해주면 된다. 단, 처음에 `prefix_sum` 의 `index 0` 을 arr[0] 으로 초기화시켜주는 작업이 필요하다.

![](Algorithm/Prefixsum/images/Pasted%20image%2020240524180958.png)

```python {4, 6}
def solution(arr):  
    length = len(arr)  
    psum = [0] * length  
    psum[0] = arr[0]  
    for idx in range(1, length):  
        psum[idx] = psum[idx - 1] + arr[idx]  
    return psum  
  
print(solution([13, 19, 28, 23, 11, 25, 10, 20, 12, 24]))
```

### version 2
두번째방법은 prefix_sum 배열을 `arr + 1` 크기만큼 만들어 누적합을 구하는 방법이다. 이는 prefix_sum 의 `index 0` 을 비워두고 index 1 부터 누적합을 채워가는 방법이다.

![](Algorithm/Prefixsum/images/Pasted%20image%2020240524182905.png)

```python {3,5}
def solution(arr):  
    length = len(arr)  
    psum = [0] * (length + 1)  
    for idx in range(1, length + 1):  
        psum[idx] = psum[idx - 1] + arr[idx - 1]  
    return psum  
  
print(solution([13, 19, 28, 23, 11, 25, 10, 20, 12, 24]))
```

### 연속된 구간합
만약 `연속된 구간 N ~ J` 까지의 구간합을 구하고 싶다면 `prefix_sum[J] - prefix_sum[N - 1]` 를 해주면 된다. 아래 그림의 예시처럼 `arr[3] ~ arr[5]` 의 구간합을 구하고 싶다면  `prefix_sum[5] - prefix_sum[3 - 1]` 를 해주면 된다.

![](Algorithm/Prefixsum/images/Pasted%20image%2020240524190416.png)

아래 과정을 보면 이해가 가능할 것이다.

![](Algorithm/Prefixsum/images/Pasted%20image%2020240524190452.png)

이를 코드로 구현하면 아래와같이 나타낼 수 있다. prefix_sum 배열만 구해놓으면 할게 없다.

```python {8}
def solution(arr, prolog, epilog):  
    length = len(arr)  
    psum = [0] * length  
    psum[0] = arr[0]  
    for idx in range(1, length):  
        psum[idx] = psum[idx - 1] + arr[idx]  
  
    return psum[epilog] - psum[prolog - 1]  
  
print(solution([13, 19, 28, 23, 11, 25, 10, 20, 12, 24], 3, 5))
```

## 2차원 배열 누적합
우선 2차원 배열의 누적합을 모두 구하게되면 아래와 같이 나오게 된다. row 와 col padding 이 1개 씩 들어가있는것을 볼 수 있는데, 경계값에 대한 예외를 처리하지 않게하기 위함이다.

![](Algorithm/Prefixsum/images/Pasted%20image%2020240524203942.png)

### version 1
2차원 배열에서 `arr[row][col]` 까지의 누적합을 구하고 싶다면 `psum[row + 1][col + 1]` 까지 구하면 되며, 이를 식으로 나타내면 아래와 같다.

> [!note] 왜 row, col 에 1 을 더해주나?
> 누적합 배열을 처음 초기활때 기존 arr 의 row 와 col 보다 1 씩 크게 만들어주었기 때문.

```python
row, col = row + 1, col + 1

psum[row][col] = psum[row - 1][col] + psum[row][col - 1] - psum[row - 1][col - 1] + arr[row - 1][col - 1]
```

마찬가지로 `arr[3][2]` 까지의 누적합을 구하고 싶다면 `psum[4][3]` 을 보면 된다. 

![](Algorithm/Prefixsum/images/Pasted%20image%2020240524224127.png)

좀 더 보기 쉽게 그려보자면 아래와 같다. `psum[4 - 1][3]` 와 `psum[4][3 - 1]` 을 더하면 `psum[4 - 1][3 - 1]` 부분이 한번 더 더해지기 때문에 갈색 부분을 한번 빼주는 것이다. 여기까지가 `psum[row - 1][col - 1]` 값이고, 이제 원본 배열의 `arr[row - 1][col - 1]` 위치의 원소를 더하면 `psum[row][col]` 이 완성되는 것이다.

![](Algorithm/Prefixsum/images/Pasted%20image%2020240524205341.png)

![](Algorithm/Prefixsum/images/Pasted%20image%2020240524210857.png)

아래와 같은 코드로 구현할 수 있다. hightlight 된 부분이 앞에서 자세히 설명한 부분이다.

```python {6-9}
def solution(arr):  
    row_length, col_length = len(arr), len(arr[0])  
    prefix_sum = [[0] * (col_length + 1) for _ in range(row_length + 1)]  
    for row in range(1, row_length + 1):  
        for col in range(1, col_length + 1):  
            prefix_sum[row][col] = prefix_sum[row - 1][col] \  
                                   + prefix_sum[row][col - 1] \  
                                   - prefix_sum[row - 1][col - 1] \  
                                   + arr[row - 1][col - 1]  
    return prefix_sum  
  
print(  
    solution(  
        [            
	        [13, 24, 13, 24, 1],  
            [20, 28, 29, 21, 27],  
            [13, 19, 28, 23, 11],  
            [25, 10, 20, 12, 24]
        ]    
	)
)
```

### 연속된 구간합
2차원 배열에서 `arr[r1][c1] ~ arr[r2][c2]` 의 구간합을 구하고 싶다면 `psum[r1 + 1][c1 + 1] ~ psum[r2 + 1][c2 + 1]` 구간을 살펴보면 된다. 이를 식으로 표현하면 아래와 같이 나타낼 수 있다.

> [!note] 왜 r1, c1, r2, c2 에 1을 더해주나?
> 처음 누적합을 구할 때 row, col 에 padding 을 1 씩 주었기 때문.

```python
# arr[r1][c1] ~ arr[r2][c2] 까지의 구간합은?

r1, c1 = r1 + 1, c1 + 1   # arr 과 psum 의 크기를 맞추기 위해 1 을 더해줌
r2, c2 = r2 + 1, c2 + 1   # arr 과 psum 의 크기를 맞추기 위해 1 을 더해줌

psum[r2][c2] - psum[r2][c1 - 1] - psum[r1 - 1][c2] + psum[r1 - 1][c1 - 1]
```

마찬가지로 `arr[2][2] ~ arr[3][3]` 까지의 구간합을 구하고 싶다면, `psum[3][3] ~ psum[4][4]` 을 보면 된다.

![](Algorithm/Prefixsum/images/Pasted%20image%2020240524221112.png)

누적합을 구할때와 비슷하게, 초록색부분과 갈색부분을 빼주면 보라색부분이 한번 더 빼지기 때문에, 이를 보충하기 위해 보라색 부분을 한번 더해주는 것이다.

![](Algorithm/Prefixsum/images/Pasted%20image%2020240524221414.png)

코드로 표현하면 아래와 같이 나타낼 수 있다.

```python {11-12, 14-17}
def solution(arr, prolog, epilog):  
    row_length, col_length = len(arr), len(arr[0])  
    prefix_sum = [[0] * (col_length + 1) for _ in range(row_length + 1)]  
    for row in range(1, row_length + 1):  
        for col in range(1, col_length + 1):  
            prefix_sum[row][col] = prefix_sum[row - 1][col] \  
                                   + prefix_sum[row][col - 1] \  
                                   - prefix_sum[row - 1][col - 1] \  
                                   + arr[row - 1][col - 1]  
  
    st_row, st_col = prolog[0] + 1, prolog[1] + 1  
    end_row, end_col = epilog[0] + 1, epilog[1] + 1  
  
    return prefix_sum[end_row][end_col] \  
        - prefix_sum[end_row][st_col - 1] \  
        - prefix_sum[st_row - 1][end_col] \  
        + prefix_sum[st_row - 1][st_col - 1]  
  
print(  
    solution(  
        [            
	        [13, 24, 13, 24, 1],  
            [20, 28, 29, 21, 27],  
            [13, 19, 28, 23, 11],  
            [25, 10, 20, 12, 24]  
        ],        
        (2, 2),  
        (3, 3)  
    )
)
```
