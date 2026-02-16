import { computed } from "vue";

export type MultivalueType = "text" | "number" | "integer" | "color";

interface UseMultivalueModeOptions {
  multivalue: () => boolean | undefined;
  type: () => MultivalueType;
}

/**
 * Determines the operating mode of vc-multivalue:
 * - dictionary mode (multivalue=true): select from dropdown options
 * - input mode (multivalue=false): type values manually
 *
 * Also resolves the HTML input type from the logical type.
 */
export function useMultivalueMode(options: UseMultivalueModeOptions) {
  const isDictionaryMode = computed(() => options.multivalue() === true);

  /** Maps logical type → HTML input type */
  const htmlInputType = computed(() => {
    const t = options.type();
    if (t === "integer") return "number";
    if (t === "color") return "text";
    return t;
  });

  return {
    isDictionaryMode,
    htmlInputType,
  };
}
