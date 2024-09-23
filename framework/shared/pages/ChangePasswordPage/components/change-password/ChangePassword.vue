<template>
  <div
    class="vc-change-password"
    :style="backgroundImageHandler"
  >
    <ChangePassComponent :forced="forced" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ChangePassword as ChangePassComponent } from "../../../../components/change-password";

const router = useRouter();

const forced = router.currentRoute.value.meta?.forced as boolean | undefined;

export interface Props {
  background: string;
}

const props = withDefaults(defineProps<Props>(), {
  background: "/assets/background.jpg",
});

const backgroundImageHandler = computed(() => {
  return `background: url(${props.background}) center / cover no-repeat`;
});
</script>

<style lang="scss">
.vc-change-password {
  @apply tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center;
}
</style>
