---
title: Connection
---

Database 에 SQL 을 전송하기 위해서는 먼저 Database 에 접근하여 Connection 을 얻어와야한다. Connection 연결에 성공한 데이터베이스에서는 해당 커넥션에 맞는 Session 을 생성하여 보관하게 된다.

## DriverManager
DriverManager 는 자바의 `java.sql` 에서 제공하며 실제적으로 SQL 을 전송하기 전에 필요한 DB Connection 을 얻어오는 역할을 한다. DriverManager 로 부터 Connection 을 가져오려면 DB 접속에 필요한 `url`, `username`, `password` 정보가 필요하다.

DB 와의 Connection 을 가져올때마다 Checked 예외인 `SQLException` 를 던지게 된다. 커넥션을 연결할 때마다 try catch 로 잡아줄 순 없으므로, Connection 을 얻어오는 역할만 수행하는 Uitl 성 클래스로 분리해주는게 좋다.

```java
public class DBConnectionUtil {  
  
    private static final Logger LOGGER = LoggerFactory.getLogger(DBConnectionUtil.class);  
    private static final String URL = "jdbc:h2:tcp://localhost/~/jdbc";  
    private static final String USER = "sa";  
    private static final String PASSWORD = "";  
  
    public static Connection getConnection() {  
        try {  
            Connection connection = DriverManager.getConnection(URL, USER, PASSWORD);  
            LOGGER.info("Get Connection  = {}, Get Class = {}", connection, connection.getClass());  
            return connection;  
        }  
        catch (SQLException sqlException) {  
            throw new IllegalStateException("Connection 을 얻어오는데 실패했습니다.");  
        }  
    }  
}
```


아래와 같이 Connection 이 잘 얻어와지는지 테스트 코드를 짜볼 수 있는데, Connection 의 타입이 `org.h2.jdbc.JdbcConnection` 인 것을 볼 수 있다.

```java
class DBConnectionUtilTest {  
  
    @Test  
    @DisplayName("DB Connection 연결 정보를 확인한다.")  
    public void connectionTest() {  
        Connection connection = DBConnectionUtil.getConnection();  
        assertThat(connection).isNotNull();  
    }  
}
```

```text
14:43:17.163 [main] INFO  a.s.connection.DBConnectionUtil -- Get Connection  = conn0: url=jdbc:h2:tcp://localhost/~/jdbc user=SA, Get Class = class org.h2.jdbc.JdbcConnection
```


이 이유는 처음 프로젝트를 생성할때 H2 를 사용하려고 Gradle 에 H2 Driver 의존성을 추가해줘서 그렇다.

```groovy
dependencies {  
    implementation 'org.springframework.boot:spring-boot-starter-jdbc'  
    runtimeOnly 'com.h2database:h2'  
    testImplementation 'org.springframework.boot:spring-boot-starter-test'  
}
```


때문에 DrvierManager 는 내부적으로 H2 Driver 를 사용하여 H2 와 커넥션을 맺고 그 결과를 반환해준다.

![](Spring/DataAccess/images/Pasted%20image%2020240814150653.png)

## Connection
Connection 은 DriverManager 가 DB 와 커넥션을 맺고 반환한 Interface 이다. 이 Connection 은 `Transaction Commit, Rollback`, `Query 생성 및 실행 (Statement)`  등과 같이 실제적으로 DB 에 어떠한 명령을 실행할 수 있게 해준다.

![](Spring/DataAccess/images/Pasted%20image%2020240814152440.png)


중요한 것은 내부적으로 `사용하는 Driver 에 따라 반환되는 구현체가 달라진다는 것`이다. ConnectionImpl 은 MySQL Driver 를 통해 생성된 인스턴스이며, JdbcConnection 은 H2 Driver 를 통해 생성된 인스턴스이다. 두 구현체 모두 Connection 인터페이스를 구현한 것을 알 수 있다.

![](Spring/DataAccess/images/Pasted%20image%2020240814160802.png)

### 여러개의 DBMS 연결
DriverManager 로부터 반환되는 Connection 은 내부적으로 사용하는 Driver 에 따라 반환되는 구현체가 달라진다. 이를 이용하면 하나의 애플리케이션에서 여러가지 DBMS 를 사용할 수 있다.

