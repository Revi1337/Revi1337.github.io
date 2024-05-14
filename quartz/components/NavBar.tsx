import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import style from "../components/styles/navbar.scss"
import DarkmodeConstructor from "./Darkmode"

const NavBar: QuartzComponent = (props: QuartzComponentProps) => {
  const title = props.cfg?.pageTitle ?? i18n(props.cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(props.fileData.slug!)
  const Darkmode = DarkmodeConstructor()
  const baseUrl = `https://${props.cfg.baseUrl}`
  return (
    <nav>
      <h1 className={classNames(props.displayClass, "page-title")}>
        <a href={baseDir}>{title}</a>
      </h1>
      <ul>
        <li>
          <a href={baseDir}>📙 Blog</a>
        </li>
        <li>
          <a href={`${baseDir}/Projects`}>📂 Projects</a>
        </li>
        <li>
          <a href={`${baseDir}/About-Me`}>🔎 About</a>
        </li>
        <li>
          <a href="https://github.com/JongDeug" target="_blank">⚡ Github</a>
        </li>
      </ul>

      <Darkmode {...props} children={props.children} />
    </nav>
  )
}

NavBar.css = style

export default (() => NavBar) satisfies QuartzComponentConstructor