<template>
  <form @submit.prevent="submit">
    <slot>vc-form</slot>
  </form>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'submit'): void;
}>()

const submit = () => {
  emit('submit');
}
</script>
