import { boot } from 'quasar/wrappers';

import Prism from 'prismjs';

import VMdPreviewHtml from '@kangc/v-md-editor/lib/preview-html';
import '@kangc/v-md-editor/lib/style/preview-html.css';

import VueMarkdownEditor from '@kangc/v-md-editor';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import enUS from '@kangc/v-md-editor/lib/lang/en-US';
export default boot(({ app }) => {
  Prism.highlightAll();
  VueMarkdownEditor.use(vuepressTheme, {
    Prism: Prism
  }).lang.use('en-US', enUS);
  app.use(VueMarkdownEditor);
  app.use(VMdPreviewHtml);
});

// import VMdEditor from '@kangc/v-md-editor';
// import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
// import hljs from 'highlight.js';
// import '@kangc/v-md-editor/lib/style/base-editor.css';
// import '@kangc/v-md-editor/lib/theme/style/github.css';
// export default boot(({ app }) => {
//   VMdEditor.use(githubTheme, {
//     Hljs: hljs
//   });
//   app.use(VMdEditor);
// });
