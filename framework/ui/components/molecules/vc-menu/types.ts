import type { Component } from "vue";

export interface VcMenuProps {
  expanded?: boolean;
  loading?: boolean;
}

export interface VcMenuItemBadge {
  content?: string | number;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "secondary";
  isDot?: boolean;
}

export interface VcMenuItemProps {
  icon?: string | Component;
  title?: string;
  active?: boolean;
  nested?: boolean;
  badge?: VcMenuItemBadge;
  expanded?: boolean | null;
}

export interface VcMenuGroupProps {
  groupId: string;
  icon?: string | Component;
  title?: string;
  badge?: VcMenuItemBadge;
  active?: boolean;
  open?: boolean;
  variant?: "default" | "section";
}
