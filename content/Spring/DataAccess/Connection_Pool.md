---
title: Connection Pool
tags: ['data_access', 'connection', 'connection-pool', 'DriverManager', 'DataSource', 'HikariDataSource', 'DriverManagerDataSource']
---

SQL 을 날리기 위해 DriverManager 로 매번 Connection 을 얻어오는 것은 성능상 이슈가 있을 수 있다. 왜냐하면 Connection 을 얻어오기 위해서는 TCP 연결 하고, DB 에 한번은 갔다와야하기 때문이다. 때문에 일반적인 경우에는 미리 여러개의 Connection 들을 얻어와 이들을 모아둔 `Connection Pool` 이라는 개념을 사용한다. 

따라서 SQL 을 날릴때마다 매번 Connection 을 얻어오지 않고, Connection Pool 에서 관리되는 Connection 을 가져와 즉시 SQL 을 날릴 수 있게 된다. 이렇게 사용된 `Connection 은 종료되지 않은 상태` 로 Connection Pool 로 다시 반환되게 되는데, 이 반환된 커넥션은 Connection Pooling(재사용) 된다.

## 오픈소스 Connection Pool
대표적인 오픈소스 Connection Pool 에는 `commons-dbcp2`, `tomcat-jdbc pool`, `HikariCP` 가 있다. 하지만 Spring 에서는 `HikariCP` 를 디폴트로 사용하고 있다.

## DataSource
DriverManager 로부터 Connection 을 매번 가져오는 기존 방식에서 `HikariCP` 로부터 미리 생성된 Connection 을 가져오는 방법으로 바꾸려면, 의존관계를 DriverManager 에서 HikariCP 로 변경해야 한다.

즉, 기존 코드를 변경해야 한다는 건데.. 이를 불편하게 생각했던 Java 진영에서는 `DB 로부터 Connection 을 가져오는 방법에 대한 추상화` 를 하게 된다. 그리고 그 추상화에 대한 결과로 `javax.sql.DataSource` 라는 Interface 를 제공하게 된다. 따라서 개발자는 DataSource 를 구현하고 의존관계를 DataSource 로 바꾸면 `OCP(Open Closed Principal : 개방 폐쇄 원칙)` 를 지킬 수 있게 된다. 

> [!note]
> 처음부터 DataSource 에 의존하고 있었다면 상관없지만, 만약 기존에 DriverManager 를 직접 의존하고 있었다면 DataSource 로 의존관계 변경하기 위한 코드 수정은 피할 수 없다.

### DataSource 구조
`DataSource` 에서 제일 중요한 부분은 `Connection getConnection()` 이다. 해당 메서드가 실제적으로 Connection 을 얻어오는 역할을 한다.

```java {3}
public interface DataSource  extends CommonDataSource, Wrapper {  
  
	Connection getConnection() throws SQLException;  
  
	Connection getConnection(String username, String password) throws SQLException;  
  
	java.io.PrintWriter getLogWriter() throws SQLException;  
  
	void setLogWriter(java.io.PrintWriter out) throws SQLException;  
  
	void setLoginTimeout(int seconds) throws SQLException;  
  
	int getLoginTimeout() throws SQLException;  
  
	default ConnectionBuilder createConnectionBuilder() throws SQLException {  
        throw new SQLFeatureNotSupportedException("createConnectionBuilder not implemented");  
  };  
}
```

> [!note]
> DataSource 는 Connection 을 가져오는 방법을 추상화한 것이다. 따라서 Connection Pool 로부터 미리 저장된 Connection 을 가져오도록 구현할 수 있고, 아니면 똑같이 DriverManger 처럼 매번 Connection 을 가져오도록 구현할 수 있다.

## Spring DataSource
Spring 에서 기본으로 제공하는 `DataSource` 는 크게 `HikariDataSource` , `DriverManagerDataSoucre` 가 있다. 모두 DataSource 를 구현하고 있는 것을 볼 수 있다.

![](Spring/DataAccess/images/Pasted%20image%2020240814141347.png)

> [!note]
> DataSource 의 구현체들은 객체를 생성할 때 한번만 URL, USER, PASSWORD 를 지정해주면 된다. 이는 설정과 사용을 분리시킴으로서, 후에 변경이 발생했을 떄 유연하게 대처할 수 있게 된다.

### HikariDataSource
HikariDataSource 은 Spring 에서 기본으로 채택하고있는 DataSource 이다. `getConnection()` 을 하게 되면 `Hikari Connection Pool` 에서 Connection 을 가져오게 된다. 또한, HikariDataSource 는 내부적으로 Connection Pool 에서 Connection 을 가져오기 때문에, Pool 에 생성 및 보관할 수 있는 `최대 Connection 개수(Pool Size)`와 `Pool 이름`을 지정할 수 있다.

