<template>
  <q-page-sticky position="top-right" :offset="offset" class="summary row">
    <div class="container">
      <ul class="summary-container">
        <li
          v-for="summary in summarys"
          :key="summary"
          :style="[calcMargin(summary), `color: ${color}`]"
          class="summary-title"
          @click="$emit('click', 1, 2, 3)"
        >
          {{ summary.replaceAll('#', '') }}
        </li>
      </ul>
    </div>
  </q-page-sticky>
</template>

<script setup>
import { onMounted } from 'vue';
import 'highlight.js/styles/atom-one-dark.css';

const emit = defineEmits(['click']);

const props = defineProps({
  summarys: {
    type: Array,
    required: true
  },
  offset: {
    type: Array[(Number, Number)],
    required: true
  },
  color: {
    type: String,
    required: false,
    default: '#e1e5ec'
  }
});

onMounted(() => {});

const calcMargin = summary => {
  const regex = new RegExp('#', 'g');
  const matches = summary.match(regex);
  const matchCount = matches ? matches.length : 0;

  return { marginLeft: 10 * (matchCount - 1) + 'px' };
};
</script>

<style lang="scss" scoped>
.container {
  padding-left: 5px;
  border-left: 1px solid $font-color;
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
