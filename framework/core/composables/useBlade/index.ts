import { inject } from "vue";
import { BladeInstance } from "../../../injection-keys";

/**
 * Composable for accessing the current blade instance
 * @returns The current blade instance
 */
export function useBlade() {
    const blade = inject(BladeInstance);

    if (!blade) {
        throw new Error("Blade instance not found in the current context");
    }
    return blade;
}
