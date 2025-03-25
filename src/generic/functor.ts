// Type guard: checks if a value has a .map method
export function isFunctor<A, B>(
    value: any,
): value is {
    map: (fn: (a: A) => B) => any;
} {
    return (
        value !== null &&
        typeof value === "object" &&
        typeof value.map === "function"
    );
}

// Assertion variant \u2013 throws if value is not a functor
export function assertFunctor<A, B>(
    value: any,
): asserts value is {
    map: (fn: (a: A) => B) => any;
} {
    if (!isFunctor(value)) {
        throw new Error("Expected a functor with a .map method");
    }
}

// Wrap a mapping function (like mapInstr) into a functor instance
export function wrapFunctor<F>(
    value: F,
    mapF: <A, B>(fa: F, f: (a: A) => B) => F,
): {
    map: <B>(f: (a: any) => B) => F;
} {
    return {
        map: (f) => mapF(value, f),
    };
}

