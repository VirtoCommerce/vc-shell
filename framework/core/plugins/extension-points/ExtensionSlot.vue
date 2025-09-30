<template>
  <template
    v-for="extension in components"
    :key="extension.id"
  >
    <component
      :is="extension.component"
      v-bind="extension.props || {}"
    />
  </template>
</template>

<script setup lang="ts">
import { useExtensionSlot } from './simple-extensions';

interface Props {
  name: string;
}

const props = defineProps<Props>();

const { components } = useExtensionSlot(props.name);
</script>
