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

    <div style="min-height: 300px" class="row items-center">
      <transition appear enter-active-class="animated fadeIn ">
        <div
          v-if="isReadyToRenderContributeInfo"
          class="heatmap-container col-12"
        >
          <div class="row items-center">
            <div style="width: 50%" class="col-6 row items-center q-my-md">
              <q-avatar size="60px" class="q-ma-sm">
                <q-img
                  width="45px"
                  src="assets/Github.svg"
                  style="color: #e1e5ec"
                />
              </q-avatar>

              <CalendarHeatmap
                ref="githubHeatmap"
                dark-mode
                :values="contributeObjects"
                :end-date="new Date()"
                :tooltip-unit="Interaction"
                :round="2"
                :max="6"
                :tooltip-formatter="
                  v =>
                    `${v.count ? v.count : 'No'} contributions on ${
                      monthNames[v.date.getMonth()]
                    } ${v.date.getDate()}, ${v.date.getFullYear()}`
                "
                @vue:mounted="changeLegendColor"
                class="col"
              />
            </div>
            <div class="col-6 row items-center justify-center q-my-md">
              <LineChart
                :chart-data="githubChartData"
                :options="githubChartOptions"
                :height="89.44"
              />
            </div>
          </div>

          <div class="row items-center">
            <div style="width: 50%" class="row items-center q-my-md">
              <q-avatar size="60px" class="q-ma-sm">
                <q-img
                  width="45px"
                  src="https://avatars.githubusercontent.com/u/43436467?s=48&v=4"
                />
              </q-avatar>
              <!-- <q-img width="45px" src="assets/Inflearn.svg" /> -->

              <CalendarHeatmap
                ref="inflearnHeatmap"
                style="width: 50%"
                dark-mode
                :values="inflearnContributeObjects"
                :end-date="new Date()"
                :tooltip-unit="Interaction"
                :round="2"
                :max="6"
                :tooltip-formatter="
                  v =>
                    `${v.count ? v.count : 'No'} contributions on ${
                      monthNames[v.date.getMonth()]
                    } ${v.date.getDate()}, ${v.date.getFullYear()}`
                "
                @vue:mounted="console.log('inflearnHeatmap')"
                class="col"
              />
            </div>
            <div class="col-6 row items-center justify-center q-my-md">
              <LineChart
                :chart-data="inflearnChartData"
                :options="inflearnChartOptions"
                :height="89.44"
              />
            </div>
          </div>

          <div class="row items-center">
            <div style="width: 50%" class="row items-center q-my-md">
              <q-avatar size="60px" class="q-ma-sm">
                <q-img width="45px" src="assets/HackTheBox.svg" />
              </q-avatar>
              <CalendarHeatmap
                ref="hackTheBoxHeatmap"
                style="width: 50%"
                dark-mode
                :values="hackTheBoxContributeObjects"
                :end-date="new Date()"
                :tooltip-unit="Interaction"
                :round="2"
                :max="6"
                :tooltip-formatter="
                  v =>
                    `${v.count ? v.count : 'No'} contributions on ${
                      monthNames[v.date.getMonth()]
                    } ${v.date.getDate()}, ${v.date.getFullYear()}`
                "
                @vue:mounted="console.log('hackTheBoxHeatmap')"
                class="col"
              />
            </div>
            <div class="col-6 row items-center justify-center q-my-md">
              <LineChart
                :chart-data="hackTheBoxChartData"
                :options="hackTheBoxChartOptions"
                :height="89.44"
              />
            </div>
          </div>

          <div class="row items-center">
            <div style="width: 50%" class="row items-center q-my-md">
              <q-avatar size="60px" class="q-ma-sm">
                <q-img width="45px" src="assets/TryHackMe.svg" />
              </q-avatar>
              <CalendarHeatmap
                ref="tryHackMeHeatmap"
                style="width: 50%"
                dark-mode
                :values="tryHackMeContributeObjects"
                :end-date="new Date()"
                :tooltip-unit="Interaction"
                :round="2"
                :max="6"
                :tooltip-formatter="
                  v =>
                    `${v.count ? v.count : 'No'} contributions on ${
                      monthNames[v.date.getMonth()]
                    } ${v.date.getDate()}, ${v.date.getFullYear()}`
                "
                @vue:mounted="console.log('tryHackMeHeatmap')"
                class="col"
              />
            </div>
            <div class="col-6 row items-center justify-center q-my-md">
              <LineChart
                :chart-data="tryHackMeChartData"
                :options="tryHackMeChartOptions"
                :height="89.44"
              />
            </div>
          </div>
        </div>
        <div v-else class="col-12 text-center">
          <q-spinner-facebook color="teal" size="2rem" />
        </div>
      </transition>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import PostComponent from 'components/PostComponent.vue';
