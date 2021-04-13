<template>
  <VcBlade
    v-bind="$props"
    icon="fa-folder"
    title="Catalog details"
    subtitle="The list of catalog items"
    class="w-50"
    v-on="$listeners"
  >
    <template #toolbar>
      <VcBladeToolbar>
        <VcMenuItem icon="fa-sync-alt" title="Refresh" />
        <VcMenuItem icon="fa-download" title="Export" />
      </VcBladeToolbar>
    </template>
    <div>
      <b-table
        sticky-header="700px"
        bordered
        hover
        :items="items"
        :fields="fields"
        :busy="isBusy"
      >
        <template #cell(checkbox)>
          <input
            id="checkboxNoLabel"
            class=""
            type="checkbox"
            value=""
            aria-label="..."
          />
        </template>
        <!-- A custom formatted header cell for field 'name' -->
        <template #head(checkbox)>
          <input
            id="checkboxNoLabel"
            class=""
            type="checkbox"
            value=""
            aria-label="..."
          />
        </template>
        <!-- A custom formatted column -->
        <template #cell(pic)="data">
          <img alt="product pic" :src="data.value" class="image" />
        </template>
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>
      </b-table>
    </div>
  </VcBlade>
</template>

<script lang="ts">
import { Ref, ref } from '@nuxtjs/composition-api'
import { VcBlade } from '~/components/organisms'
import { VcMenuItem } from '~/components/molecules'
export default {
  name: 'VcCatalogDetailBlade',
  components: {
    VcBlade,
    VcMenuItem,
  },
  extends: VcBlade,
  inheritAttrs: false,
  setup() {
    const fields = [
      {
        key: 'checkbox',
        sortable: false,
        class: 'checkbox_field',
      },
      {
        key: 'pic',
        label: 'Pic',
        sortable: false,
      },
      {
        key: 'name',
        label: 'Name',
        sortable: true,
      },
      {
        key: 'sku',
        label: 'Sku',
        sortable: true,
      },
    ]
    const items = [...Array(10).keys()].map(() => {
      const obj = {
        pic:
          'https://admin-demo.virtocommerce.com/cms-content/assets/catalog/ASZF216GBSL/1431971520000_1134360_64x64.jpg',
        name: 'DJI Phantom 3 Professional Quadcopter',
        sku: '188904989',
      }
      return obj
    })

    const isBusy: Ref<Boolean> = ref(true)
    setTimeout(() => {
      isBusy.value = false
    }, 2000)

    return {
      fields,
      items,
      isBusy,
    }
  },
}
</script>
<style>
.checkbox_field {
  max-width: 30px;
}
</style>
