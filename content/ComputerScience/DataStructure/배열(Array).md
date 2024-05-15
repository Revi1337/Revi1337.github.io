## 배열

배열 또는 순차 리스트는 `Index`  와 `Value` 의 쌍으로 구현된 데이터 타입이라고 볼 수 있다.  또한 `연속적인 메모리 공간` 을 차지하기 때문에 저장 공간의 낭비가 발생할 수 있다.

###  일차원 배열 구조

우리가 일반적으로 자주 사용하는 `일차원 배열` 의 구조를 우리눈에 보기 쉽게 그려보자면 아래와 같이 그릴 수 있다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112214752.png)


위에 사진은 우리눈에 보기 쉽게 나타낸 그림이지만 실제 메모리에서는 `일차원 배열` 은  아래와 같이 저장되어 있다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112220201.png)

### 이차원 배열 구조

`lst = [[val1, val2, val3], [val4, val5, val6]]`  와 같은 이차원배열을 우리눈에 보기 쉽게 그려보자면 아래와 같이 그릴 수 있다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112223546.png)


또한 이 이차원배열이 저장된 메모리구조를 보면 아래와 같이 나타낼 수 있다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112223935.png)

## 배열의 시간복잡도

배열 데이터에 접근할 때는 `임의 접근 방법` 으로 배열의 모든 위치에 있는 데이터를 한번에 접근할 수 있다. 따라서 데이터에 접근하기 위한 시간 복잡도는 `O(1)` 이다.

### 맨 뒤에 값을 삽입 

배열의 맨 뒤에 값을 넣는 방법은 기존 데이터들의 위치가 변경되지 않기 때문에 `O(1)` 의 시간 복잡도를 갖는다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112225019.png)

### 맨 앞에 값을 삽입

그렇다면 배열의 `맨 앞에 값을 넣을떄`의 시간복잡도는 어떻게 될까?  결과적으로 `O(N)` 의 시간복잡도가 걸리게 된다. 왜냐하면 배열은 `연속된 메모리구조` 를 갖고있기 때문에 배열의 맨앞에 값이 추가되면 기존의 `index` 들이 하나씩 뒤로 밀리기 때문이다.

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/algorithm/3_array/Pasted%20image%2020240112225515.png)

> 새로운 값을 배열의 가운데에 넣어도 똑같다.

### 정리

1. `Index` 로 배열의 값에 접근하는 것은 `O(1)` 의 시간 복잡도.
2. 배열의 맨 뒤에 새로운 값을 삽입하는 경우에는 `O(1)` 의 시간 복잡도.
3. 배열의 맨 앞이나 중간에 새로운 값을 삽입하는 경우엔는 `O(N)` 의 시간 복잡도.
4. 데이터에 자주 접근하거나 값을 읽어야하는 경우에 배열을 사용하면 좋은 성능을 낼 수 있다.
5. 하지만 배려의 마지막 데이터가 아닌 `배열 사이의 데이터를 뻇다 추가`하는 등의 연산이 많은 경우에는 적합하지 않으며 `연결 리스트` 가 권장 된다.


## 문제 풀이

### 배열 정렬하기

```python  
from random import randrange, randint  
def solution(datas):  
    datas.sort()  
    return datas  
  
datas = [randint(-100_000, 100_100) for _ in range(randrange(2,106))]  
print(solution(datas))  
```

### 배열 제어하기

```python  
from random import randrange, randint  
# 배열의 중복값을 제거하고 배열 데이터를 내림차순으로 정렬.  
  
def solution_book(lst):  
    """ 교재에서 나온 답 """    
    unique_lst = list(set(lst))
    unique_lst.sort(reverse=True)
    return unique_lst  
  
def solution_self(datas: list[int]) -> list[int]:
    """ 개인적으로 푼 답 """
    datas.sort(reverse=True)
    answer = [datas[0]]  
    for idx in range(1, len(datas)):
        if datas[idx] != datas[idx - 1]:  
            answer.append(datas[idx])  
  
    return answer  
datas = [randint(-100_000, 100_000) for _ in range(randrange(2, 1001))]  
print(solution_self(datas))  
# print(solution_book(datas))  
```

### 두 개 뽑아서 더하기

```python  
from random import randrange, randint  
def solution(datas):  
    answer = []  
    length = len(datas)  
    for idx in range(length):  
        for i in range(idx + 1, length):  
            answer.append(datas[idx] + datas[i])  
    return sorted(set(answer))  
  
datas = [randint(0, 100) for _ in range(randrange(2,101))]  
print(solution(datas))  
```

### 모의고사

```python  
def solution(answers):  
    patterns = [
	    [1, 2, 3, 4, 5],
	    [2, 1, 2, 3, 2, 4, 2, 5],
	    [3, 3, 1, 1, 2, 2, 4, 4, 5, 5]
    ]    
    scores = [0] * 3    
    for idx, answer in enumerate(answers):        
	    for i, pattern in enumerate(patterns):           
		    if answer == pattern[idx % len(pattern)]:                
			    scores[i] += 1    
			                   
	max_score = max(scores)  
    highest_scores = []    
    for i, score in enumerate(scores):        
	    if score == max_score:            
		    highest_scores.append(i + 1)    
	return highest_scores  
  
print(solution([1,2,3,4,5]))  
print(solution([1,3,2,4,2]))  
```

### 행렬의 곱셈

(보류)

### 실패율

(보류)

### 방문 길이

```python  
row = [1, 0, -1, 0]  
col = [0, 1, 0, -1]  
  
def solution(dirs):  
    r = c = 0
    dr = dc = 0    
    answer = set()    
    for dir in dirs:        
	    if dir == 'U':            
		    dr = r + row[0]            
		    dc = c + col[0]        
		elif dir == 'R':            
			dr = r + row[1]            
			dc = c + col[1]        
		elif dir == 'D':            
			dr = r + row[2]            
			dc = c + col[2]        
		elif dir == 'L':            
			dr = r + row[3]            
			dc = c + col[3]  
			
        if not ((-5 <= dr <= 5) and (-5 <= dc <= 5)):            
	        continue  
	        
        answer.add((c, r, dc, dr))        
        answer.add((dc, dr, c, r))  
        c, r = dc, dr  
        
    return len(answer) // 2 
     
print(solution('ULURRDLLU'))  
print(solution('LULLLLLLU'))
```
