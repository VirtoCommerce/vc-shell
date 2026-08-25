import {
  useCellRegistry,
  type BuiltinCellType,
  type CellRegistration,
  type CellType,
} from "@ui/components/organisms/vc-data-table/composables/useCellRegistry";

import CellDefault from "@ui/components/organisms/vc-data-table/components/cells/CellDefault.vue";
import CellMoney from "@ui/components/organisms/vc-data-table/components/cells/CellMoney.vue";
import CellNumber from "@ui/components/organisms/vc-data-table/components/cells/CellNumber.vue";
import CellDate from "@ui/components/organisms/vc-data-table/components/cells/CellDate.vue";
import CellDateAgo from "@ui/components/organisms/vc-data-table/components/cells/CellDateAgo.vue";
import CellImage from "@ui/components/organisms/vc-data-table/components/cells/CellImage.vue";
import CellStatus from "@ui/components/organisms/vc-data-table/components/cells/CellStatus.vue";
import CellStatusIcon from "@ui/components/organisms/vc-data-table/components/cells/CellStatusIcon.vue";
import CellLink from "@ui/components/organisms/vc-data-table/components/cells/CellLink.vue";
import CellHtml from "@ui/components/organisms/vc-data-table/components/cells/CellHtml.vue";

/**
 * The cell types VcDataTable ships with. Any of them can be replaced by
 * registering the same `type` through {@link useCellRegistry} — see the
 * "Custom Cell Types" section of `vc-data-table.docs.md`.
 */
const BUILTIN_CELLS: readonly (CellRegistration & { type: BuiltinCellType })[] = [
  { type: "text", component: CellDefault, config: { editable: true } },
  { type: "number", component: CellNumber, config: { editable: true } },
  { type: "money", component: CellMoney, config: { editable: true } },
  { type: "date", component: CellDate, config: { editable: false } },
  { type: "time", component: CellDate, config: { editable: false } },
  { type: "datetime", component: CellDate, config: { editable: false } },
  { type: "date-ago", component: CellDateAgo, config: { editable: false } },
  { type: "image", component: CellImage, config: { editable: false } },
  { type: "status", component: CellStatus, config: { editable: false } },
  { type: "status-icon", component: CellStatusIcon, config: { editable: false } },
  { type: "link", component: CellLink, config: { editable: false } },
  { type: "html", component: CellHtml, config: { editable: false } },
];

/** Names of the built-in cell types, in registration order. */
export const BUILTIN_CELL_TYPES: readonly CellType[] = Object.freeze(BUILTIN_CELLS.map((cell) => cell.type));

/**
 * Register the built-in cell components in the shared cell registry.
 *
 * Idempotent and non-destructive: a type that is already registered — by an
 * earlier call or by application code — is left alone, so custom cells always
 * win over the built-ins regardless of import order.
 */
export function registerBuiltinCells(): void {
  const { register, has } = useCellRegistry();

  for (const cell of BUILTIN_CELLS) {
    if (!has(cell.type)) {
      register(cell);
    }
  }
}
