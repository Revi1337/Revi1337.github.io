"use strict";(globalThis["webpackChunkr3vi1e37"]=globalThis["webpackChunkr3vi1e37"]||[]).push([[801],{5801:(e,a,t)=>{t.r(a),t.d(a,{default:()=>ve});var n=t(9835),l=t(499),r=(t(9665),t(6970)),o=t(1957),s=t(8339);const c=e=>((0,n.dD)("data-v-8e5b85a4"),e=e(),(0,n.Cn)(),e),i={class:"row q-gutter-lg"},u={class:"flex flex-center"},p={class:"text-center"},d={class:"col"},g={class:"title"},v={class:"row q-gutter-sm"},h={class:"col-3"},y={class:"row no-wrap items-center"},f={class:"text-overline text-red"},w=c((()=>(0,n._)("span",{class:"text-bold"}," · ",-1))),m={class:"text-caption"},x={key:0,class:"q-ml-lg"},b={__name:"PostComponent",props:{id:{type:Number,required:!1},title:{type:String,required:!0},content:{type:String,required:!0},hashtag:{type:Array[String],required:!0},createdAt:{type:String,required:!0},createdBy:{type:String,required:!1},category:{type:String,required:!0},shadow:{type:Boolean,required:!1,default:!0},border:{type:Boolean,required:!1,default:!0},folder:{type:String,required:!0},filename:{type:String,requried:!0}},setup(e){const a=e,t=(0,l.iH)(!1),c=(0,l.iH)(!1),b=()=>{c.value=!c.value,t.value=!t.value},k=(0,s.tv)(),_=()=>k.push({name:"Index",query:{post:a.folder.replace("/",""),markdown:a.filename.replace("/","")}}),S=new Date(a.createdAt),q=S.getFullYear(),H=String(S.getMonth()+1).padStart(2,"0"),T=String(S.getDate()).padStart(2,"0"),M=String(S.getHours()).padStart(2,"0"),Q=String(S.getMinutes()).padStart(2,"0"),Z=`${q}-${H}-${T} ${M}:${Q}`,B=(0,n.Fl)({get:()=>a.content.slice(0,80)}),D=(0,n.Fl)({get:()=>{const e=Math.floor(a.content.split("\n").length/40);return 0===e?"1 min to read":`${e} min to read`}}),P=e=>"Spring"===e?"Spring":"Vue"===e?"Vue":"Python"===e?"Python":"Bash"===e?"Bash":"Java"===e?"Java":"JavaScript"===e?"JavaScript":"Quasar"===e?"Quasar":"HackTheBox"===e?"HackTheBox":"TryHackMe"===e?"TryHackMe":"Unknown",C=(0,n.Fl)((()=>{const e={shadow:"none",link:"Unknown",color:"Unknown",label:"Unknown"};return"Spring"===a.hashtag[0]?(e.shadow=c.value?"0 0 3px #6cb52d, 0 0 11px #6cb52d, 0 0 25px #6cb52d, 0 0 45px #6cb52d":"none",e.link="Spring.svg",e.color="Spring",e.label="Spring"):"Vue"===a.hashtag[0]?(e.shadow=c.value?"0 0 3px #42b883, 0 0 11px #42b883, 0 0 25px #42b883, 0 0 45px #42b883":"none",e.link="Vue.svg",e.color="Vue",e.label="Vue"):"Python"===a.hashtag[0]?(e.shadow=c.value?"0 0 3px #3d7daf, 0 0 11px #3d7daf, 0 0 25px #3d7daf, 0 0 45px #3d7daf":"none",e.link="Python.svg",e.color="Python",e.label="Python"):"Bash"===a.hashtag[0]?(e.shadow=c.value?"0 0 3px #fefefe, 0 0 11px #fefefe, 0 0 25px #fefefe, 0 0 45px #fefefe":"none",e.link="Bash.svg",e.color="Bash",e.label="Bash"):"Java"===a.hashtag[0]?(e.shadow=c.value?"0 0 3px #b07219, 0 0 11px #b07219, 0 0 25px #b07219, 0 0 45px #b07219":"none",e.link="Java.svg",e.color="Java",e.label="Java"):"JavaScript"===a.hashtag[0]?(e.shadow=c.value?"0 0 3px #f1e05a, 0 0 11px #f1e05a, 0 0 25px #f1e05a, 0 0 45px #f1e05a":"none",e.link="JavaScript.svg",e.color="JavaScript",e.label="JavaScript"):"Quasar"===a.hashtag[0]?(e.shadow=c.value?"0 0 3px #00b4ff, 0 0 11px #00b4ff, 0 0 25px #00b4ff, 0 0 45px #00b4ff":"none",e.link="Quasar.svg",e.color="Quasar",e.label="Quasar"):"HackTheBox"===a.hashtag[0]?(e.shadow=c.value?"0 0 3px #9fef00, 0 0 11px #9fef00, 0 0 25px #9fef00, 0 0 45px #9fef00":"none",e.link="HackTheBox.svg",e.color="HackTheBox",e.label="HackTheBox"):"TryHackMe"===a.hashtag[0]&&(e.shadow=c.value?"0 0 3px #ff0000, 0 0 11px #ff0000, 0 0 25px #ff0000, 0 0 45px #ff0000":"none",e.link="TryHackMe.svg",e.color="TryHackMe",e.label="TryHackMe"),e}));return(l,s)=>{const k=(0,n.up)("q-img"),S=(0,n.up)("q-avatar"),q=(0,n.up)("q-badge");return(0,n.wg)(),(0,n.iD)(n.HY,null,[(0,n._)("article",{class:(0,r.C_)({hovered:c.value}),style:(0,r.j5)({boxShadow:e.shadow?C.value.shadow:"none",minHeight:"100px",padding:"15px",border:e.border?"1px solid":"none"}),onClick:s[0]||(s[0]=e=>_()),onMouseenter:s[1]||(s[1]=e=>b()),onMouseleave:s[2]||(s[2]=e=>b())},[(0,n.WI)(l.$slots,"default",{svgLink:C.value.link,timeToRead:D.value,content:B.value},(()=>[(0,n._)("div",i,[(0,n._)("div",null,[(0,n._)("div",u,[(0,n.Wm)(S,{size:"64px"},{default:(0,n.w5)((()=>[(0,n.Wm)(k,{width:"48px",src:C.value.link},null,8,["src"])])),_:1})]),(0,n._)("span",p,[(0,n.Wm)(q,{rounded:"",outline:"",color:C.value.color,label:C.value.label},null,8,["color","label"])])]),(0,n._)("div",d,[(0,n._)("div",{class:"row items-center no-wrap",style:(0,r.j5)({height:a.hashtag.slice(1).length>0?"64px":"100%"})},[(0,n._)("span",g,(0,r.zw)(e.title),1)],4),(0,n._)("div",v,[((0,n.wg)(!0),(0,n.iD)(n.HY,null,(0,n.Ko)(a.hashtag.slice(1),(e=>((0,n.wg)(),(0,n.iD)("span",{key:e},[(0,n.Wm)(q,{rounded:"",outline:"",color:P(e),label:e},null,8,["color","label"])])))),128))])]),(0,n._)("div",h,[(0,n._)("div",y,[(0,n._)("span",f,(0,r.zw)(e.category.toUpperCase()),1),w,(0,n._)("span",m,(0,r.zw)(D.value),1)]),(0,n._)("div",null,[(0,n._)("span",null,"Created : "+(0,r.zw)(Z)),(0,n._)("span",null,"Written By : "+(0,r.zw)(e.createdBy),1)])])])]))],38),(0,n.Wm)(o.uT,{name:"articleSlider"},{default:(0,n.w5)((()=>[t.value?((0,n.wg)(),(0,n.iD)("div",x,[(0,n.WI)(l.$slots,"slide")])):(0,n.kq)("",!0)])),_:3})],64)}}};var k=t(1639),_=t(1357),S=t(335),q=t(990),H=t(9984),T=t.n(H);const M=(0,k.Z)(b,[["__scopeId","data-v-8e5b85a4"]]),Q=M;T()(b,"components",{QAvatar:_.Z,QImg:S.Z,QBadge:q.Z});const Z={class:"row no-wrap"},B=(0,n._)("p",{class:"col-auto"},null,-1),D={class:"col q-ml-md"},P=(0,n._)("p",{class:"text-weight-bold"},"Summary",-1),C={key:0},j={__name:"SummaryComponent",props:{content:{type:[String,Object]}},setup(e){const a=e,t=(0,n.Fl)((()=>{const e=[];return a.content.content.split("\n").filter((e=>e.startsWith("#"))).map((e=>e.replaceAll("#",""))).map((a=>e.push(a))),e}));return(0,n.bv)((()=>{console.log("SummaryComponent onMounted")})),(e,a)=>{const l=(0,n.up)("q-separator"),o=(0,n.up)("q-page-sticky");return(0,n.wg)(),(0,n.j4)(o,{position:"top-right",offset:[42,140],class:"summary row"},{default:(0,n.w5)((()=>[(0,n._)("div",Z,[B,(0,n.Wm)(l,{vertical:"",color:"grey-9"}),(0,n._)("div",D,[P,0===t.value.length?((0,n.wg)(),(0,n.iD)("p",C," Cannot make summary. Make sure your posts is written via Markdown ")):(0,n.kq)("",!0),((0,n.wg)(!0),(0,n.iD)(n.HY,null,(0,n.Ko)(t.value,((e,a)=>((0,n.wg)(),(0,n.iD)("p",{key:a},(0,r.zw)(a+1)+". "+(0,r.zw)(e),1)))),128))])])])),_:1})}}};var $=t(627),J=t(926);T()(j,"components",{QPageSticky:$.Z,QSeparator:J.Z});var I=t(7524);function F(e,a){const t=I.Z.create(Object.assign({baseURL:e},a));return t}const W=F("https://revi1337.github.io/posts/");async function A(e){return W.get(`${e}.md`)}async function U(){return W.get("/seed.json")}function z(e){return U().then((a=>Y(a,e))).catch((e=>console.log(e)))}function Y(e,a){return"all"===a?e.data:e.data.filter((e=>e.category===a))}const L=(0,n._)("div",null,"CATEGORY PAGE",-1),V={__name:"CategoryPage",props:{category:{type:String,required:!0}},setup(e){const a=e;(0,n.bv)((()=>{console.log("Category Page Mounted")}));const t=(0,n.Fl)((()=>a.category)),r=(0,l.iH)(!1),o=((0,l.iH)(""),(0,l.iH)([])),s=async()=>{try{r.value=!1;const e=await z(a.category);o.value=e,r.value=!0}catch(e){r.value=!1,console.error(e)}};return(0,n.m0)((()=>{t.value,s()})),(e,a)=>((0,n.wg)(),(0,n.iD)(n.HY,null,[L,((0,n.wg)(!0),(0,n.iD)(n.HY,null,(0,n.Ko)(o.value,((e,a)=>((0,n.wg)(),(0,n.iD)(n.HY,{key:a},[r.value?((0,n.wg)(),(0,n.j4)(Q,{key:0,id:a,title:e.title,hashtag:e.hashtags,category:e.category,"created-at":e.createdAt,folder:e.folder,filename:e.filename,"created-by":"Revi1337",content:"content"},null,8,["id","title","hashtag","category","created-at","folder","filename"])):(0,n.kq)("",!0)],64)))),128))],64))}},R=V,O=R,K={__name:"MainPage",setup(e){return(0,n.bv)((()=>{console.log("Main Page Mounted")})),(e,a)=>((0,n.wg)(),(0,n.iD)("div",null,"Main Page"))}},E=K,G=E;var N=t(2512),X=t(519);t(6117);const ee={class:"row justify-center"},ae={class:"mark-down",style:{width:"800px"}},te=["innerHTML"],ne=/!\[\S*]\(\S*\.\S*\)/g,le={__name:"PostDetails",props:{path:{type:String,required:!0}},setup(e){(0,n.bv)((()=>{console.log("PostDetails mounted"),c()}));const a=(0,s.yj)(),t=`/${a.query.post}/${a.query.markdown}`,r=(0,l.iH)(),o=(0,l.iH)(""),c=((0,l.iH)([]),async()=>{try{r.value=!1,({data:o.value}=await A(t));o.value.match(ne);r.value=!0}catch(e){console.error(e),r.value=!1}}),i=new N.TU.Renderer;i.code=(e,a)=>{const t=X.Z.getLanguage(a)?a:"plaintext",n=X.Z.highlight(e,{language:a}).value;return`<pre><code class="hljs ${t}">${n}</code></pre>`},N.TU.setOptions({renderer:i,mangle:!1,headerIds:!1});const u=(0,n.Fl)((()=>N.TU.parse(o.value)));return(e,a)=>((0,n.wg)(),(0,n.iD)("div",ee,[(0,n._)("div",ae,[(0,n._)("div",{class:"markdown-container",innerHTML:u.value},null,8,te)])]))}},re=le,oe=re;T()(le,"components",{QSeparator:J.Z,QPageSticky:$.Z});const se={__name:"IndexPage",setup(e){const a=(0,s.yj)(),t=(0,n.Fl)((()=>a.query.category)),l=(0,n.Fl)((()=>!t.value&&a.query.post)),r=(0,n.Fl)((()=>["all","dev","ctf","writeup","cs","cheet_sheet"].includes(a.query.category)));return(e,a)=>((0,n.wg)(),(0,n.iD)("div",null,[l.value?((0,n.wg)(),(0,n.j4)(oe,{key:0})):r.value?((0,n.wg)(),(0,n.j4)(O,{key:1,category:t.value},null,8,["category"])):((0,n.wg)(),(0,n.j4)(G,{key:2}))]))}};var ce=t(7052),ie=t(1694),ue=t(3115),pe=t(1113),de=t(2857);const ge=(0,k.Z)(se,[["__scopeId","data-v-230ed9de"]]),ve=ge;T()(se,"components",{QCarousel:ce.Z,QCarouselSlide:ie.Z,QAvatar:_.Z,QImg:S.Z,QItemLabel:ue.Z,QTable:pe.Z,QIcon:de.Z})}}]);