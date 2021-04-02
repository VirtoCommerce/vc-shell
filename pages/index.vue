<template>
  <div class="container-fluid px-0">
    <div class="row no-gutters align-items-stretch h-100">
      <div v-for="blade in blades" :key="blade.id">
        <VcBlade :blade="blade" @click:close="closeBlade(blade)">
          <div class="bg-light h-100 d-flex align-items-center">
            <button
              type="button"
              class="btn btn-primary mx-auto"
              @click="createAndOpenNewBlade"
            >
              Click me
            </button>
          </div>
        </VcBlade>
      </div>
      <div class="col"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { VcBlade } from '../components/organisms'
import { useNavigation } from '../libs/navigation'
export default {
  components: {
    VcBlade,
  },
  setup() {
    const { blades, openNewBlade, closeBlade } = useNavigation()
    const createAndOpenNewBlade = () => {
      const newId = blades.value.length + 1
      openNewBlade({ ...blades.value[0], id: newId, title: `blade #${newId}` })
    }

    return {
      blades,
      createAndOpenNewBlade,
      closeBlade,
    }
  },
}
</script>
