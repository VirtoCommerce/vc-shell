import { computed, isRef, Ref, ref, unref, watch } from "vue";

interface IData {
  id?: string;
}

interface IUseAutosave {
  savedValue: Ref<IData>;
  loadAutosaved: () => void;
  resetAutosaved: () => void;
}

export default (data, modified): IUseAutosave => {
  const rawValue = computed(() => (isRef(data) ? unref(data) : data));
  const isModified = computed(() => unref(modified));
  const savedValue = ref<IData>();

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
    if (rawValue.value.id) {
      localStorage.setItem(
        rawValue.value.id,
        JSON.stringify(rawValue.value, (k, v) => {
          return v === undefined ? null : v;
        })
      );
    }
  }

  function loadAutosaved() {
    const savedData = JSON.parse(localStorage.getItem(rawValue.value.id));
    if (savedData) {
      savedValue.value = savedData;
    }
  }

  function resetAutosaved() {
    localStorage.removeItem(rawValue.value.id);
  }

  return {
    savedValue: computed(() => savedValue.value),
    loadAutosaved,
    resetAutosaved,
  };
};
