---
title: 유클리드 호제법
tags: ["알고리즘", "수학", "유클리드-호제법"]
---

### 유클리드 호제법
유클리드 호제법은 두개의 자연수 a 와 b 의 `최대공약수`를 효율적으로 구하는 알고리즘이다. 

- a, b 에 대해서 a 를 b 로 나눈 나머지를 r 이라 하면 (단, a>b), a와 b의 최대공약수는 b 와 r 의 최대공약수와 같다.
- 이 성질에 따라, b를 r 로 나눈 나머지 r' 를 구하고, 다시 r 을 r' 로 나눈 나머지를 구하는 과정을 반복하여 `나머지가 0이 되었을 때 나누는 수가 a와 b의 최대공약수` 가 된다.

> [!note] 호제법
> 호제법은 두 수가 서로 상대방 수를 나누어 원하는 수를 얻는 알고리즘을 의미한다.

### 최대공약수
최대공약수는 a, b 각각의 약수를 구한 뒤, 공통되는 약수들 중 가장 큰 약수를 의미한다. 보통은 두 수의 약수를 모두 구해야하여 효율적이지 않다. 하지만 이는 유클리드 호제법을 이용하여 최적화 시킬 수 있다.

### 최소공배수
서로 다른 수 a, b의 배수중에서 공통되는 배수 중에 가장 작은 값을 의미한다. a, b의 곱을 a, b의 최대 공약수로 나누면 나오게 된다.

### Python 코드
유클리드 호제법을 Python 코드로 표현하면 아래와 같다.

```python
def solution(a, b):  
  
    def gcd(a, b): # gcd 는 최대공약수를 의미 (유클리드 호제법)  
        max_num, min_num = max(a, b), min(a, b)  
        while max_num % min_num != 0:  
            max_num, min_num = min_num, max_num % min_num  
        return min_num  
  
    def lcm(a, b, gcd): # lcm 은 최소공배수를 의미. a * b 를 gcd 의 결과로 나누면 된다.  
        return (a * b) // gcd  
  
    gcd_answer = gcd(a, b)  
    lcm_answer = lcm(a, b, gcd_answer)  
  
    print(gcd_answer)  
    print(lcm_answer)  
  
solution(24, 18)
```
