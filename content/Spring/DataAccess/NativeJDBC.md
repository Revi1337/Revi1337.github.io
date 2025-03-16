---
title: Native JDBC
tags: ['data_access', 'JDBC', 'Statement', 'PreparedStatement']
---

##  JDBC 표준 인터페이스

![](Spring/DataAccess/images/Pasted%20image%2020240920015338.png)

## 주요 메서드
### executeUpdate()
`pstmt.executeUpdate()` 는 `Insert, Update, Delete` 문을 날릴때 사용한다. 결과값으로 `영향을 받은 row 의 개수` 를 반환하게 된다.

### executeQuery()
`pstmt.executeQuery()` 는 `Select` 문을 날릴때 사용한다. 결과값으로 `ResultSet` 를 반환하게 되는데, 반환된 row 들에 접근할 수 있다.

### executeBatch()
`pstmt.executeBatch()` 는 Batch 쿼리를 날릴때 사용한다. `addBatach()` 를 통해 쿼리를 실행하지 않고 메모리에 올려두었다가 `executeBatch()` 실행 명령이 있으면 한번에 쿼리를 날린다.

## CRUD
CRUD 에서는 Connection, PreparedStatement, ResultSet 가 사용되는데 이 리소스들은 사용하고 꼭 해제해주어야 한다. 그렇지 않으면 메모리 누수가 발생할 수 있다. 과거에는 직접 `finally` 문에서 이러한 리소스들을 직접 해제해주어야 했지만, Java 7 부터 생긴 try with resources 문법을 사용해주면 try 문에 명시된 리소스들은 `AutoClosable` 로 인해 리소스가 자동으로 해제되게 된다.

