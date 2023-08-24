`vite` 를 이용한 일반적인 프로젝트에서는 `.env` 파일을 참조할 수 있어 전역적으로 사용 가능하다.
하지만 `quasar` 를 통해 생성한 프로젝트에서는 이러한 방법이 가능하지않은데, 이러한 방법을 가능하게 하는
방법을 소개하고자 한다.

### 1. .env 파일 생성

우선 프로젝트 루트 폴더에 `.env` 파일 생성하고 설정할 환경변수를 `Key=Value` 형태로 지정한다.
 
![img.png](https://revi1337.github.io/posts/quasar-environment/img.png)

### 2. dotenv 패키지를 설치

`npm` 으로 `dotenv` 패키지를 설치한다.
`dotenv` 패키지는 `.env` 파일에 포함된 변수를 `JSON` 으로 구문 분석하여 `process.env` 에 저장하는 역할을 한다.

```bash
$npm i -D dotenv
```

### 3. quasar.config.js 파일에 dotenv 설정

`Quasar` 설정파일인  `qusar.config.js` 파일의 `build` 섹션에 아래와 같이`env` 를 추가한다.

![img_1.png](https://revi1337.github.io/posts/quasar-environment/img_1.png)

### 4. 사용

이제 어떠한 파일에서든 `process.env.KEY` 로 설정했던 환경변수를 참조 가능하다.

![img_2.png](https://revi1337.github.io/posts/quasar-environment/img_2.png)

![img_3.png](https://revi1337.github.io/posts/quasar-environment/img_3.png)

### 참고

https://quasar.dev/quasar-cli-webpack/handling-process-env#import-based-on-process-env

https://www.npmjs.com/package/dotenv

https://0xhagen.medium.com/how-to-pass-env-variables-into-quasar-framework-application-c5acc6ad09a2