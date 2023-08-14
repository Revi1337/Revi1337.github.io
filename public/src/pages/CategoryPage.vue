<template>
  <div>CATEGORY PAGE</div>
  <!-- <div>{{ category }}</div> -->

  <template v-for="(value, index) in postData" :key="index">
    <PostComponent
      v-if="isLoaded"
      :id="index"
      :title="value.title"
      :hashtag="value.hashtags"
      :category="value.category"
      :created-at="value.createdAt"
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
