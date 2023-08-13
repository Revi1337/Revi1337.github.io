<template>
  <div>CATEGORY PAGE</div>
  <div>{{ category }}</div>

  <template v-for="(value, index) in category.length" :key="index">
    <PostComponent
      v-if="isLoaded"
      :id="index"
      :title="value"
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
const fetchData = () => {
  try {
    isLoaded.value = false;
    isLoaded.value = true;
  } catch (error) {
    console.log(error);
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
