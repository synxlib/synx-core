export class Free<F, A> {
    constructor(
        private readonly runFree: <R>(
            onPure: (a: A) => R,
            onImpure: <X>(
                effect: F & { resultType: X },
                k: (x: X) => Free<F, A>,
            ) => R,
        ) => R,
    ) {}

    static pure<F, A>(a: A): Free<F, A> {
        return new Free((onPure, _) => onPure(a));
    }

    static liftF<F, A>(effect: F & { resultType: A }): Free<F, A> {
        return new Free((onPure, onImpure) =>
            onImpure(effect, (x) => Free.pure(x)),
        );
    }

    flatMap<B>(f: (a: A) => Free<F, B>): Free<F, B> {
        return new Free((onPure, onImpure) =>
            this.runFree(
                // Pure case: apply f and continue
                (a) => f(a).runFree(onPure, onImpure),

                // Impure case: handle the effect then continue
                (effect, k) => onImpure(effect, (x) => k(x).flatMap(f)),
            ),
        );
    }

    run(interpret: <X>(effect: F & { resultType: X }) => X): A {
        return this.runFree(
            // Pure case: return the value
            (a) => a,

            // Impure case: interpret the effect and continue
            (effect, k) => k(interpret(effect)).run(interpret),
        );
    }
}

/**
 * Utility functions for working with Free monads
 */

/**
 * Sequence a list of Free computations into a single computation that returns a list
 */
export function sequence<F, A>(fas: Array<Free<F, A>>): Free<F, Array<A>> {
    return fas.reduce(
        (acc, fa) =>
            acc.flatMap((xs) => fa.flatMap((x) => Free.pure([...xs, x]))),
        Free.pure<F, Array<A>>([]),
    );
}

/**
 * Map a function that returns a Free over an array
 */
export function traverse<F, A, B>(
    arr: Array<A>,
    f: (a: A) => Free<F, B>,
): Free<F, Array<B>> {
    return sequence(arr.map(f));
}

/**
 * Run multiple Free computations in sequence, keeping only the last result
 */
export function chain<F, A>(...fas: Array<Free<F, A>>): Free<F, A> {
    return fas.reduce(
        (acc, fa) => acc.flatMap(() => fa),
        fas[0] || Free.pure(null as any),
    );
}

/**
 * Combine multiple Free computations with a combining function
 */
export function lift2<F, A, B, C>(
    f: (a: A, b: B) => C,
    fa: Free<F, A>,
    fb: Free<F, B>,
): Free<F, C> {
    return fa.flatMap((a) => fb.flatMap((b) => Free.pure(f(a, b))));
}

/**
 * Lift a 3-argument function to work with Free values
 */
export function lift3<F, A, B, C, D>(
    f: (a: A, b: B, c: C) => D,
    fa: Free<F, A>,
    fb: Free<F, B>,
    fc: Free<F, C>,
): Free<F, D> {
    return fa.flatMap((a) =>
        fb.flatMap((b) => fc.flatMap((c) => Free.pure(f(a, b, c)))),
    );
}

/**
 * Apply a Free function to a Free value
 */
export function ap<F, A, B>(
    ff: Free<F, (a: A) => B>,
    fa: Free<F, A>,
): Free<F, B> {
    return ff.flatMap((f) => fa.flatMap((a) => Free.pure(f(a))));
}

/**
 * Create a Free computation from multiple input values
 * This eliminates the nesting of flatMaps
 */
export function liftN<F, T extends any[], R>(
    f: (...args: T) => R,
    ...args: { [K in keyof T]: Free<F, T[K]> }
): Free<F, R> {
    // Helper to recursively flatten the nested flatMaps
    const go = (index: number, collected: any[]): Free<F, R> => {
        if (index >= args.length) {
            return Free.pure(f(...(collected as T)));
        }
        return args[index].flatMap((val) => go(index + 1, [...collected, val]));
    };

    return go(0, []);
}
