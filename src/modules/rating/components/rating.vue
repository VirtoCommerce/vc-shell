<template>
  <div
    v-loading="loading"
    class="tw-relative"
  >
    <VcRating
      v-if="rating"
      :rating="rating"
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
    <span v-else>{{ $t("RATING.RATING.EMPTY") }}</span>
  </div>
</template>

<script lang="ts" setup>
import { VcRating } from "@vc-shell/framework";
import { onMounted } from "vue";
import { useRating } from "../composables";

// Component

export interface Props {
  variant?: "stars" | "star-and-text" | "text";
}

withDefaults(defineProps<Props>(), { variant: "star-and-text" });

onMounted(async () => {
  await getRating();
});

// Data

const { loading, rating, reviewCount, getRating } = useRating();
</script>