> Thread.sleep() 을 넣어주어야 Connection 들이 만들어지고 Pool 에 저장되는 로그를 끝까지 볼 수 있다.

```java {19}
@Slf4j  
public class ConnectionTest {  
  
    private static final String MYSQL_URL = "jdbc:mysql://localhost/onsquad";  
    private static final String MYSQL_USER = "root";  
    private static final String MYSQL_PASSWORD = "1234";  
  
    @Test  
    @DisplayName("HikariCP 로 커넥션 풀링 (DataSource 의 구현체)")  
    public void dataSourceConnectionPool() throws SQLException, InterruptedException {  
        HikariDataSource hikariDataSource = new HikariDataSource();  
        hikariDataSource.setJdbcUrl(MYSQL_URL);  
        hikariDataSource.setUsername(MYSQL_USER);  
        hikariDataSource.setPassword(MYSQL_PASSWORD);  
        hikariDataSource.setMaximumPoolSize(10);  
        hikariDataSource.setPoolName("MyPool");  
  
        useDataSource(hikariDataSource);  
        Thread.sleep(2000);  
    }  
  
    private void useDataSource(DataSource dataSource) throws SQLException {  
        Connection connection1 = dataSource.getConnection();  
        Connection connection2 = dataSource.getConnection();  
        log.info("connection = {}, class = {}", connection1, connection1.getClass());  
        log.info("connection = {}, class = {}", connection2, connection2.getClass());  
    }  
}
```


로그를 위해 `logback.xml` 를 작성하고 테스트 코드를 실행해보면 매우 긴 로그를 볼 수 있다.

```xml
<configuration>  
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">  
        <encoder>  
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} -%kvp- %msg%n</pattern>  
        </encoder>  
    </appender>  
    <root level="DEBUG">  
        <appender-ref ref="STDOUT" />  
    </root>  
</configuration>
```


`4` 번째 라인을 보면 우선 main 스레드에서 Connection 을 하나 만들고 Connection Pool 에 집어넣는 것을 볼 수 있다. 이 부분을 제외한 나머지 부분들은 `풀 이름 + connection adder` 이름의 별도의 스레드가 Connection 을 만들고 Pool 에 넣는 것을 볼 수 있다. 또한, Application 이 시작될 때, 사전에 설정한 Pool Size 만큼 Connection 들을 미리 생성하고 Pool 에 저장하는 것을 알 수 있다.

```text {4,6,9-10,12-17}
...생략...
16:43:11.469 [main] INFO  com.zaxxer.hikari.HikariDataSource -- MyPool - Starting...
16:43:11.477 [main] DEBUG c.z.hikari.util.DriverDataSource -- Loaded driver with class name com.mysql.cj.jdbc.Driver for jdbcUrl=jdbc:mysql://localhost/onsquad
16:43:11.633 [main] INFO  com.zaxxer.hikari.pool.HikariPool -- MyPool - Added connection com.mysql.cj.jdbc.ConnectionImpl@285c08c8
16:43:11.634 [main] INFO  com.zaxxer.hikari.HikariDataSource -- MyPool - Start completed.
16:43:11.656 [MyPool connection adder] DEBUG com.zaxxer.hikari.pool.HikariPool -- MyPool - Added connection com.mysql.cj.jdbc.ConnectionImpl@1fb7727d
16:43:11.656 [main] INFO  a.s.connection.ConnectionTest -- connection = HikariProxyConnection@515273883 wrapping com.mysql.cj.jdbc.ConnectionImpl@285c08c8, class = class com.zaxxer.hikari.pool.HikariProxyConnection
16:43:11.658 [main] INFO  a.s.connection.ConnectionTest -- connection = HikariProxyConnection@79919963 wrapping com.mysql.cj.jdbc.ConnectionImpl@1fb7727d, class = class com.zaxxer.hikari.pool.HikariProxyConnection
16:43:11.687 [MyPool connection adder] DEBUG com.zaxxer.hikari.pool.HikariPool -- MyPool - Added connection com.mysql.cj.jdbc.ConnectionImpl@2e622dba
16:43:11.714 [MyPool connection adder] DEBUG com.zaxxer.hikari.pool.HikariPool -- MyPool - Added connection com.mysql.cj.jdbc.ConnectionImpl@7f988d32
16:43:11.739 [MyPool housekeeper] DEBUG com.zaxxer.hikari.pool.HikariPool -- MyPool - Pool stats (total=4, active=2, idle=2, waiting=0)
16:43:11.742 [MyPool connection adder] DEBUG com.zaxxer.hikari.pool.HikariPool -- MyPool - Added connection com.mysql.cj.jdbc.ConnectionImpl@7bd6960b
16:43:11.770 [MyPool connection adder] DEBUG com.zaxxer.hikari.pool.HikariPool -- MyPool - Added connection com.mysql.cj.jdbc.ConnectionImpl@43297837
16:43:11.797 [MyPool connection adder] DEBUG com.zaxxer.hikari.pool.HikariPool -- MyPool - Added connection com.mysql.cj.jdbc.ConnectionImpl@2fae037a
16:43:11.821 [MyPool connection adder] DEBUG com.zaxxer.hikari.pool.HikariPool -- MyPool - Added connection com.mysql.cj.jdbc.ConnectionImpl@5c281003
16:43:11.849 [MyPool connection adder] DEBUG com.zaxxer.hikari.pool.HikariPool -- MyPool - Added connection com.mysql.cj.jdbc.ConnectionImpl@5ea59876
16:43:11.879 [MyPool connection adder] DEBUG com.zaxxer.hikari.pool.HikariPool -- MyPool - Added connection com.mysql.cj.jdbc.ConnectionImpl@575f3be3
```


