<template>
  <div class="relative">
    <VcLoading :active="loading"></VcLoading>
    <VcRating v-if="rating" :rating="rating" :variant="variant">
      <template v-slot:details>
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
import { VcLoading, VcRating } from "@vc-shell/ui";
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