우선 MySQL 을 사용할 수 있게하는 Driver 의존성을 추가해준다.

```groovy {4}
dependencies {  
    implementation 'org.springframework.boot:spring-boot-starter-jdbc'  
    runtimeOnly 'com.h2database:h2'  
    runtimeOnly 'com.mysql:mysql-connector-j'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'  
}
```


그리고 DB 로부터 커넥션을 얻어오는 Util 클래스를 작성해준다.

```java
public class DBConnectionUtil {  
  
    private static final Logger LOGGER = LoggerFactory.getLogger(DBConnectionUtil.class);  
  
    private static final String H2_URL = "jdbc:h2:tcp://localhost/~/jdbc";  
    private static final String H2_USER = "sa";  
    private static final String H2_PASSWORD = "";  
  
    private static final String MYSQL_URL = "jdbc:mysql://localhost/onsquad";  
    private static final String MYSQL_USER = "root";  
    private static final String MYSQL_PASSWORD = "1234";  
  
    public static Connection getH2Connection() {  
        return getConnection(H2_URL, H2_USER, H2_PASSWORD);  
    }  
  
    public static Connection getMySqlConnection() {  
        return getConnection(MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD);  
    }  
  
    private static Connection getConnection(String url, String username, String password) {  
        try {  
            Connection connection = DriverManager.getConnection(url, username, password);  
            LOGGER.info("Get Connection  = {}, Get Class = {}", connection, connection.getClass());  
            return connection;  
        } catch (SQLException sqlException) {  
            throw new IllegalStateException("Connection 을 얻어오는데 실패했습니다.");  
        }  
    }  
}
```


이제 Connection 을 확인할 수 있는 테스트 코드를 짜고 실행해보면, H2 는 `org.h2.jdbc.JdbcConnection` 그리고 MySQL 은 `com.mysql.cj.jdbc.ConnectionImpl` 인 것을 확인할 수 있다.

```java
class DBConnectionUtilTest {  
  
    @Test  
    @DisplayName("H2 그리고 MYSQL Connection 연결 정보를 확인한다.")  
    public void connectionTest() {  
        Connection h2Connection = DBConnectionUtil.getH2Connection();  
        Connection mySqlConnection = DBConnectionUtil.getMySqlConnection();  
        assertThat(h2Connection).isNotNull();  
        assertThat(mySqlConnection).isNotNull();  
    }  
}
```

```text
16:02:31.579 [main] INFO  a.s.connection.DBConnectionUtil -- Get Connection  = conn0: url=jdbc:h2:tcp://localhost/~/jdbc user=SA, Get Class = class org.h2.jdbc.JdbcConnection
16:02:31.719 [main] INFO  a.s.connection.DBConnectionUtil -- Get Connection  = com.mysql.cj.jdbc.ConnectionImpl@78fb9a67, Get Class = class com.mysql.cj.jdbc.ConnectionImpl
```

## 발생할 수 있는 문제
쿼리를 수행할때마다 DriverManager 를 통해 Connection 을 얻어오는 것은 성능에 문제가 갈 수 있는 단점이 있다. 왜냐하면 Connection 을 얻어오기 위해서는 TCP 연결 하고, DB 에 한번은 갔다와야하기 때문이다. 때문에 일반적인 경우에는 미리 여러개의 Connection 들을 얻어와 이들을 모아둔 `Connection Pool` 이라는 개념을 사용하여 쿼리마다 Connection 을 얻어오는 행위를 방지하곤 한다.

## 정리
1. DriverManager 는 DB 와 커넥션을 맺고 Connection 인스턴스를 반환한다.
	- DriverManager 는 내부적으로 Driver 구현체(H2 Driver, MySQL Driver) 들을 사용하여 Driver 에 맞는 Connection 구현체를 반환한다. 
2. DriverManager 를 통해 매번 Connection 을 얻어오는 방법보다는 미리 Connection 들을 연결하고, 이들을 모아둔 Connection Pool 이라는 개념을 사용하여 성능 저하 문제를 예방한다.
