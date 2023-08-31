<template>
  <div v-if="isReady" class="row justify-center">
    <div class="mark-down" style="width: 800px">
      <div class="text-center">
        <h2>{{ title }}</h2>
        <p class="text-grey-7">{{ createdAt }}</p>

        <p class="row justify-center items-center q-mb-lg">
          <span v-for="{ tag, tagColor } in hashtag" :key="tag" class="q-mx-xs">
            <q-badge rounded outline :color="tagColor" :label="tag" />
          </span>
        </p>
        <q-separator spaced dark />
      </div>

      <div
        ref="markdownHtml"
        class="markdown-container"
        v-html="markdownToHtml"
      ></div>
    </div>
  </div>

  <div class="slider">
    <div class="container">
      <ul class="summary-container">
        <li
          v-for="({ textContent, tagName, id }, index) in summary"
          :key="index"
          ref="summaryReferences"
          :id="id"
          :class="['summary-title']"
          :style="calcMargin(tagName)"
          @click="moveToSummaryTitle(id)"
        >
          {{ textContent }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { getMarkDown } from 'src/api/posts';
import {
  ref,
  onMounted,
  computed,
  onUpdated,
  onBeforeUnmount,
  onBeforeMount
} from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { useQuasar } from 'quasar';

const props = defineProps({
  path: {
    type: String,
    required: true
  }
});

/**
 * Initialize Section
 */
const $q = useQuasar();
const route = useRoute();
const currentMarkdown = `/${route.query.post}/${route.query.markdown}`;
const isReady = ref();
const content = ref('');
const markdownHtml = ref(null);
const summary = ref([]);
const title = $q.localStorage.getItem('title');
const hashtag = $q.localStorage.getItem('hashtag');
const createdAt = $q.localStorage.getItem('createdAt');

/**
 * Life Cycle Hook Section
 */
onBeforeMount(() => {
  console.log('onBeforeMount()');
  fetchMarkDown();
});

onMounted(() => {
  console.log('onMounted()');
});

onUpdated(() => {
  summary.value = Array.from(markdownHtml.value.children).filter(child =>
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(child.tagName.toLowerCase())
  );
  window.addEventListener('scroll', scrollHandler);
});

onBeforeUnmount(() => {
  console.log('onBeforeUnmount()');
  window.removeEventListener('scroll', scrollHandler);
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

/**
 * Summary Click Event Section
 */
const moveToSummaryTitle = id => {
  summary.value
    .filter(element => element.id === id)
    .map(element => {
      const styles = window.getComputedStyle(element);
      const marginBottom = parseInt(styles.marginBottom.replace('px', ''), 10);
      // console.log(element.offsetTop - marginBottom - element.clientHeight);
      window.scrollTo({
        top: element.offsetTop - marginBottom - element.clientHeight + 1,
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
function scrollHandler() {
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

      const summarys = Array.from(
        this.document.getElementsByClassName('summary-title')
      );

      for (const summary of summarys) {
        if (summary.id === currentActiveElement.value.id) {
          summarys
            .filter(value => value.id !== currentActiveElement.value.id)
            .forEach(value => value.classList.remove('active'));
          // console.log(summary.getAttribute('id'));
          summary.classList.add('active');
        }
      }
    }
  } else {
    currentActiveElement.value = null;
  }
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
  headerIds: true,
  silent: true,
  break: true
});
const markdownToHtml = computed(() => marked.parse(content.value));
</script>

<style lang="scss" scoped>
.slider {
  $top: 130px;
  overflow-y: auto;
  position: fixed;
  top: $top;
  left: calc(50% + (950px / 2) + 20px);
  max-height: calc(100vh - $top - 35px);
}
.container {
  padding-left: 5px;
  border-left: 1px solid $grey-9;
}
ul.summary-container {
  list-style: none;
  padding-left: 0;
  margin: 2px;
  li {
    margin: 9px 0 9px;
  }
}
.summary-title {
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &.active {
    color: $font-color;
  }
}
</style>