import { getProcessedData } from 'src/api/posts';
import { useRouter } from 'vue-router';
import { CalendarHeatmap } from 'vue3-calendar-heatmap';
import { Chart, registerables } from 'chart.js';
import { LineChart } from 'vue-chart-3';
import {
  fetchGitContributeInfo,
  fetchInflearnContributeInfo,
  fetchHackTheBoxContributeInfo,
  fetchTryHackMeContributeInfo
} from 'src/api/fetchapi';

const githubHeatmap = ref(null);
const inflearnHeatmap = ref(null);
const hackTheBoxHeatmap = ref(null);
const tryHackMeHeatmap = ref(null);

const router = useRouter();
const slide = ref(1);
const autoplay = ref(4200);
const posts = ref([]);
const isLoaded = ref(false);
const isGithubDataLoaded = ref(false);
const contributeObjects = ref([]);
const githubData = ref({
  startDate: '',
  endDate: ''
});
const isTryhackmeDataLoaded = ref(false);
const tryHackMeContributeObjects = ref([]);
const tryhackmeData = ref({
  startDate: '',
  endDate: ''
});
const isHackTheBoxDataLoaded = ref(false);
const hackTheBoxContributeObjects = ref([]);
const isInflearnDataLoaded = ref(false);
const inflearnContributeObjects = ref([]);
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

const preIndex = new Date().getMonth() + 1;
const pre = monthNames.slice(preIndex);
const postIndex = monthNames.indexOf(pre[0]);
const post = monthNames.slice(0, postIndex);

Chart.register(...registerables);
const chartMonthDelemeter = ref(preIndex);
const chartMonthNameValues = ref(
  pre.concat(post).map(monName => monName.slice(0, 3))
);
const githubChartMonthDatas = ref([]);
const githubChartData = ref({});
const githubChartOptions = ref({});

const inflearnChartMonthDatas = ref([]);
const inflearnChartData = ref({});
const inflearnChartOptions = ref({});

const hackTheBoxChartMonthDatas = ref([]);
const hackTheBoxChartData = ref({});
const hackTheBoxChartOptions = ref({});

const tryHackMeChartMonthDatas = ref([]);
const tryHackMeChartData = ref({});
const tryHackMeChartOptions = ref({});

const isReadyToRenderContributeInfo = computed(
  () =>
    isInflearnDataLoaded.value &&
    isGithubDataLoaded.value &&
    isTryhackmeDataLoaded.value &&
    isHackTheBoxDataLoaded.value
);

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

    const { data } = await fetchGitContributeInfo();

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
    // console.log(contributeObjects.value);

    const monthlySum = {};
    contributeObjects.value.forEach(item => {
      const month = new Date(item.date).getMonth();
      if (!monthlySum[month]) {
        monthlySum[month] = 0;
      }
      monthlySum[month] += item.count;
    });
    const resultArray = Array.from({ length: 12 }, (_, month) => ({
      month: month + 1,
      totalCount: monthlySum[month] || 0
    }));
    const preResultData = resultArray.map(arr => arr.totalCount);
    const pre = preResultData.slice(chartMonthDelemeter.value);
    const post = preResultData.slice(0, chartMonthDelemeter.value);
    githubChartMonthDatas.value = pre.concat(post);
    // console.log(githubChartMonthDatas.value);

    createChartInstance(
      githubChartData,
      chartMonthNameValues,
      githubChartMonthDatas,
      githubChartOptions
    );

    isGithubDataLoaded.value = true;
  } catch (error) {
    isGithubDataLoaded.value = false;
    console.error(error);
  }
};

