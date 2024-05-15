import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

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
      mapFn: (node) => {
        // dont change name of root node
        if (node.depth > 0) {
          // set emoji for file/folder
          if (node.file) {
            node.displayName = "- " + node.displayName
          } else if (node.depth === 1) {
            node.displayName = "📌 " + node.displayName
          } else {
            node.displayName = "● " + node.displayName
          }
        }
      }
    }))
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    // Component.Graph({
    //   localGraph: {
    //     drag: true,
    //     zoom: true,
    //     depth: 1,
    //     scale: 1.1,
    //     repelForce: 0.5,
    //     centerForce: 0.3,
    //     linkDistance: 40,
    //     fontSize: 0.2,
    //     opacityScale: 1,
    //     removeTags: [],
    //     showTags: true,
    //   },
    //   globalGraph: {
    //     drag: true,
    //     zoom: true,
    //     depth: -1,
    //     scale: 0.9,
    //     repelForce: 0.5,
    //     centerForce: 0.3,
    //     linkDistance: 40,
    //     fontSize: 0.2,
    //     opacityScale: 1,
    //     removeTags: [],
    //     showTags: true,
    //   },
    // }),
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
