<template>
  <div class="vc-list-row" v-on="$listeners">
    <div class="vc-list-row__menu"><VcIcon icon="fa-ellipsis-v" /></div>
    <div class="vc-list-row__row-icon"><VcIcon :icon="icon" /></div>
    <div class="vc-list-row__text-container">
      <div class="row-title"><slot /></div>
    </div>
    <div class="vc-list-row__end-row"><VcIcon icon="fa-chevron-right" /></div>
  </div>
</template>
<script>
import { VcIcon } from '~/components/atoms'
export default {
  name: 'VcListItem',
  components: { VcIcon },
  props: {
    icon: {
      type: String,
      default: '',
      require: false,
    },
  },
  computed: {},
}
</script>
