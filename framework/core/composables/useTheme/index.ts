import { useColorMode, useCycleList } from "@vueuse/core";
import { computed, watchEffect, ref, type Ref } from "vue";

export interface IUseTheme {
  themes: Ref<string[]>;
  current: Ref<string>;
  next: () => void;
  register: (customNames: string | string[]) => void;
  unregister: (customNames: string | string[]) => void;
  setTheme: (theme: string) => void;
}

const registeredThemes: Ref<string[]> = ref(["auto"]);
export const useTheme = (): IUseTheme => {
  function register(customNames: string | string[]) {
    (typeof customNames === "string" ? [customNames] : customNames).forEach((name) => {
      if (!registeredThemes.value.includes(name)) {
        registeredThemes.value.push(name);
      }
    });
  }

  function unregister(customNames: string | string[]) {
    (typeof customNames === "string" ? [customNames] : customNames).forEach((name) => {
      const index = registeredThemes.value.indexOf(name);
      if (index >= 0) {
        registeredThemes.value.splice(index, 1);
      }
    });
  }

  function setTheme(theme: string) {
    state.value = theme;
  }

  const mode = useColorMode({
    emitAuto: true,
    modes: {
      ...registeredThemes.value.reduce(
        (acc, name) => {
          acc[name] = name;
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
  });

  const { state, next } = useCycleList(registeredThemes.value, { initialValue: mode });

  watchEffect(() => (mode.value = state.value));

  return {
    themes: computed(() => registeredThemes.value),
    current: state,
    next,
    register,
    unregister,
    setTheme,
  };
};
