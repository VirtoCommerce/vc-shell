import { ref, WatchStopHandle, watch, onMounted, onUnmounted, getCurrentInstance, Ref } from "vue";
import { ListBaseBladeScope, DetailsBaseBladeScope, DetailsBladeExposed, ListBladeExposed } from "../..";

export interface IUseDynamicViewsUtils {
  getBladeExposedData: <BladeScope extends ListBaseBladeScope | DetailsBaseBladeScope>(
    scope: BladeScope,
  ) => BladeScope extends ListBaseBladeScope ? Ref<ListBladeExposed<BladeScope>> : Ref<DetailsBladeExposed<BladeScope>>;
}

export default () => {
  const instance = getCurrentInstance();

  function getBladeExposedData<BladeScope extends ListBaseBladeScope | DetailsBaseBladeScope>() {
    const reactiveBlade = ref<BladeScope | null>(null);

    const blade = ref(instance?.vnode);

    let unwatch: WatchStopHandle | null = null;

    const updateReactiveBlade = () => {
      if (blade.value && blade.value.props?.navigation?.instance) {
        reactiveBlade.value = blade.value.props.navigation.instance;
      }
    };

    unwatch = watch(blade, updateReactiveBlade, { immediate: true, deep: true });

    onMounted(() => {
      updateReactiveBlade();
    });

    onUnmounted(() => {
      if (unwatch) {
        unwatch();
      }
    });

    return reactiveBlade as unknown as BladeScope extends ListBaseBladeScope
      ? Ref<ListBladeExposed<BladeScope>>
      : Ref<DetailsBladeExposed<BladeScope>>;
  }

  return {
    getBladeExposedData,
  };
};
