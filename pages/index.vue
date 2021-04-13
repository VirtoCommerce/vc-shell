<template>
  <main role="main" class="vc-content flex-md-equal">
    <component
      :is="blade.component"
      v-for="blade in blades"
      :key="blade.id"
      :icon="blade.icon"
      :title="blade.title"
      :subtitle="blade.subtitle"
      @click:close="closeBlade(blade)"
    >
    </component>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'
import VcCatalogsListBlade from './catalog/VcCatalogsListBlade.vue'
import VcCatalogDetailBlade from './catalog/VcCatalogDetailBlade.vue'
import { VcBlade } from '~/components/organisms'
import { useNavigation } from '~/libs/navigation'
// TODO: find solution hot to register all blades components automaticaly
Vue.component('VcCatalogsListBlade', VcCatalogsListBlade)
Vue.component('VcCatalogDetailBlade', VcCatalogDetailBlade)

export default {
  components: {
    VcBlade,
  },
  setup() {
    const { blades, closeBlade } = useNavigation()
    return {
      blades,
      closeBlade,
    }
  },
}
</script>
