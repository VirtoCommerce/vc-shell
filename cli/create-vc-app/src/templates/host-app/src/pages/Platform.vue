<template>
  <div class="tw-w-full tw-h-full">
    <iframe
      v-if="url"
      ref="iframeRef"
      :src="url"
      class="tw-w-full tw-h-full tw-border-0"
      allow="clipboard-read; clipboard-write"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const url = computed(() => route.query.url as string | undefined);
</script>
