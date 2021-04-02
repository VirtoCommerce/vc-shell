import { computed, Ref, ref } from '@vue/composition-api'
import { BladeInfo } from '../types'

const blades: Ref<BladeInfo[]> = ref([
  {
    id: 0,
    title: 'blade #0',
    subtitle: 'my cool subtitle',
    menuItems: [
      { icon: 'check', title: 'add new blade' },
      { icon: 'cog', title: 'do some usefull' },
    ],
  },
])

export default () => {
  function openNewBlade(blade: BladeInfo) {
    blades.value.push(blade)
  }
  function closeBlade(blade: BladeInfo) {
    blades.value = blades.value.filter((el) => el.id !== blade.id)
  }
  return {
    openNewBlade,
    closeBlade,
    blades: computed(() => blades.value),
  }
}
