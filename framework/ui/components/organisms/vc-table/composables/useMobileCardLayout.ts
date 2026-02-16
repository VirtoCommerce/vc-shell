import { computed, type Ref } from "vue";
import type { ColumnInstance } from "../utils/ColumnCollector";
import type {
  MobileCardLayout,
  MobileColumnConfig,
  MobileCardPosition,
  MobileCardRole,
  MobileFieldPosition,
} from "../types";

/** Field positions in order for auto-placement */
const FIELD_POSITIONS: MobileFieldPosition[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

/** Maximum number of fields in 2x2 grid */
const MAX_FIELDS = 4;

/** Types treated as statuses in default mobile layout */
const STATUS_TYPES = new Set(["status", "status-icon"]);

/** Types preferred as title in default mobile layout */
const TITLE_PRIORITY_TYPES = new Set(["text", "link", "html"]);

export interface UseMobileCardLayoutOptions {
  /** Column instances from VcColumn */
  columns: Ref<ColumnInstance[]>;
}

export interface UseMobileCardLayoutReturn {
  /** Computed mobile card layout */
  mobileLayout: Ref<MobileCardLayout>;
  /** Whether any columns are configured for mobile */
  hasMobileColumns: Ref<boolean>;
  /** Columns that are visible on mobile */
  mobileVisibleColumns: Ref<MobileColumnConfig[]>;
}

/**
 * Map legacy mobilePosition to mobileRole.
 * Used for backward compatibility when only mobilePosition is specified.
 */
function mapPositionToRole(position: MobileCardPosition, isFirstTopLeft: boolean): MobileCardRole {
  switch (position) {
    case "image":
      return "image";
    case "status":
      return "status";
    case "top-left":
      // First top-left becomes title in legacy mode
      return isFirstTopLeft ? "title" : "field";
    case "top-right":
    case "bottom-left":
    case "bottom-right":
      return "field";
    default:
      return "field";
  }
}

/**
 * Create MobileColumnConfig from column instance.
 */
function createColumnConfig(
  col: ColumnInstance,
  position: MobileCardPosition,
  isTitle: boolean = false
): MobileColumnConfig {
  return {
    id: col.props.id,
    field: col.props.field,
    type: col.props.type,
    position,
    label: col.props.title,
    isTitle,
    column: col,
  };
}

/**
 * Returns true for service-only columns that should not appear in fallback mobile cards.
 */
function isServiceColumn(col: ColumnInstance): boolean {
  const { selectionMode, rowEditor, rowReorder, expander } = col.props;
  return Boolean(selectionMode || rowEditor || rowReorder || expander);
}

/**
 * Build a default mobile layout when no explicit mobile configuration is provided.
 * Strategy (legacy-friendly):
 * - First text-like column => title
 * - First image column => image block
 * - All status/status-icon columns => statuses row
 * - Next regular columns (up to 4) => fields grid
 */
function createDefaultMobileConfigs(columns: ColumnInstance[]): MobileColumnConfig[] {
  const configs: MobileColumnConfig[] = [];
  const eligibleColumns = columns.filter(
    (col) => col.props.visible !== false && col.props.mobileVisible !== false && !isServiceColumn(col),
  );

  if (eligibleColumns.length === 0) {
    return configs;
  }

  const imageColumn = eligibleColumns.find((col) => col.props.type === "image");
  const statusColumns = eligibleColumns.filter((col) => STATUS_TYPES.has(col.props.type ?? ""));

  const regularColumns = eligibleColumns.filter((col) => col !== imageColumn && !statusColumns.includes(col));
  const titleColumn = regularColumns.find((col) => TITLE_PRIORITY_TYPES.has(col.props.type ?? "")) ?? regularColumns[0];

  if (titleColumn) {
    configs.push(createColumnConfig(titleColumn, "top-left", true));
  }

  if (imageColumn) {
    configs.push(createColumnConfig(imageColumn, "image"));
  }

  for (const statusColumn of statusColumns) {
    configs.push(createColumnConfig(statusColumn, "status"));
  }

  const fieldColumns = regularColumns.filter((col) => col !== titleColumn).slice(0, MAX_FIELDS);
  for (let i = 0; i < fieldColumns.length; i++) {
    configs.push(createColumnConfig(fieldColumns[i], FIELD_POSITIONS[i]));
  }

  return configs;
}

/**
 * Composable for computing mobile card layout from VcColumn definitions.
 *
 * Supports two APIs:
 * 1. **New API (recommended)**: Use `mobileRole` for semantic roles
 *    - `title`: Primary identifier (full width, bold)
 *    - `image`: Visual element (left side)
 *    - `field`: Data with label (auto-distributed in 2x2 grid, max 4)
 *    - `status`: Status badge (multiple allowed, bottom row)
 *
 * 2. **Legacy API**: Use `mobilePosition` (backward compatible)
 *    - Automatically maps to roles: image→image, status→status,
 *      first top-left→title, others→field
 *
 * Auto-placement for fields:
 * - Fields with explicit `mobilePosition` are placed there
 * - Fields without `mobilePosition` fill remaining grid positions in order
 * - Maximum 4 fields (2x2 grid), excess fields are hidden
 *
 * @example
 * ```vue
 * <!-- New API with mobileRole -->
 * <VcColumn id="name" title="Name" mobile-role="title" />
 * <VcColumn id="price" title="Price" type="money" mobile-role="field" />
 * <VcColumn id="status" type="status" mobile-role="status" />
 *
 * <!-- Legacy API with mobilePosition (still works) -->
 * <VcColumn id="name" title="Name" mobile-position="top-left" />
 * ```
 */
export function useMobileCardLayout(options: UseMobileCardLayoutOptions): UseMobileCardLayoutReturn {
  const { columns } = options;

  /**
   * Process columns and determine their mobile configuration.
   * Priority: explicit mobileRole/mobilePosition > type-based fallback
   */
  const mobileVisibleColumns = computed<MobileColumnConfig[]>(() => {
    const configs: MobileColumnConfig[] = [];
    const fallbackColumns: ColumnInstance[] = [];
    let hasExplicitMobileConfig = false;

    // Track if we've seen first top-left for legacy mapping
    let firstTopLeftSeen = false;

    for (const col of columns.value) {
      const { mobileRole, mobilePosition } = col.props;
      const hasExplicitConfig = Boolean(mobileRole || mobilePosition);

      // Respect desktop/mobile visibility flags
      if (col.props.visible === false || col.props.mobileVisible === false) continue;

      // Only visible columns should switch layout to explicit mode.
      // Hidden explicit columns must not suppress fallback layout for visible data columns.
      if (hasExplicitConfig) {
        hasExplicitMobileConfig = true;
      }

      // Fallback candidates: columns without explicit mobile config
      if (!hasExplicitConfig) {
        fallbackColumns.push(col);
        continue;
      }

      // Determine the effective role
      let role: MobileCardRole;
      let position: MobileCardPosition;

      if (mobileRole) {
        // New API: mobileRole is specified
        role = mobileRole;
        // For fields, mobilePosition can override auto-placement
        position =
          mobileRole === "field" && mobilePosition
            ? mobilePosition
            : mobileRole === "image"
              ? "image"
              : mobileRole === "status"
                ? "status"
                : mobileRole === "title"
                  ? "top-left" // Title uses top-left position internally
                  : "bottom-left"; // Default for visible-only columns
      } else if (mobilePosition) {
        // Legacy API: only mobilePosition is specified
        const isFirstTopLeft = mobilePosition === "top-left" && !firstTopLeftSeen;
        if (isFirstTopLeft) firstTopLeftSeen = true;

        role = mapPositionToRole(mobilePosition, isFirstTopLeft);
        position = mobilePosition;
      } else {
        // mobileVisible: true without role/position - treat as hidden field
        continue;
      }

      configs.push({
        id: col.props.id,
        field: col.props.field,
        type: col.props.type,
        position,
        label: col.props.title,
        isTitle: role === "title",
        column: col,
      });
    }

    // Explicit config always wins (including intentional empty layout)
    if (hasExplicitMobileConfig) {
      return configs;
    }

    // No explicit mobile config -> build base layout from column types
    return createDefaultMobileConfigs(fallbackColumns);
  });

  /**
   * Whether any columns are configured for mobile display
   */
  const hasMobileColumns = computed(() => mobileVisibleColumns.value.length > 0);

  /**
   * Computed mobile card layout with columns distributed to positions.
   * Uses new universal layout structure (title, image, fields[], statuses[]).
   */
  const mobileLayout = computed<MobileCardLayout>(() => {
    const layout: MobileCardLayout = {
      title: undefined,
      image: undefined,
      fields: [],
      statuses: [],
    };

    // Separate columns by role
    const titleCols: MobileColumnConfig[] = [];
    const imageCols: MobileColumnConfig[] = [];
    const fieldCols: MobileColumnConfig[] = [];
    const statusCols: MobileColumnConfig[] = [];

    for (const col of mobileVisibleColumns.value) {
      if (col.isTitle) {
        titleCols.push(col);
      } else if (col.position === "image") {
        imageCols.push(col);
      } else if (col.position === "status") {
        statusCols.push(col);
      } else {
        // All position-based columns (top-left, top-right, bottom-left, bottom-right)
        fieldCols.push(col);
      }
    }

    // Assign single title (first one wins)
    if (titleCols.length > 0) {
      layout.title = titleCols[0];
    }

    // Assign single image (first one wins)
    if (imageCols.length > 0) {
      layout.image = imageCols[0];
    }

    // Assign multiple statuses (all allowed)
    layout.statuses = statusCols;

    // Auto-placement algorithm for fields
    // 1. Track which positions are explicitly occupied
    const occupiedPositions = new Set<MobileFieldPosition>();
    const explicitlyPlacedFields: MobileColumnConfig[] = [];
    const autoPlaceFields: MobileColumnConfig[] = [];

    for (const field of fieldCols) {
      const pos = field.position as MobileFieldPosition;
      if (FIELD_POSITIONS.includes(pos)) {
        // Field has explicit position
        occupiedPositions.add(pos);
        explicitlyPlacedFields.push(field);
      } else {
        // Field needs auto-placement
        autoPlaceFields.push(field);
      }
    }

    // 2. Add explicitly placed fields
    const allFields = [...explicitlyPlacedFields];

    // 3. Auto-place remaining fields in free positions
    const freePositions = FIELD_POSITIONS.filter((pos) => !occupiedPositions.has(pos));
    for (let i = 0; i < autoPlaceFields.length && i < freePositions.length; i++) {
      const field = autoPlaceFields[i];
      // Update position to the auto-assigned one
      allFields.push({
        ...field,
        position: freePositions[i],
      });
    }

    // 4. Limit to MAX_FIELDS (2x2 grid)
    layout.fields = allFields.slice(0, MAX_FIELDS);

    // Sort fields by position order for consistent rendering
    layout.fields.sort((a, b) => {
      const posA = FIELD_POSITIONS.indexOf(a.position as MobileFieldPosition);
      const posB = FIELD_POSITIONS.indexOf(b.position as MobileFieldPosition);
      return posA - posB;
    });

    return layout;
  });

  return {
    mobileLayout,
    hasMobileColumns,
    mobileVisibleColumns,
  };
}

export default useMobileCardLayout;
