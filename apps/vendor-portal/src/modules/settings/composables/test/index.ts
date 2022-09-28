import { computed, isRef, Ref, ref, unref, watch } from "vue";

interface IData {
  id?: string;
}

type Data = object & IData;

interface IUseAutosave {
  savedValue: Ref<IData>;
  loadAutosaved: () => void;
  resetAutosaved: () => void;
}

export default (data, modified, defaultName?: string): IUseAutosave => {
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
      // console.log(rawValue.value)
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
    } else if (defaultName) {
      localStorage.setItem(
        defaultName,
        JSON.stringify(rawValue.value, (k, v) => {
          return v === undefined ? null : v;
        })
      );
    }
  }

  function loadAutosaved() {
    if (rawValue.value.id) {
      const savedData = JSON.parse(localStorage.getItem(rawValue.value.id));
      console.log(
        savedData.value,
        JSON.parse(localStorage.getItem(rawValue.value.id))
      );
      if (savedData) {
        savedValue.value = savedData;
      }
    } else if (defaultName) {
      const savedData = JSON.parse(localStorage.getItem(defaultName));
      if (savedData) {
        savedValue.value = savedData;
      }
    }
  }

  function parser(obj, reviver) {
    if (obj) {
      if (typeof reviver !== "function") {
        return JSON.parse(obj);
      }
      const undefs = [];
      const rev = (k, v) => {
        const val = reviver(k, v);
        if (typeof val === "undefined") {
          undefs.push(k);
        }
        return val;
      };
      const result = JSON.parse(obj, rev);
      if (undefs && undefs.length) {
        undefs?.forEach((k) => (result[k] = undefined));
      }

      return result;
    }
  }

  function resetAutosaved() {
    if (rawValue.value.id) {
      localStorage.removeItem(rawValue.value.id);
    } else if (defaultName) {
      localStorage.removeItem(defaultName);
    }
  }

  return {
    savedValue: computed(() => savedValue.value),
    loadAutosaved,
    resetAutosaved,
  };
};
