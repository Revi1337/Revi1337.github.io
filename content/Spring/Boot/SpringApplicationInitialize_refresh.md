

Spring 컨테이너(애플리케이션 컨텍스트)를 **초기화하고 리프레시하는 핵심 메서드**야.  
이 메서드는 **모든 Bean을 초기화하고, 필요한 설정을 마친 후 애플리케이션을 실행 가능한 상태로 만든다.**  
즉, **Spring 애플리케이션의 부팅 과정**을 담당하는 메서드라고 보면 돼.

### prepareRefresh
`AbstractApplicationContext.preparRefresh()` 메서드는 Spring Context. 즉 Application Context 의 상태를 초기화하고, 환경변수(Environment) 와 Propery 설정, 그리고 Resource Loading 를 하는 과정을 수행합니다.

![](Spring/Boot/images/Pasted%20image%2020250311001545.png)

#### initPropertySources
`AnnotationConfigServletWebServerApplicationContext(AbstractApplicationContext).initPropertySources()` 메서드는 외부 설정 파일이나 Property 값(`application.properties` 등)을 `Environment` 에 로드하는 작업을 수행합니다.

![](Spring/Boot/images/Pasted%20image%2020250311002803.png)


`GenericWebApplicationContext.initPropertySources()` 메서드에서는 `ConfigurableWebEnvironment` 를 사용하여 `ServletContext`. 즉, 웹 애플레케이션과 관련된 `PropertySource` 를 초기화하고, 후에 애플리케이션에서 해당 `Property` 들을 사용할 수 있도록 준비합니다.

> 참고로 ConfigurableEnvironment 는 `Environment` 를 확장한 Interface 이며, 환경 설정을 변경하고 조작할 수 있습니다. 또한, StandardServletEnvironment 의 initPropertySources(ServletContext) 를 호출하게 됩니다.

![](Spring/Boot/images/Pasted%20image%2020250311003318.png)


#### getEnvironment().validateRequiredProperties()
`getEnvironment().validateRequiredProperties()` 메서드는 앞의 `initPropertySources` 로 부터 가져온 `Environment` 의 `필수 속성` 이 제대로 설정되었는지 확인하는 역할을 합니다. 

> 주석에도 나와있지만, ConfigurablePropertyResolver.setRequiredProperties() 에서 설정한 필수속성들을 검증하는 과정입니다.

![](Spring/Boot/images/Pasted%20image%2020250311005645.png)


Environment 의 필수 속성을 검증하는 과정은 최종적으로 `AbstractEnvironment` 에서 이루어집니다.

![](Spring/Boot/images/Pasted%20image%2020250311010459.png)

#### ApplicationListeners Backup
`getEnvironment().validateRequiredProperties()` 음 마치면 다음 과정이 수행됩니다.

- ApplicationContext 가 초기화되는 `refresh()` 과정 이전에 등록된 EventListener 들이 없으면, 현재 활성화된 EventListener 들을 순서를 유지하며 `earlyApplicationListenrs` 에 백업하는 과정을 수행합니다. 
- 백업을 마치면, `earlyApplicationEvents` 는 비게 됩니다. 이는 `refresh()` 중에 발생하는 Event 를 수집하기 위함입니다.

> 여기서 미쳐 해결하지 못한게 있습니다. refresh() 는 보통 한번만 호출합니다. 동일한 Thread 에서 refresh() 를 두번 호출하면, IllegalArgumentException 이 터집니다. 그런데 저 else 블록은 왜 있는걸까요? 제가 생각할 때, 만약 Spring Context 를 close() 했다가 다시 refresh() 하여 다시 초기화를 진행시켰을 때를 고려한게 안전장치가 아닌가.. 싶습니다.

![](Spring/Boot/images/Pasted%20image%2020250311011309.png)

### prepareBeanFactory 


![](Spring/Boot/images/Pasted%20image%2020250311001625.png)


![](Spring/Boot/images/Pasted%20image%2020250311001648.png)



SpringApplication
AbstractApplicationContext
EnvironmentPostProcessorApplicationListener
ConfigDataEnvironmentPostProcessor
PropertySourcePropertyResolver
ConfigDataImporter
ConfigDataEnvirionment


EnableAsync
AsyncConfigurationSelector
ProxyAsyncConfiguration
AsyncAnnotationBeanPostProcessor
AbstractBeanFactoryAwareAdvisingPostProcessor
AbstractAdvisingBeanPostProcessor
AbstractAutowireCapableBeanFactory
AsyncAnnotationAdvisor
AnnotationAsyncExecutionInterceptor
AsyncExecutionInterceptor
AsyncExecutionAspectSupport

