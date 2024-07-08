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
        // if ((!a.file && !b.file) || (a.file && b.file)) {
        //   // sensitivity: "base": Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A
        //   // numeric: true: Whether numeric collation should be used, such that "1" < "2" < "10"
        //   return a.displayName.localeCompare(b.displayName, undefined, {
        //     numeric: true,
        //     sensitivity: "base",
        //   })
        // }
        if (a.file && !b.file) {
          return 1
        } else {
          return -1
        }
      }
      // sortFn: (a, b) => {
      //   const nameOrderMap: Record<string, number> = {
      //     "Language": 100,
      //     "Algorithm": 101,
      //     "ComputerScience": 102,
      //     "Framework": 103,
      //     "DesignPattern": 104,
      //     "Settings": 105,
      //     "SSAFY": 106,
      //     "interview": 107
      //   }
      //
      //   let orderA = 0
      //   let orderB = 0
      //
      //   if (a.file && a.file.slug) {
      //     orderA = nameOrderMap[a.file.slug] || 0
      //   } else if (a.name) {
      //     orderA = nameOrderMap[a.name] || 0
      //   }
      //
      //   if (b.file && b.file.slug) {
      //     orderB = nameOrderMap[b.file.slug] || 0
      //   } else if (b.name) {
      //     orderB = nameOrderMap[b.name] || 0
      //   }
      //
      //   return orderA - orderB
      // },
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
