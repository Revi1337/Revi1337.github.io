---
title: schema.sql & data.sql 의 매우 상세한 동작 원리
tags: ['spring', 'data.sql', 'schema.sql']
---

## 들어가며
Spring 에서 더미 데이터를 넣어주는 방법에는 아래와 같이 5가지가 있습니다.

1. `CommandLineRunner` 를 통한 더미데이터 추가
2. `ApplicationRunner` 를 통한 더미데이터 추가
3. `PostConstruct` 를 통한 더미데이터가 추가
4. `Event` 를 통한 더미데이터 추가 (ApplicationReadyEvent 를 통한 더미데이터 추가)
5. `ScriptUtils` 를 통한 더미데이터 추가 (스크립트를 통한 더미데이터 추가)

해당 포스팅에서는 `5번. ScriptUtils 를 통한 더미데이터 추가` 에 대한 상세과정을 분석해보려고 합니다.

## ScriptUtils
 `ScriptUtils` 는 `resources` 하위에 `schema.sql` 혹은 `data.sql` 을 명시해주었을때 해당 스크립트를 실행시켜주는 클래스입니다. 실제로 properties 에 `spring.sql.init.mode=always` 를 설정하고 resources 하위에 `schema.sql` 과 `data.sql` 을 작성하면

![](Spring/DataAccess/images/Pasted%20image%2020231214175417.png)


 Connection Pool 로부터 DB Connection 을 획득한 후, `ScriptUtils` 가 schema.sql  와 data.sql 순으로 실행시켜주는 것을 확인할 수 있습니다.

![](Spring/DataAccess/images/Pasted%20image%2020231214001834.png)

> spring.sql.init.mode 의 디폴트값은 embedded 입니다. 그렇기 때문에 InMemory 데이터베이스가 아니면 자동으로 수행되지 않습니다. schema.sql 과 data.sql 을 어떠한 DB Platform 이든 매번 실행시키고 싶다면, 직접 always 로 값을 수정해주어야 합니다.

## schema.sql & data.sql
스크립트의 이름에서도 유추할 수 있겠지만, `schema.sql` 은 Table 의 구조를 정의하는 `DDL 쿼리를 넣을때 사용` 됩니다. 또한, `data.sql` 은 `DML 쿼리를 넣을때 사용` 됩니다. 당연하겠지만, DML 은 DDL 에 의해 테이블 구조가 정의된 후 실행되어야 하기 때문에, `schema.sql` 이 먼저 수행되고 `data.sql` 이 실행되게 됩니다.


![](Spring/DataAccess/images/Pasted%20image%2020231214002455.png)

> 물론 DDL 과 DML 쿼리를 schema.sql 과 data.sql 로 분리하지 않고, 하나의 sql 파일에 몰아넣을 수 있습니다. 하지만 구조적으로도 그렇고 분리하는 것이 더 좋습니다.

## schema.sql & data.sql 실행 조건
하지만 `schema.sql` 과 `data.sql` 실행되기 위해서는 조건이 있습니다.

1.  `spring.sql.init.mode` 값이 `always` 여야 합니다.
2.  혹은 `임베디드 데이터베이스` 여야합니다.

실제로 애플리케이션을 실행하면, `AbstractScriptDatabaseInitializer` 추상 클래스에서 `spring.sql.init.mode`값이 `always` 인지, 혹은 `임베디드 데이터베이스` 검사를 하게 됩니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214010424.png)


`임베디드 데이터베이스` 인지 확인은 `DataSourceScriptDatabaseInitializer` 클래스에서 수행하는데요. `DataSource` 를 통해 임베디드 데이터베이스인지 확인하게 됩니다. 만약 임베디드 데이터베이스가 아니면, 오류를 뱉게 됩니다.

> 임베디드 데이터베이스의 확인은 내부적으로 쿼리를 날려봄으로서 판단됩니다.

**DataSourceScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214005806.png)


모두 아시겠지만, `spring.sql.init.mode` 라는 옵션은 SpringBoot 에서 SQL 에 대한 AutoConfigure 에 사용되는 `SqlInitializationProperties` 에서 설정되는 값입니다. 앞에서도 언급하였지만, 디폴트 값은 `EMBEDDED` 입니다.

![](Spring/DataAccess/images/Pasted%20image%2020231214004006.png)

## 정리
지금까지의 내용을 정리하면 아래와 같습니다.

