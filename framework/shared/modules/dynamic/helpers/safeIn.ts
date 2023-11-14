type AllKeys<T> = T extends unknown ? keyof T : never;
type FilterByKnownKey<T, K extends PropertyKey> = T extends unknown ? (K extends keyof T ? T : never) : never;

export function safeIn<K extends AllKeys<T>, T extends object>(key: K, obj: T): obj is FilterByKnownKey<T, K> {
  return key in obj ?? undefined;
}
