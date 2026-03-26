<template>
  <div :class="{ 'my-comp--mobile': $isMobile.value }">
    <span v-if="$isDesktop.value">Desktop</span>
    <span v-if="isPhone">Phone</span>
  </div>
</template>
<script setup lang="ts">
import { inject, ref } from "vue";
import { useBlade, IsPhoneKey } from "@vc-shell/framework";

const isPhone = inject(IsPhoneKey, ref(false));
const { openBlade } = useBlade();
</script>
