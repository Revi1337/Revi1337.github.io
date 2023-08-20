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
        />
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, watchEffect, computed, ref } from 'vue';
import PostComponent from 'src/components/PostComponent.vue';
import SummaryComponent from 'src/components/SummaryComponent.vue';
import { getProcessedData } from 'src/api/posts';

onMounted(() => {
  console.log('Category Page Mounted');
});

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
    console.log(postData.value);

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

// const searchData = async () => {
//   try {
//     const data = await getProcessedData(props.category, titleContains.value);
//     const assembledArray = data
//       .filter(json => json.title.includes(titleContains.value))
//       .map(json => json);
//     console.log(assembledArray);
//   } catch (error) {}
// };

// watchEffect(() => {
//   titleContains.value;
//   searchData();
// });
</script>

///////////////////////////////////////////////////////////////////////////////////////////////////////////

<!-- <template>
  <q-page>
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
  </q-page>
</template>

<script setup>
import { onMounted, watchEffect, computed, ref } from 'vue';
import PostComponent from 'src/components/PostComponent.vue';
import SummaryComponent from 'src/components/SummaryComponent.vue';
import { getProcessedData } from 'src/api/posts';

onMounted(() => {
  console.log('Category Page Mounted');
});

const props = defineProps({
  category: {
    type: String,
    required: true
  }
});

const currentPath = computed(() => props.category);
const isLoaded = ref(false);
const title = ref('');
const postData = ref([]);

const fetchData = async () => {
  try {
    isLoaded.value = false;
    const data = await getProcessedData(props.category);
    postData.value = data;
    isLoaded.value = true;
  } catch (error) {
    isLoaded.value = false;
    console.error(error);
  }
};

watchEffect(() => {
  currentPath.value;
  fetchData();
});
</script> -->

///////////////////////////////////////////////////////////////////////////////////////////////////////////

<!-- <template>
  <div>CATEGORY PAGE</div>

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
</template>

<script setup>
import { onMounted, watchEffect, computed, ref } from 'vue';
import PostComponent from 'src/components/PostComponent.vue';
import SummaryComponent from 'src/components/SummaryComponent.vue';
import { getProcessedData } from 'src/api/posts';

onMounted(() => {
  console.log('Category Page Mounted');
});

const props = defineProps({
  category: {
    type: String,
    required: true
  }
});

const currentPath = computed(() => props.category);
const isLoaded = ref(false);
const title = ref('');
const postData = ref([]);

const fetchData = async () => {
  try {
    isLoaded.value = false;
    const data = await getProcessedData(props.category);
    postData.value = data;
    isLoaded.value = true;
  } catch (error) {
    isLoaded.value = false;
    console.error(error);
  }
};

watchEffect(() => {
  currentPath.value;
  fetchData();
});
</script>

<style lang="scss" scoped></style> -->