- ScriptUtils 로 인해 실행되는 schema.sql 과 data.sql 는 무조건 실행되는 것이 아니라 spring.sql.init.mode 값이 always 혹은 임베디드 데이터베이스일때 실행됩니다.
- 임베디드 데이터베이스인지 확인은 DataSource 를 참조하고 실제로 쿼리를 날려봄으로서 판단합니다.

## debug 과정
이제 디버깅을 통해 원리를 상세히 파악해보도록 하겠습니다. 해당 부분은 스프링 부트의 자동구성을 조금은 알아야 이해하기 수월합니다.

### AutoConfiguration
스크립트의 실행은SpringBoot 의 자동구성으로부터 시작됩니다. `36` 라인과  `38` 라인에 Breakpoint 가 걸려있는데 해당 부분이 핵심입니다.

> @ConditionalProperty 같은 경우에는 현재 matchIfMissing=true 이기 때문에, spring.sql.init.enabled 가 설정되어있지 않아도 AutoConfigure 이 SqlInitilizationModeCondition 이 동작하게 됩니다.

**SqlInitilizationAutoConfiguration**
![](Spring/DataAccess/images/Pasted%20image%2020231214013244.png)

### SqlInitializationProperties
`@EnableConfigurationProperties` 로 인해 properties 혹은 yml 에 작성한 `spring.sql.init` 하위 설정값들을 기반으로  `SqlInitializationProperties` 초기화되어지고 Bean 으로 등록되게 됩니다. 여기서 `spring.sql.init.mode` 의 값을 따로 명시해주지 않았다면, `embedded` 로 설정되게 됩니다.

**SqlInitializationProperties**
![](Spring/DataAccess/images/Pasted%20image%2020231214014342.png)

### DataSourceInitializationConfiguration
SqlInitializationProperties Bean 으로 되고나면, 바로 `DataSourceInitializationConfiguration` 가 동작하게 됩니다. 내부에서는 생성자를 통해 `SqlDataSourceScriptDatabaseInitializer` 타입의 Bean 을 만들어주게 되는 것을 확인할 수 있습니다. (BreakPoint 부분입니다.)

> DataSourceInitializationConfiguration 는 SqlDataSourceScriptDatabaseInitializer 와 SqlR2dbcScriptDatabaseInitializer 타입의 Bean 이 없을 때 동작하게 됩니다. 이는 @ConditionalOnMissingBean 을 통해 알 수 있습니다.

**DataSourceInitializationConfiguration**
![](Spring/DataAccess/images/Pasted%20image%2020231214015054.png)

### SqlDataSourceScriptDatabaseInitializer
SqlDataSourceScriptDatabaseInitializer 의 생성자에서는 SqlInitializationProperties 를 통해`DatabaseInitializationSettings`  정보를 만들고, 오버로딩된 생성자를 다시 호출하게 됩니다.

**SqlDataSourceScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214015706.png)


아래 사진을 보면 SqlInitializationProperties 를 통해 `DatabaseInitializationSettings`  를 만드는 것을 볼 수 있습니다.

**SqlDataSourceScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214015751.png)


DatabaseInitializationSettings 를 만들고나면, 오버로딩한 생성자에서는 부모클래스인 `DataSourceScriptDatabaseInitializer` 의 생성자를 호출하는것을 확인할 수 있습니다.

**SqlDataSourceScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214015813.png)

### DataSourceScriptDatabaseInitializer
DataSourceScriptDatabaseInitializer 생성자에서는 부모 추상 클래스인 `AbstractScriptDatabaseInitializer` 의 생성자를 또 한번 호출하게 됩니다.  여기서 이 `AbstractScriptDatabaseInitializer` 가 매우 중요한 역할을 수행하게 된다.

**DataSourceScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214020405.png)

### AbstractScriptDatabaseInitializer
`AbstractScriptDatabaseInitializer` 의 생성자에서는 매개변수로 넘어온 DatabaseInitializationSettings 를 필드변수로 할당해줍니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214020921.png)


AbstractScriptDatabaseInitializer 는 `InitializingBean` 를 구현하고있기 때문에 곧바로 afterPropertiesSet() 에서 `initializeDatabase()` 메서드를 호출하게 됩니다. initializeDatabase() 안에서는 `schema.sql, data.sql 파일들을 찾고 spring.sql.init.mode 를 검사`하는 과정을 수행하게 됩니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214021407.png)

