<template>
  <main role="main" class="vc-content flex-md-equal">
    <component
      :is="blade.component"
      v-for="blade in blades"
      :key="blade.id"
      :blade="blade"
      @click:close="closeBlade(blade)"
    >
      <div class="h-100 d-flex align-items-center">
        <button
          type="button"
          class="btn btn-primary mx-auto"
          @click="createAndOpenNewBlade"
        >
          Click me
        </button>
      </div>
    </component>
  </main>
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
