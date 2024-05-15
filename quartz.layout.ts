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
    Component.Search(),
    Component.Darkmode(),
    Component.MobileOnly(Component.Spacer()),
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
      },
    })),
    Component.Backlinks(),
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Graph({
      localGraph: {
        drag: true, // whether to allow panning the view around
        zoom: true, // whether to allow zooming in and out
        depth: 1, // how many hops of notes to display
        scale: 1.1, // default view scale
        repelForce: 0.5, // how much nodes should repel each other
        centerForce: 0.3, // how much force to use when trying to center the nodes
        linkDistance: 40, // how long should the links be by default?
        fontSize: 0.2, // what size should the node labels be?
        opacityScale: 1, // how quickly do we fade out the labels when zooming out?
        removeTags: [], // what tags to remove from the graph
        showTags: true, // whether to show tags in the graph
      },
      globalGraph: {
        drag: true,
        zoom: true,
        depth: -1,
        scale: 0.9,
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 40,
        fontSize: 0.2,
        opacityScale: 1,
        removeTags: [], // what tags to remove from the graph
        showTags: true, // whether to show tags in the graph
      },
    }),
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