### schema.sql 및 data.sql 실행
현재 활성화된 breakpoint 를 보면 `applySchemaScripts()`  를 수행하기 직전인것을 알 수 있습니다. 해당 메서드 이름만 봐도 schema.sql 관련 메서드인건을 유추할 수 있습니다. 물론 그 아래의 `applyDataScripts()` 는 data.sql 관련 메서드인것도 유추할 수 있습니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214022922.png)

#### schema.sql
##### schema.sql 실행 준비
applySchemaScripts() 은 또 한번 `applyScripts()` 를 호출하게 됩니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214023514.png)


 applyScripts() 에서는 실제로 `schema.sql` 을 실행하는 `runScripts()` 메서드를 실행하기 이전에, `schema.sql` 파일이 있는지 있는지 검사하고, spring.sql.init.mode 를 검사하는 `isEnabled()` 를 통해 스크립트를 실행할지 결정하게 됩니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214024116.png)

##### spring.sql.init.mode 검사
`isEnabled()` 에서는 `spring.sql.init.mode` 가 `always` 이거나 `임베디드 데이터베이스`인지 검사하게 됩니다. 임베디드모드인지 아닌지 검사는 `isEmbeddedDatabase()` 에서 실행되게 됩니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214024242.png)


만약, 임베디드 데이터베이스가 아니면, schema.sql 이 수행될 수 없도록 false 가 반환되게 됩니다. 하지만 현재 우리의 설정은 `spring.sql.init.mode=always` 이기 때문에 `isEmbeddedDatabase()` 가 호출되지 않게 됩니다.

> isEmbeddedDatabase() 는 AbstractScriptDatabaseInitializer 를 상속한 DataSourceScriptDatabaseInitializer 의 오버라이딩한 메서드를 호출합니다.

**DataSourceScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214024533.png)

##### schema.sql 실행
`schema.sql` 실행 여부를 판단하는 조건문 통과하게 되면 `runScripts()` 를 실행하여 실제로 `schema.sql` 을 실행하는 절차를 밟게 됩니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214024805.png)


runScripts() 메서드에서는 추상 메서드를 호출하기때문에 이 메서드를 구현한 `DataSourceScriptDatabaseInitializer` 의 runScripts() 메서드를 호출하게 됩니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214024951.png)


DataSourceScriptDatabaseInitializer 의 runScripts() 에서는 실행할 수 있는 sql 스크립트를 담은 `ResourceDatabasePopulator` 를 만든 후, `DatabasePopulatorUtils` 의 `execute()` 메서드에 Datasource 와 ResourceDatabasePopulator 를 매개변수로 넘겨주게 됩니다.

**DataSourceScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214030522.png)


DatabasePopulatorUtils 의 execute() 메서드에서는 `DataSource` 로부터 `DB Connection` 을 획득한 뒤 ResourceDatabasePopulator 의 `populate()` 메서드에 Connection 을 넘겨주고 호출하게 됩니다.

**DatabasePopulatorUtils**
![](Spring/DataAccess/images/Pasted%20image%2020231214030832.png)


이 ResourceDatabasePopulator 의 populate() 메서드에서는 드디어 `ScriptUtils` 의 `executeSqlScript()` 메서드에 Connection, schema.sql, 그리고 기타 정보등 을 매개변수로 넘기고 `schema.sql` 를 실행하게 됩니다. 현재 `Evaluate` 창을 보면 현재 schema.sql 정보를 확인할 수 있습니다.

**ResourceDatabasePopulator**
![](Spring/DataAccess/images/Pasted%20image%2020231214031112.png)


`ScriptUtils` 내부에서는 `executeSqlScript()` 에서 스크립트를 호출한다는 로그를 찍은 뒤

**ScriptUtils**
![](Spring/DataAccess/images/Pasted%20image%2020231214031504.png)


안에서 `스크립트를 읽고`, `PreparedStatement` 를 생성하고, schema.sql 에 작성된 DDL 쿼리를 실행하게 됩니다.

**ScriptUtils**
![](Spring/DataAccess/images/Pasted%20image%2020231214031535.png)


최종적으로 아래와 같이 ScriptUtils 로부터 schema.sql 이 실행된다는 로그를 확인할 수 있습니다.

![](Spring/DataAccess/images/Pasted%20image%2020231214031622.png)

#### data.sql
끝난것 같지만 아직 data.sql 가 남아있습니다. data.sql 도 schema.sql 실행 원리와 똑같으니 매우 간략하게 적도록 하겠습니다.

