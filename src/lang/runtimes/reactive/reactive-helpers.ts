import { Freer, pure } from "@/lang/extensions/freer";
import { run } from "./run";
import { flatMap } from "@/lang/extensions/helpers";

const signalStore = new WeakMap<any, Set<() => void>>();

export function trackDependency(signal: any, effect: () => void) {
  if (!signalStore.has(signal)) signalStore.set(signal, new Set());
  signalStore.get(signal)!.add(effect);
}

export function notify(signal: any) {
  const effects = signalStore.get(signal);
  if (effects) {
    effects.forEach((fn) => fn());
  }
}

export function isSignal(x: any): x is { get: () => any } {
  return typeof x === "object" && x !== null && typeof x.get === "function";
}

export function withReactive<T>(value: any, effect: (val: T) => void) {
    if (isSignal(value)) {
        if (!signalStore.has(value)) signalStore.set(value, new Set());
        const update = () => effect(value.get());
        signalStore.get(value)!.add(update);
        update();
    } else {
        effect(value);
    }
}

export function withReactiveValues(
    values: any[],
    effect: (...resolved: any[]) => void,
) {
    const resolved = values.map((v: any) => (isSignal(v) ? v.get() : v));

    if (!values.some(isSignal)) {
        return effect(...resolved);
    }

    values.forEach((val, index) => {
        if (isSignal(val)) {
            if (!signalStore.has(val)) signalStore.set(val, new Set());
            const update = () => {
                resolved[index] = val.get();
                console.log("resolved", resolved);
                effect(...resolved);
            };
            signalStore.get(val)!.add(update);
            update();
        }
    });
}

export function handleReactive<A>(
    inputs: Freer<any>[],
    continuation: (...resolved: any[]) => A,
): A {
    const recur = (index: number, acc: any[]): Freer<any> => {
        if (index >= inputs.length) {
            let result: A | undefined;
            withReactiveValues(acc, (...resolved) => {
                // Only capture the first result to return
                if (result === undefined) {
                    result = continuation(...resolved);
                } else {
                    continuation(...resolved); // Still run for side effects
                }
            });
            return pure(result!);
        }
        return flatMap(inputs[index], (val) => {
            console.log("recur", val);
            return recur(index + 1, [...acc, val]);
        });
    };
    return run(recur(0, []));
}
