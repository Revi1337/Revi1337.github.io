---
title: PyInstaller
---

해당 포스팅에서는 `pyinstaller` 로 특정한 파이썬 파일을 `exe` 파일로 생성하는 방법을 알아본다.

### pyinstaller 설치
```bash
$ pip install pyinstaller
```

### pyinstaller 옵션 정보
우선 `pyintaller` 에서 자주 쓰이는 옵션은 아래와 같다. 

| Option               | Desciption                                |
| -------------------- | ----------------------------------------- |
| -w, --noconsole      | 콘솔창이 출력되지 않게 하는 옵션                        |
| -F, --onefile        | 하나의 실행파일만 생성하도록 하는 옵션                     |
| -n NAME, --name NAME | 변환된 이름을 지정. 별도로 지정하지 않을 경우 스크립트 이름을 따라간다. |

### pyinstaller 실행
이제 아래의 커맨드를 통해 우리의 python 파일을 `exe` 파일로 만들어주면된다. exe 파일은 `dist` 폴더 하위에 위치하게 된다.

```bat
> pyinstaller -w -F -n image_commit.exe .\git_image_commiter\image_upload.py
```

![](https://raw.githubusercontent.com/Revi1337/BlogImageFactory/main/python/pyinstaller/Pasted%20image%2020231231182847.png)
