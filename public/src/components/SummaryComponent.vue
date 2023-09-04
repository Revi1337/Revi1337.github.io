<template>
  <div class="s-container">
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
    required: false
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
.s-container {
  width: 250px;
  padding-left: 5px;
  border-left: 1px solid $font-color;

  &::-webkit-scrollbar {
    width: 5px;
    background: $dark;
    overflow: auto;
  }

  &::-webkit-scrollbar-thumb {
    width: 5px;
    background-color: $grey-10;
    border-radius: 20px;
  }
}
ul.summary-container {
  list-style: none;
  padding-left: 0;
  margin: 2px;
  margin-top: 0;
  li {
    margin: 9px 0 9px;
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
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
