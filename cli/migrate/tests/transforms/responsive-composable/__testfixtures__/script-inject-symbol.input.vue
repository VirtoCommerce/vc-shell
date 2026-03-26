<template>
  <div v-if="isMobile">Mobile</div>
</template>
<script setup lang="ts">
import { inject, ref } from "vue";
import { IsMobileKey } from "@vc-shell/framework";

const isMobile = inject(IsMobileKey, ref(false));
</script>
