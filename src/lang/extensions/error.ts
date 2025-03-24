import { Either, left, right } from "@/generic/either";
import { Freer, impure, mapFreer, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";
import { log } from "./debug";
import { flatMap } from "./helpers";

const InstructionTags = {
    Throw: "Throw",
    Catch: "Catch",
    Require: "Require",
} as const;

type RequireInstruction<T, A> = {
    tag: "Require";
    error: Freer<string>;
    input: Either<string, T>;
    next: (value: T) => A;
};

export type ErrorInstruction<A> =
    | { tag: "Throw"; error: Freer<string> }
    | {
          tag: "Catch";
          tryBlock: Freer<any>;
          handler: (err: string) => Freer<A>;
      }
    | RequireInstruction<any, A>;

export const throwError = (msg: string | Freer<string>): Freer<never> =>
    impure({ tag: "Throw", error: typeof msg === "string" ? pure(msg) : msg });

export const catchError = <A>(
    tryBlock: Freer<A>,
    handler: (msg: string) => Freer<A>,
): Freer<A> =>
    impure({
        tag: InstructionTags.Catch,
        tryBlock,
        handler: (err) => pure(handler(err)),
    });

export const require = <A>(e: Either<string, A>): Freer<A> =>
    e.isRight()
        ? pure(e.value)
        : // TODO Use contructors from debug
          impure({
              tag: "Log",
              message: pure(e.value),
              next: () => {
                  throw new Error(e.value);
              },
          });

export const requireE = <A>(fa: Freer<Either<string, A>>): Freer<A> =>
    flatMap(fa, (either) =>
        either.isRight() ? pure(either.value) : throwError(either.value),
    );

export const mapLeft = <A>(
    input: Either<string, A>,
    f: (msg: string) => string,
): Either<string, A> => (input.isLeft() ? left(f(input.value)) : input);

export const mapError = <A>(
    prog: Freer<A>,
    f: (err: string) => string,
): Freer<A> => catchError(prog, (e) => throwError(f(e)));

export const orElse = <A>(prog: Freer<A>, fallback: A): Freer<A> =>
    catchError(prog, () => pure(fallback));

export const recoverWith = <A>(prog: Freer<A>, alt: Freer<A>): Freer<A> =>
    catchError(prog, () => alt);

export function errorMapInstr<A, B>(
    instr: ErrorInstruction<A>,
    f: (a: A) => B,
): ErrorInstruction<B> {
    switch (instr.tag) {
        case InstructionTags.Throw:
            return { ...instr }; // nothing to map

        case InstructionTags.Catch:
            return {
                ...instr,
                handler: (err) => mapFreer(instr.handler(err), f),
            };
        case InstructionTags.Require:
            return {
                ...instr,
                next: (s) => f(instr.next(s)),
            };
    }
}

export const isErrorInstruction = makeTagGuard(Object.values(InstructionTags));

export const fromNullable = <A>(
    value: A | null | undefined,
    errorMsg: string,
): Either<string, A> => (value != null ? right(value) : left(errorMsg));

// Map over an Either, preserving errors
export const eitherMap = <E, A, B>(
    either: Either<E, A>,
    f: (a: A) => B,
): Either<E, B> => (either.isRight() ? right(f(either.value)) : either);

// Chain Eithers together
export const eitherChain = <E, A, B>(
    either: Either<E, A>,
    f: (a: A) => Either<E, B>,
): Either<E, B> => (either.isRight() ? f(either.value) : either);

// Sequence multiple Eithers
export const eitherAll = <E, A>(eithers: Either<E, A>[]): Either<E, A[]> => {
    const results: A[] = [];

    for (const either of eithers) {
        if (either.isLeft()) return either;
        results.push(either.value);
    }

    return right(results);
};

// Map over a Freer<Either<E, A>> to get a Freer<Either<E, B>>
export const mapE = <E, A, B>(
    fa: Freer<Either<E, A>>,
    f: (a: A) => B,
): Freer<Either<E, B>> => flatMap(fa, (either) => pure(eitherMap(either, f)));


// Chain operations on Freer<Either<E, A>>
export const chainE = <E, A, B>(
    fa: Freer<Either<E, A>>,
    f: (a: A) => Freer<Either<E, B>>,
): Freer<Either<E, B>> =>
    flatMap(fa, (either) =>
        either.isRight() ? f(either.value) : pure(left(either.value)),
    );


// Lift a regular value into Freer<Either<E, A>>
export const ofE = <A>(value: A): Freer<Either<string, A>> =>
    pure(right(value));

// Sequence multiple Freer<Either<E, A>> values
export const allE = <E, A>(
    fas: Freer<Either<E, A>>[],
): Freer<Either<E, A[]>> => {
    if (fas.length === 0) return pure(right([]));

    return fas.reduce(
        (acc, next) =>
            chainE(acc, (values) =>
                chainE(next, (value) => pure(right([...values, value]))),
            ),
        pure(right([]) as Either<E, A[]>),
    );
};

// Apply a function to a successful value, or log the error and throw
export const withRequire = <A, B>(
    fa: Freer<Either<string, A>>,
    f: (a: A) => Freer<B>,
): Freer<B> =>
    flatMap(fa, (either) =>
        either.isRight()
            ? f(either.value)
            : impure({
                  tag: "Log",
                  message: pure(`Error: ${either.value}`),
                  next: () =>
                      throwError(`Required value missing: ${either.value}`),
              }),
    );

// Try to get a successful value, or use a default with a warning
export const withDefault = <A>(
    fa: Freer<Either<string, A>>,
    defaultValue: A,
): Freer<A> =>
    flatMap(fa, (either) =>
        either.isRight()
            ? pure(either.value)
            : impure({
                  tag: "Log",
                  message: pure(
                      `Warning: Using default value because: ${either.value}`,
                  ),
                  next: () => pure(defaultValue),
              }),
    );

