<template>
  <!-- Normal -->
  <template v-if="type === 'normal'">
    <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate tw-mt-1">
      <div class="tw-truncate">
        <p>{{ value }}</p>
      </div>
    </div>
  </template>

  <!-- Text -->
  <template v-if="type === 'text'">
    <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
      <div class="tw-truncate">
        <VcHint class="!tw-text-s">{{ value }}</VcHint>
      </div>
    </div>
  </template>

  <!-- Date -->
  <template v-if="type === 'date'">
    <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
      <div class="tw-truncate">
        <VcHint class="!tw-text-s"> {{ value.toLocaleDateString() }}</VcHint>
      </div>
    </div>
  </template>

  <!-- Date ago -->
  <template v-if="type === 'date-ago'">
    <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
      <div class="tw-truncate">
        <VcHint class="!tw-text-s"> {{ moment(value).fromNow() ?? "N/A" }}</VcHint>
      </div>
    </div>
  </template>

  <!-- Link -->
  <template v-if="type === 'link'">
    <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
      <div class="tw-truncate">
        <VcLink
          class="vc-link !tw-text-s tw-truncate tw-w-full"
          @click="onLinkClick"
          >{{ value }}</VcLink
        >
      </div>
      <slot></slot>
    </div>
  </template>
</template>

<script lang="ts" setup>
import moment from "moment";

export interface Props {
  type: "text" | "date" | "date-ago" | "link" | "normal";
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

<style lang="scss" scoped></style>
