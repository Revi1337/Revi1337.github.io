<template>
  <div :style="{ width: '320px', height: '320px' }">
    <canvas id="myChart"></canvas>
  </div>
</template>

<script setup>
import Chart from 'chart.js/auto';
// Props 를 선언한다.
const props = defineProps({
  chartType: {
    type: String
  },
  chartData: {
    type: Object
  },
  chartOptions: {
    type: Object
  }
});

// Chart 의 Default Color 를 설정해준다.
Chart.defaults.color = '#BADA55';
Chart.defaults.borderColor = '#adbac7';

// 이제 Element 에 Chart 를 만들어주는 생성자(함수) 를 만들어준다.
const ChartComponentConstructor = (chartType, chartData, chartOptions) => {
  const chartElement = document.getElementById('myChart');
  new Chart(chartElement, {
    type: chartType,
    data: chartData,
    options: chartOptions
  });
};

// Mounted 되면 생성자 함수를 호출해주어 Chart 를 만들어준다.
onMounted(() => {
  ChartComponentConstructor(props.chartType, props.chartData, props.chartOptions);
});
</script>
