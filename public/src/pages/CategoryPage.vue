<template>
  <q-page>
    <HashTagsComponent
      :hashtags-objects-array="hashtagCounts"
      @click-hastag="clickHashTag"
    />

    <div class="row justify-end items-center q-mb-xl">
      <q-input
        dense
        dark
        :spellcheck="false"
        type="text"
        v-model="titleContains"
        :style="{ width: '300px' }"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <div class="flex flex-center">
      <template v-for="(value, index) in postData" :key="index">
        <PostComponent
          v-if="isLoaded"
          :id="index"
          :title="value.title"
          :hashtag="value.hashtags"
          :category="value.category"
          :created-at="value.createdAt"
          :folder="value.folder"
          :filename="value.filename"
          created-by="Revi1337"
          content="content"
          @forward-post="goPostDetails"
          @mouse-enter="focusSummary"
          @mouse-leave="blurSummary"
        />
      </template>
    </div>
  </q-page>

  <Transition appear enter-active-class="animated fadeIn">
    <SummaryComponent
      v-if="isFocusOnPost"
      :summarys="postHoverData"
      :offset="[80, 140]"
    />
  </Transition>
</template>

<script setup>
import { onMounted, watchEffect, computed, ref } from 'vue';
import PostComponent from 'src/components/PostComponent.vue';
import SummaryComponent from 'src/components/SummaryComponent.vue';
import HashTagsComponent from 'src/components/HashTagsComponent.vue';
import { getProcessedData, getMarkDown } from 'src/api/posts';
import { useRouter } from 'vue-router';

onMounted(() => {
  console.log('CategoryPage onMounted()');
});

const props = defineProps({
  category: {
    type: String,
    required: true
  }
});

const router = useRouter();
const currentPath = computed(() => props.category);
const isLoaded = ref(false);
const postData = ref([]);
const titleContains = ref('');
const hashtagContains = ref('');
const postHoverData = ref([]);
const isFocusOnPost = ref(false);
const hashtagCounts = ref({});

const fetchData = async () => {
  try {
    isLoaded.value = false;

    const data = await getProcessedData(props.category);
    postData.value = data
      .filter(json => {
        const isTitleContains = json.title
          .toLowerCase()
          .includes(titleContains.value.toLowerCase());
        let preHashTags = json.hashtags.map(val => val.toLowerCase());
        const isHashTagContains =
          preHashTags.includes(hashtagContains.value.toLowerCase()) ||
          hashtagContains.value === '';
        return isTitleContains && isHashTagContains;
      })
      .map(json => json);

    const result = {};
    for (const item of postData.value) {
      for (const hashtag of item.hashtags) {
        if (!result[hashtag]) {
          result[hashtag] = 0;
        }
        result[hashtag]++;
      }
    }
    const resultArray = Object.keys(result).map(hashtag => ({
      hashtag: hashtag,
      count: result[hashtag]
    }));
    hashtagCounts.value = resultArray;
    // console.log(hashtagCounts.value);

    isLoaded.value = true;
  } catch (error) {
    isLoaded.value = false;
    console.error(error);
  }
};

const focusSummary = async (folder, filename) => {
  try {
    isFocusOnPost.value = false;
    const realPath = `${folder}${filename}`;
    const { data } = await getMarkDown(realPath);
    postHoverData.value = data.split('\n').filter(line => line.startsWith('#'));
    isFocusOnPost.value = true;
  } catch (error) {
    console.error(error);
    isFocusOnPost.value = false;
  }
};

const blurSummary = () => {
  isFocusOnPost.value = false;
};

const currentElement = ref(null);
const clickHashTag = (hashtag = null, count, elements) => {
  if (hashtag === null) {
    hashtagContains.value = '';
    return;
  }
  const selectedElement = elements.filter(
    element =>
      element.textContent.slice(0, element.textContent.lastIndexOf(' ')) ===
      hashtag
  );

  if (currentElement.value !== null) {
    currentElement.value.classList.remove('clicked');
    currentElement.value = selectedElement[0];
  }
  currentElement.value = selectedElement[0];
  selectedElement[0].classList.add('clicked');

  hashtagContains.value = hashtag;
};

watchEffect(() => {
  currentPath.value;
  titleContains.value;
  hashtagContains.value;
  fetchData();
});

const goPostDetails = (folder, filename) => {
  router.push({
    name: 'Index',
    query: {
      post: folder.replace('/', ''),
      markdown: filename.replace('/', '')
    }
  });
};
</script>
