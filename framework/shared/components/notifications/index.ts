// Transitional re-exports — consumers should migrate to @core/notifications or @shell/_internal/notifications
import "@shell/_internal/notifications/styles/index.scss";

export * from "@shell/_internal/notifications/components";
export * from "@shell/_internal/notifications/composables";
export * from "@core/notifications/toast-types";
export * from "@core/notifications/notification";
