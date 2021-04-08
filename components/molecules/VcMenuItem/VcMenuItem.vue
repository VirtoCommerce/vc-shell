<template>
  <li class="menu-item">
    <button class="menu-btn">
      <VcIcon :icon="icon" size="lg"></VcIcon>
      <span class="menu-btn__text">{{ title }}</span>
    </button>
  </li>
</template>
<script>
import { VcIcon } from '~/components/atoms'
export default {
  name: 'VcMenuItem',
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
