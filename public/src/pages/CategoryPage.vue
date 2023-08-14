<template>
  <div>CATEGORY PAGE</div>
  <div>{{ category }}</div>

  <template v-for="(value, index) in category.length" :key="index">
    <PostComponent
      v-if="isLoaded"
      :id="index"
      :title="title"
      content="content"
      hashtag="hashtag"
      created-at="created-at"
      created-by="created-by"
      category="category"
    />
  </template>
</template>

<script setup>
import { onMounted, watchEffect, computed, ref } from 'vue';
import PostComponent from 'src/components/PostComponent.vue';
import SummaryComponent from 'src/components/SummaryComponent.vue';
import { getMarkDown, getSeed, getProcessedData } from 'src/api/posts';

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

const fetchData = async () => {
  try {
    isLoaded.value = false;
    const data = await getProcessedData(props.category);
    console.log(data);
    isLoaded.value = true;
  } catch (error) {
    console.error(error);
  }
};

watchEffect(() => {
  currentPath.value;
  fetchData();
});
</script>

<style lang="scss" scoped></style>

<!-- <template>
  <div>CATEGORY PAGE</div>
  <div>{{ category }}</div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

onMounted(() => {
  console.log('Category Page Mounted');
});

const props = defineProps({
  category: {
    type: String,
    required: true
  }
});

const currnePath = computed(() => props.category);

watch(currnePath, () => {
  console.log('categoryPage watch');
});
</script>

<style lang="scss" scoped></style> -->
