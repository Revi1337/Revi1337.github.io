<template>
  <div>
    <template v-if="isPostValid">
      <PostDetails />
    </template>

    <template v-else-if="isCategoryValid">
      <CategoryPage :category="currentCategory" />
    </template>

    <template v-else>
      <MainPage />
    </template>
  </div>
</template>

<script setup>
import CategoryPage from './CategoryPage.vue';
import MainPage from './MainPage.vue';
import PostDetails from './post/PostDetails.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentCategory = computed(() => route.query.category);
const isPostValid = computed(() => !currentCategory.value && route.query.post);
const isCategoryValid = computed(() =>
  ['all', 'dev', 'ctf', 'writeup', 'cs', 'cheet_sheet'].includes(
    route.query.category
  )
);
</script>

<style lang="scss" scoped>
.carousel {
  color: $font-color;
}
.text-table {
  color: $font-color !important;
}
</style>

<!-- <template>
  <p class="text-h5 text-weight-bold">Recent Post</p>
  <q-carousel
    class="carousel"
    :style="{ height: 'auto', width: 'auto' }"
    dark
    swipeable
    animated
    v-model="slide"
    :autoplay="autoplay"
    ref="carousel"
    infinite
    transition-prev="slide-right"
    transition-next="slide-left"
  >
    <template v-for="(post, index) in posts" :key="index">
      <q-carousel-slide :name="index + 1">
        <div>
          <PostComponent
            :id="post.id"
            :title="post.title"
            :content="post.content"
            :hashtag="post.hashtag"
            :created-at="post.createdAt"
            :created-by="post.createdBy"
            :category="post.category"
            :shadow="false"
            :border="false"
            v-slot="{ svgLink, timeToRead, content }"
          >
            <div class="row items-center justify-center">
              <div class="col-3 row items-center justify-center">
                <q-avatar size="13rem" square>
                  <q-img :src="svgLink" />
                </q-avatar>
              </div>

              <div class="col-7 row items-center justify-center q-ml-xl">
                <div class="q-gutter-y-md">
                  <div>
                    <q-avatar size="2rem">
                      <q-img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZHnYW3u0Y2pKCoepqCtCchGi89SaRO4_oZWyg7ial3BmDSAqGElB_LMIqmWEIiTUCpLs&usqp=CAU"
                      />
                    </q-avatar>
                    <span class="q-ml-sm">{{ post.createdBy }}</span>
                  </div>

                  <div class="text-h4 text-bold">{{ post.title }}</div>

                  <div class="text-caption">
                    {{ content }}
                  </div>

                  <q-item-label class="q-mb-md">
                    <span class="text-overline text-red">
                      {{ post.category.toUpperCase() }}
                    </span>
                    <span class="text-bold">&nbsp;·&nbsp;</span>
                    <span class="text-caption">{{ timeToRead }}</span>
                  </q-item-label>
                </div>
              </div>
            </div>
          </PostComponent>
        </div>
      </q-carousel-slide>
    </template>
  </q-carousel>

  <div class="row items-center justify-center" :style="{ height: '400px' }">
    <div class="col-12 row items-center justify-center no-wrap q-px-lg">
      <p class="col-6 text-h5 text-weight-bold q-mr-md">DEVLOG</p>
      <p class="col-6 text-h5 text-weight-bold">TRYHACKME</p>
    </div>
    <div class="col-12 row items-center justify-center no-wrap q-pa-lg">
      <div class="col-6 q-mr-md">
        <q-table
          class="text-table"
          dense
          hide-no-data
          dark
          flat
          bordered
          :rows="githubResults"
          :columns="columns"
          row-key="name"
          separator="cell"
        >
          <template v-slot:top>
            <q-avatar
              font-size="1.8rem"
              size="1.8rem"
              icon="fa-brands fa-github"
            />
          </template>
        </q-table>
      </div>

      <div class="col-6">
        <div class="row no-wrap">
          <div class="col-auto" :style="{ width: '320px', height: '320px' }">
            <ChartComponent
              v-if="loaded"
              chart-type="radar"
              :chart-data="chartData"
              :chart-options="config"
            />
          </div>

          <div class="column justify-center items-center">
            <div class="q-mb-md">
              <div
                class="row items-end justify-center no-wrap"
                :style="{ width: '210px', height: '70px' }"
              >
                <div class="q-mr-md">
                  <span>&nbsp;</span>
                  <div class="text-center text-h6 text-weight-bold">
                    {{ tryHackMeTotalUsers.totalUsers }}
                  </div>
                  <div class="text-center text-caption">
                    <q-icon name="fa-solid fa-users" />
                    Users
                  </div>
                </div>
                <div>
                  <span v-if="!isNaN(tryHackMeRankPercentage)">
                    <span class="text-caption text-light-green-12">
                      In the top {{ tryHackMeRankPercentage }}%</span
                    >
                  </span>
                  <div class="text-center text-h6 text-weight-bold">
                    {{ tryHackMeUserRank.userRank }}
                  </div>
                  <div class="text-center text-caption">
                    <q-icon name="fa-solid fa-trophy" />
                    Rank
                  </div>
                </div>
              </div>
            </div>
            <TryHackMeBadgeComponent
              :user-rank="tryHackMeUserRank.userRank"
              class="q-mb-lg"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { findAllPost } from 'src/api/posts';