> [!note]
> try with resources 문에서 사용된 리소스들은 할당된 순서 반대로 해제되게 된다. 예를들어, Connection, PreparedStatement, ResultSet 순으로 할당되었다면, ResultSet, PreparedStatement, Connection 순으로 리소스가 해제된다.
### Initialize
테스트 메서드가 끝날때마다 모든 데이터를 삭제하는 jdbc 코드를 직접 만들어 사용할 수 있지만, 여기서는 테스트 메서드마다 CREW 테이블을 [TRUNCATE](ComputerScience/Database/interview/DELETE_DROP_TRUNCATE.md#TRUNCATE) 해주는 스크립트를 실행하도록 했다.

```java
@Slf4j  
class CrewRepositoryTest {  
  
    CrewRepository crewRepository = new CrewRepository();  
  
    private static String initializeScript;  
  
    static {  
        try {  
            initializeScript = new String(Files.readAllBytes(Paths.get("src/test/resources/crew-init.sql")));  
        } catch (IOException e) {  
            log.info("Cannot found Initialize Script", e);  
        }  
    }  
  
    @BeforeEach  
    void tearDown() throws IOException {  
        final String H2_URL = "jdbc:h2:tcp://localhost/~/jdbc";  
        final String H2_USER = "sa";  
        final String H2_PASSWORD = "";  
        final String sql = new String(Files.readAllBytes(Paths.get("src/test/resources/crew-init.sql")));  
        try (  
                Connection connection = DriverManager.getConnection(H2_URL, H2_USER, H2_PASSWORD);  
                Statement statement = connection.createStatement();  
        ) {  
            statement.execute(sql);  
        } catch (SQLException e) {  
            log.info("SQL Initialize Error", e);  
        }  
    }  
}
```


`crew-init.sql` 에는 아래의 SQL 을 적어주면 된다.

```sql
TRUNCATE TABLE CREW;  
```

### Insert
실행할 SQL 에 파라미터를 바인딩할 수 있는 PreparedStatment 를 사용한다. `?` 순서대로 Type 에 맞는 파라미터를 바인딩시켜주면 된다.

```java
public Crew save(Crew crew) throws SQLException {  
    final String sql = "INSERT INTO CREW VALUES (?, ?)";  
    try (Connection connection = DBConnectionUtil.getH2Connection();  
         PreparedStatement preparedStatement = connection.prepareStatement(sql)) {  
        preparedStatement.setLong(1, crew.getId());  
        preparedStatement.setString(2, crew.getName());  
        preparedStatement.executeUpdate();  
        return crew;  
    } catch (SQLException exception) {  
        log.info("SQL Error");  
        throw exception;  
    }  
}
```

```java
@Nested  
class Save {  
  
    @Test  
    @DisplayName("save 를 테스트한다.")  
    public void saveTest() throws SQLException {  
        Crew crew = new Crew(1L, "crew_name_1");  
        Crew savedCrew = crewRepository.save(crew);  
  
        assertSoftly(softly -> {  
            softly.assertThat(savedCrew.getId()).isEqualTo(savedCrew.getId());  
            softly.assertThat(savedCrew.getName()).isEqualTo(savedCrew.getName());  
            softly.assertThat(savedCrew).isEqualTo(savedCrew);  
            softly.assertThat(savedCrew).isSameAs(savedCrew);  
        });  
    }  
}
```

### Read
#### 단건 조회
파라미터 바인딩을 시킨 후, preparedStatement.executeQuery() 를 실행하여 ResultSet 을 얻는다. 초기 ResultSet 은 row 를 가리키고 있지 않기 때문에, `resultSet.next()` 로 반환된 row 가 있는지 확인하는 과정을 거쳐야 한다. ResultSet 으로 결과를 가져올때는 Column 명을 선택해 가져올 수 있다.

```java
public Crew findById(Long id) throws SQLException {  
    final String sql = "SELECT * FROM CREW WHERE id = ?";  
    try (Connection connection = DBConnectionUtil.getH2Connection();  
         PreparedStatement preparedStatement = connection.prepareStatement(sql)) {  
        preparedStatement.setLong(1, id);  
        try (ResultSet resultSet = preparedStatement.executeQuery()) {  
            if (resultSet.next()) {  
                return new Crew(resultSet.getLong("id"), resultSet.getString("name"));  
            }  
        }  
        throw new NoSuchElementException(String.format("cannot find crew by id : %d", id));  
    } catch (SQLException exception) {  
        log.info("SQL Error");  
        throw exception;  
    }  
}
```

```java
@Nested  
class FindById {  
  
    @Test  
    @DisplayName("id 로 crew 를 찾을 수 있으면 성공한다.")  
    public void findByIdTest1() throws SQLException {  
        Crew crew = new Crew(1L, "crew_name_1");  
        Crew savedCrew = crewRepository.save(crew);  
  
        Crew findCrew = crewRepository.findById(savedCrew.getId());  
  
        assertSoftly(softly -> {  
            softly.assertThat(findCrew.getId()).isEqualTo(savedCrew.getId());  
            softly.assertThat(findCrew.getName()).isEqualTo(savedCrew.getName());  
            softly.assertThat(findCrew).isEqualTo(savedCrew);  
            softly.assertThat(findCrew).isNotSameAs(savedCrew);  
        });  
    }  
  
    @Test  
    @DisplayName("id 로 crew 를 찾을 수 찾을 수 없으면 예외를 던진다.")  
    public void findByIdTest2() throws SQLException {  
        Crew crew = new Crew(1L, "crew_name_1");  
        Crew savedCrew = crewRepository.save(crew);  
  
        Long targetId = savedCrew.getId() + 1;  
        assertThatThrownBy(() -> crewRepository.findById(targetId))  
                .isExactlyInstanceOf(NoSuchElementException.class)  
                .hasMessage(String.format("cannot find crew by id : %d", targetId));  
    }  
}
```

####  다건 조회
다건 조회도 단건 조회와 매우 비슷하다. 단, `while (resultSet.next())` 로 반환된 row 를 모두 순회해야한다는 점에서 차이가 있다.

```java
public List<Crew> findAll() throws SQLException {  
    final String sql = "SELECT * FROM CREW";  
    try (Connection connection = DBConnectionUtil.getH2Connection();  
         PreparedStatement preparedStatement = connection.prepareStatement(sql)) {  
        try (ResultSet resultSet = preparedStatement.executeQuery()) {  
            ArrayList<Crew> crews = new ArrayList<>();  
            while (resultSet.next()) {  
                Crew crew = new Crew(resultSet.getLong("id"), resultSet.getString("name"));  
                crews.add(crew);  
            }  
            return crews;  
        }  
    } catch (SQLException exception) {  
        log.info("SQL Error");  
        throw exception;  
    }  
}
```


```java
@Nested  
class FindAll {  
  
    @Test  
    @DisplayName("모든 Crew 들을 조회한다.")  
    public void findAllTest() throws SQLException {  
        for (long i = 1; i < 6; i++) {  
            crewRepository.save(new Crew(i, "crew_name_" + i));  
        }  
  
        List<Crew> allCrews = crewRepository.findAll();  
  
        assertSoftly(softly -> {  
            softly.assertThat(allCrews).hasSize(5);  
            softly.assertThat(allCrews).extracting(Crew::getId).containsExactly(  
                    1L, 2L, 3L, 4L, 5L  
            );  
            softly.assertThat(allCrews).extracting(Crew::getName).containsExactly(  
                    "crew_name_1", "crew_name_2", "crew_name_3", "crew_name_4", "crew_name_5"  
            );  
        });  
    }  
}
```

### Update
? 순서대로 파라미터 바인딩을 시킨 후,  preparedStatement.executeUpdate() 를 실행하여 `영향을 받은 row 의 개수` 를 얻는다. PK  로 조회하였기 때문에 resultCount 의 결과는 1 이 되게 된다.

```java
public int update(Long id, String targetName) throws SQLException {  
    final String sql = "UPDATE CREW SET name = ? WHERE id = ?";  
    try (Connection connection = DBConnectionUtil.getH2Connection();  
         PreparedStatement preparedStatement = connection.prepareStatement(sql)) {  
        preparedStatement.setString(1, targetName);  
        preparedStatement.setLong(2, id);  
        int resultCount = preparedStatement.executeUpdate();  
        return resultCount;  
    } catch (SQLException exception) {  
        log.info("SQL Error");  
        throw exception;  
    }  
}
```

```java
@Nested  
class Update {  
  
    @Test  
    @DisplayName("id 로 Crew 를 찾으면 Update 에 성공한다.")  
    public void updateTest() throws SQLException {  
        Crew crew = new Crew(1L, "crew_name_1");  
        crewRepository.save(crew);  
        Crew findCrew = crewRepository.findById(crew.getId());  
  
        int resultCount = crewRepository.update(findCrew.getId(), "change_name");  
        Crew confirmCrew = crewRepository.findById(findCrew.getId());  
  
        assertSoftly(softly -> {  
            softly.assertThat(resultCount).isEqualTo(1);  
            softly.assertThat(confirmCrew.getId()).isEqualTo(1L);  
            softly.assertThat(confirmCrew.getName()).isEqualTo("change_name");  
        });  
    }  
}
```
### Delete
delete 또한 update 와 동일하다. PK 로 삭제하기 때문에 resultCount 의 결과는 1 이 된다.

```java
public int deleteById(Long id) throws SQLException {  
    final String sql = "DELETE FROM CREW WHERE id = ?";  
    try (Connection connection = DBConnectionUtil.getH2Connection();  
         PreparedStatement preparedStatement = connection.prepareStatement(sql)) {  
        preparedStatement.setLong(1, id);  
        int resultCount = preparedStatement.executeUpdate();  
        return resultCount;  
    } catch (SQLException exception) {  
        log.info("SQL Error");  
        throw exception;  
    }  
}
```

```java
@Nested  
class DeleteById {  
  
    @Test  
    @DisplayName("id 로 Crew 를 찾으면 delete 에 성공한다.")  
    public void deleteByIdTest() throws SQLException {  
        Crew crew = new Crew(1L, "crew_name_1");  
        crewRepository.save(crew);  
        Crew findCrew = crewRepository.findById(crew.getId());  
  
        int resultCount = crewRepository.deleteById(findCrew.getId());  
        assertSoftly(softly -> {  
            softly.assertThat(resultCount).isEqualTo(1);  
            softly.assertThatThrownBy(() -> crewRepository.findById(findCrew.getId()))  
                   .isExactlyInstanceOf(NoSuchElementException.class)  
                   .hasMessage(String.format("cannot find crew by id : %d", findCrew.getId()));  
        });  
    }  
}
```

## Batch Query
여러개의 insert 쿼리를 하나의 쿼리로 묶는 Batch 쿼리와 같은 경우에는 `preparedStatement.executeBatch()` 를 사용한다. try with resources 문에서 생성된 PreparedStatement 를 재사용하기 위해 `clearParameters()` 로 바인딩된 파라미터를 비워주어야 한다.

> [!note]
> Batch Insert 가 정상적으로 수행되는지 확인하기 위해 MYSQL 을 사용한다. 
> - rewriteBatchedStatements : Batch 쿼리를 허용할지 말지 설정한다.
> - profileSQL : Driver에서 전송하는 쿼리를 출력한다.
> - logger : Driver에서 쿼리 출력시 사용할 Logger를 설정한다.
> - maxQuerySizeToLog : 출력할 쿼리 길이를 설정한다.

```java
public void insertBatch(List<Crew> crews) throws SQLException {  
    final String sql = "INSERT INTO crew VALUES (?, ?)";  
    try (Connection connection = DriverManager.getConnection(  
            "jdbc:mysql://localhost/batchinsert?UTF-8&rewriteBatchedStatements=true&profileSQL=true&logger=Slf4JLogger&maxQuerySizeToLog=200",  
            "root",  
            "1234");  
            PreparedStatement preparedStatement = connection.prepareStatement(sql)  
    ) {  
        for (Crew crew : crews) {  
            preparedStatement.setLong(1, crew.getId());  
            preparedStatement.setString(2, crew.getName());  
            preparedStatement.addBatch();  
            preparedStatement.clearParameters();  
        }  
        preparedStatement.executeBatch();  
    } catch (SQLException exception) {  
        log.info("SQL Error");  
        throw exception;  
    }  
}
```

```java
@Nested  
class InsertBatch {  
  
    @BeforeEach  
    void tearDown() {  
        final String MYSQL_URL = "jdbc:mysql://localhost/batchinsert";  
        final String MYSQL_USER = "root";  
        final String MYSQL_PASSWORD = "1234";  
        try (  
                Connection connection = DriverManager.getConnection(MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD);  
                Statement statement = connection.createStatement();  
        ) {  
            statement.execute(initializeScript);  
        } catch (SQLException e) {  
            log.info("SQL Initialize Error", e);  
        }  
    }  
  
    @Test  
    @DisplayName("Batch Insert 를 테스트한다.")  
    public void saveTest() throws SQLException {  
        List<Crew> targetCrews = LongStream.rangeClosed(1, 101)  
                .mapToObj(value -> new Crew(value, "crew_name_" + value))  
                .toList();  
        crewRepository.insertBatch(targetCrews);  
    }  
}
```


`rewriteBatchedStatements` 를 false 로 설정해주게 되면 executeBatch() 를 사용한다 해도 insert 쿼리가 100 개씩 나가게 된다.

![](Spring/DataAccess/images/Pasted%20image%2020240907175123.png)


반대로 `rewriteBatchedStatements` 를 true 로 설정해주게 되면 100개의 insert 쿼리가 하나의 쿼리로 묶여 수행된다.

![](Spring/DataAccess/images/Pasted%20image%2020240907175224.png)

