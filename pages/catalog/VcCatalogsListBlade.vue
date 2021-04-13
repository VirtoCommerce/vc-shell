<template>
  <VcBlade v-bind="$props" v-on="$listeners">
    <template #toolbar>
      <VcBladeToolbar>
        <VcMenuItem icon="fa-sync-alt" title="Refresh" />
        <VcMenuItem icon="fa-plus" title="Add" />
      </VcBladeToolbar>
    </template>
    <VcList>
      <VcListItem
        v-for="catalog in catalogs"
        :key="catalog"
        icon="fa-folder"
        @click="openCatalogDetails"
      >
        {{ catalog }}
      </VcListItem>
    </VcList>
  </VcBlade>
</template>

<script lang="ts">
import { VcMenuItem } from '~/components/molecules'
import { VcBlade, VcList } from '~/components/organisms'
import { useNavigation } from '~/libs/navigation'
export default {
  name: 'VcCatalogsListBlade',
  components: {
    VcBlade,
    VcList,
    VcMenuItem,
  },
  extends: VcBlade,
  inheritAttrs: false,
  setup() {
    const { openNewBlade } = useNavigation()
    const catalogs = ['B2B mixed', 'Clothing', 'Electronics']
    const openCatalogDetails = () => {
      openNewBlade({ component: 'VcCatalogDetailBlade' })
    }
    return {
      openCatalogDetails,
      catalogs,
    }
  },
}
</script>
