<template>
  <li>
    <a href="#" class="vc-nav-link">
      <VcIcon :icon="icon" class="vc-nav-link__icon" />{{ title }}
    </a>
  </li>
</template>
<script>
import { VcIcon } from '~/components/atoms'
export default {
  name: 'VcMainMenuItem',
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
  },
  computed: {},
}
</script>
<style lang="scss"></style>
