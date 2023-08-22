<template>
  <q-page-sticky position="top-right" :offset="offset" class="summary row">
    <div class="row no-wrap">
      <p class="col-auto"></p>
      <q-separator vertical color="grey-9" />
      <div class="summary-container col q-ml-md">
        <p
          ref="summaryReferences"
          v-for="summary in summarys"
          :key="summary"
          class="summary-title"
        >
          {{ summary }}
        </p>
      </div>
    </div>
  </q-page-sticky>
</template>

<script setup>
const props = defineProps({
  summarys: {
    type: Array,
    required: true
  },
  offset: {
    type: Array[Number],
    required: true
  }
});
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
