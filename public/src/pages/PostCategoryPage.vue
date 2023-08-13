<template>
  <div class="row reverse">
    <div>TEST</div>
  </div>
</template>

<script setup>
// import { ref, watchEffect, onMounted, computed } from 'vue';
// import { findPostByContainingString } from 'src/api/posts';
// import PostComponent from 'src/components/PostComponent.vue';
// import HashTagsComponent from 'src/components/HashTagsComponent.vue';
// import SummaryComponent from 'src/components/SummaryComponent.vue';

// // Initialize
// const props = defineProps({
//   category: {
//     type: [String],
//     required: true
//   }
// });
// const CATEGORY = computed(() => props.category);
// const posts = ref([]);
// const hashTagNavigation = ref([]);

// // Fetch Posts
// const postRequestParams = ref({
//   title_contains: null,
//   category: CATEGORY,
//   hashtag_contains: null,
//   size: 100
// });
// const findPostByCategoryRequest = async params => {
//   try {
//     const { data } = await findPostByContainingString(params);
//     posts.value = data;
//     hashTagNavigation.value = data;
//   } catch (error) {
//     console.error(error);
//   }
// };

// watchEffect(() => {
//   props.category;
//   findPostByCategoryRequest(postRequestParams.value);
// });

// // ClickHashTag
// const clickHashTag = hashtag => {
//   if (hashtag.length === 0) postRequestParams.value.title_contains = null;
//   postRequestParams.value.hashtag_contains = hashtag;
// };
</script>

<!-- <template>
  <div class="row reverse">
    <q-input
      class="self-right col-12 q-mb-xl"
      dense
      dark
      :spellcheck="false"
      type="text"
      v-model="postRequestParams.title_contains"
      :style="{ width: '300px' }"
    >
      <template #append>
        <q-icon name="search" />
      </template>
    </q-input>

    <section class="col-12 scroll" :style="{ width: '100vw', height: '700px', padding: '40px' }">
      <template v-for="(post, index) in posts" :key="index">
        <PostComponent
          :id="post.id"
          :title="post.title"
          :content="post.content"
          :hashtag="post.hashtag"
          :created-at="post.createdAt"
          :created-by="post.createdBy"
          :category="post.category"
        >
          <template #slide>
            <SummaryComponent :content="post" />
          </template>
        </PostComponent>
      </template>
    </section>
  </div>
  <HashTagsComponent :value="hashTagNavigation" @clickHashTag="hashtag => clickHashTag(hashtag)" />
</template>

<script setup>
import { ref, watchEffect, onMounted, computed } from 'vue';
import { findPostByContainingString } from 'src/api/posts';
import PostComponent from 'src/components/PostComponent.vue';
import HashTagsComponent from 'src/components/HashTagsComponent.vue';
import SummaryComponent from 'src/components/SummaryComponent.vue';

// Initialize
const props = defineProps({
  category: {
    type: [String],
    required: true
  }
});
const CATEGORY = computed(() => props.category);
const posts = ref([]);
const hashTagNavigation = ref([]);

// Fetch Posts
const postRequestParams = ref({
  title_contains: null,
  category: CATEGORY,
  hashtag_contains: null,
  size: 100
});
const findPostByCategoryRequest = async params => {
  try {
    const { data } = await findPostByContainingString(params);
    posts.value = data;
    hashTagNavigation.value = data;
  } catch (error) {
    console.error(error);
  }
};
watchEffect(() => {
  props.category;
  findPostByCategoryRequest(postRequestParams.value);
});

// ClickHashTag
const clickHashTag = hashtag => {
  if (hashtag.length === 0) postRequestParams.value.title_contains = null;
  postRequestParams.value.hashtag_contains = hashtag;
};
</script> -->
