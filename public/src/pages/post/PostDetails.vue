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
      <div class="summary-container col q-ml-md">
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

/**
 * Initialize Section
 */
const route = useRoute();
const currentMarkdown = `/${route.query.post}/${route.query.markdown}`;
const isReady = ref();
const content = ref('');
const markdownHtml = ref(null);
const summary = ref([]);

/**
 * Life Cycle Hook Section
 */
onMounted(() => {
  // console.log('PostDetails mounted');
  listenScrollingMouseEvent();
});

onUpdated(() => {
  summary.value = Array.from(markdownHtml.value.children).filter(child =>
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(child.tagName.toLowerCase())
  );
});

/**
 * Data Fetch Section
 */
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

/**
 * Summary Click Event Section
 */
const moveToSummaryTitle = title => {
  summary.value
    .filter(element => element.textContent === title)
    .map(element => {
      const styles = window.getComputedStyle(element);
      const marginBottom = parseInt(styles.marginBottom.replace('px', ''), 10);
      // console.log(element.offsetTop - marginBottom - element.clientHeight);
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

/**
 * Summary Mouse Scroll Event Section
 */
const currentActiveElement = ref(null);
function listenScrollingMouseEvent() {
  window.addEventListener('scroll', function () {
    const currentYPosition = window.scrollY;

    const elements = summary.value.filter(element => {
      const styles = window.getComputedStyle(element);
      const marginBottom = parseInt(styles.marginBottom.replace('px', ''), 10);

      const elementYPosition =
        element.offsetTop - marginBottom - element.clientHeight;
      if (currentYPosition >= elementYPosition) return true;
      return false;
    });

    if (currentActiveElement.value === null) {
      Array.from(this.document.getElementsByClassName('summary-title')).forEach(
        value => value.classList.remove('active')
      );
    }

    if (elements.length !== 0) {
      if (currentActiveElement.value !== elements[elements.length - 1]) {
        currentActiveElement.value = elements[elements.length - 1];

        // consoe.sd
        const summarys = Array.from(
          this.document.getElementsByClassName('summary-title')
        );

        for (const summary of summarys) {
          if (summary.innerText === currentActiveElement.value.innerText) {
            summarys
              .filter(
                value =>
                  value.innerText !== currentActiveElement.value.innerText
              )
              .forEach(value => value.classList.remove('active'));

            summary.classList.add('active');
          }
        }
      }
    } else {
      currentActiveElement.value = null;
    }
  });
}

/**
 * MarkDown Section
 */
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
</script>

<style lang="scss" scoped>
.summary-title {
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &.active {
    color: $font-color;
  }
}
</style>
