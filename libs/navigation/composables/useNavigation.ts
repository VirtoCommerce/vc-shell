import { computed, Ref, ref } from '@nuxtjs/composition-api'
import { BladeInfo, MainMenuItem } from '../types'

const blades: Ref<BladeInfo[]> = ref([])

const mainMenuItems: Ref<MainMenuItem[]> = ref([
  {
    id: 'home',
    title: 'Home',
    icon: 'fa-home',
    onClick: () => {},
  },
  {
    id: 'catalog',
    title: 'Digital catalog',
    icon: 'fa-cog',
    onClick: () => openNewBlade({ component: 'VcCatalogsListBlade' }),
  },
  {
    id: 'marketing',
    title: 'Marketing',
    icon: 'fa-flag',
    onClick: () => {},
  },
  {
    id: 'thumbnails',
    title: 'Thumbnails',
    icon: 'fa-image',
    onClick: () => {},
  },
  {
    id: 'stores',
    title: 'Stores',
    icon: 'fa-archive',
    onClick: () => {},
  },
])
function openNewBlade(blade: BladeInfo) {
  blade.id = blades.value.length
  blades.value.push(blade)
}
function closeBlade(blade: BladeInfo) {
  blades.value = blades.value.filter((el) => el.id !== blade.id)
}
function addMainMenuItem(menuItem: MainMenuItem) {
  mainMenuItems.value.push(menuItem)
}

export default () => {
  return {
    openNewBlade,
    closeBlade,
    addMainMenuItem,
    blades: computed(() => blades.value),
    mainMenuItems: computed(() => mainMenuItems.value),
  }
}
