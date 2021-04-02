<template>
  <div class="text-white d-flex align-items-center px-4 py-2">
    <VcIcon :icon="icon"> </VcIcon>
    <h1
      class="d-inline-block ml-5 mb-0"
      :class="{ h6: subtitle, h4: !subtitle }"
    >
      {{ title }}
      <span class="blade-subtitle">{{ subtitle }}</span>
    </h1>
  </div>
</template>
<script>
import { VcIcon } from '../../../atoms'
export default {
  name: 'VcBladeHeader',
  components: { VcIcon },
  props: {
    icon: {
      type: String,
      default: 'ban',
    },
    title: {
      type: String,
      default: '',
      required: false,
    },
    subtitle: {
      type: String,
      default: '',
      required: false,
    },
  },
  computed: {},
}
</script>
<style lang="scss"></style>
