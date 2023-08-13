<template>
  <footer
    class="row justify-between items-center no-wrap"
    :style="{ minHeight: '62px', position: $props.pos }"
  >
    <p class="footer-content policy cursor-pointer">Privacy Policy</p>
    <p class="footer-content">Copyright (&COPY;) {{ new Date().getFullYear() }} R3VI1E37</p>
  </footer>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  pos: {
    type: [String],
    required: false,
    default: 'absolute'
  }
});
</script>

<style lang="scss" scoped>
footer,
.q-footer {
  // position: absolute;
  background-color: #22272e;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0 75px 0;
}
.footer-content {
  margin-bottom: 0;
}
.policy {
  position: relative;
  text-decoration: none;
}
.policy:before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: $font-color;
  transition: width 0.3s ease-in-out;
}
.policy:hover:before {
  width: 100%;
}
</style>
