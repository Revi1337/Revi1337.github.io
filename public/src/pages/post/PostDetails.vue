<template>
  <div class="q-mt-xl mark-down" :style="{ oveflow: 'hidden' }">
    <p class="q-mb-lg text-h3 text-weight-bold">{{ articleData.title }}</p>

    <div>
      <q-separator dark spaced />
    </div>

    <div class="markdown-container q-mt-xl" v-html="markdownToHtml"></div>
  </div>

  <q-page-sticky position="top-right" :offset="[42, 140]" class="summary row">
    <div class="row no-wrap">
      <p class="col-auto"></p>
      <q-separator vertical color="grey-9" />
      <div class="col q-ml-md">
        <p class="text-weight-bold">Summary</p>
        <p
          ref="summaryReferences"
          v-for="{ textContent, tagName } in summary"
          :key="textContent"
          @click="moveToSummaryTitle(textContent)"
          :style="calcMargin(tagName)"
          class="summary-title"
        >
          {{ textContent }}
        </p>
      </div>
    </div>
  </q-page-sticky>
</template>

<script setup>
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { findPostById } from 'src/api/posts';
import { onUpdated, watchEffect, computed, ref, onMounted } from 'vue';

// Initialize
const props = defineProps({
  id: String
});
const articleId = parseInt(props.id);

// Article Data
const articleData = ref({
  id: '',
  title: '',
  content: ''
});
const findPostByIdRequest = async articleId => {
  try {
    const { data } = await findPostById(articleId);
    const { id, title, content } = data;
    articleData.value.id = id;
    articleData.value.title = title;
    articleData.value.content = content;
    // console.log(data);
  } catch (err) {
    console.error(err);
  }
};
findPostByIdRequest(articleId);

// MarkDown
const renderer = new marked.Renderer();
renderer.code = (code, language) => {
  const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
  const highlightedCode = hljs.highlight(code, { language }).value;
  return `<pre><code class="hljs ${validLanguage}">${highlightedCode}</code></pre>`;
};
marked.setOptions({
  renderer,
  mangle: false,
  headerIds: false
});
const markdownToHtml = computed(() => marked.parse(articleData.value.content));

// handling summary
const summaryReferences = ref([]);

const searchSummaryTitle = () => {
  const parentElement = document.querySelector('.markdown-container');
  const childElements = parentElement.querySelectorAll('*');
  return Array.from(childElements).filter(childElement =>
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(childElement.tagName.toLowerCase())
  );
};

const summary = ref([]);
onUpdated(() => {
  const summaryTitleElements = searchSummaryTitle();
  summaryTitleElements.forEach(summaryTitle => {
    console.log(summaryTitle);
    summary.value.push(summaryTitle);
  });
  handleViewportTop(summaryTitleElements, 'active');
});

watchEffect(() => {
  // summaryReferences.value.forEach(summaryRef => console.log(summaryRef.textContent));
});

function handleViewportTop(elements, activeClass) {
  let activeElement = null;
  function checkViewportTop() {
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isTopInView = rect.top <= 15;
      if (isTopInView) {
        if (element !== activeElement) {
          if (activeElement) {
            activeElement.classList.remove(activeClass);
          }
          element.classList.add(activeClass);
          activeElement = element;
        }
      }
    });
  }
  window.addEventListener('scroll', checkViewportTop);
}

const moveToSummaryTitle = title => {
  summary.value
    .filter(element => element.textContent === title)
    .map(element => element.scrollIntoView({ behavior: 'smooth' }));
};

const calcMargin = hashCount => {
  hashCount = parseInt(hashCount.toLowerCase().replace('h', ''));
  return { marginLeft: 10 * (hashCount - 1) + 'px' };
};
</script>
