<template>
  <q-page-sticky position="top-right" :offset="[42, 140]" class="summary row">
    <div class="row no-wrap">
      <p class="col-auto"></p>
      <q-separator vertical color="grey-9" />
      <div class="col q-ml-md">
        <p class="text-weight-bold">Summary</p>
        <p v-if="summaryValue.length === 0">
          Cannot make summary. Make sure your posts is written via Markdown
        </p>
        <template v-for="(value, line) in summaryValue" :key="line">
          <p>{{ line + 1 }}. {{ value }}</p>
        </template>
      </div>
    </div>
  </q-page-sticky>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';

const props = defineProps({
  content: {
    type: [String, Object]
  }
});

const summaryValue = computed(() => {
  const filteredResult = [];
  props.content.content
    .split('\n')
    .filter(line => line.startsWith('#'))
    .map(result => result.replaceAll('#', ''))
    .map(result => filteredResult.push(result));
  return filteredResult;
});

onMounted(() => {
  console.log('SummaryComponent onMounted');
  // filteredData.value = props.content.content.split('\n');
});
</script>

<style lang="scss" scoped></style>
