import { signal as preactSignal, computed as preactComputed, effect as preactEffect } from "@preact/signals-core";

export type Signal<T> = ReturnType<typeof signal<T>>;
export type Computed<T> = ReturnType<typeof preactComputed<T>>;

export const signal = preactSignal;
export const computed = preactComputed;
export const effect = preactEffect;