---
title: Prefix sum
tags: ['algorithm', 'prefix-sum', 'range-sum']
---

## Prefix sum
누적합(Prefix sum)은 배열의 시작점(보통 인덱스 0 또는 1)부터 특정 인덱스까지의 원소의 합을 말합니다. 예를 들어, 배열이 `A = [a₀, a₁, ..., aₙ]` 일 때, 인덱스 `i` 까지의 누적합 `S[i]` 는 다음과 같이 표현할 수 있습니다.

- Index 0 Base : `S[i] = a₀ + a₁ + ... + aᵢ `
- Index 1 Base : `S[i] = a₁ + a₂ + ... + aᵢ` 


누적합 배열을 미리 구해두면, 배열의 특정 `구간합(Range sum)`을 `O(1)`이라는 매우 빠른 시간 복잡도로 계산할 수 있습니다.

> [!note] Prefix sum & Range sum
> 누적합과 구간합은 모두 배열이나 리스트의 원소들을 활용하여 합을 계산하는 기법이지만, 계산 방식과 목적이 다릅니다. 누적합은 각 인덱스까지의 합을 미리 계산하여 저장하는 반면, 구간합은 특정 구간의 합을 계산하는 데 사용됩니다. 즉, 누적합은 구간합을 계산하는 데 필요한 기반을 제공하며, 구간합은 누적합을 활용하여 특정 구간의 합을 빠르게 계산하는 데 사용됩니다.


## 1D Array Prefix sum
### Index 1 Base
1차원 배열의 `누적합` 을 구할때는 주로 `Index 1 Base` 를 사용합니다. Index 1 Base 누적합 배열은 `누적합 배열의 Index 0 은 비워두고 Index 1 부터 저장`하는 방식입니다. 

- 기존 arr 크기가 N 이라면, 누적합 배열의 크기는 (N + 1) 만큼 0 으로 초기화합니다. `psum = [0] * (N + 1)`
- arr 을 인덱스 1 ~ (N + 1) 까지 순회하며 `psum[idx] = psum[idx - 1] + arr[idx - 1]` 를 진행합니다.

![](Algorithm/images/Pasted%20image%2020240524182905.png)


코드로는 다음과 같이 구현할 수 있습니다.

```python {3,5}
def solution(arr):  
    length = len(arr)  
    psum = [0] * (length + 1)  
    for idx in range(1, length + 1):  
        psum[idx] = psum[idx - 1] + arr[idx - 1]  
    return psum  
  
print(solution([13, 19, 28, 23, 11, 25, 10, 20, 12, 24]))
```


### Index 0 Base
Index 0 Base 누적합 배열은 `누적합 배열의 Index 0 부터 저장`하는 방식입니다. 

- 기존 arr 크기가 N 이라면, 누적합 배열의 크기도 N 만큼 0 으로 초기화합니다. `psum = [0] * N`
- 누적합 배열의 Index 0 을 arr[0] 값으로 초기화 시킵니다. `psum[0] = arr[0]`
- arr 을 인덱스 1 ~ N 까지 순회하며 `psum[idx] = psum[idx - 1] + arr[idx]` 를 진행합니다.

![](Algorithm/images/Pasted%20image%2020240524180958.png)


코드로는 다음과 같이 구현할 수 있습니다.

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


#### Index 0 Base 는 잘 사용 X
하지만 Index 0 Base 누적합 배열은 잘 사용하지 않습니다. 이는 이 누적합 배열을 이용하여 배열의 특정 구간의 구간합을 구할 때 시작 구간이 Index 0 이면, 인덱스 범위를 벗어나 예외가 발생하기 때문입니다. (`파이썬에서는 -1 인덱스. 즉, 누적합 배열의 맨 뒤의 값을 참조하게 됩니다.`) 따라서 시작 구간이 Index 0 을 포함한 구간의 합을 구할 때 `예외처리 혹은 분기처리가 필요`합니다.

