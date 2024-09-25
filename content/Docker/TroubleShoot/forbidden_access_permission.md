---
title: forbidden access permission
tags: ['docker', 'troubleshoot']
---

평소와 같이 Redis 를 Docker 로 띄우는데 갑자기 `docker an attempt was made to access a socket in a way forbidden by its access permission` 라는 Error 가 던져졌다. 참고로 컨테이너에서 외부에 노출되는 포트는 `6379` 였다.

## 원인
우선 `관리자 권한` 으로 Powershell 을 켜서 아래 커맨드를 쳐서 확인해준다. 만약 커맨드의 결과값에서 `시작포트` 와 `끝 포트` 사이의 값에 사용하고자하는 Port 가 포함되어있으면 forbidden by its access permission 오류가 발생한다.

```powershell
> netsh interface ipv4 show excludedportrange protocol=tcp
```

## 해결방법
 이를 해결하기위해서는 일단 Window Nat Driver 서비스를 종료시켜준다.

```powershell
> net stop winnat
```


그 다음 `제한 금지 포트`를 지정해주고

```powershell
> netsh int ipv4 add excludedportrange protocol=tcp startport=원하는포트 numberofports=1
```


다시 Window Nat Driver 서비스를 실행시켜주면 해결된다.

```powershell
> net start winnat
```

