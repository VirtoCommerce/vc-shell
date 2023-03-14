<template>
  <div class="vc-rating">
    <!-- Rating label -->
    <VcLabel
      v-if="label"
      class="tw-mb-2"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        v-slot:tooltip
      >
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>

    <!-- Rating icon -->
    <template v-if="rating">
      <template v-if="variant == 'stars'">
        <VcIcon
          v-for="index in rating"
          :key="index"
          icon="fas fa-star"
          class="vc-rating__icon"
        ></VcIcon>
        <VcIcon
          v-for="index in max - rating"
          :key="index"
          icon="far fa-star"
          class="vc-rating__icon"
        ></VcIcon>
      </template>
      <template v-else>
        <VcIcon
          v-if="variant == 'star-and-text'"
          icon="fas fa-star"
          class="vc-rating__icon"
        ></VcIcon>
        <span class="vc-rating__rating">{{ rating }}/{{ max }}</span>
        <slot name="details"></slot>
      </template>
    </template>
    <template v-else>
      <span class="vc-rating__placeholder"></span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon, VcLabel } from "./../../../components";
import { ratingProps } from "./vc-rating-model";

defineProps({...ratingProps});
</script>

<style lang="scss">
:root {
  --rating-placeholder-color: #a5a5a5;
}

.vc-rating {
  @apply tw-align-middle;

  &__placeholder {
    @apply tw-text-[color:var(--rating-placeholder-color)];
  }
  &__icon {
    @apply tw-text-[color:var(--special-color)] tw-mr-1;
    font-size: inherit;
  }
  &__rating {
    @apply tw-mr-1;
  }
}
</style>
