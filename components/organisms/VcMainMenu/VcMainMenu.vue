<template>
  <div class="main-menu d-flex align-items-center">
    <aside class="main-menu list-group bg-light border-right flex-fill">
      <button
        class="list-group-item list-group-item-action font-weight-bold"
        ng-click=""
      >
        <VcIcon icon="bars" size="lg" />
      </button>
      <VcMenuItem icon="home" title="Home" />
    </aside>
  </div>
</template>
<script>
import { VcIcon } from '../../atoms'
import { VcMenuItem } from '../../molecules'
export default {
  name: 'VcMainMenu',
  components: {
    VcIcon,
    VcMenuItem,
  },
  props: {},
  computed: {},
}
</script>
<style lang="scss"></style>
