<template>
  <q-page>
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
        />
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, watchEffect, computed, ref } from 'vue';
import PostComponent from 'src/components/PostComponent.vue';
import { getProcessedData } from 'src/api/posts';
import { useRouter } from 'vue-router';

onMounted(() => {});

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

const fetchData = async () => {
  try {
    isLoaded.value = false;

    const data = await getProcessedData(props.category);
    postData.value = data
      .filter(json =>
        json.title.toLowerCase().includes(titleContains.value.toLowerCase())
      )
      .map(json => json);

    isLoaded.value = true;
  } catch (error) {
    isLoaded.value = false;
    console.error(error);
  }
};

watchEffect(() => {
  currentPath.value;
  titleContains.value;
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
<!-- <template>


  <q-page>
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
        />
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, watchEffect, computed, ref } from 'vue';
import PostComponent from 'src/components/PostComponent.vue';
import { getProcessedData } from 'src/api/posts';

onMounted(() => {});

const props = defineProps({
  category: {
    type: String,
    required: true
  }
});

const currentPath = computed(() => props.category);
const isLoaded = ref(false);
const postData = ref([]);
const titleContains = ref('');

const fetchData = async () => {
  try {
    isLoaded.value = false;

    const data = await getProcessedData(props.category);
    postData.value = data
      .filter(json =>
        json.title.toLowerCase().includes(titleContains.value.toLowerCase())
      )
      .map(json => json);

    isLoaded.value = true;
  } catch (error) {
    isLoaded.value = false;
    console.error(error);
  }
};

watchEffect(() => {
  currentPath.value;
  titleContains.value;
  fetchData();
});
</script> -->
