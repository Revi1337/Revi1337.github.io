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
      // sortFn: (a, b) => {
      //   if ((!a.file && !b.file) || (a.file && b.file)) {
      //     return a.displayName.localeCompare(b.displayName, undefined, {
      //       numeric: true,
      //       sensitivity: "base",
      //     })
      //   }
      //   if (a.file && !b.file) {
      //     return 1
      //   } else {
      //     return -1
      //   }
      // }
      sortFn: (a, b) => {
        const nameOrderMap: Record<string, number> = {
          "Language": 1000,
          "Algorithm": 2000,
          "ComputerScience": 3000,
          "DesignPattern": 4000,

          "Spring": 5000,
          "Spring/MVC": 5100,
          "Spring/JPA": 5200,
          "Spring/DataJPA": 5300,
          "Spring/QueryDSL": 5400,
          "Spring/Cloud": 5500,

          "Docker": 6000,
          "Docker/Docker": 6100,
          "Docker/DockerImage": 6200,
          "Docker/DockerVolume": 6300,
          "Docker/DockerNetwork": 6400,
          "Docker/DockerCompose": 6500,
          "Docker/run_exec": 6600,
          "Docker/ps,stop,rm,rmi,logs,images": 6700,
          "Docker/DockerCheetSheet": 6800,
          "Docker/Trouble Shooting": 6900,
          "Docker/forbidden_access_permission": 6901,

          "Settings": 7000,
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
