<template>
  <div
    v-if="bladeLoading"
    class="vc-field"
    :class="[`vc-field--${orientation}`]"
  >
    <div
      v-if="label"
      class="vc-field__label"
    >
      <VcSkeleton
        variant="block"
        :width="60 + (label?.length || 0) * 4"
        :height="11"
      />
    </div>
    <div class="vc-field__value">
      <VcSkeleton
        variant="block"
        :width="120"
        :height="14"
      />
    </div>
  </div>
  <div
    v-else
    class="vc-field"
    :class="[`vc-field--${orientation}`]"
  >
    <!-- Label -->
    <div
      v-if="label"
      class="vc-field__label"
      :style="orientation === 'horizontal' ? { flex: `${aspectRatio[0]} 1 0%` } : undefined"
    >
      <VcLabel>
        <span>{{ label }}</span>
        <template
          v-if="tooltip"
          #tooltip
        >
          {{ tooltip }}
        </template>
      </VcLabel>
    </div>

    <!-- Value -->
    <div
      class="vc-field__value"
      :style="orientation === 'horizontal' ? { flex: `${aspectRatio[1]} 1 0%` } : undefined"
    >
      <div class="vc-field__content">
        <VcLink
          v-if="type === 'link' && modelValue"
          class="vc-field__link"
          @click="onLinkClick"
          >{{ displayValue || modelValue }}</VcLink
        >

        <a
          v-else-if="type === 'email' && modelValue"
          :href="`mailto:${modelValue}`"
          class="vc-field__link"
          >{{ displayValue || modelValue }}</a
        >

        <span
          v-else
          class="vc-field__text"
          >{{ formattedValue }}</span
        >
      </div>

      <VcButton
        v-if="copyable"
        :icon="copyIcon"
        icon-size="m"
        class="vc-field__copy"
        text
        aria-label="Copy to clipboard"
        @click="onCopy"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useBladeLoading } from "@ui/composables/useBladeLoading";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";

const bladeLoading = useBladeLoading();
import { VcLabel } from "@ui/components/atoms/vc-label";
import { formatDateRelative } from "@core/utilities/date";

export interface VcFieldProps {
  label?: string;
  tooltip?: string;
  type?: "text" | "date" | "date-ago" | "link" | "email";
  modelValue?: string | number | Date;
  /** Text to display instead of modelValue. modelValue is still used for copy/link actions. */
  displayValue?: string;
  copyable?: boolean;
  orientation?: "horizontal" | "vertical";
  aspectRatio?: [number, number];
}

const props = withDefaults(defineProps<VcFieldProps>(), {
  type: "text",
  orientation: "vertical",
  aspectRatio: () => [1, 1],
});

const formattedValue = computed(() => {
  const val = props.modelValue;
  if (val == null || val === "") {
    return props.type === "date" || props.type === "date-ago" ? "N/A" : "";
  }

  if (props.type === "date") {
    return val instanceof Date ? val.toLocaleDateString() : String(val);
  }
  if (props.type === "date-ago") {
    return formatDateRelative(val) || "N/A";
  }
  return String(val);
});

const copyIcon = ref("lucide-copy");

function onCopy() {
  navigator.clipboard?.writeText(String(props.modelValue ?? ""));
  copyIcon.value = "lucide-check";
  setTimeout(() => {
    copyIcon.value = "lucide-copy";
  }, 1000);
}

function onLinkClick() {
  const url = String(props.modelValue ?? "");
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
</script>

<style lang="scss">
.vc-field {
  @apply tw-min-w-0 tw-max-w-full tw-overflow-hidden;

  &--vertical {
    @apply tw-flex tw-flex-col;
    gap: 0.25rem;
  }

  &--horizontal {
    @apply tw-flex tw-flex-row tw-items-baseline;
    gap: 0.5rem;
  }

  &__label {
    @apply tw-min-w-0;
  }

  &__value {
    @apply tw-flex tw-items-center tw-gap-1;
  }

  &__content {
    @apply tw-overflow-hidden tw-flex-1;
  }

  &__text {
    @apply tw-text-sm tw-text-[color:var(--neutrals-600)];
    @apply tw-whitespace-normal tw-break-words;
  }

  &__link {
    @apply tw-text-sm;
  }

  &__copy {
    @apply tw-flex-shrink-0;
  }
}
</style>