해당 예외 케이스에 대한 부분은 [Index 0 Base 엣지 케이스](Algorithm/Prefixsum.md#Index%200%20Base%20엣지%20케이스)를 참고하면 됩니다.


### Range sum
#### Index 1 Base
Index 1 Base 누적합 배열에서 `연속된 구간 N ~ J` 의 구간합을 구하고 싶다면 `psum[J + 1] - psum[N]` 를 해주면 됩니다. 아래 그림의 예시처럼 `arr[3] ~ arr[5]` 의 구간합을 구하려면  `prefix_sum[6] - prefix_sum[3]` 를 계산하면 됩니다.

![](Algorithm/images/Pasted%20image%2020250531164810.png)


계산 과정은 아래 그림을 보면 이해할 수 있을것입니다.

![](Algorithm/images/Pasted%20image%2020250531164905.png)


코드로는 다음과 같이 구현할 수 있습니다. 누적합 배열 psum 만 구해놓으면 딱히 할게 없습니다.

```python {7}
def solution(arr, prolog, epilog):  
    length = len(arr)  
    psum = [0] * (length + 1)  
    for idx in range(1, length + 1):  
        psum[idx] = psum[idx - 1] + arr[idx - 1]  
  
    return psum[epilog + 1] - psum[prolog]  
  
print(solution([13, 19, 28, 23, 11, 25, 10, 20, 12, 24], 3, 5))
```


#### Index 0 Base 엣지 케이스
Index 0 Base 누적합 배열에서 `연속된 구간 N ~ J` 의 구간합을 구하고 싶다면 `psum[J] - psum[N - 1]` 를 해주면 됩니다. 아래 예시처럼 `arr[3] ~ arr[5]` 의 구간합을 구하려면  `prefix_sum[5] - prefix_sum[2]` 를 계산하면 됩니다.

![](Algorithm/images/Pasted%20image%2020250531173042.png)


계산 과정은 아래 그림을 보면 이해할 수 있을것입니다.

![](Algorithm/images/Pasted%20image%2020250531172734.png)


코드로는 다음과 같이 구현할 수 있습니다. 마찬가지로 psum 만 구해놓으면 딱히 할게 없습니다.

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


앞서 Index 0 Base 누적합 배열은 잘 사용하지 않는다고 언급하였습니다. arr 배열의 `0 ~ 3` 의 구간합을 구하는 경우를 봐보겠습니다.

- arr 0 ~ 3 의 구간합을 구하려면 `psum[3] - psum[0 - 1]` 을 수행하면 됩니다.
- 하지만 `psum[0 - 1]`는 `psum[-1]`. 즉, 파이썬에서 psum 배열의 맨 마지막 원소를 말하기 때문에 arr 배열의 원소를 모두 더한 값을 참조하게 되어 이상한 값이 출력되게 됩니다.

![](Algorithm/images/Pasted%20image%2020250531174437.png)
^why-not-use-0-base


이를 해결하기 위해 추가적인 예외처리 혹은 분기처리가 들어가기 때문에 효율적이지 않습니다.

```python {8,9,10}
def solution(arr, prolog, epilog):  
    length = len(arr)  
    psum = [0] * length  
    psum[0] = arr[0]  
    for idx in range(1, length):  
        psum[idx] = psum[idx - 1] + arr[idx]  
  
    if prolog == 0:  
        return psum[epilog]  
    return psum[epilog] - psum[prolog - 1]  
  
  
print(solution([13, 19, 28, 23, 11, 25, 10, 20, 12, 24], 0, 3))
```


## 2D Prefix sum
우선 2차원 배열의 누적합을 모두 구하게되면 아래와 같이 나오게 된다. row 와 col padding 이 1개 씩 들어가있는것을 볼 수 있는데, 경계값에 대한 예외를 처리하지 않게하기 위함이다.

![](Algorithm/images/Pasted%20image%2020240524203942.png)

### version 1
2차원 배열에서 `arr[row][col]` 까지의 누적합을 구하고 싶다면 `psum[row + 1][col + 1]` 까지 구하면 되며, 이를 식으로 나타내면 아래와 같다.

> [!note] 왜 row, col 에 1 을 더해주나?
> 누적합 배열을 처음 초기활때 기존 arr 의 row 와 col 보다 1 씩 크게 만들어주었기 때문.

```python
row, col = row + 1, col + 1

psum[row][col] = psum[row - 1][col] + psum[row][col - 1] - psum[row - 1][col - 1] + arr[row - 1][col - 1]
```

마찬가지로 `arr[3][2]` 까지의 누적합을 구하고 싶다면 `psum[4][3]` 을 보면 된다. 

![](Algorithm/images/Pasted%20image%2020240524224127.png)

좀 더 보기 쉽게 그려보자면 아래와 같다. `psum[4 - 1][3]` 와 `psum[4][3 - 1]` 을 더하면 `psum[4 - 1][3 - 1]` 부분이 한번 더 더해지기 때문에 갈색 부분을 한번 빼주는 것이다. 여기까지가 `psum[row - 1][col - 1]` 값이고, 이제 원본 배열의 `arr[row - 1][col - 1]` 위치의 원소를 더하면 `psum[row][col]` 이 완성되는 것이다.

![](Algorithm/images/Pasted%20image%2020240524205341.png)

![](Algorithm/images/Pasted%20image%2020240524210857.png)

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

![](Algorithm/images/Pasted%20image%2020240524221112.png)

누적합을 구할때와 비슷하게, 초록색부분과 갈색부분을 빼주면 보라색부분이 한번 더 빼지기 때문에, 이를 보충하기 위해 보라색 부분을 한번 더해주는 것이다.

![](Algorithm/images/Pasted%20image%2020240524221414.png)

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

