<template>
  <form
    class="vc-form"
    novalidate
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    @submit.prevent="submit"
  >
    <slot>vc-form</slot>
  </form>
</template>

<script lang="ts" setup>
export interface Props {
  ariaLabel?: string;
  ariaLabelledby?: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "submit"): void;
}>();

const submit = () => {
  emit("submit");
};
</script>

<style lang="scss">
:root {
  --form-gap: 1rem;
}

.vc-form {
  @apply tw-flex tw-flex-col;
}
</style>
