<template>
  <VcContainer class="dashboard w-full h-full box-border">
    <div class="text-[25px] text-[#333333] my-3 px-2" v-if="$isDesktop.value">
      Dashboard
    </div>
  </VcContainer>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

defineProps({
  openPage: {
    type: Function,
    default: undefined,
  },
});
const router = useRouter();
onMounted(() => {
  router.push("/");
});
</script>

<style lang="scss">
.dashboard {
  --card-header-background: transparent;
}
</style>
