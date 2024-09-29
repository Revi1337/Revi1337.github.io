import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import GithubComment from "../GithubComment"

const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const {fileData, tree} = props;
  const content = htmlToJsx(fileData.filePath!, tree)
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const classString = ["popover-hint", ...classes].join(" ")
  // const GithubComments = GithubComment()
  return (
    <div>
      <article className={classString}>{content}</article>
      {/*<GithubComments {...props} />*/}
    </div>
  )
}

export default (() => Content) satisfies QuartzComponentConstructor
