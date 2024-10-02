import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { ComponentProps } from "preact/compat"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  // header: [Component.NavBar()],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/Revi1337",
      Quartz: "https://github.com/jackyzha0/quartz",
    },
  }),
}

// 게시글 페이지
// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({
      spacerSymbol: "❯",
      rootName: "Home",
      resolveFrontmatterTitle: true,
      hideOnRoot: true,
      showCurrentPage: true
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer({
      filterFn: (node) => {
        // exclude files with the tag "explorerexclude"
        return node.file?.frontmatter?.tags?.includes("excalidraw.md") !== true
      },
      mapFn: (node) => {
        // dont change name of root node
        if (node.depth > 0) {
          // set emoji for file/folder
          if (node.file) {
            node.displayName = "- " + node.displayName
          } else if (node.depth === 1) {
            node.displayName = "📌 " + node.displayName
          } else {
            // node.displayName = "● " + node.displayName
            node.displayName = "🏷️ " + node.displayName
          }
        }
      },
      sortFn: (a, b) => {
        const nameOrderMap: Record<string, number> = {
          // 겹치는 디렉터리의 우선순위
          "Analyze": -2,
          "TroubleShoot": -1,

          // (Root) Language
          "Language": 1000,
          "Java": 1100,
          "Python": 1200,
          "Bash": 1300,
          "Language/Python/PyInstaller": 1298,
          "Language/Python/Deploy-PyPI": 1299,

          // (Root) Algorithm
          // "Algorithm": 2000,
          // "Mathematics": 2100,
          // "Algorithm/Mathematics/Euclidean": 2101,
          // "Algorithm/Mathematics/SieveOfEratosthenes": 2102,
          // "Prefixsum": 2200,
          // "BackTracking": 2300,
          "Algorithm": 2000,
          "Algorithm/Matrix": 2001,
          "Algorithm/Euclidean": 2002,
          "Algorithm/Eratosthenes": 2003,
          "Algorithm/Prefixsum": 2004,
          "Algorithm/TwoPointer": 2005,
          "Algorithm/SlidingWindow": 2006,
          "Algorithm/BackTracking": 2008,
          "Algorithm/Dijkstra": 2009,

          // (Root) ComputerScience
          "ComputerScience": 5000, // EntryPoint
          "DataStructure": 5100, // EntryPoint
          "ComputerScience/DataStructure/Array": 5101,
          "ComputerScience/DataStructure/Graph": 5102,
          "ComputerScience/DataStructure/Tree": 5103,
          "ComputerScience/DataStructure/SpanningTree": 5104,
          "ComputerScience/DataStructure/MinimumCostTree": 5105,
          "ComputerArchitecture": 5200, // EntryPoint
          "ComputerScience/ComputerArchitecture/Roadmap": 5201,
          "ComputerScience/ComputerArchitecture/Compiler_Interpreter": 5204,
          "ComputerScience/ComputerArchitecture/Data": 5205,
          "ComputerScience/ComputerArchitecture/Cpu": 5206,
          "ComputerScience/ComputerArchitecture/Memory": 5207,
          "ComputerScience/ComputerArchitecture/LittleEndian_BigEndian": 5208,
          "Network": 5300, // EntryPoint
          "Database": 5400, // EntryPoint
          "ComputerScience/Database/SQLEngine": 5402,
          "ComputerScience/Database/Select": 5403,
          "ComputerScience/Database/Like": 5404,
          "ComputerScience/Database/OrderBy": 5405,
          "ComputerScience/Database/Grouping_Aggregate": 5406,
          "ComputerScience/Database/Join": 5407,
          "Redis": 5401,

          // (Root) DesignPattern
          "DesignPattern": 7000,

          // (Root) Spring
          "Spring": 8000,
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
          "JPA": 8300,
          "Spring/JPA/@ColumnDefault": 8304,
          "Spring/JPA/@DynamicInsert_@DynamicUpdate": 8305,
          "Spring/JPA/CascadeRemove_OrphanRemoval": 8306,
          "DataJPA": 8400,
          "Spring/DataJPA/Multiple_Pageable": 8401,
          "QueryDSL": 8500,
          "Cloud": 8600,
          "Spring/docker-local-config": 8801,
          "Spring/RefactorS3Sdk": 8802,
          "Spring/Scheduling": 8803,
          "Spring/SchedulingThread": 8804,
          "Spring/QueryTransactionLog": 8805,
          "Spring/UpsertQuery": 8806,

          // (Root) Docker
          "Docker": 9000,
          "Docker/WhatIsDocker": 9100,
          "Docker/DockerBaseCommand": 9200,
          "Docker/DockerVolume": 9200,
          "Docker/DockerNetwork": 9300,
          "Docker/DockerCompose": 9400,
          "Docker/DockerBuild": 9500,
          "Docker/DockerCheetSheet": 9600,
          "Docker/forbidden_access_permission": 9901,

          // Tools
          "Tools": 10000,
          "IntelliJ": 11000,
          "PyCharm": 12000,
          "Tools/PyCharm/PycharmChangeAnaconda": 12001,

          // Settings
          "Settings": 11000,
        }

        let orderA = 0
        let orderB = 0

        if (a.file && a.file.slug) {
          orderA = nameOrderMap[a.file.slug] || 0
        } else if (a.name) {
          orderA = nameOrderMap[a.name] || 0
        }

        if (b.file && b.file.slug) {
          orderB = nameOrderMap[b.file.slug] || 0
        } else if (b.name) {
          orderB = nameOrderMap[b.name] || 0
        }

        return orderA - orderB
      },
    }))
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks()
  ],
}

// 인덱스 (tags, folders) 페이지
// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [],
}
