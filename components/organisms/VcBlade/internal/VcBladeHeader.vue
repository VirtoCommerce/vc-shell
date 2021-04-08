<template>
  <div class="blade-t">
    <VcIcon :icon="icon" class="blade-t__ico"> </VcIcon>
    <span class="blade-t__h-text">
      <span class="blade-t__head"> {{ title }}</span>
      <span class="blade-t__subhead">{{ subtitle }}</span>
    </span>
  </div>
</template>
<script>
import { VcIcon } from '~/components/atoms'
export default {
  name: 'VcBladeHeader',
  components: { VcIcon },
  props: {
    icon: {
      type: String,
      default: 'fa-ban',
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
