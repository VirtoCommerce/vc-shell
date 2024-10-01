<template>
  <!-- Text -->
  <template v-if="type === 'text'">
    <div class="vc-field-type">
      <div class="vc-field-type__text-wrap">
        <p class="vc-field-type__text">{{ value }}</p>
      </div>
    </div>
  </template>

  <!-- Date -->
  <template v-if="type === 'date'">
    <div class="vc-field-type">
      <div class="vc-field-type__text-wrap">
        <p class="vc-field-type__text">{{ value instanceof Date ? value.toLocaleDateString() : value }}</p>
      </div>
    </div>
  </template>

  <!-- Date ago -->
  <template v-if="type === 'date-ago'">
    <div class="vc-field-type">
      <div class="vc-field-type__text-wrap">
        <p class="vc-field-type__text">{{ value instanceof Date ? (moment(value).fromNow() ?? "N/A") : value }}</p>
      </div>
    </div>
  </template>

  <!-- Link -->
  <template v-if="type === 'link'">
    <div class="vc-field-type">
      <div class="vc-field-type__text-wrap">
        <VcLink
          class="vc-field-type__link"
          @click="onLinkClick"
          >{{ value }}</VcLink
        >
      </div>
      <slot></slot>
    </div>
  </template>

  <!-- Email -->
  <template v-if="type === 'email'">
    <div class="vc-field-type">
      <div class="vc-field-type__text-wrap">
        <a
          :href="`mailto:${value}`"
          class="vc-field-type__link"
          >{{ value }}</a
        >
      </div>
      <slot></slot>
    </div>
  </template>
</template>

<script lang="ts" setup>
import moment from "moment";

export interface Props {
  type: "text" | "date" | "date-ago" | "link" | "email";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface Emits {
  (event: "click"): void;
  (event: "copy"): void;
}

defineEmits<Emits>();
const props = defineProps<Props>();

function onLinkClick() {
  location.href = props.value;
}
</script>

<style lang="scss">
.vc-field-type {
  @apply tw-flex tw-flex-row tw-justify-stretch tw-truncate;

  &__text-wrap {
    @apply tw-text-wrap;
  }

  &__text {
    @apply tw-text-sm;
  }

  &__link {
    @apply tw-text-sm tw-truncate tw-w-full;
  }
}
</style>
