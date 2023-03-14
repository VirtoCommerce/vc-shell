<template>
  <div>
    <template v-if="status">
      <VcIcon
        icon="fas fa-check-circle"
        class="tw-text-[color:#87b563]"
      ></VcIcon>
    </template>
    <template v-else>
      <VcIcon
        icon="fas fa-times-circle"
        class="tw-text-[color:#bdd1df]"
      ></VcIcon>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../../../components";
import { statusIconProps } from "./vc-status-icon-model";

defineProps({...statusIconProps});
</script>
