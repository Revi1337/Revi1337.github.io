---
title: forbidden access permission
tags: ['docker', 'troubleshoot']
---

## Cause
우선 `관리자 권한`으로 Powershell을 켜서 아래 커맨드를 실행합니다. 결과에서 `시작포트` 와 `끝 포트` 사이의 값에 사용하고자하는 포트가 포함되어있으면 forbidden by its access permission 오류가 발생하게 됩니다.

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```


## Solve
Window Nat Driver 서비스를 종료합니다.

```powershell
net stop winnat
```


`제한 금지 포트`를 지정합니다.

```powershell
netsh int ipv4 add excludedportrange protocol=tcp startport=원하는포트 numberofports=1
```


Window Nat Driver 서비스를 다시 실행합니다.

```powershell
net start winnat
```

