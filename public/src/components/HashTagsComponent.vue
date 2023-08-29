<template>
  <q-page-sticky position="top-left" :offset="[42, 140]" class="row">
    <div class="row">
      <q-separator vertical color="grey-9" />
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
  </q-page-sticky>
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

<style lang="scss">
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
  }
}
</style>
