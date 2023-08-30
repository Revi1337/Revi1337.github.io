<template>
  <div class="h-container">
    <div class="q-ml-md hashtag-container">
      <p class="text-weight-bold">
        <span>HashTags</span>
      </p>

      <p class="hashtag">
        <span
          ref="hashtagElements"
          @click="emit('clickHastag')"
          class="hashtag-title"
        >
          All
        </span>
      </p>

      <p
        v-for="({ hashtag, count }, index) in hashtagsObjectsArray"
        :key="index"
        class="hashtag"
      >
        <span
          ref="hashtagElements"
          @click="emit('clickHastag', hashtag, count, hashtagElements)"
          class="hashtag-title"
          >{{ `${hashtag} (${count})` }}</span
        >
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['clickHastag']);

const props = defineProps({
  hashtagsObjectsArray: {
    type: Array,
    required: true
  }
});

const hashtagElements = ref([]);
</script>

<style lang="scss" scoped>
.h-container {
  border-left: 1px solid $grey-9;
  .hashtag-container {
    max-width: 250px;
    overflow-wrap: break-word;
    .hashtag {
      margin: 10px 0 10px;
      .hashtag-title {
        position: relative;
        text-decoration: none;
        cursor: pointer;
        transition: all;

        &:before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background-color: $font-color;
          transition: width 0.3s ease-in-out;
        }

        &:hover:before {
          width: 100%;
        }
      }
      &:nth-last-child(n) {
        margin-bottom: 0;
      }
    }
  }
}
</style>
