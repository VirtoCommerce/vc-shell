<template>
  <div v-if="isMobile">Mobile</div>
</template>
<script setup lang="ts">
import { inject, ref } from "vue";

const isMobile = inject("isMobile", ref(false));
const isDesktop = inject("isDesktop", ref(true));
</script>
