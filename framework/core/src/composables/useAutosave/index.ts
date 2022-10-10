import { computed, isRef, Ref, ref, unref, watch } from "vue";

interface IUseAutosave {
  savedValue: Ref<any>;
  loadAutosaved: () => void;
  resetAutosaved: () => void;
}

export default (data, modified, defaultName: string): IUseAutosave => {
  const rawValue = computed(() => (isRef(data) ? unref(data) : data));
  const isModified = computed(() =>
    isRef(modified) ? unref(modified) : modified
  );
  const savedValue = ref();

  const isSaving = ref(false);

  watch(isModified, () => {
    if (isModified.value) {
      isSaving.value = true;
    } else {
      isSaving.value = false;
      resetAutosaved();
    }
  });

  watch(
    [rawValue, isSaving],
    () => {
      if (isSaving.value) {
        saveToStorage();
      }
    },
    { deep: true }
  );

  function saveToStorage() {
    localStorage.setItem(defaultName, JSON.stringify(rawValue.value));
  }

  function loadAutosaved() {
    const savedData = JSON.parse(localStorage.getItem(defaultName));
    if (savedData) {
      savedValue.value = savedData;
    }
  }

  function resetAutosaved() {
    localStorage.removeItem(defaultName);
  }

  return {
    savedValue: computed(() => savedValue.value),
    loadAutosaved,
    resetAutosaved,
  };
};
