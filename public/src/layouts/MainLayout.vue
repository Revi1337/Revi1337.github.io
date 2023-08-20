<template>
  <q-layout view="lHh Lpr lFf">
    <HeaderComponent />

    <ContentComponent />

    <!-- <FooterComponent pos="relative" :style="{ padding: 0 }" /> -->
  </q-layout>
</template>

<script setup>
import FooterComponent from 'src/components/FooterComponent.vue';
import HeaderComponent from 'src/components/HeaderComponent.vue';
import ContentComponent from 'src/components/ContentComponent.vue';
</script>
