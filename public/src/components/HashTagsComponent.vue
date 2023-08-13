<template>
  <q-page-sticky position="top-left" :offset="[42, 140]" class="hashtag row">
    <div class="row no-wrap">
      <p class="col-auto"></p>
      <q-separator vertical color="grey-9" />
      <div class="col q-ml-md">
        <p class="text-weight-bold">HashTags</p>
        <p class="hashtag-title" @click="$emit('clickHashTag', '')">All</p>
        <!-- <p v-for="(value, index) in value" :key="index" class="hashtag-title">{{ value }}</p> -->
        <p
          v-for="({ hashtag, count }, index) in getHashTagInfo"
          :key="index"
          class="hashtag-title"
          @click="$emit('clickHashTag', hashtag)"
        >
          {{ hashtag }} ({{ count }})
        </p>
        <p></p>
      </div>
    </div>
  </q-page-sticky>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

onMounted(() => {
  console.log(props.value);
});

const props = defineProps({
  value: {
    type: Array,
    required: true
  }
});

// Hashtag Navigate Handler
const getHashTagInfo = computed(() => {
  const result = countHashtagOccurrences(props.value);
  return result;
});

// Calculate Occurrences
function countHashtagOccurrences(array) {
  const hashtagCounts = {};
  for (let i = 0; i < array.length; i++) {
    let obj = array[i];
    if (obj.hasOwnProperty('hashtag')) {
      obj.hashtag.forEach(tag => {
        // console.log(tag);
        let hashtag = tag;
        if (hashtagCounts[hashtag]) {
          hashtagCounts[hashtag]++;
        } else {
          hashtagCounts[hashtag] = 1;
        }
      });
      // let hashtag = obj.hashtag;
      // if (hashtagCounts[hashtag]) {
      //   hashtagCounts[hashtag]++;
      // } else {
      //   hashtagCounts[hashtag] = 1;
      // }
    }
  }

  const result = [];
  for (const key in hashtagCounts) {
    if (hashtagCounts.hasOwnProperty(key)) {
      result.push({ hashtag: key, count: hashtagCounts[key] });
    }
  }
  return result;
}
</script>
