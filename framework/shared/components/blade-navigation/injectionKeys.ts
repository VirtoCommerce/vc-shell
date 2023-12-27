import { InjectionKey } from "vue";
import { BladeVNode } from "./types";

export const navigationViewLocation = Symbol("blade navigation view location") as InjectionKey<BladeVNode>;
