<template>
  <a class="list-group-item list-group-item-action font-weight-bold p-0">
    <VcLink :icon="icon" size="lg">
      <span class="ml-2">{{ title }}</span>
    </VcLink>
  </a>
</template>
<script>
import { VcLink } from '~/components/atoms'
export default {
  name: 'VcMenuItem',
  components: { VcLink },
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