마지막으로 작성했던 테스트코드에서 찍은 로그를 보면 Connection 의 타입이 `HikariProxyConnection@주소 wrapping` 인 것을 볼 수 있다. 해당 의미는 HikariProxyConnection 안에 Wrapping 된 진짜 Connection 이 있다는 것이다.

```text
16:43:11.656 [main] INFO  a.s.connection.ConnectionTest -- connection = HikariProxyConnection@515273883 wrapping com.mysql.cj.jdbc.ConnectionImpl@285c08c8, class = class com.zaxxer.hikari.pool.HikariProxyConnection
16:43:11.658 [main] INFO  a.s.connection.ConnectionTest -- connection = HikariProxyConnection@79919963 wrapping com.mysql.cj.jdbc.ConnectionImpl@1fb7727d, class = class com.zaxxer.hikari.pool.HikariProxyConnection
```

### DriverManagerDataSource
`DriverManagerDataSource` 는 Spring 에서 DriverManager 를 사용해서 구현한 DataSource 이다. DriverManger 는 Connection Pool 을 사용하여 Connection 을 관리하는 방식이 아니기 때문에, 매번 Connection 을 얻어오게 된다.

**AbstractDriverBasedDataSource**
![](Spring/DataAccess/images/Pasted%20image%2020240816170537.png)

**DriverManagerDataSource**
![](Spring/DataAccess/images/Pasted%20image%2020240816170645.png)

```java
@Slf4j  
public class ConnectionTest {  
  
    private static final String MYSQL_URL = "jdbc:mysql://localhost/onsquad";  
    private static final String MYSQL_USER = "root";  
    private static final String MYSQL_PASSWORD = "1234";  

    public void dataSourceDriverManager() throws SQLException {  
        DataSource driverManagerDataSource = new DriverManagerDataSource(URL, USER, PASSWORD);  
        useDataSource(driverManagerDataSource);  
    }  
  
    private void useDataSource(DataSource dataSource) throws SQLException {  
        Connection connection1 = dataSource.getConnection();  
        Connection connection2 = dataSource.getConnection();  
        log.info("connection = {}, class = {}", connection1, connection1.getClass());  
        log.info("connection = {}, class = {}", connection2, connection2.getClass());  
    }  
}
```


로그를 보면 매번 Connection 을 생성하여 가져오는 것을 확인할 수 있다.

```text
17:02:29.091 [main] DEBUG o.s.j.d.DriverManagerDataSource -- Creating new JDBC DriverManager Connection to [jdbc:h2:tcp://localhost/~/jdbc]
17:02:29.135 [main] DEBUG o.s.j.d.DriverManagerDataSource -- Creating new JDBC DriverManager Connection to [jdbc:h2:tcp://localhost/~/jdbc]
17:02:29.138 [main] INFO  a.s.connection.ConnectionTest -- connection = conn0: url=jdbc:h2:tcp://localhost/~/jdbc user=SA, class = class org.h2.jdbc.JdbcConnection
17:02:29.139 [main] INFO  a.s.connection.ConnectionTest -- connection = conn1: url=jdbc:h2:tcp://localhost/~/jdbc user=SA, class = class org.h2.jdbc.JdbcConnection
```

## 정리
1. DataSource 는 Connection 을 가져오는 방법을 추상화 한 것.
2. Spring 의 기본 구현체는 HikariDataSource, DriverManagerDataSource 가 있으며 디폴트로 HikariDataSource 를 사용한다.
3. HikariDataSource 는 Connection Pool 에서 Connection 을 관리하고, Pool 에서 Connection 을 가져온다.
	- Application 이 시작될때 Pool Size 만큼 Connection 들을 미리 생성하고 Pool 에 저장시킨다.
4. DriverManagerDataSource 는 Connection 을 매번 새롭게 가져온다.
