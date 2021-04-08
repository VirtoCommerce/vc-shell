<template>
  <li>
    <a
      href="#"
      :class="{ 'vc-nav-link-toggler': toggler, 'vc-nav-link': !toggler }"
    >
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
    toggler: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  computed: {},
}
</script>
<style lang="scss"></style>