const fetchTryhackmeContribution = async () => {
  try {
    isTryhackmeDataLoaded.value = false;

    const { data } = await fetchTryHackMeContributeInfo();

    let preResults = data.data;
    preResults.sort(
      (a, b) =>
        new Date(`${a._id.year}-${a._id.month}-${a._id.day}`) -
        new Date(`${b._id.year}-${b._id.month}-${b._id.day}`)
    );
    const objectLength = preResults.length;
    const startDate = `${preResults[0]._id.year}-${preResults[0]._id.month}-${preResults[0]._id.day}`;
    const endDate = `${preResults[objectLength - 1]._id.year}-${
      preResults[objectLength - 1]._id.month
    }-${preResults[objectLength - 1]._id.day}`;

    tryhackmeData.value.startDate = startDate;
    tryhackmeData.value.endDate = endDate;

    for (const preResult of preResults) {
      const day = `${preResult._id.year}-${preResult._id.month}-${preResult._id.day}`;
      const event = preResult.events;
      const contributeObject = {};
      contributeObject['date'] = day;
      contributeObject['count'] = event;
      tryHackMeContributeObjects.value.push(contributeObject);
    }
    tryHackMeContributeObjects.value = tryHackMeContributeObjects.value.reduce(
      (accumulator, current) => {
        const existingItem = accumulator.find(
          item => item.date === current.date
        );
        if (existingItem) {
          existingItem.count += current.count;
        } else {
          accumulator.push({ date: current.date, count: current.count });
        }
        return accumulator;
      },
      []
    );
    // console.log(tryHackMeContributeObjects.value);

    const monthlySum = {};
    tryHackMeContributeObjects.value.forEach(item => {
      const month = new Date(item.date).getMonth();
      if (!monthlySum[month]) {
        monthlySum[month] = 0;
      }
      monthlySum[month] += item.count;
    });
    const resultArray = Array.from({ length: 12 }, (_, month) => ({
      month: month + 1,
      totalCount: monthlySum[month] || 0
    }));
    const preResultData = resultArray.map(arr => arr.totalCount);
    const pre = preResultData.slice(chartMonthDelemeter.value);
    const post = preResultData.slice(0, chartMonthDelemeter.value);
    tryHackMeChartMonthDatas.value = pre.concat(post);
    // console.log(tryHackMeChartMonthDatas.value);

    createChartInstance(
      tryHackMeChartData,
      chartMonthNameValues,
      tryHackMeChartMonthDatas,
      tryHackMeChartOptions
    );

    isTryhackmeDataLoaded.value = true;
  } catch (error) {
    isTryhackmeDataLoaded.value = false;
    console.error(error);
  }
};

