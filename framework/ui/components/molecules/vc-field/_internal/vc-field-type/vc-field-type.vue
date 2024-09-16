<template>
  <!-- Text -->
  <template v-if="type === 'text'">
    <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
      <div class="tw-text-wrap">
        <p>{{ value }}</p>
      </div>
    </div>
  </template>

  <!-- Date -->
  <template v-if="type === 'date'">
    <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
      <div class="tw-text-wrap">
        <p>{{ value instanceof Date ? value.toLocaleDateString() : value }}</p>
      </div>
    </div>
  </template>

  <!-- Date ago -->
  <template v-if="type === 'date-ago'">
    <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
      <div class="tw-text-wrap">
        <p>{{ value instanceof Date ? moment(value).fromNow() ?? "N/A" : value }}</p>
      </div>
    </div>
  </template>

  <!-- Link -->
  <template v-if="type === 'link'">
    <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
      <div class="tw-truncate tw-text-wrap">
        <VcLink
          class="vc-link !tw-text-s tw-truncate tw-w-full"
          @click="onLinkClick"
          >{{ value }}</VcLink
        >
      </div>
      <slot></slot>
    </div>
  </template>

  <!-- Email -->
  <template v-if="type === 'email'">
    <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
      <div class="tw-text-wrap">
        <a
          :href="`mailto:${value}`"
          class="vc-link !tw-text-s tw-truncate tw-w-full"
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

<style lang="scss"></style>
