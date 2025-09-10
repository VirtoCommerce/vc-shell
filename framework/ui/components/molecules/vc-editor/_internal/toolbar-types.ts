import type { Editor } from "@tiptap/vue-3";

export interface CustomToolbarButton {
  /** Unique identifier for the button */
  id: string;
  /** Button label or title */
  label: string;
  /** Icon name (lucide icon) */
  icon: string;
  /** Action to execute when button is clicked */
  action: (editor: Editor) => void;
  /** Check if button should be active */
  isActive?: (editor: Editor) => boolean;
  /** Check if button should be disabled */
  isDisabled?: (editor: Editor) => boolean;
  /** Custom component to render instead of default button */
  component?: any;
  /** Props to pass to custom component */
  componentProps?: Record<string, any>;
  /** Button group for organizing buttons */
  group?: string;
  /** Sort order within group */
  order?: number;
}

export interface CustomToolbarDropdown {
  /** Unique identifier for the dropdown */
  id: string;
  /** Dropdown label */
  label: string;
  /** Dropdown options */
  options: Array<{
    value: string;
    label: string;
    action: (editor: Editor, value: string) => void;
  }>;
  /** Get current value */
  getValue?: (editor: Editor) => string;
  /** Check if dropdown should be disabled */
  isDisabled?: (editor: Editor) => boolean;
  /** Custom styles for dropdown */
  style?: Record<string, any>;
  /** Button group for organizing dropdowns */
  group?: string;
  /** Sort order within group */
  order?: number;
}

export type CustomToolbarItem = CustomToolbarButton | CustomToolbarDropdown;

export function isDropdown(item: CustomToolbarItem): item is CustomToolbarDropdown {
  return 'options' in item;
}

export function isButton(item: CustomToolbarItem): item is CustomToolbarButton {
  return !('options' in item);
}