const fetchHackTheBoxContribution = async () => {
  try {
    isHackTheBoxDataLoaded.value = false;

    const { data } = await fetchHackTheBoxContributeInfo();

    let preDatas = data.profile.activity;

    const dateGroups = preDatas.reduce((groupMap, obj) => {
      const datePart = obj.date.split('T')[0];
      if (!groupMap[datePart]) {
        groupMap[datePart] = { date: datePart, count: 1 };
      } else {
        groupMap[datePart].count++;
      }
      return groupMap;
    }, {});
    hackTheBoxContributeObjects.value = Object.values(dateGroups);
    // console.log(hackTheBoxContributeObjects.value);

    const monthlySum = {};
    hackTheBoxContributeObjects.value.forEach(item => {
      const month = new Date(item.date).getMonth();
      if (!monthlySum[month]) {
        monthlySum[month] = 0;
      }
      monthlySum[month] += item.count;
    });
    const resultArray = Array.from({ length: 12 }, (_, month) => ({
      month: month + 1,
      totalCount: monthlySum[month] || 0
    }));
    const preResults = resultArray.map(arr => arr.totalCount);
    const pre = preResults.slice(chartMonthDelemeter.value);
    const post = preResults.slice(0, chartMonthDelemeter.value);
    hackTheBoxChartMonthDatas.value = pre.concat(post);
    // console.log(hackTheBoxChartMonthDatas.value);

    createChartInstance(
      hackTheBoxChartData,
      chartMonthNameValues,
      hackTheBoxChartMonthDatas,
      hackTheBoxChartOptions
    );

    isHackTheBoxDataLoaded.value = true;
  } catch (error) {
    isHackTheBoxDataLoaded.value = false;
    console.error(error);
  }
};

const fetchInflearnContribution = async () => {
  try {
    isInflearnDataLoaded.value = false;

    const previousYear = await fetchInflearnContributeInfo(2022);
    const currentYear = await fetchInflearnContributeInfo();

    let previousPreResults = previousYear.data.data.heatMap;
    let currentPreResults = currentYear.data.data.heatMap;
    const totalPreResults = previousPreResults.concat(currentPreResults);

    for (const preResult of totalPreResults) {
      const dummyObject = {};
      if (preResult[1] === 0) continue;
      dummyObject['date'] = preResult[0];
      dummyObject['count'] = preResult[1];
      inflearnContributeObjects.value.push(dummyObject);
    }
    // console.log(inflearnContributeObjects.value);

    const monthlySum = {};
    inflearnContributeObjects.value.forEach(item => {
      const month = new Date(item.date).getMonth();
      if (!monthlySum[month]) {
        monthlySum[month] = 0;
      }
      monthlySum[month] += item.count;
    });
    const resultArray = Array.from({ length: 12 }, (_, month) => ({
      month: month + 1,
      totalCount: monthlySum[month] || 0
    }));
    const preResults = resultArray.map(arr => arr.totalCount);
    const pre = preResults.slice(chartMonthDelemeter.value);
    const post = preResults.slice(0, chartMonthDelemeter.value);
    inflearnChartMonthDatas.value = pre.concat(post);
    // console.log(inflearnChartMonthDatas.value);

    createChartInstance(
      inflearnChartData,
      chartMonthNameValues,
      inflearnChartMonthDatas,
      inflearnChartOptions
    );

    isInflearnDataLoaded.value = true;
  } catch (error) {
    isInflearnDataLoaded.value = false;
    console.log(error);
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

const changeLegendColor = () => {
  let elements = document.querySelectorAll(
    '.vch__wrapper text, .vch__legend div'
  );
  elements.forEach(element => {
    element.setAttribute('style', 'fill: white; font-size: 10px;');
  });

  let elementsToDelete = document.querySelectorAll(
    '.vch__container > .vch__legend'
  );
  elementsToDelete.forEach(element => {
    element.parentNode.removeChild(element);
  });
  const targetElement = document.querySelector('.heatmap-container');
  targetElement.appendChild(elementsToDelete[0]);
};

function createChartInstance(
  dataHolder,
  monthNameValues,
  chartMonthDatas,
  chartOptions
) {
  let chartDatas = {
    labels: monthNameValues.value,
    datasets: [
      {
        data: chartMonthDatas.value,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };
  let options = {
    plugins: {
      legend: {
        display: false
      }
    }
  };

  dataHolder.value = chartDatas;
  chartOptions.value = options;
}

onMounted(() => {
  console.log('MainPage Mounted()');
});

fetchData();
fetchGitGraphQL();
fetchTryhackmeContribution();
fetchHackTheBoxContribution();
fetchInflearnContribution();

watch(isReadyToRenderContributeInfo, () => {
  console.log('Ready to Render ChartJS');
});
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
