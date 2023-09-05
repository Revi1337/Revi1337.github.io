<template>
  <q-page-container class="row items-center justify-center">
    <div :style="contentStyle">
      <router-view />
    </div>
  </q-page-container>
</template>

<script setup>
import { ref } from 'vue';
// const contentStyle = ref(['width: 1350px', 'height: 1500px']);
const contentStyle = ref(['width: 1350px']);
</script>

<style lang="scss" scoped></style>
