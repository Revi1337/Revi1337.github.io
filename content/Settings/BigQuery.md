---
title: Google BigQuery
---

## Google Cloud 프로젝트 생성
우선 [Google Cloud Console](https://console.cloud.google.com) 에 들어가 Google Cloud 로고 오른쪽에 있는 DropDown 을 클릭하여 새 프로젝트 생성 버튼을 눌러준다.

![](Settings/images/Pasted%20image%2020240609102714.png)


원하는 프로젝트 이름을 명시해준 후 `만들기` 를 눌러준다.

![](Settings/images/Pasted%20image%2020240609102816.png)


Google Cloud 를 처음 사용하거나 하면 90일동안 `$300` 만큼의 리소스를 무료로 사용할 수 있다. `무료로 시작하기`  버튼을 누른다.

![](Settings/images/Pasted%20image%2020240609102912.png)


개인정보 입력 후, 결제 정보를 입력해주면 아래와 같이 무료 체험판 사용중이라고 뜰 것이다.

![](Settings/images/Pasted%20image%2020240609103520.png)


## BigQuery 활성
메인 대시보드에서 햄버거 버튼을 누르고 `BigQuery` 에 들어간다.

![](Settings/images/Pasted%20image%2020240609103540.png)


설정 버튼을 눌러 `데이터 세트 만들기` 를 눌러준다.

![](Settings/images/Pasted%20image%2020240609120517.png)


데이터세트 ID 도 마음대로 적어주고 

![](Settings/images/Pasted%20image%2020240609120559.png)


방금 만든 데이터세트에서 `테이블 만들기` 를 눌러준다.

![](Settings/images/Pasted%20image%2020240609120728.png)


테이블을 만들 소스에는 `업로드` 를 선택해준다. 해당 옵션은 외부 csv 로 된 파일을 데이터로 만들 때 사용된다. `테이블` 이름에는 자신이 원하는 이름을 넣어주고 스키마 섹션에서 `자동 감지` 를 선택해주고 테이블을 생성해준다.

![](Settings/images/Pasted%20image%2020240609120829.png)


테이블을 다 만들면 `새 탭에서 열기` 를 눌러준다.

![](Settings/images/Pasted%20image%2020240609121546.png)


이제 테스트로 쿼리를 작성하고 데이터를 확인해보면 BigQuery 설정이 끝난다.

![](Settings/images/Pasted%20image%2020240609121558.png)
