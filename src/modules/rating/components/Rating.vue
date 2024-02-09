<template>
  <div
    v-loading="loading"
    class="tw-relative"
  >
    <VcRating
      v-if="rating"
      :model-value="rating"
      :variant="variant"
    >
      <template #details>
        {{
          $t("RATING.RATING.REVIEWS", {
            count: reviewCount,
          })
        }}
      </template>
    </VcRating>
    <slot v-else>{{ $t("RATING.RATING.EMPTY") }}</slot>
  </div>
</template>

<script lang="ts" setup>
import { VcRating } from "@vc-shell/framework";
import { onMounted } from "vue";
import { useRating } from "../composables";

export interface Props {
  variant?: InstanceType<typeof VcRating>["variant"];
}

withDefaults(defineProps<Props>(), { variant: "star-and-text" });

const { loading, rating, reviewCount, getRating } = useRating();

onMounted(async () => {
  await getRating();
});
</script>
