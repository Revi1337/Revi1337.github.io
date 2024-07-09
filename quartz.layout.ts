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
          "TroubleShooting": -1,

          // (Root) Language
          "Language": 1000,
          "Java": 1100,
          "Python": 1200,
          "Bash": 1300,
          "Language/Python/PyInstaller": 1298,
          "Language/Python/Deploy-PyPI": 1299,

          // (Root) Algorithm
          "Algorithm": 2000,
          "PrefixSum": 2100,
          "BackTracking": 2200,

          // (Root) ComputerScience
          "ComputerScience": 5000,
          "DataStructure": 5100,
          "Network": 5200,
          "Database": 5300,
          "Redis": 5301,
          "ComputerScience/Database/SQLEngine": 5302,
          "ComputerScience/Database/Select": 5303,
          "ComputerScience/Database/Like": 5304,
          "ComputerScience/Database/OrderBy": 5305,
          "ComputerScience/Database/Grouping_Aggregate": 5306,
          "ComputerScience/Database/Join": 5307,

          // (Root) DesignPattern
          "DesignPattern": 7000,

          // (Root) Spring
          "Spring": 8000,
          "MVC": 8100,
          "JPA": 8200,
          "DataJPA": 8300,
          "QueryDSL": 8400,
          "Cloud": 8500,
          "Spring/docker-local-config": 8601,
          "Spring/MVC/Filter": 8102,
          "Spring/MVC/Interceptor": 8103,
          "Spring/MVC/@RequestPart": 8104,

          // (Root) Docker
          "Docker": 9000,
          "Docker/Docker": 9100,
          "Docker/DockerVolume": 9200,
          "Docker/DockerNetwork": 9300,
          "Docker/DockerImage": 9400,
          "Docker/DockerCompose": 9500,
          "Docker/run_exec": 9600,
          "Docker/ps,stop,rm,rmi,logs,images": 9700,
          "Docker/DockerCheetSheet": 9800,
          "Docker/forbidden_access_permission": 9901,

          // Tools
          "Tools": 10000,
          "Intellij": 11000,
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
