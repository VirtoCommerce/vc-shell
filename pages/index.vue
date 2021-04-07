<template>
  <div class="container-fluid px-0">
    <div class="row no-gutters align-items-stretch h-100">
      <div v-for="blade in blades" :key="blade.id">
        <component
          :is="blade.component"
          :blade="blade"
          @click:close="closeBlade(blade)"
        >
          <div class="bg-light h-100 d-flex align-items-center">
            <button
              type="button"
              class="btn btn-primary mx-auto"
              @click="createAndOpenNewBlade"
            >
              Click me
            </button>
          </div>
        </component>
      </div>
      <div class="col"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VcItemBlade from './catalog/VcItemBlade.vue'
import { VcBlade } from '~/components/organisms'
import { useNavigation } from '~/libs/navigation'
// TODO: find solution hot to register all blades components automaticaly
Vue.component('VcItemBlade', VcItemBlade)

export default {
  components: {
    VcBlade,
  },
  setup() {
    const { blades, openNewBlade, closeBlade } = useNavigation()
    const createAndOpenNewBlade = () => {
      const newId = blades.value.length + 1
      openNewBlade({
        ...blades.value[0],
        id: newId,
        title: `blade #${newId}`,
        component: 'VcItemBlade',
      })
    }

    return {
      blades,
      createAndOpenNewBlade,
      closeBlade,
    }
  },
}
</script>
