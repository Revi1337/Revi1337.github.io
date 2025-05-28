import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "REVI1337",
    pageTitleSuffix: "",
    enableSPA: true, // spa 를 false 로 해야지, comments 남길 수 있음!
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "Revi1337.github.io",
    ignorePatterns: ["private", "templates", ".obsidian", "**.excalidraw.md", "SSAFY", "interview", 'Excalidraw', 'woowa', 'Test.md'],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Exo",
        body: "Exo",
        code: "JetBrains Mono"
      },
      colors: {
        lightMode: {
          light: "#FBFBFB",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#1B183E", // darkgray: "#4e4e4e",
          dark: "#1B183E", // dark: "#2b2b2b",
          secondary: "#39227a", // secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)", // "rgba(57, 34, 122, .1)"
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#020617",
          lightgray: "#393639",
          gray: "#E2E8F1",
          darkgray: "#ffffff",
          dark: "#ebebec",
          secondary: "#ffffff",
          tertiary: "#00dc82",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false, enableCheckbox: true, parseBlockReferences: true }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({
        markdownLinkResolution: "absolute",
        openLinksInNewTab: false,
        lazyLoad: true,
        externalLinkIcon: false
      }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage()
    ],
  },
}

export default config
