<template>
  <div>TEST PAGE</div>
  <div>
    {{ route }}
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();
</script>

<style lang="scss" scoped></style>
