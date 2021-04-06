<template>
  <div class="container-fluid d-flex flex-column flex-fill px-0">
    <div class="row no-gutters">
      <div class="col">
        <VcHeader></VcHeader>
      </div>
    </div>
    <div class="row no-gutters align-items-stretch h-100">
      <div class="col-auto">
        <VcMainMenu :items="mainMenuItems"></VcMainMenu>
      </div>
      <div class="col">
        <Nuxt />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { VcHeader, VcMainMenu } from '../components/organisms'
import { useNavigation } from '../libs/navigation'

export default {
  components: {
    VcHeader,
    VcMainMenu,
  },
  setup() {
    const { mainMenuItems } = useNavigation()

    return {
      mainMenuItems,
    }
  },
}
</script>
