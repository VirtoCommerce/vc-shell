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
import { VcIcon } from "@/ui/components";
import { VcStatusIconProps } from "@/ui/components/atoms/vc-status-icon/vc-status-icon-model";

withDefaults(defineProps<VcStatusIconProps>(), {
  status: false,
});
</script>
