import { computed, Ref, ref } from '@nuxtjs/composition-api'
import { BladeInfo, MainMenuItem } from '../types'

const blades: Ref<BladeInfo[]> = ref([
  {
    id: 0,
    title: 'blade #0',
    subtitle: 'my cool subtitle',
    component: 'VcBlade',
    menuItems: [
      { id: 'addBlade', icon: 'fa-check', title: 'add new blade' },
      { id: 'doUsefull', icon: 'fa-cog', title: 'do some usefull' },
    ],
  },
])

const mainMenuItems: Ref<MainMenuItem[]> = ref([
  {
    id: 'home',
    title: 'Home',
    icon: 'fa-home',
  },
  {
    id: 'catalog',
    title: 'Digital catalog',
    icon: 'fa-cog',
  },
])
export default () => {
  function openNewBlade(blade: BladeInfo) {
    blades.value.push(blade)
  }
  function closeBlade(blade: BladeInfo) {
    blades.value = blades.value.filter((el) => el.id !== blade.id)
  }
  function addMainMenuItem(menuItem: MainMenuItem) {
    mainMenuItems.value.push(menuItem)
  }
  return {
    openNewBlade,
    closeBlade,
    addMainMenuItem,
    blades: computed(() => blades.value),
    mainMenuItems: computed(() => mainMenuItems.value),
  }
}
