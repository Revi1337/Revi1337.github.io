
평소와 같이 Redis 를 Docker 로 띄우는데 갑자기 `docker an attempt was made to access a socket in a way forbidden by its access permission` 라는 Error 가 던져졌다. 참고로 컨테이너에서 외부에 노출되는 포트는 `6379` 였다.

### ✔️ 해결방법

1. `관리자 권한` 으로 Powershell 을 켜서 알애 커맨드를 쳐서 확인해준다. `시작포트` 와 `끝 포트` 사이의 값에 사용하고자하는 포트가 포함되어있으면 forbidden by its access permission 이 뜨는 것이다.

```powershell
> netsh interface ipv4 show excludedportrange protocol=tcp
```

2. 그 다음 아래 명령어로 Window Nat Driver 서비스를 종료시켜준다.

```powershell
> net stop winnat
```

3. 이제 아래 명령어로 `제한 금지 포트`를 지정해준다.

```powershell
> netsh int ipv4 add excludedportrange protocol=tcp startport=원하는포트 numberofports=1
```

4. 이제 다시 Window Nat Driver 서비스를 실행시켜준다.

```powershell
> net start winnat
```

이제 docker 로 컨테이너를 다시 띄우면 에러없이 정상적으로 실행할 수 있다.