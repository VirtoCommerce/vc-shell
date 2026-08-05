<template>
  <slot />
</template>

<script lang="ts" setup>
import { computed, provide } from "vue";
import { PopupInstanceKey } from "@core/composables/usePopup/keys";

/**
 * Hands the per-popup close context to whatever component the container renders.
 *
 * This is provide/inject rather than a prop because the container renders an
 * arbitrary component: writing `modelValue` into it would collide with popups that
 * own that prop themselves. A popup that knows nothing about the context simply
 * ignores it and is unmounted by the fallback timer in `usePopup.close`.
 */
const props = defineProps<{
  /** True once closing started, so the popup should play its leave transition. */
  closing: boolean;
}>();

const emit = defineEmits<{
  /** Raised by the popup when its leave transition finished. */
  (e: "finalize"): void;
}>();

provide(PopupInstanceKey, {
  closing: computed(() => props.closing),
  finalize: () => emit("finalize"),
});
</script>
