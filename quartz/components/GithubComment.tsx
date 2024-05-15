import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { simplifySlug } from "../util/path"
import {useEffect} from "preact/hooks"

const GithubComment: QuartzComponent = (props: QuartzComponentProps) => {
  const {fileData, displayClass, cfg} = props;
  const url = simplifySlug(fileData.slug!);
  useEffect(() => {
     console.log('asdasd');
  })

  return (
    <div>
      {url !== "/" && url !== "About-Me" && url !== "Projects" && (
        <>
          <div className="giscus"></div>
          <script
            src="https://giscus.app/client.js"
            data-repo="Revi1337/Revi1337.github.io"
            data-repo-id="R_kgDOL7Ql2g"
            data-category="General"
            data-category-id="DIC_kwDOL7Ql2s4CfWPd"
            data-mapping="pathname"
            data-strict="0"
            data-reactions-enabled="1"
            data-emit-metadata="0"
            data-input-position="top"
            data-theme="light"
            data-lang="ko"
            crossOrigin="anonymous"
            async
          />
        </>
      )}
    </div>
  )
}

export default (() => GithubComment) satisfies QuartzComponentConstructor



// export default (() => {
//   function GithubComment(props: QuartzComponentProps) {
//     const {fileData} = props;
//     const url = simplifySlug(fileData.slug!);
//     return (
//       <div>
//         {url !== "/" && url !== "About-Me" && url !== "Projects" && (
//           <>
//             <button id="btn">Click me</button>
//             <div className="giscus"></div>
//             <script
//               src="https://giscus.app/client.js"
//               data-repo="Revi1337/Revi1337.github.io"
//               data-repo-id="R_kgDOL7Ql2g"
//               data-category="General"
//               data-category-id="DIC_kwDOL7Ql2s4CfWPd"
//               data-mapping="pathname"
//               data-strict="0"
//               data-reactions-enabled="1"
//               data-emit-metadata="0"
//               data-input-position="top"
//               data-theme="light"
//               data-lang="ko"
//               crossOrigin="anonymous"
//               async
//             />
//           </>
//         )}
//       </div>
//     )
//   }
//
//   return GithubComment
// }) satisfies QuartzComponentConstructor


// function GithubComment(props: QuartzComponentProps) {
//   const {fileData} = props;
//   const url = simplifySlug(fileData.slug!);
//   return (
//     <div>
//       {url !== "/" && url !== "About-Me" && url !== "Projects" && (
//         <>
//           <div className="giscus"></div>
//           <script
//             src="https://giscus.app/client.js"
//             data-repo="Revi1337/Revi1337.github.io"
//             data-repo-id="R_kgDOL7Ql2g"
//             data-category="General"
//             data-category-id="DIC_kwDOL7Ql2s4CfWPd"
//             data-mapping="pathname"
//             data-strict="0"
//             data-reactions-enabled="1"
//             data-emit-metadata="0"
//             data-input-position="top"
//             data-theme="light"
//             data-lang="ko"
//             crossOrigin="anonymous"
//             async
//           />
//         </>
//       )}
//     </div>
//   )
// }
//
// export default (() => GithubComment) satisfies QuartzComponentConstructor


// import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
// import { simplifySlug } from "../util/path"
//
// function GithubComment(props: QuartzComponentProps) {
//   const {fileData} = props;
//   const url = simplifySlug(fileData.slug!);
//   return (
//     <div>
//       {url !== "/" && url !== "About-Me" && url !== "Projects" && (
//         <>
//           <div className="giscus"></div>
//           <script
//             src="https://giscus.app/client.js"
//             data-repo="Revi1337/Revi1337.github.io"
//             data-repo-id="R_kgDOL7Ql2g"
//             data-category="General"
//             data-category-id="DIC_kwDOL7Ql2s4CfWPd"
//             data-mapping="pathname"
//             data-strict="0"
//             data-reactions-enabled="1"
//             data-emit-metadata="0"
//             data-input-position="top"
//             data-theme="light"
//             data-lang="ko"
//             crossOrigin="anonymous"
//             async
//           />
//         </>
//       )}
//     </div>
//   )
// }
//
// export default (() => GithubComment) satisfies QuartzComponentConstructor




// import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
//
// function AboutMe(props: QuartzComponentProps) {
//   return (
//     <div>
//       <h1>About Me</h1>
//       <p>안녕하세요!👋 블로그 운영자 <strong>김종환</strong>이라고 합니다.</p>
//
//       <p>
//         저는 백엔드 개발자가 되기 위해 노력하고 있는 취준생입니다.
//         <br />
//         대학교 1학년 때 개발을 처음 접했고, 현재까지 적성에 맞아 재밌게 공부하고 있습니다.
//       </p>
//
//       <p>
//         대학교 커리큘럼을 따라 무작정 개발 공부를 하면서 때때로 왜 이런 지식을 배워야 하는지에 대한 의문이 든 적이 있습니다. (이런 걸 굳이 배워야 할까..)
//       </p>
//
//       <p>
//         하지만 프로젝트를 진행하면서 그 의문이 점차 해소됐습니다. 아! 이래서 이런 내용을 배웠구나!
//         <br />
//         목적을 가지고 무언가 만들어내려고 했을 때, 개발을 바라보는 관점이 달라졌고, 더 나은 이해를 위해 자기 주도적으로 공부하게 됐습니다. 또, 가장 중요한 "진짜" 문제들을 만나볼 수
//         있었습니다.
//       </p>
//
//       <p>
//         <strong>그래서 저는 현실적인 문제를 해결할 능력이 있는 개발자가 되고 싶습니다.</strong>
//         <br />
//         <strong>이를 위해 꾸준함과 긴 호흡으로 이 여정을 이어가 보려 합니다. 같이 함께 했으면 좋겠습니다 :)</strong>
//       </p>
//
//       <hr />
//
//       <h1>Contact</h1>
//       <p>
//         이메일 : jongdeug2021@gmail.com
//       </p>
//     </div>
//   )
// }
//
// export default (() => AboutMe) satisfies QuartzComponentConstructor