import PostComponent from 'src/components/PostComponent.vue';
import ChartComponent from 'src/components/ChartComponent.vue';
import TryHackMeBadgeComponent from 'src/components/TryHackMeBadgeComponent.vue';
import { onMounted, computed, ref } from 'vue';
import {
  fetchGithubCommits,
  fetchTryHackMeTotalUsers,
  fetchTryHackMeRank,
  fetchTryHackMeSkillSet
} from 'src/api/data';

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// request Recent post
const posts = ref([]);
const postRequestParam = ref({
  page: 1,
  size: 4,
  category: 'writeup'
});
const findRecentPostRequest = async param => {
  try {
    const { data } = await findAllPost(param);
    posts.value = data;
  } catch (error) {
    console.error(error);
  }
};

// quarsal
const slide = ref(1);
const autoplay = ref(3000);

// fetch github api
const githubCommits = ref([]);
const githubResults = ref([]);
const fetchGithubCommitsRequest = async repository => {
  ({ data: githubCommits.value } = await fetchGithubCommits(repository));
  githubCommits.value.forEach(({ commit }) =>
    githubResults.value.push({
      message: commit.message.slice(0, 30),
      committer: commit.committer.name,
      email: commit.committer.email,
      date: commit.committer.date
    })
  );
};

// fetch TryHackMe TotalUser
const tryHackMeTotalUsers = ref({});
const fetchTryHackMeTotalUsersRequest = async () => {
  ({ data: tryHackMeTotalUsers.value } = await fetchTryHackMeTotalUsers());
};

// fetch TryHackMe UserRank
const tryHackMeUserRank = ref({});
const fetchTryHackMeRankRequest = async () => {
  ({ data: tryHackMeUserRank.value } = await fetchTryHackMeRank());
};

// calculate TryHackMe RankPercentage
const tryHackMeRankPercentage = computed(() => {
  return Math.ceil(
    (tryHackMeUserRank.value.userRank / tryHackMeTotalUsers.value.totalUsers) *
      100
  );
});

// filtering maximum value
const filteringMaximumValue = iterable => {
  const emptyArray = [];
  iterable.forEach(value =>
    value >= 100 ? emptyArray.push(100) : emptyArray.push(value)
  );
  return emptyArray;
};

// fetch TryHackMe SkillSet & ChartJS
const tryHackMeSkillSet = ref({
  fundamentals: '',
  linux: '',
  network: '',
  privesc: '',
  web: '',
  windows: ''
});

const fetchTryHackMeSkillSetRequest = async () => {
  let preData = null;
  try {
    loaded.value = false;
    const { data } = await fetchTryHackMeSkillSet();
    preData = filteringMaximumValue([
      data.skills.fundamentals.score,
      data.skills.linux.score,
      data.skills.network.score,
      data.skills.privesc.score,
      data.skills.web.score,
      data.skills.windows.score
    ]);
  } catch {
    preData = [100, 85, 81, 70, 93, 38];
  } finally {
    chartData.value = {
      labels: Object.keys(tryHackMeSkillSet.value),
      datasets: [
        {
          label: 'Skill Score',
          data: preData,
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          pointBackgroundColor: 'rgb(54, 162, 235)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(54, 162, 235)'
        }
      ]
    };
    loaded.value = true;
  }
};
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);
ChartJS.defaults.color = '#BADA55';
ChartJS.defaults.borderColor = '#adbac7';
const loaded = ref(false);
const chartData = ref(null);
const config = {
  elements: {
    line: {
      borderWidth: 3
    }
  },
  scales: {
    r: {
      beginAtZero: true,
      min: 0,
      max: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      ticks: {
        stepSize: 20,
        callback: (value, tick, values) => '',
        backdropPadding: 0
      }
      // angleLines: {
      //   color: 'red'
      // }
    }
  },
  animation: {
    duration: 1500,
    easing: 'easeInOutQuart'
  }
};

// table
const columns = [
  {
    name: 'message',
    label: 'Message',
    field: 'message',
    align: 'left',
    sortable: true
  },
  {
    name: 'committer',
    label: 'Committer',
    field: 'committer',
    align: 'center'
  },
  {
    name: 'date',
    label: 'Date',
    field: 'date',
    align: 'center',
    sortable: true
  }
];

// LifeCycle Hook
onMounted(async () => {
  findRecentPostRequest(postRequestParam.value); // TODO: 프롭스로 넘기든 뭐든 해야한다.
  fetchGithubCommitsRequest('R3VI1E37');
  fetchTryHackMeTotalUsersRequest();
  fetchTryHackMeRankRequest('revi1337');
  fetchTryHackMeSkillSetRequest();
});
</script>

<style lang="scss" scoped>
.carousel {
  color: $font-color;
}
.text-table {
  color: $font-color !important;
}
</style> -->