##### data.sql 실행 준비
schema.sql 을 정상적으로 실행했으면, [schema.sql 및 data.sql 실행](Spring/script_init_mechanism/ScriptUtilsMechanism#schema.sql 및 data.sql 실행) 으로 다시 돌아와서 `data.sql` 을 실행하기 위한 준비를 하게 됩니다. 아래 사진을 보면 AbstractScriptDatabaseInitializer 의 `initializeDatabase()` 메서드로 돌아와 `applyDataScripts()` 를 실행하는 것을 확인할 수 있습니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214032024.png)


해당 시점부터는 `schema.sql` 를 실행했던 과정과 완전히 똑같습니다. applyDataScripts() 메서드에서 `applyScripts()` 메서드를 호출해주면 

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214032553.png)

##### data.sql 실행
마찬가지로 data.sql 이 있는지와 `spring.sql.init.mode` 를  검사하고 `runScripts()` 메서드를 호출하게 됩니다.

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214032859.png)


이것도 마찬가지로 runScripts() 에서는 추상메서드인 runScripts() 를 구현한 DataSourceScriptDatabaseInitializer 의 `runScripts()` 메서드를 호출해주면

**AbstractScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214032932.png)


runScripts() 안에서 `DatabasePopulatorUtils.execute()` 를 호출해주고

**DataSourceScriptDatabaseInitializer**
![](Spring/DataAccess/images/Pasted%20image%2020231214033103.png)


DatabasePopulatorUtils.execute() 에선 `ResourceDatabasePopulator.populate()` 를 호출하게됩니다.

**DatabasePopulatorUtils**
![](Spring/DataAccess/images/Pasted%20image%2020231214033311.png)


ResourceDatabasePopulator.populate() 에서는 또 한번 `ScriptUtils.executeSqlScript()` 를 호출하게 되면

**ResourceDatabasePopulator**
![](Spring/DataAccess/images/Pasted%20image%2020231214033607.png)


드디어 ScriptUtils.executeSqlScript() 에서는 data.sql 이 실행된다는 로그를 찍은 후

**ScriptUtils**
![](Spring/DataAccess/images/Pasted%20image%2020231214033625.png)


`data.sql 을 읽고`,  `PreparedStatement` 를 만들고, 최종적으로 data.sql 의 DML 쿼리를 실행하게 됩니다.

**ScriptUtils**
![](Spring/DataAccess/images/Pasted%20image%2020231214033743.png)


이렇게 data.sql 도 실행된다는 로그를 확인할 수 있습니다.

![](Spring/DataAccess/images/Pasted%20image%2020231214033906.png)

### 사용된 BreakPoints
사용된 BeakPoint 들은 아래와 같습니다. 

![](Spring/DataAccess/images/Pasted%20image%2020231214034048.png)

## 정리
이 긴 과정을 요점만 축약하면 아래와 같습니다.

1. schema.sql 과 data.sql 이 실행시키는 것은 최종적으로 ScriptUtils 이다.
2. schema.sql 과 data.sql 이 실행되기 위해서는
	- `spring.sql.init.mode=embedded` 임과 동시에 DB 환경이 임베디드모드 여야하거나
	- `spring.sql.init.mode=always` 여야 합니다.
3.  디버깅 과정이 많이 복잡해보이나 `SqlDataSourceScriptDatabaseInitializer`, `DataSourceScriptDatabaseInitializer`, `AbstractScriptDatabaseInitializer` 모두 상속관계이기 때문에 하나의 매우 큰 클래스라고 볼 수 있습니다.
	- DataSourceScriptDatabaseInitializer 가 실제적으로 schema.sql 과 data.sql 을 모두 수행합니다.
4. 해당 포스팅에서 살펴보진 않았지만 schema.sql 그리고 data.sql `스크립트의 위치를 지정할 수 있고`,  `실행할 스크립트를 여러개를 지정할 수 있습니다`. 

## 마치며
왜이렇게 분석하는게 재밌는지 모르겠습니다. 이시간에 양질의 프로젝트를 하나라도 더 뽑아내야하는데.. 그래도 시간가는줄도 모르고 글을 쓴것 같습니다. 로컬에만 저장되어있는 이런 분석글이 아직 많은데 언제 다듬고 언제 블로그에 올릴지 막막해집니다. 그럼 이만 마치겠습니다
