<template>
  <div>
    <VcHeader
      version="3.0.0"
      :logo="require('~/assets/img/logo.svg')"
    ></VcHeader>

    <div class="container-fluid">
      <div class="row">
        <VcMainMenu>
          <VcMainMenuItem
            v-for="item in mainMenuItems"
            :key="item.id"
            :icon="item.icon"
            :title="item.title"
            @click="item.onClick"
          />
        </VcMainMenu>
        <Nuxt />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { VcHeader, VcMainMenu } from '~/components/organisms'
import { useNavigation } from '~/libs/navigation'

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
