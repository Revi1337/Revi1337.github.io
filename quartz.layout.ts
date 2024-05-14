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
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    // Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
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


// import { PageLayout, SharedLayout } from "./quartz/cfg"
// import * as Component from "./quartz/components"
//
// // components shared across all pages
// export const sharedPageComponents: SharedLayout = {
//   head: Component.Head(),
//   header: [],
//   footer: Component.Footer({
//     links: {
//       GitHub: "https://github.com/jackyzha0/quartz",
//       "Discord Community": "https://discord.gg/cRFFHYye7t",
//     },
//   }),
// }
//
// // components for pages that display a single page (e.g. a single note)
// export const defaultContentPageLayout: PageLayout = {
//   beforeBody: [
//     Component.Breadcrumbs(),
//     Component.ArticleTitle(),
//     Component.ContentMeta(),
//     Component.TagList(),
//   ],
//   left: [
//     Component.PageTitle(),
//     Component.MobileOnly(Component.Spacer()),
//     Component.Search(),
//     Component.Darkmode(),
//     Component.DesktopOnly(Component.Explorer()),
//   ],
//   right: [
//     Component.Graph(),
//     Component.DesktopOnly(Component.TableOfContents()),
//     Component.Backlinks(),
//   ],
// }
//
// // components for pages that display lists of pages  (e.g. tags or folders)
// export const defaultListPageLayout: PageLayout = {
//   beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
//   left: [
//     Component.PageTitle(),
//     Component.MobileOnly(Component.Spacer()),
//     Component.Search(),
//     Component.Darkmode(),
//     Component.DesktopOnly(Component.Explorer()),
//   ],
//   right: [],
// }
