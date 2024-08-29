<template>
  <div
    class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center"
    :style="backgroundImageHandler"
  >
    <ChangePassword :forced="forced"> </ChangePassword>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const forced = router.currentRoute.value.meta?.forced;
const bgimage = router.currentRoute.value.meta?.bgimage;

import { ChangePassword } from "../../../../components/change-password";

export interface Props {
  background?: string;
  userName?: string;
}

const props = defineProps<Props>();

const backgroundImageHandler = computed(() => {
  return `background: url(${bgimage}) center / cover no-repeat`;
});
</script>
