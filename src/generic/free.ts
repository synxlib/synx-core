type FreeOperation<F, A> =
    | { type: "Pure"; value: A }
    | {
          type: "Impure";
          effect: F & { resultType: any };
          next: (x: any) => Free<F, A>;
      };

export class Free<F, A> {
    private constructor(private readonly operation: FreeOperation<F, A>) {}

    static pure<F, A>(a: A): Free<F, A> {
        return new Free({ type: "Pure", value: a });
    }

    static liftF<F, A>(effect: F & { resultType: A }): Free<F, A> {
        return new Free({
            type: "Impure",
            effect,
            next: (x) => Free.pure(x),
        });
    }

    flatMap<B>(f: (a: A) => Free<F, B>): Free<F, B> {
        if (this.operation.type === "Pure") {
            return f(this.operation.value);
        } else {
            return new Free({
                type: "Impure",
                effect: this.operation.effect,
                next: (x) => this.operation.next(x).flatMap(f),
            });
        }
    }

    run(interpret: <X>(effect: F & { resultType: X }) => X): A {
        let current: Free<F, A> = this;
        let result: A | undefined = undefined;

        while (true) {
            if (current.operation.type === "Pure") {
                result = current.operation.value;
                break;
            } else {
                const effect = current.operation.effect;
                const effectResult = interpret(effect);
                current = current.operation.next(effectResult);
            }
        }

        return result!;
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
