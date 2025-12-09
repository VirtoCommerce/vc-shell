import type { App, Ref } from "vue";

/**
 * Service lifecycle interface for managing service creation and cleanup
 */
export interface ServiceLifecycle<T> {
  /**
   * Creates a new instance of the service
   */
  create(): T;

  /**
   * Provides the service to the Vue application
   */
  provide(app: App): void;

  /**
   * Cleanup function called when the service is no longer needed
   */
  cleanup(): void;
}

/**
 * Interface for services that support pre-registration of items
 * before the service is fully initialized
 */
export interface PreregistrationQueue<T> {
  /**
   * Items waiting to be registered
   */
  readonly items: readonly T[];

  /**
   * Register an item to be processed when the service initializes
   */
  register(item: T): void;

  /**
   * Flush all pending items and return them for processing
   */
  flush(): T[];

  /**
   * Clear the queue without processing
   */
  clear(): void;
}

/**
 * Base interface for registry-type services
 */
export interface RegistryService<TKey, TItem> {
  /**
   * Register a new item in the registry
   */
  register(key: TKey, item: TItem): void;

  /**
   * Unregister an item from the registry
   */
  unregister(key: TKey): boolean;

  /**
   * Get an item by its key
   */
  get(key: TKey): TItem | undefined;

  /**
   * Check if an item exists in the registry
   */
  has(key: TKey): boolean;

  /**
   * Get all registered items
   */
  getAll(): Map<TKey, TItem>;

  /**
   * Clear all items from the registry
   */
  clear(): void;
}

/**
 * Interface for services that provide reactive lists
 */
export interface ListService<T> {
  /**
   * Reactive reference to the list items
   */
  items: Ref<T[]>;

  /**
   * Add an item to the list
   */
  add(item: T): void;

  /**
   * Remove an item from the list
   */
  remove(item: T): boolean;

  /**
   * Find an item in the list
   */
  find(predicate: (item: T) => boolean): T | undefined;

  /**
   * Filter items in the list
   */
  filter(predicate: (item: T) => boolean): T[];
}

/**
 * Interface for services with ordered items
 */
export interface OrderedListService<T> extends ListService<T> {
  /**
   * Reorder an item to a new position
   */
  reorder(fromIndex: number, toIndex: number): void;

  /**
   * Get items sorted by priority
   */
  getSorted(): T[];
}

/**
 * Result type for async service operations
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Interface for services that support subscription to changes
 */
export interface ObservableService<T> {
  /**
   * Subscribe to changes
   */
  subscribe(callback: (value: T) => void): () => void;

  /**
   * Get the current value
   */
  getValue(): T;
}

/**
 * Type for widget registration
 */
export interface WidgetRegistration<TProps = Record<string, unknown>> {
  id: string;
  component: unknown;
  props?: TProps;
  order?: number;
  isVisible?: boolean | (() => boolean);
}

/**
 * Type for menu item registration
 */
export interface MenuItemRegistration {
  id: string;
  title: string;
  icon?: string;
  priority?: number;
  permissions?: string | string[];
  routeId?: string;
  url?: string;
  group?: string;
  children?: MenuItemRegistration[];
}

/**
 * Type for toolbar item registration
 */
export interface ToolbarItemRegistration {
  id: string;
  title: string;
  icon?: string;
  order?: number;
  disabled?: boolean;
  clickHandler?: () => void;
  permissions?: string | string[];
}
