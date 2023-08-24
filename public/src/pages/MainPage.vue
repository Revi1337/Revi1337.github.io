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

    <CalendarHeatmap
      v-if="isGithubDataLoaded"
      style="width: 50%"
      dark-mode
      :values="contributeObjects"
      :end-date="githubData.endDate"
      :tooltip-unit="Interaction"
      :round="2"
      :max="6"
      :tooltip-formatter="
        v =>
          `${v.count ? v.count : 'No'} contributions on ${
            monthNames[v.date.getMonth()]
          } ${v.date.getDate()}, ${v.date.getFullYear()}`
      "
      @vue:mounted="changeGitColor"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PostComponent from 'components/PostComponent.vue';
import { getProcessedData } from 'src/api/posts';
import { useRouter } from 'vue-router';
import { CalendarHeatmap } from 'vue3-calendar-heatmap';
import { getRecentGitContribution } from 'src/api/git';
import { getTryhackmeContribution } from 'src/api/tryhackme';

const router = useRouter();
const slide = ref(1);
const autoplay = ref(4200);
const posts = ref([]);
const isLoaded = ref(false);
const isGithubDataLoaded = ref(false);
const githubData = ref({
  startDate: 'null',
  endDate: ''
});
const contributeObjects = ref([]);
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

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

const fetchGitGraphQL = async () => {
  try {
    isGithubDataLoaded.value = false;

    const { data } = await getRecentGitContribution();

    const totalContributions =
      data.data.user.contributionsCollection.contributionCalendar
        .totalContributions;
    const originalWeeks =
      data.data.user.contributionsCollection.contributionCalendar.weeks;
    const reversedWeeks = [...originalWeeks].reverse();

    const startDate = originalWeeks[0].contributionDays[0].date;
    const endDate =
      reversedWeeks[0].contributionDays[
        [reversedWeeks[0].contributionDays.length] - 1
      ].date;
    githubData.value.startDate = startDate;
    githubData.value.endDate = endDate;

    for (const weeks of originalWeeks) {
      const days = weeks.contributionDays;
      for (const day of days) {
        const contributeObject = {};
        contributeObject['date'] = day.date;
        contributeObject['count'] = day.contributionCount
          ? day.contributionCount
          : null;

        contributeObjects.value.push(contributeObject);
      }
    }
    isGithubDataLoaded.value = true;
  } catch (error) {
    isGithubDataLoaded.value = false;
    console.error(error);
  }
};

const fetchTryhackmeContribution = async () => {
  const { data } = await getTryhackmeContribution();
  console.log(data);
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

const changeGitColor = () => {
  let elements = document.querySelectorAll('.vch__wrapper text, .vch__legend');
  elements.forEach(element => {
    element.setAttribute('style', 'fill: white; font-size: 10px;');
  });
};

onMounted(() => {});
fetchData();
fetchGitGraphQL();
fetchTryhackmeContribution();
</script>

<style lang="scss" scoped>
.carousel {
  width: 1250px;
}
@media (max-width: 1259px) {
  .carousel {
    width: 900px;
  }
}

@media (max-width: 911px) {
  .carousel {
    width: 600px;
  }
}
</style>
