<template>
  <div class="row justify-center">
    <div class="mark-down" style="width: 800px">
      <div
        ref="markdownHtml"
        class="markdown-container"
        v-html="markdownToHtml"
      ></div>
    </div>
  </div>

  <q-page-sticky position="top-right" :offset="[42, 140]" class="summary row">
    <div class="row no-wrap">
      <p class="col-auto"></p>
      <q-separator vertical color="grey-9" />
      <div class="col q-ml-md">
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
import { useRoute } from 'vue-router';
import { getMarkDown } from 'src/api/posts';
import { ref, onMounted, computed, onUpdated } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const props = defineProps({
  path: {
    type: String,
    required: true
  }
});

const route = useRoute();
const currentMarkdown = `/${route.query.post}/${route.query.markdown}`;

const isReady = ref();
const content = ref('');
const markdownHtml = ref(null);
const summary = ref([]);

// Life Cycle Hook
onMounted(() => {
  console.log('PostDetails mounted');
});

onUpdated(() => {
  summary.value = Array.from(markdownHtml.value.children).filter(child =>
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(child.tagName.toLowerCase())
  );
});

// Fetching
const fetchMarkDown = async () => {
  try {
    isReady.value = false;
    ({ data: content.value } = await getMarkDown(currentMarkdown));
    isReady.value = true;
  } catch (error) {
    console.error(error);
    isReady.value = false;
  }
};
fetchMarkDown();

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
const markdownToHtml = computed(() => marked.parse(content.value));

// Summary
const moveToSummaryTitle = title => {
  summary.value
    .filter(element => element.textContent === title)
    .map(element => {
      const styles = window.getComputedStyle(element);
      const marginBottom = parseInt(styles.marginBottom.replace('px', ''), 10);
      window.scrollTo({
        top: element.offsetTop - marginBottom - element.clientHeight,
        behavior: 'auto'
      });
    });
};
const calcMargin = hashCount => {
  hashCount = parseInt(hashCount.toLowerCase().replace('h', ''));
  return { marginLeft: 10 * (hashCount - 1) + 'px' };
};
</script>
