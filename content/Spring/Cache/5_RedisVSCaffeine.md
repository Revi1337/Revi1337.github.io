---
title: Redis vs Caffeine
tags: ['spring', 'cache', 'redis', 'caffeine']  
---

## 다건 캐싱
CaffeineCacheManager

![](Spring/Cache/images/Pasted%20image%2020250324023506.png)


RedisCacheManager

![](Spring/Cache/images/Pasted%20image%2020250324023603.png)



**RedisCacheManager vs CaffeineCacheManager (최신 데이터)**

|항목|**CaffeineCacheManager**|**RedisCacheManager**|
|---|---|---|
|**Sample (요청 수)**|10,000|10,000|
|**Average (평균 응답 시간)**|🥇 **18 ms**|41 ms|
|**Min (최소 응답 시간)**|🥇 **1 ms**|2 ms|
|**Max (최대 응답 시간)**|🥇 **143 ms**|207 ms|
|**Std. Dev. (표준편차)**|🥇 **16.17 ms**|29.72 ms|
|**Error % (에러율)**|✅ 0.0%|✅ 0.0%|
|**Throughput (처리량)**|🥇 **4899.6 rps**|4539.3 rps|
|**Received KB/sec**|1247.0|1247.0|
|**Sent KB/sec**|2124.4|1968.2|



## 단건 캐싱
CaffeineCacheManager

![](Spring/Cache/images/Pasted%20image%2020250324024326.png)


RedisCacheManager

![](Spring/Cache/images/Pasted%20image%2020250324024417.png)



**CaffeineCacheManager vs RedisCacheManager**

| 항목                     | **CaffeineCacheManager** | **RedisCacheManager** |
| ---------------------- | ------------------------ | --------------------- |
| **Sample (요청 수)**      | 10,000                   | 10,000                |
| **Average (평균 응답 시간)** | 🥇 **29 ms**             | 72 ms                 |
| **Min (최소 응답 시간)**     | 🥇 **1 ms**              | 2 ms                  |
| **Max (최대 응답 시간)**     | 🥇 **185 ms**            | 380 ms                |
| **Std. Dev. (표준편차)**   | 🥇 **23.34 ms**          | 43.54 ms              |
| **Error % (에러율)**      | ✅ 0.0%                   | ✅ 0.0%                |
| **Throughput (처리량)**   | 🥇 **4757 rps**          | 4327 rps              |
| **Received KB/sec**    | 3029.1                   | 2755.2                |
| **Sent KB/sec**        | 🥇 **2072.1**            | 1884.7                |
| **Avg Bytes**          | 652.0                    | 652.0                 |



작성중...
