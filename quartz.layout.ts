import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { Options } from "./quartz/components/Explorer"

/**
 * 폴더 이름 명시 : 폴더 하위 index.md 내부 Frontmatter: title 의 값을 적어야 한다. title 이 없으면 폴더이름을 따라간다.
 * <p>
 * 파일 이름 명시 : 폴더이름/파일이름 형식으로 적어야 한다. Web 에 보여지는 이름은 파일 내부 Frontmatter: title 을 따라간다.
 */
export const sortFn: Options["sortFn"] = (a, b) => {
  const nameOrderMap: Record<string, number> = {
    // 겹치는 디렉터리의 우선순위
    "Analyze": -2,
    "TroubleShoot": -1,

    // (Root) Language
    "Language": 1000,
    "Java": 1100,
    "Language/Java/1_CallByValue_CallByReference": 1101,
    "Language/Java/2_JDK_JRE": 1102,
    "Language/Java/3_Identity_Equality": 1103,
    "Language/Java/4_String_StringBuilder_StringBuffer": 1104,
    "Python": 1200,
    "Language/Python/1_Sequence_NonSequence": 1201,
    "Language/Python/2_Iterable_Iterator": 1202,
    "Language/Python/4_Scope": 1250,
    "Language/Python/99_PyInstaller": 1298,
    "Language/Python/100_Deploy-PyPI": 1299,
    "Bash": 1300,

    // (Root) Algorithm
    "Algorithm": 2000,
    "Algorithm/Matrix": 2001,
    "Algorithm/Euclidean": 2002,
    "Algorithm/Eratosthenes": 2003,
    "Algorithm/Prefixsum": 2004,
    "Algorithm/TwoPointer": 2005,
    "Algorithm/SlidingWindow": 2006,
    "Algorithm/BackTracking": 2008,
    "Algorithm/UnionFind": 2010,
    "Algorithm/Dijkstra": 2011,
    "Algorithm/Sort/InsertionSort": 2501,
    "Algorithm/Sort/SelectionSort": 2502,
    "Algorithm/Sort/BubbleSort": 2503,
    "Algorithm/Sort/HeapSort": 2504,

    // (Root) ComputerScience
    "Computer Science": 5000, // EntryPoint

    "DataStructure": 5100, // EntryPoint
    "ComputerScience/DataStructure/Array": 5101,
    "ComputerScience/DataStructure/LinkedList": 5102,
    "ComputerScience/DataStructure/Stack": 5103,
    "ComputerScience/DataStructure/Queue": 5104,
    "ComputerScience/DataStructure/HashTable": 5105,
    "ComputerScience/DataStructure/Heap": 5106,
    "ComputerScience/DataStructure/Graph": 5107,
    "ComputerScience/DataStructure/Tree": 5108,
    "ComputerScience/DataStructure/SpanningTree": 5109,
    "ComputerScience/DataStructure/MST": 5110,

    "Computer Architecture": 5200, // EntryPoint
    "ComputerScience/ComputerArchitecture/Compiler_Interpreter": 5204,
    "ComputerScience/ComputerArchitecture/Data": 5205,
    "ComputerScience/ComputerArchitecture/ByteOrder": 5206,
    "ComputerScience/ComputerArchitecture/Operand": 5207,
    "ComputerScience/ComputerArchitecture/Cpu": 5208,
    "ComputerScience/ComputerArchitecture/Memory": 5209,

    "Operating System": 5300, // EntryPoint

    "Network": 5400, // EntryPoint

    "Database": 5500, // EntryPoint
    "interview": 5600, // EntryPoint
    "Redis": 5700, // EntryPoint
    "ComputerScience/Database/DataModeling": 5801,
    "ComputerScience/Database/SQLEngine": 5802,
    "ComputerScience/Database/Select": 5803,
    "ComputerScience/Database/Like": 5804,
    "ComputerScience/Database/OrderBy": 5805,
    "ComputerScience/Database/Grouping_Aggregate": 5806,
    "ComputerScience/Database/Join": 5807,
    "ComputerScience/Database/QueryProfiling": 5820,
    "ComputerScience/Database/DummyData": 5821,
    "ComputerScience/Database/CopyTable": 5822,

    // (Root) DesignPattern
    "Design Pattern": 7000,

    // (Root) Spring
    "Spring": 8000,

    "Cache": 8025,
    "Spring/Cache/1_SpringCacheAbstraction": 8026,
    "Spring/Cache/2_RedisCacheManagerCaching": 8027,
    "Spring/Cache/ImplementRedisCacheWithAOP": 8028,
    "Spring/Cache/4_IsReallyNeedRedis": 8029,
    "Spring/Cache/5_RedisVSCaffeine": 8030,

    "Boot": 8050,
    "Spring/Boot/Actuator": 8051,
    "Spring/Boot/Prometheus": 8052,
    "Spring/Boot/Grafana": 8053,

    "MVC": 8100,
    "Spring/MVC/Filter": 8102,
    "Spring/MVC/Interceptor": 8103,
    "Spring/MVC/@RequestPart": 8104,

    "DataAccess": 8200,
    "Spring/DataAccess/Connection": 8201,
    "Spring/DataAccess/Connection_Pool": 8202,
    "Spring/DataAccess/ScriptUtilsMechanism": 8203,

    "JPA": 8300,
    "Spring/JPA/@ColumnDefault": 8304,
    "Spring/JPA/@DynamicInsert_@DynamicUpdate": 8305,
    "Spring/JPA/CascadeRemove_OrphanRemoval": 8306,

    "DataJPA": 8400,
    "Spring/DataJPA/Multiple_Pageable": 8401,

    "QueryDSL": 8500,

    "Security": 8550,
    "Spring/Security/OAuth2AuthenticatoinFlow": 8551,
    "Spring/Security/RestOAuth2FrontendBackendRole": 8552,
    "Spring/Security/WhyNotAuthCodeReceiveInFrontend": 8553,
    "Spring/Security/SpringOAuth2Implement": 8554,
    "Spring/Security/SpringOAuth2ImplementRefactor": 8555,

    "Cloud": 8600,

    "Spring/docker-local-config": 8801,
    "Spring/Scheduling": 8802,
    "Spring/SchedulingThread": 8803,
    "Spring/QueryTransactionLog": 8804,
    "Spring/UpsertQuery": 8805,
    "Spring/ValidateMagicByte": 8806,
    "Spring/RefactoringS3Upload": 8807,
    "Spring/RefactorUsingOOP": 8808,
    "Spring/JsonField_Deserializer": 8809,

    // (Root) Docker
    "Docker": 9000,
    "Docker/WhatIsDocker": 9010,
    "Docker/DockerBaseCommand": 9020,
    "Docker/DockerVolume": 9030,
    "Docker/DockerNetwork": 9040,
    "Docker/DockerCompose": 9050,
    "Docker/DockerBuild": 9060,
    "Docker/DockerCheetSheet": 9070,
    "Docker/forbidden_access_permission": 9081,

    // (Root) AWS
    "AWS": 9500,
    "AWS/1_S3BucketForWebHosting": 9501,
    "AWS/2_S3ConnectDomain": 9502,
    "AWS/3_HostedS3_Domain_Https": 9503,
    "AWS/4_S3BucketForBackend": 9504,
    "AWS/5_S3BucketCloudFrontForBackend": 9505,
    "AWS/6_EC2": 9506,
    "AWS/7_EC2_RDS_Connect": 9507,
    "AWS/8_EC2_Elastic_Cache_Connect": 9508,
    "AWS/9_EC2ConnectDomain": 9509,
    "AWS/10_EC2SupplyHttps": 9510,
    "AWS/11_RDS": 9511,
    "AWS/20_AwsDomainBuy": 9520,


    // (Root) Tools
    "Tools": 10000,
    "PyCharm": 12000,
    "Tools/PyCharm/PycharmChangeAnaconda": 12001,

    // (Root) Settings
    "Settings": 11000,

    // (Root) Performance
    "Performance": 12000,

    // (Root) Wireshark
    "WireShark": 13000,
  }

  let orderA = 0
  let orderB = 0

  if (!a.isFolder && a.slug) {
    orderA = nameOrderMap[a.slug] || 0
  } else if (a.isFolder) {
    orderA = nameOrderMap[a.displayName] || 0
  }

  if (!b.isFolder && b.slug) {
    orderB = nameOrderMap[b.slug] || 0
  } else if (b.isFolder) {
    orderB = nameOrderMap[b.displayName] || 0
  }

  return orderA - orderB
}

/**
 * Explorer Custom Filter Function
 */
export const filterFn: Options["filterFn"] = (node) => {
  return node.data?.tags?.includes("excalidraw.md") !== true
}


// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/Revi1337",
      Quartz: "https://github.com/jackyzha0/quartz",
    },
  }),
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({
      title: 'Documentation',
      folderClickBehavior: 'collapse',
      folderDefaultState: 'collapsed',
      useSavedState: false,
      order: ["sort", "filter", "map"],
      sortFn,
      filterFn
    })
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.DesktopOnly(Component.RecentNotes({ limit: 5, showTags: false, title: 'Recent Posts'}))
  ],
}

// tags & folders 페이지
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({
      title: 'Documentation',
      folderClickBehavior: 'collapse',
      folderDefaultState: 'collapsed'
    })
  ],
  right: [],
}
