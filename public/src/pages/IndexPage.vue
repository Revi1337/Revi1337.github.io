<template>
  <div class="q-mt-xl">
    <template v-if="isPostValid">
      <PostDetails />
    </template>

    <template v-else-if="isCategoryValid">
      <CategoryPage :category="currentCategory" />
    </template>

    <template v-else>
      <MainPage />
    </template>
  </div>
</template>

<script setup>
import CategoryPage from './CategoryPage.vue';
import MainPage from './MainPage.vue';
import PostDetails from './post/PostDetails.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentCategory = computed(() => route.query.category);
const isPostValid = computed(() => !currentCategory.value && route.query.post);
const isCategoryValid = computed(() =>
  ['all', 'dev', 'ctf', 'writeup', 'cs', 'cheet_sheet', 'devops'].includes(
    route.query.category
  )
);
</script>

<style lang="scss" scoped>
.carousel {
  color: $font-color;
}
.text-table {
  color: $font-color !important;
}
</style>
