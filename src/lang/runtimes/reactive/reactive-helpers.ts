import { run } from "./run";

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

// Get the current value, whether it's a signal or not
function getValue<T>(value: T | { get: () => T }): T {
    return isSignal(value) ? value.get() : value;
}

// Handle reactive values in the interpreter
// export function handleReactiveValues<T>(
//     values: any[],
//     compute: (...args: any[]) => T,
// ): T | { get: () => T } {
//     // If there are no signals involved, just return the direct computation
//     if (!values.some(isSignal)) {
//         return compute(...values);
//     }

//     // Otherwise, return a function that computes the result on demand
//     return {
//         get: () => compute(...values.map(getValue)),
//     };
// }

// Helper to determine if a value is a signal or contains signals
function hasSignalDependency(value: any): boolean {
    // Direct signal
    if (isSignal(value)) return true;

    // Check if it's an object with a hidden dependency
    if (typeof value === "object" && value !== null) {
        // If it has a _dependencies property listing signals
        if (Array.isArray(value._dependencies)) {
            return value._dependencies.some(hasSignalDependency);
        }

        // Check all properties recursively
        return Object.values(value).some(hasSignalDependency);
    }

    return false;
}

// For operations like Add that may depend on signals
export function handleReactiveValues<T>(
    values: any[],
    compute: (...args: any[]) => T,
) {
    console.log("Values,", values);
    if (values[1] && values[1].get) {
        console.log("Special case values[1]", values[0], values[1].get());
    }
    // Check if either value depends on a signal (directly or indirectly)
    if (values.some(hasSignalDependency)) {
        console.log("Values have dependencies");
        const resolved = values.map((v: any) => (isSignal(v) ? v.get() : v));

        console.log("Initially resolved values,", resolved);

        // Create a result with dependencies tracked
        const result = {
            get: () => compute(...resolved),
            _dependencies: values, // Track dependencies for future operations
        };

        // Register with all source signals in the dependency chain
        const registerWithSignals = (value: any, dep, index) => {
            console.log("Register with signal");
            if (
                isSignal(dep) &&
                dep._dependencies &&
                dep._dependencies.length === 0
            ) {
                console.log("Value is signal");
                if (!signalStore.has(dep)) signalStore.set(dep, new Set());
                const update = () => {
                    resolved[index] = value.get();
                    compute(...resolved);
                };
                signalStore.get(dep)!.add(update);
                update();
            } else if (typeof dep === "object" && dep !== null) {
                console.log(
                    "Not a signal, but trying to register callback for signal higher up.",
                    dep,
                );
                if (Array.isArray(dep._dependencies)) {
                    dep._dependencies.forEach((dep) =>
                        registerWithSignals(value, dep, index),
                    );
                }
            }
        };

        // Register with all signals in the dependency tree
        values.forEach((value, index) =>
            registerWithSignals(value, value, index),
        );

        return result;
    }

    // For values with no signal dependencies, just compute directly
    return compute(...values);
}

export type ReactiveResult<X> =
    | X
    | { get: (...args: any[]) => X; _dependencies: any[] };

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
                effect(...resolved);
            };
            signalStore.get(val)!.add(update);
            update();
        }
    });
}
