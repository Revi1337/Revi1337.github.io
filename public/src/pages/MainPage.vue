<template>
  <q-page>
    <q-carousel
      ref="carousel"
      dark
      class="row items-center justify-center"
      height="auto"
      animated
      v-model="slide"
      swipeable
      infinite
      :autoplay="autoplay"
    >
      <q-carousel-slide
        class="carousel flex flex-center"
        :name="index + 1"
        v-for="(post, index) in posts"
        :key="index"
      >
        <PostComponent
          v-if="isLoaded"
          width="100%"
          height="250px"
          :border="false"
          :shadow="false"
          :id="index"
          :title="post.title"
          :hashtag="post.hashtags"
          :category="post.category"
          :created-at="post.createdAt"
          :folder="post.folder"
          :filename="post.filename"
          created-by="Revi1337"
          content="content"
          v-slot="{ svgLink }"
          @forward-post="goPostDetails"
        >
          <div
            class="row items-center"
            :style="{
              height: '100%'
            }"
          >
            <div class="col-4 row items-center justify-center">
              <q-avatar class="col-12 q-mb-md" size="290px">
                <q-img width="140px" :src="svgLink" />
              </q-avatar>

              <span :class="[`text-${post.hashtags[0]}`, 'text-h5']">
                {{ post.hashtags[0] }}
              </span>
            </div>

            <div class="col column" :style="['height: 200px']">
              <div class="col-3 flex flex-center">
                <span class="text-overline text-red">
                  {{ post.category.toUpperCase() }}
                </span>
                <span>&nbsp;·&nbsp;</span>
                <span :class="`text-${post.hashtags[0]}`">
                  {{ post.hashtags[0] }}
                </span>
              </div>

              <div class="col-4 text-h4 flex flex-center">
                {{ post.title }}
              </div>

              <div class="col row justify-center items-center">
                <span v-for="tag in post.hashtags" :key="tag" class="q-mx-xs">
                  <q-badge rounded outline :color="`${tag}`" :label="tag" />
                </span>
                <span class="absolute-bottom-right q-pa-md">{{
                  post.createdAt
                }}</span>
              </div>
            </div>
          </div>
        </PostComponent>
      </q-carousel-slide>
    </q-carousel>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PostComponent from 'components/PostComponent.vue';
import { getProcessedData } from 'src/api/posts';
import { useRouter } from 'vue-router';

const router = useRouter();
const slide = ref(1);
const autoplay = ref(4200);
const posts = ref([]);
const isLoaded = ref(false);

const fetchData = async () => {
  try {
    isLoaded.value = false;

    const data = await getProcessedData();
    posts.value = data;
    posts.value = data
      .slice(posts.value.length - 5, posts.value.length)
      .sort((a, b) => b.id - a.id);

    isLoaded.value = true;
  } catch (error) {
    isLoaded.value = false;
    console.error(error);
  }
};

const goPostDetails = (folder, filename) => {
  router.push({
    name: 'Index',
    query: {
      post: folder.replace('/', ''),
      markdown: filename.replace('/', '')
    }
  });
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.carousel {
  width: 1250px;
}
@media (max-width: 1259px) {
  .carousel {
    width: 900px; /* 작은 값으로 조정 */
  }
}

@media (max-width: 911px) {
  .carousel {
    width: 600px; /* 작은 값으로 조정 */
  }
}
</style>

<!-- <template>
  <q-page>
    <q-carousel
      ref="carousel"
      dark
      class="row items-center justify-center"
      height="auto"
      animated
      v-model="slide"
      swipeable
      infinite
      :autoplay="autoplay"
    >
      <q-carousel-slide
        class="carousel flex flex-center"
        :name="index + 1"
        v-for="(post, index) in posts"
        :key="index"
      >
        <PostComponent
          v-if="isLoaded"
          width="100%"
          height="250px"
          :border="false"
          :shadow="false"
          :id="index"
          :title="post.title"
          :hashtag="post.hashtags"
          :category="post.category"
          :created-at="post.createdAt"
          :folder="post.folder"
          :filename="post.filename"
          created-by="Revi1337"
          content="content"
          v-slot="{ svgLink }"
        >
          <div
            class="row items-center"
            :style="{
              height: '100%'
            }"
          >
            <div class="col-4 row items-center justify-center">
              <q-avatar class="col-12 q-mb-md" size="290px">
                <q-img width="140px" :src="svgLink" />
              </q-avatar>

              <span :class="[`text-${post.hashtags[0]}`, 'text-h5']">
                {{ post.hashtags[0] }}
              </span>
            </div>

            <div class="col column" :style="['height: 200px']">
              <div class="col-3 flex flex-center">
                <span class="text-overline text-red">
                  {{ post.category.toUpperCase() }}
                </span>
                <span>&nbsp;·&nbsp;</span>
                <span :class="`text-${post.hashtags[0]}`">
                  {{ post.hashtags[0] }}
                </span>
              </div>

              <div class="col-4 text-h4 flex flex-center">
                {{ post.title }}
              </div>

              <div class="col row justify-center items-center">
                <span v-for="tag in post.hashtags" :key="tag" class="q-mx-xs">
                  <q-badge rounded outline :color="`${tag}`" :label="tag" />
                </span>
                <span class="absolute-bottom-right q-pa-md">{{
                  post.createdAt
                }}</span>
              </div>
            </div>
          </div>
        </PostComponent>
      </q-carousel-slide>
    </q-carousel>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PostComponent from 'components/PostComponent.vue';
import { getProcessedData } from 'src/api/posts';

const slide = ref(1);
const autoplay = ref(4200);
const posts = ref([]);
const isLoaded = ref(false);

const fetchData = async () => {
  try {
    isLoaded.value = false;

    const data = await getProcessedData();
    posts.value = data;
    posts.value = data
      .slice(posts.value.length - 5, posts.value.length)
      .sort((a, b) => b.id - a.id);

    isLoaded.value = true;
  } catch (error) {
    isLoaded.value = false;
    console.error(error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.carousel {
  width: 1250px;
}
@media (max-width: 1259px) {
  .carousel {
    width: 900px; /* 작은 값으로 조정 */
  }
}

@media (max-width: 911px) {
  .carousel {
    width: 600px; /* 작은 값으로 조정 */
  }
}
</style> -->
